// Checks process.ts against _docs/plan.md Section 8, so the stage wording
// on the site cannot drift from the plan. The ?raw import resolves relative
// to this file and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
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
