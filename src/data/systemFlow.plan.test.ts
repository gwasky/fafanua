// Checks systemFlow.ts against the V2 visual enhancement plan
// (_docs/fafanua-v2-visual-enhancements-services-and-operating-system.md,
// #66), which is the source of the diagram's wording, so the site cannot
// drift from it: the heading and lead are §4.1, the flow §4.2, the
// lifecycle labels and their lines §4.3, the central layers §4.4, the
// detail panels §5 and the return statement §6. The ?raw imports resolve
// relative to this file and are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/fafanua-v2-visual-enhancements-services-and-operating-system.md?raw'
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

// The text under a heading of the given level, up to the next heading of
// that level or higher.
function under(text: string, marks: string, heading: string): string {
  const start = text.indexOf(`\n${marks} ${heading}\n`)
  if (start === -1) throw new Error(`"${marks} ${heading}" not found`)
  const next = new RegExp(`\\n#{1,${marks.length}} `, 'g')
  next.lastIndex = start + 1
  const end = next.exec(text)?.index ?? -1
  return end === -1 ? text.slice(start) : text.slice(start, end)
}

// The headings of a level in a text, in order.
const headings = (text: string, marks: string) =>
  [...text.matchAll(new RegExp(`^${marks} (.+)$`, 'gm'))].map((match) => match[1].trim())
// The blockquote lines of a text, without their markers and bold.
const quotes = (text: string) =>
  [...text.matchAll(/^> (.+)$/gm)].map((match) => match[1].replace(/\*\*/g, '').trim())
// The bullet items of a text.
const bullets = (text: string) => [...text.matchAll(/^- (.+)$/gm)].map((match) => match[1].trim())

const s4 = section(doc, 4)
const s41 = under(s4, '##', '4.1 Heading')
const s42 = under(s4, '##', '4.2 Core Flow')
const s43 = under(s4, '##', '4.3 Left-Hand Lifecycle Labels')
const s44 = under(s4, '##', '4.4 Central Layers')
const s5 = section(doc, 5)
const s6 = section(doc, 6)

const layers = systemFlow.layers
const parts = layers.flatMap((layer) => layer.parts)

describe('enhancement plan parser', () => {
  it('finds the six flow names, ending with the loop back', () => {
    expect(quotes(s42)).toEqual([
      'Operational Systems',
      '↓',
      // A service name, which may only be written in services.ts.
      services.find((s) => s.id === 'data-engineering-and-integration')!.name,
      '↓',
      'Data Warehouse & Semantic Layer',
      '↓',
      'Data Quality + Governance',
      '↓',
      'Analytics & Reporting',
      '↓',
      'Operational Activation',
      '↻ back to Operational Systems',
    ])
  })

  it('finds six lifecycle labels, six central layers and six detail panels', () => {
    expect(headings(s43, '###')).toHaveLength(6)
    expect(headings(s44, '###')).toHaveLength(6)
    expect(headings(s5, '##')).toHaveLength(6)
  })
})

describe('systemFlow wording', () => {
  it('uses §4.1\'s heading and supporting copy', () => {
    // The first quote is the heading it replaces.
    expect(quotes(s41)).toEqual([
      'How the services connect into one operating data system',
      systemFlow.heading,
      systemFlow.lead,
    ])
    expect(systemFlow.heading).toBe('One connected data operating system')
  })

  it('follows §4.2\'s flow, with Data Quality + Governance as the trust layer\'s two parts', () => {
    const flow = quotes(s42).filter((line) => line !== '↓' && !line.startsWith('↻'))
    expect(
      layers.map((layer) => layer.parts.map((part) => part.name).join(' + ')),
    ).toEqual(flow)
    expect(layers[3].parts.map((part) => part.name)).toEqual(['Data Quality', 'Governance'])
  })

  it('has §4.3\'s six lifecycle labels and lines, in order, stored in sentence case', () => {
    const labels = headings(s43, '###')
    expect(layers.map((layer) => layer.label.toUpperCase())).toEqual(labels)
    for (const [i, label] of labels.entries()) {
      expect(layers[i].description).toBe(quotes(under(s43, '###', label))[0])
      expect(layers[i].label).not.toBe(layers[i].label.toUpperCase())
    }
  })

  it('has §4.4\'s supporting lines: a sentence for Operational Systems, terms for the rest', () => {
    for (const name of headings(s44, '###')) {
      const text = under(s44, '###', name)
      const layer = layers.find((candidate) => candidate.parts.map((part) => part.name).join(' + ') === name)!
      expect(layer, name).toBeDefined()
      if (layer.parts.length === 1) {
        const [line] = quotes(text)
        const part = layer.parts[0]
        if (part.summary) expect(part.summary).toBe(line)
        else expect(part.terms!.join(' · ')).toBe(line)
      } else {
        for (const part of layer.parts) expect(part.terms).toEqual(bullets(under(text, '####', part.name)))
      }
    }
    expect(parts.filter((part) => part.summary).map((part) => part.name)).toEqual(['Operational Systems'])
  })

  it('shows Operational Systems\' examples (§4.4) as its detail panel', () => {
    const examples = bullets(under(s44, '###', 'Operational Systems'))
    expect(layers[0].details).toEqual(examples)
  })

  it('has §5\'s six detail panels, in order', () => {
    expect(layers.map((layer) => layer.details)).toEqual(
      headings(s5, '##').map((panel) => bullets(under(s5, '##', panel))),
    )
  })

  it('keeps Reverse ETL as one term of Operational Activation', () => {
    expect(s44).toContain('Reverse ETL should be presented as one mechanism within the broader Operational Activation proposition.')
    const activation = layers.at(-1)!.parts[0]
    expect(activation.name).toBe('Operational Activation')
    expect(activation.terms![0]).toBe('Reverse ETL')
    expect(activation.terms!.length).toBeGreaterThan(1)
  })

  it('uses §6\'s return statement', () => {
    expect(quotes(s6)).toEqual([systemFlow.returnTitle, systemFlow.returnText])
  })

  it('maps each part to the stage of the service it belongs to, and Operational Systems to none', () => {
    expect(parts.map((part) => part.stage)).toEqual([
      null,
      'connect',
      'model',
      'trust',
      'govern',
      'decide',
      'connect',
    ])
  })

  it('reads the integration layer\'s name, a service name, from services.ts', () => {
    const service = services.find((s) => s.id === 'data-engineering-and-integration')!
    const code = systemFlowSource.replace(/\/\/.*$/gm, '')

    expect(layers[1].parts[0].name).toBe(service.name)
    expect(code).not.toContain(service.name)
    expect(code).toContain(`serviceName('${service.id}')`)
  })
})
