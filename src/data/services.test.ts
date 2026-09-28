import { describe, expect, it } from 'vitest'
import { serviceLines, services, type ServiceLine } from './services.ts'

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const NAV_ANCHORS = ['services', 'how-we-work', 'about', 'contact']

// Every string in the module: titles, summaries and typical-work items.
const allStrings = services.flatMap((service) => [
  service.id,
  service.title,
  service.summary,
  ...service.typicalWork,
])

describe('services', () => {
  it('has exactly six services', () => {
    expect(services).toHaveLength(6)
  })

  it('has unique ids that are the kebab-case title', () => {
    const ids = services.map((service) => service.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const service of services) {
      expect(service.id).toMatch(ID_PATTERN)
      expect(service.id).toBe(service.title.toLowerCase().replace(/ /g, '-'))
    }
  })

  it('has no id that clashes with a navigation anchor', () => {
    for (const service of services) {
      expect(NAV_ANCHORS).not.toContain(service.id)
    }
  })

  it('has a non-empty title, summary and typical-work list', () => {
    for (const service of services) {
      expect(service.title).not.toBe('')
      expect(service.summary).not.toBe('')
      expect(service.typicalWork.length).toBeGreaterThan(0)
    }
  })

  it('has no empty or duplicate typical-work items', () => {
    for (const service of services) {
      for (const item of service.typicalWork) {
        expect(item).not.toBe('')
      }
      expect(new Set(service.typicalWork).size).toBe(service.typicalWork.length)
    }
  })

  it('uses plain single-line ASCII strings without stray whitespace', () => {
    for (const text of allStrings) {
      expect(text).toMatch(/^[\x20-\x7E]+$/)
      expect(text).toBe(text.trim())
      expect(text).not.toContain('  ')
    }
  })

  it('has no markup, colours or token names in its strings', () => {
    for (const text of allStrings) {
      expect(text).not.toMatch(/[<>`]|\*\*|^- |#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--/i)
    }
  })
})

describe('service lines', () => {
  it('labels each service line as in the plan', () => {
    expect(serviceLines).toEqual({
      build: 'Build',
      govern: 'Govern',
      trust: 'Trust',
      insights: 'Insights',
    })
  })

  it('gives every service a known service line', () => {
    for (const service of services) {
      expect(Object.keys(serviceLines)).toContain(service.serviceLine)
    }
  })

  it('uses every service line at least once', () => {
    const used = new Set(services.map((service) => service.serviceLine))
    for (const line of Object.keys(serviceLines)) {
      expect(used).toContain(line)
    }
  })

  it('maps each service to its service line from the plan', () => {
    const mapping: [string, ServiceLine][] = services.map((service) => [
      service.id,
      service.serviceLine,
    ])

    expect(mapping).toEqual([
      ['data-platform-architecture', 'build'],
      ['data-integration-and-engineering', 'build'],
      ['data-warehouse-and-analytics-modelling', 'build'],
      ['data-quality-and-reliability', 'trust'],
      ['data-governance-and-metadata', 'govern'],
      ['analytics-and-reporting-products', 'insights'],
    ])
  })

  it('leaves out the intelligence service line', () => {
    expect(Object.keys(serviceLines)).not.toContain('intelligence')
  })
})

describe('services types', () => {
  // Never called: the @ts-expect-error lines fail `npm run typecheck` if
  // the data stops being read-only.
  function mutate() {
    // @ts-expect-error services are read-only
    services[0].title = 'Changed'
    // @ts-expect-error the list of services is read-only
    services.push(services[0])
    // @ts-expect-error typical-work lists are read-only
    services[0].typicalWork.push('Changed')
    // @ts-expect-error 'intelligence' is not a service line
    const line: ServiceLine = 'intelligence'
    return line
  }

  it('keeps the data read-only at compile time', () => {
    expect(typeof mutate).toBe('function')
  })
})
