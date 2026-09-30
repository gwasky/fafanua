// Checks services.ts against _docs/plan-fafanua-services-positioning.md
// (Sections 3 and 5-11), which is authoritative for service copy, so the
// wording on the site cannot drift from it. The ?raw import resolves
// relative to this file and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import positioning from '../../_docs/plan-fafanua-services-positioning.md?raw'
import servicesSource from './services.ts?raw'
import { services, servicesIntro, stages } from './services.ts'

type DocService = {
  number: string
  name: string
  label: string
  description: string
  engagements: string[]
}

const doc = positioning.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// The `## ` subsections of a section, by heading.
function subsections(text: string): Map<string, string> {
  const headings = [...text.matchAll(/^## (.+)$/gm)]
  return new Map(
    headings.map((heading, index) => [
      heading[1].trim(),
      text.slice(
        heading.index + heading[0].length,
        headings[index + 1]?.index ?? text.length,
      ),
    ]),
  )
}

// The `> ` quotes in a block, one per paragraph, without `**` emphasis.
function quotes(block: string | undefined): string[] {
  return [...(block ?? '').matchAll(/^> (.+)$/gm)].map((match) =>
    match[1].replace(/^\*\*(.+)\*\*$/, '$1').trim(),
  )
}

function bullets(block: string | undefined): string[] {
  return [...(block ?? '').matchAll(/^- (.+)$/gm)].map((match) =>
    match[1].trim(),
  )
}

// Section 3: the service name and label table.
function parseLabels(markdown: string): [string, string][] {
  return [...section(markdown, 3).matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
    .map((row): [string, string] => [row[1], row[2]])
    .filter(([name]) => name !== 'Service' && !/^-+$/.test(name))
}

// Sections 5-10: one service card each. A renamed card takes the name
// after "New:"; a kept one the quote under "Keep name".
function parseService(markdown: string, n: number): DocService {
  const parts = subsections(section(markdown, n))
  const rename = parts.get('Rename')
  const name = rename
    ? quotes(rename.slice(rename.indexOf('New:')))[0]
    : quotes(parts.get('Keep name'))[0]
  return {
    number: String(n),
    name: name ?? '',
    label: quotes(parts.get('Label'))[0] ?? '',
    description: quotes(parts.get('Description'))[0] ?? '',
    engagements: bullets(parts.get('Typical engagements')),
  }
}

// Section 11: the intro heading and its supporting paragraphs.
function parseIntro(markdown: string) {
  const parts = subsections(section(markdown, 11))
  return {
    heading: quotes(parts.get('Heading'))[0] ?? '',
    paragraphs: quotes(parts.get('Supporting copy')),
  }
}

const docLabels = parseLabels(doc)
const docServices = [5, 6, 7, 8, 9, 10].map((n) => parseService(doc, n))
const docIntro = parseIntro(doc)

describe('positioning doc parser', () => {
  it('finds six services in Sections 5 to 10', () => {
    expect(docServices).toHaveLength(6)
    for (const service of docServices) {
      expect(service.name).not.toBe('')
      expect(service.label).not.toBe('')
      expect(service.description).not.toBe('')
      expect(service.engagements.length).toBeGreaterThan(0)
    }
    expect(docServices.map((service) => service.engagements.length)).toEqual([
      8, 9, 8, 8, 10, 9,
    ])
  })

  it('finds six name and label rows in Section 3 that agree with Sections 5 to 10', () => {
    expect(docLabels).toHaveLength(6)
    expect(docLabels).toEqual(
      docServices.map((service) => [service.name, service.label]),
    )
  })

  it('finds the intro heading and two paragraphs in Section 11', () => {
    expect(docIntro.heading).not.toBe('')
    expect(docIntro.paragraphs).toHaveLength(2)
  })
})

describe('services wording', () => {
  it('lists the services in the positioning doc order', () => {
    expect(services.map((service) => service.name)).toEqual(
      docServices.map((service) => service.name),
    )
  })

  it.each(docServices.map((service, index) => [service.number, index]))(
    'matches the service card in Section %s',
    (_number, index) => {
      const expected = docServices[index]
      const actual = services[index]

      expect(actual.name).toEqual(expected.name)
      expect(stages[actual.stage]).toEqual(expected.label)
      expect(actual.description).toEqual(expected.description)
      expect(actual.engagements).toEqual(expected.engagements)
    },
  )

  it('matches the intro in Section 11', () => {
    expect(servicesIntro.heading).toEqual(docIntro.heading)
    expect(servicesIntro.paragraphs).toEqual(docIntro.paragraphs)
  })

  it('lists Reverse ETL under Data Engineering & Integration, without the Section 6 examples', () => {
    const integration = services.find(
      (service) => service.id === 'data-engineering-and-integration',
    )!
    const text = integration.engagements.join('\n')
    // Section 13 names the term to use; the literal may only live in
    // services.ts.
    const section13 = section(doc, 13)
    const term = quotes(section13.slice(section13.indexOf('Use the term:')))[0]

    expect(term).toMatch(/^Reverse ETL /)
    expect(integration.engagements).toContain(term)
    expect(text).not.toMatch(/support systems|finance systems|marketing tools|CRM platforms/i)
  })
})

describe('services source', () => {
  // The module's code without its comments, which name the plan.
  const code = servicesSource.replace(/\/\/.*$/gm, '')
  const literals = [...code.matchAll(/'([^'\\]*)'/g)].map((match) => match[1])

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|\.md\b/)
  })

  it('has no JSX, React, colours, tokens or Fafanua Intelligence', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--service|className|fafanua intelligence|future-ready/i)
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
    const wording = [
      ...services.flatMap((service) => [
        service.name,
        service.description,
        ...service.engagements,
      ]),
      servicesIntro.heading,
      ...servicesIntro.paragraphs,
    ]
    for (const [file, source] of sources) {
      for (const text of wording) {
        expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
