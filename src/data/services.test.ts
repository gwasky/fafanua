import { describe, expect, it } from 'vitest'
import {
  managedServices,
  services,
  servicesIntro,
  stages,
  type Stage,
} from './services.ts'

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const NAV_ANCHORS = ['services', 'how-we-work', 'future-ready', 'about', 'contact']

// Every string in the module: ids, names, descriptions, engagements, the
// intro and the managed-services block.
const managedStrings = [
  managedServices.eyebrow,
  managedServices.heading,
  managedServices.description,
  ...managedServices.capabilities,
  ...managedServices.journey,
]

const allStrings = [
  ...services.flatMap((service) => [
    service.id,
    service.name,
    service.description,
    ...service.engagements,
  ]),
  servicesIntro.heading,
  ...servicesIntro.paragraphs,
  ...managedStrings,
]

describe('services', () => {
  it('has exactly six services', () => {
    expect(services).toHaveLength(6)
  })

  it('has unique ids that are the kebab-case name, with & written as and', () => {
    const ids = services.map((service) => service.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const service of services) {
      expect(service.id).toMatch(ID_PATTERN)
      expect(service.id).toBe(
        service.name.toLowerCase().replace(/&/g, 'and').replace(/ /g, '-'),
      )
    }
    expect(ids[0]).toBe('data-strategy-and-platform-architecture')
  })

  it('has no id that clashes with a navigation anchor', () => {
    for (const service of services) {
      expect(NAV_ANCHORS).not.toContain(service.id)
    }
  })

  it('has a non-empty name, description and engagements list', () => {
    for (const service of services) {
      expect(service.name).not.toBe('')
      expect(service.description).not.toBe('')
      expect(service.engagements.length).toBeGreaterThan(0)
    }
  })

  it('has no empty or duplicate engagements', () => {
    for (const service of services) {
      for (const item of service.engagements) {
        expect(item).not.toBe('')
      }
      expect(new Set(service.engagements).size).toBe(service.engagements.length)
    }
  })

  it('has an intro heading and two paragraphs', () => {
    expect(servicesIntro.heading).not.toBe('')
    expect(servicesIntro.paragraphs).toHaveLength(2)
  })

  // The em dash in the intro is the one exception to plain ASCII.
  it('uses plain single-line ASCII strings, plus the em dash, without stray whitespace', () => {
    for (const text of allStrings) {
      expect(text).toMatch(/^[\x20-\x7E\u2014]+$/)
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

describe('managedServices', () => {
  it('has an eyebrow, heading, description, 13 capabilities and 3 journey steps', () => {
    expect(managedServices.eyebrow).not.toBe('')
    expect(managedServices.heading).not.toBe('')
    expect(managedServices.description).not.toBe('')
    expect(managedServices.capabilities).toHaveLength(13)
    expect(managedServices.journey).toHaveLength(3)
  })

  it('has no empty or duplicate strings', () => {
    for (const text of managedStrings) expect(text).not.toBe('')
    expect(new Set(managedStrings).size).toBe(managedStrings.length)
  })

  it('is not a seventh service and has no stage', () => {
    expect(services.map((service) => service.name)).not.toContain(
      managedServices.heading,
    )
    expect(Object.keys(managedServices)).toEqual([
      'eyebrow',
      'heading',
      'description',
      'capabilities',
      'journey',
    ])
  })
})

describe('stages', () => {
  it('labels the six lifecycle stages', () => {
    expect(stages).toEqual({
      design: 'Design',
      connect: 'Connect',
      model: 'Model',
      trust: 'Trust',
      govern: 'Govern',
      decide: 'Decide',
    })
  })

  it('gives each service its own stage, in lifecycle order', () => {
    const mapping: [string, Stage][] = services.map((service) => [
      service.id,
      service.stage,
    ])

    expect(mapping).toEqual([
      ['data-strategy-and-platform-architecture', 'design'],
      ['data-engineering-and-integration', 'connect'],
      ['data-warehousing-and-analytics-modelling', 'model'],
      ['data-quality-and-reliability', 'trust'],
      ['data-governance-and-metadata', 'govern'],
      ['business-intelligence-and-analytics', 'decide'],
    ])
  })

  it('leaves out the operate and intelligence stages', () => {
    expect(Object.keys(stages)).not.toContain('operate')
    expect(Object.keys(stages)).not.toContain('intelligence')
  })
})

describe('services types', () => {
  // Never called: the @ts-expect-error lines fail `npm run typecheck` if
  // the data stops being read-only.
  function mutate() {
    // @ts-expect-error services are read-only
    services[0].name = 'Changed'
    // @ts-expect-error the list of services is read-only
    services.push(services[0])
    // @ts-expect-error engagement lists are read-only
    services[0].engagements.push('Changed')
    // @ts-expect-error the intro is read-only
    servicesIntro.heading = 'Changed'
    // @ts-expect-error the managed-services block is read-only
    managedServices.heading = 'Changed'
    // @ts-expect-error the capability list is read-only
    managedServices.capabilities.push('Changed')
    // @ts-expect-error the journey is read-only
    managedServices.journey.push('Changed')
    // @ts-expect-error 'operate' is not a stage
    const operate: Stage = 'operate'
    // @ts-expect-error 'intelligence' is not a stage
    const intelligence: Stage = 'intelligence'
    return [operate, intelligence]
  }

  it('keeps the data read-only at compile time', () => {
    expect(typeof mutate).toBe('function')
  })
})
