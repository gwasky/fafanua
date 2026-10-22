// Checks process.ts against _docs/plan.md Section 8 (names and
// descriptions), the V2 refinement plan §8 (each stage's output, #63) and
// section B of the homepage sections refinement plan (the heading, the
// Assess description and output, "lineage" in Govern, the labels, #90),
// so the stage wording on the site cannot drift from the plans. The ?raw
// imports resolve relative to this file and are never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import refinementPlan from '../../_docs/fafanua-homepage-sections-refinement-plan.md?raw'
import processSource from './process.ts?raw'
import { processIntro, processStages } from './process.ts'
import { managedServices } from './services.ts'

type PlanStage = {
  number: string
  name: string
  description: string
}

// The text of Section 8, from its heading up to the next `## ` heading.
function section8(markdown: string): string {
  const start = markdown.indexOf('\n## 8. How We Work\n')
  if (start === -1) throw new Error('Section 8 not found in plan.md')
  const end = markdown.indexOf('\n## ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// Each `1. **Name** - Description` line of the numbered list.
function parseStages(section: string): PlanStage[] {
  return [...section.matchAll(/^(\d+)\. \*\*(.+?)\*\* - (.+)$/gm)].map(
    (match) => ({ number: match[1], name: match[2], description: match[3] }),
  )
}

const planStages = parseStages(section8(plan.replace(/\r\n/g, '\n')))

// The refinement plan §8, from its `# 8. ` heading up to the next `# `.
const refinementDoc = refinement.replace(/\r\n/g, '\n')
const r8Start = refinementDoc.indexOf('\n# 8. How We Work\n')
const r8 = refinementDoc.slice(r8Start, refinementDoc.indexOf('\n# ', r8Start + 1))

// Each `### 0N Name` stage: its name, and its output, the bold quote after
// "Add short output:" or "Add:" (the stage's last quote; the first is its
// current purpose).
const refinementStages = [...r8.matchAll(/^### (\d\d) (.+)\n([\s\S]*?)(?=\n### |\n## |\n---)/gm)].map(
  (match) => {
    const quotes = [...match[3].matchAll(/^> \*\*(.+)\*\*$/gm)].map((quote) => quote[1])
    return { number: match[1], name: match[2], outputs: quotes, add: /\nAdd( short output)?:\n/.test(match[3]) }
  },
)

// Section B's copy table (homepage sections refinement plan §5, #90):
// each `| Element | Text | Status |` row, from `### Copy` up to `### Layout`.
const sectionsDoc = refinementPlan.replace(/\r\n/g, '\n')
const b5Start = sectionsDoc.indexOf('\n## 5. Section B: How We Work\n')
const b5Copy = sectionsDoc.slice(
  sectionsDoc.indexOf('\n### Copy\n', b5Start),
  sectionsDoc.indexOf('\n### Layout\n', b5Start),
)
const sectionB = new Map(
  [...b5Copy.matchAll(/^\| (.+?) \| (.+?) \| (.+?) \|$/gm)]
    .filter((row) => row[1] !== 'Element' && !/^-+$/.test(row[1]))
    .map((row) => [row[1], { text: row[2], status: row[3] }]),
)
const sectionBText = (element: string): string => {
  const row = sectionB.get(element)
  if (row === undefined) throw new Error(`No "${element}" row in section B`)
  return row.text
}

describe('plan Section 8 parser', () => {
  it('finds exactly four stages numbered 1 to 4', () => {
    expect(planStages.map((stage) => stage.number)).toEqual(['1', '2', '3', '4'])
  })

  it('parses a name and a one-line description for each', () => {
    for (const stage of planStages) {
      expect(stage.name).not.toBe('')
      expect(stage.description).not.toBe('')
      expect(stage.description).not.toContain('\n')
    }
  })
})

describe('refinement plan §8 parser', () => {
  it('finds four stages, 01 to 04, each with one bold output after "Add"', () => {
    expect(r8Start).toBeGreaterThan(-1)
    expect(refinementStages.map((stage) => stage.number)).toEqual(['01', '02', '03', '04'])
    for (const stage of refinementStages) {
      expect(stage.outputs, stage.name).toHaveLength(1)
      expect(stage.add, stage.name).toBe(true)
    }
  })
})

describe('process outputs', () => {
  it('names the stages as the refinement plan §8 does', () => {
    expect(processStages.map((stage) => stage.name)).toEqual(
      refinementStages.map((stage) => stage.name),
    )
  })

  it.each(refinementStages.slice(1).map((stage, index) => [stage.number, index + 1]))(
    'uses the refinement plan §8 output for stage %s, character for character',
    (_number, index) => {
      expect(processStages[index].output).toBe(refinementStages[index].outputs[0])
    },
  )

  it('uses section B\'s Assess output for stage 01, not §8\'s superseded one (#90)', () => {
    expect(processStages[0].output).toBe(sectionBText('Assess output'))
    expect(refinementStages[0].outputs[0]).toBe('Systems & needs assessment')
    expect(processStages[0].output).not.toBe(refinementStages[0].outputs[0])
  })
})

describe('process wording', () => {
  it('lists the stages in plan order', () => {
    expect(processStages.map((stage) => stage.name)).toEqual(
      planStages.map((stage) => stage.name),
    )
  })

  it.each(planStages.map((stage, index) => [stage.number, index]))(
    'matches stage %s\'s name in the plan',
    (_number, index) => {
      expect(processStages[index].name).toBe(planStages[index].name)
    },
  )

  it.each([['2', 1], ['3', 2]])(
    'matches stage %s\'s description in the plan, which section B leaves unchanged',
    (_number, index) => {
      expect(processStages[index].description).toBe(
        planStages[index].description,
      )
    },
  )

  it('takes stage 1\'s description from section B, not the superseded plan.md one (#90)', () => {
    expect(processStages[0].description).toBe(sectionBText('Assess description'))
    expect(processStages[0].description).not.toBe(planStages[0].description)
  })

  it('takes stage 4\'s description from section B: plan.md\'s, with "traceability" as "lineage" (#90)', () => {
    expect(processStages[3].description).toBe(sectionBText('Govern description'))
    expect(processStages[3].description).toBe(
      planStages[3].description.replace('traceability', 'lineage'),
    )
    expect(processStages[3].description).not.toMatch(/traceability/i)
  })
})

describe('section B (homepage sections refinement plan §5, #90)', () => {
  it('finds the copy table', () => {
    expect(b5Start).toBeGreaterThan(-1)
    expect(sectionB.size).toBeGreaterThanOrEqual(12)
  })

  it('uses its heading, output label and step 01 tag', () => {
    expect(processIntro.heading).toBe(sectionBText('Heading'))
    expect(processIntro.outputLabel.toUpperCase()).toBe(sectionBText('Output label'))
    expect(sectionBText('Output label')).toBe('YOU GET')
    expect(processIntro.startTag.toUpperCase()).toBe(sectionBText('Step 01 tag'))
    expect(sectionBText('Step 01 tag')).toBe('START HERE')
  })

  it('reuses the Managed Services journey as its stage labels', () => {
    expect([...managedServices.journey]).toEqual(sectionBText('Stage labels').split('; '))
  })

  it('numbers and names the steps as it does', () => {
    expect(
      processStages.map((stage, index) => `${String(index + 1).padStart(2, '0')} ${stage.name}`),
    ).toEqual(sectionBText('Step names').split('; '))
  })

  it('uses its Assess description and output', () => {
    expect(processStages[0].description).toBe(sectionBText('Assess description'))
    expect(processStages[0].output).toBe(sectionBText('Assess output'))
  })

  it('leaves the Design and Build descriptions and the other outputs unchanged', () => {
    expect(sectionBText('Design description')).toBe('Unchanged')
    expect(sectionBText('Build description')).toBe('Unchanged')
    expect(sectionBText('Design, Build and Govern outputs')).toBe('Unchanged')
  })
})

describe('process source', () => {
  // The module's code without its comments, which name the plan.
  const code = processSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className|intelligence/i)
  })
})

describe('other source files', () => {
  // Every source file under src/ except process.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(
    ([file]) => file !== '/src/data/process.ts' && !/\.test\.tsx?$/.test(file),
  )

  it('scans the rest of src/', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/App.tsx')
    expect(files).not.toContain('/src/data/process.ts')
  })

  it('do not repeat any stage description', () => {
    for (const [file, source] of sources) {
      for (const { description } of processStages) {
        expect(source.includes(description), `${file} repeats "${description}"`).toBe(false)
      }
    }
  })

  it('do not repeat the heading, "You get" or "Start here" (#90)', () => {
    for (const [file, source] of sources) {
      const lower = source.toLowerCase()
      for (const text of [processIntro.heading, 'You get', 'Start here']) {
        expect(lower.includes(text.toLowerCase()), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
