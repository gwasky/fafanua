// Checks process.ts against _docs/plan.md Section 8 (names and
// descriptions) and the V2 refinement plan §8 (each stage's output, #63),
// so the stage wording on the site cannot drift from the plans. The ?raw
// imports resolve relative to this file and are never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import processSource from './process.ts?raw'
import { processStages } from './process.ts'

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

  it.each(refinementStages.map((stage, index) => [stage.number, index]))(
    'uses the refinement plan §8 output for stage %s, character for character',
    (_number, index) => {
      expect(processStages[index].output).toBe(refinementStages[index].outputs[0])
    },
  )
})

describe('process wording', () => {
  it('lists the stages in plan order', () => {
    expect(processStages.map((stage) => stage.name)).toEqual(
      planStages.map((stage) => stage.name),
    )
  })

  it.each(planStages.map((stage, index) => [stage.number, index]))(
    'matches stage %s in the plan',
    (_number, index) => {
      expect(processStages[index].name).toBe(planStages[index].name)
      expect(processStages[index].description).toBe(
        planStages[index].description,
      )
    },
  )
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
})
