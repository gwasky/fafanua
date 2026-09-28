// Checks services.ts against _docs/plan.md Section 7, so the wording on
// the site cannot drift from the plan. This and process.plan.test.ts are
// the only files allowed to read the plan; the ?raw import resolves
// relative to this file and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/plan.md?raw'
import servicesSource from './services.ts?raw'
import { services } from './services.ts'

type PlanService = {
  number: string
  title: string
  summary: string
  typicalWork: string[]
}

// The text of Section 7, from its heading up to the next `## ` heading.
function section7(markdown: string): string {
  const start = markdown.indexOf('\n## 7. Phase 1 Services\n')
  if (start === -1) throw new Error('Section 7 not found in plan.md')
  const end = markdown.indexOf('\n## ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// Each `### 7.x` service with its Summary paragraph and Typical work bullets.
function parseServices(section: string): PlanService[] {
  const headings = [...section.matchAll(/^### (7\.\d+) (.+)$/gm)]
  return headings.map((heading, index) => {
    const bodyStart = heading.index + heading[0].length
    const bodyEnd = headings[index + 1]?.index ?? section.length
    const body = section.slice(bodyStart, bodyEnd)

    const summary = body.match(/\*\*Summary\*\*\n\n([\s\S]*?)\n\n\*\*Typical work\*\*/)
    const bullets = body.match(/\*\*Typical work\*\*\n\n((?:- .*\n?)+)/)
    return {
      number: heading[1],
      title: heading[2].trim(),
      summary: summary?.[1] ?? '',
      typicalWork: (bullets?.[1] ?? '')
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2)),
    }
  })
}

const planServices = parseServices(section7(plan.replace(/\r\n/g, '\n')))

describe('plan Section 7 parser', () => {
  it('finds services 7.1 to 7.6 in order', () => {
    expect(planServices.map((service) => service.number)).toEqual([
      '7.1',
      '7.2',
      '7.3',
      '7.4',
      '7.5',
      '7.6',
    ])
  })

  it('parses a title, a single-paragraph summary and bullets for each', () => {
    for (const service of planServices) {
      expect(service.title).not.toBe('')
      expect(service.summary).not.toBe('')
      expect(service.summary).not.toContain('\n')
      expect(service.typicalWork.length).toBeGreaterThan(0)
    }
  })
})

describe('services wording', () => {
  it('lists the services in plan order', () => {
    expect(services.map((service) => service.title)).toEqual(
      planServices.map((service) => service.title),
    )
  })

  it.each(planServices.map((service, index) => [service.number, index]))(
    'matches service %s in the plan',
    (_number, index) => {
      const expected = planServices[index]
      const actual = services[index]

      expect(actual.title).toEqual(expected.title)
      expect(actual.summary).toEqual(expected.summary)
      expect(actual.typicalWork).toEqual(expected.typicalWork)
    },
  )
})

describe('services source', () => {
  // The module's code without its comments, which name the plan.
  const code = servicesSource.replace(/\/\/.*$/gm, '')
  const literals = [...code.matchAll(/'([^'\\]*)'/g)].map((match) => match[1])

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, colours, tokens or Fafanua Intelligence', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--service|className|intelligence|future-ready/i)
    expect(literals.length).toBeGreaterThan(40)
    for (const literal of literals) {
      expect(literal).not.toMatch(/[<>`]|\*\*|^- /)
    }
  })
})

describe('other source files', () => {
  // Every source file under src/ except the data module itself.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => file !== '/src/data/services.ts')

  it('scans the rest of src/', () => {
    expect(sources.map(([file]) => file)).toContain('/src/App.tsx')
  })

  it('do not repeat any service wording', () => {
    const wording = services.flatMap((service) => [
      service.title,
      service.summary,
      ...service.typicalWork,
    ])
    for (const [file, source] of sources) {
      for (const text of wording) {
        expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
