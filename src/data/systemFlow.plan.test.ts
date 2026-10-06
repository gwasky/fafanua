// Checks systemFlow.ts against _docs/fafanua-v2-visual-upgrade-plan.md
// Section 11 ("System / Data Flow Visual"), which is the source of the
// diagram's wording, so the site cannot drift from it: the names are the
// "Preferred conceptual flow", the labels the "Technical layer labels",
// and the terms the flow's source line and the "Possible supporting
// terms". The V2 refinement plan §5 keeps them (#63): its "Core flow to
// preserve" and "Labels to retain" are checked too, and the return label
// against its wording. The ?raw imports resolve relative to this file and
// are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import systemFlowSource from './systemFlow.ts?raw'
import { services } from './services.ts'
import { systemFlow } from './systemFlow.ts'

const doc = plan.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// The text under a `## ` heading, up to the next `## ` heading.
function subsection(text: string, heading: string): string {
  const start = text.indexOf(`\n## ${heading}\n`)
  if (start === -1) throw new Error(`"## ${heading}" not found`)
  const end = text.indexOf('\n## ', start + 1)
  return end === -1 ? text.slice(start) : text.slice(start, end)
}

const s11 = section(doc, 11)

// The flow: the lines of the first code block, without the arrows.
const flowBlock = subsection(s11, 'Preferred conceptual flow').match(/```text\n([\s\S]*?)```/)![1]
const flowLines = flowBlock
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && line !== '↓')
// The names are the lines without " · "; the one with it is the source
// systems' terms, under the first name.
const docNames = flowLines.filter((line) => !line.includes(' · '))
const docSourceTerms = flowLines.find((line) => line.includes(' · '))!.split(' · ')

const labelsText = subsection(s11, 'Technical layer labels')
// The bold labels in the "Use small restrained labels" list.
const docLabels = [...labelsText.matchAll(/^- \*\*(.+)\*\*$/gm)].map((match) => match[1])
// "Possible supporting terms": a bold label, then its terms on the next line.
const docTerms = new Map(
  [...labelsText.matchAll(/^\*\*(.+)\*\*\n(.+)$/gm)].map((match) => [
    match[1],
    match[2].split(' · ').map((term) => term.trim()),
  ]),
)

const layers = systemFlow.layers

// The refinement plan §5: the bold names in the "Core flow to preserve"
// blockquote, and the "Labels to retain" list.
const r5 = section(refinement.replace(/\r\n/g, '\n'), 5)
const refinementNames = [
  ...subsection(r5, 'Core flow to preserve').matchAll(/^> \*\*(.+)\*\*\s*$/gm),
].map((match) => match[1])
const refinementLabels = [
  ...subsection(r5, 'Labels to retain').matchAll(/^- (.+)$/gm),
].map((match) => match[1].trim())

describe('plan V2 §11 parser', () => {
  it('finds the six names of the conceptual flow, and the source terms', () => {
    expect(docNames).toHaveLength(6)
    expect(docNames[0]).toBe('Operational Systems')
    expect(docNames.at(-1)).toBe('Reverse ETL / Operational Activation')
    expect(docSourceTerms).toEqual(['CRM', 'ERP', 'Payments', 'LMS', 'Files', 'APIs'])
  })

  it('finds five labels and four sets of supporting terms', () => {
    expect(docLabels).toEqual([
      'DATA SOURCES',
      'INTEGRATION LAYER',
      'TRUST LAYER',
      'DECISION LAYER',
      'ACTIVATION LAYER',
    ])
    expect([...docTerms.keys()]).toEqual([
      'DATA SOURCES',
      'TRUST LAYER',
      'DECISION LAYER',
      'ACTIVATION LAYER',
    ])
  })

  it('finds the stated goal', () => {
    expect(s11).toContain('> **how the services connect into one operating data system**')
  })
})

describe('refinement plan §5', () => {
  it('finds the six names of the core flow and the five labels', () => {
    expect(refinementNames).toHaveLength(6)
    expect(refinementLabels).toHaveLength(5)
  })

  it('keeps the six names, in order', () => {
    expect(layers.map((layer) => layer.name)).toEqual(refinementNames)
  })

  it('keeps the five labels, in order, on every layer but the warehouse', () => {
    expect(layers.filter((layer) => layer.label).map((layer) => layer.label!.toUpperCase())).toEqual(
      refinementLabels,
    )
    expect(layers[2].label).toBeUndefined()
  })

  it('words the return label from "connect back to operational systems"', () => {
    expect(r5).toContain('The final activation stage should visually connect back to operational systems.')
    expect(systemFlow.returnLabel).toBe('Back to operational systems')
    expect(r5).toContain(`connect ${systemFlow.returnLabel.toLowerCase()}`)
  })
})

describe('systemFlow wording', () => {
  it('has the six flow names, in order', () => {
    expect(layers.map((layer) => layer.name)).toEqual(docNames)
  })

  it('has the five labels, in order, on every layer but the warehouse', () => {
    expect(layers.map((layer) => layer.label?.toUpperCase() ?? null)).toEqual([
      docLabels[0],
      docLabels[1],
      null,
      docLabels[2],
      docLabels[3],
      docLabels[4],
    ])
    expect(layers[2].name).toBe('Data Warehouse & Semantic Models')
  })

  it('stores the labels in sentence case, not uppercase', () => {
    for (const layer of layers) {
      if (layer.label) expect(layer.label).not.toBe(layer.label.toUpperCase())
    }
  })

  it('takes the source terms from the flow, and the others from the supporting terms', () => {
    expect(layers[0].terms).toEqual(docSourceTerms)
    for (const layer of layers.slice(1)) {
      const label = layer.label?.toUpperCase()
      expect(layer.terms ?? null, layer.name).toEqual(
        (label && docTerms.get(label)) ?? null,
      )
    }
  })

  it('uses the stated goal, sentence-cased, as the heading', () => {
    expect(systemFlow.heading).toBe('How the services connect into one operating data system')
  })

  it('reads the integration layer\'s name, a service name, from services.ts', () => {
    const service = services.find((s) => s.id === 'data-engineering-and-integration')!
    const code = systemFlowSource.replace(/\/\/.*$/gm, '')

    expect(layers[1].name).toBe(service.name)
    expect(code).not.toContain(service.name)
    expect(code).toContain(`serviceName('${service.id}')`)
  })
})
