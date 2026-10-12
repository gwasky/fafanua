// The solution landing pages' copy (page in solutions.ts, #67): distinct
// metadata, sector-specific content, the protected brand language, real
// service links, and no invented clients or claims (SEO plan §18).
import { describe, expect, it } from 'vitest'
import { servicePages } from './servicePages.ts'
import { solutions } from './solutions.ts'
import { activationIntro, solutionPages } from './solutionPages.ts'

const pages = solutions.map((solution) => ({ ...solution, page: solutionPages[solution.id] }))

describe('solution landing pages', () => {
  it('gives every page a unique title, description and h1', () => {
    for (const field of ['title', 'description'] as const) {
      const values = pages.map((solution) => solution.page[field])
      expect(new Set(values).size, field).toBe(6)
    }
    expect(new Set(solutions.map((solution) => solution.heading)).size).toBe(6)
  })

  it('names Fafanua at the end of every title, and keeps titles to 60 characters', () => {
    for (const { page } of pages) {
      expect(page.title).toMatch(/ \| Fafanua$/)
      expect(page.title.length, page.title).toBeLessThanOrEqual(60)
    }
  })

  it('keeps meta descriptions between 100 and 170 characters', () => {
    for (const { page } of pages) {
      expect(page.description.length, page.description).toBeGreaterThanOrEqual(100)
      expect(page.description.length, page.description).toBeLessThanOrEqual(170)
    }
  })

  it('writes every section for every sector, with no copy shared between sectors', () => {
    const seen = new Map<string, string>()
    for (const solution of pages) {
      const { page } = solution
      expect(page.context.length).toBeGreaterThanOrEqual(2)
      expect(page.problems.length).toBeGreaterThanOrEqual(5)
      expect(page.services.length).toBeGreaterThanOrEqual(4)
      expect(page.governance.length).toBeGreaterThanOrEqual(3)
      expect(page.activation.length).toBeGreaterThanOrEqual(3)
      for (const text of [...page.context, ...page.problems, ...page.governance, ...page.activation, ...page.services.map((item) => item.text)]) {
        expect(seen.get(text), `"${text}" is on ${seen.get(text)} and ${solution.id}`).toBeUndefined()
        seen.set(text, solution.id)
      }
    }
  })

  it('uses "trusted data foundation" and names Uganda and East Africa in each sector context', () => {
    for (const { page, id } of pages) {
      const context = page.context.join(' ')
      expect(context, id).toMatch(/trusted data foundation/)
      expect(context, id).toMatch(/Uganda and East Africa/)
    }
  })

  it('links each sector to real, distinct services with descriptive anchors', () => {
    const keys = servicePages.map((page) => page.key)
    for (const { page } of pages) {
      for (const link of page.services) {
        expect(keys).toContain(link.service)
        expect(link.label).not.toMatch(/learn more|read more|click here/i)
      }
      expect(new Set(page.services.map((link) => link.service)).size).toBe(page.services.length)
    }
  })

  // SEO plan §22: the sectors it gives links for.
  it.each([
    ['financial-services', ['data-engineering-and-integration', 'data-warehousing-and-analytics-modelling', 'data-quality-and-reliability', 'data-governance-and-metadata', 'business-intelligence-and-analytics']],
    ['health', ['data-engineering-and-integration', 'data-warehousing-and-analytics-modelling', 'data-quality-and-reliability', 'data-governance-and-metadata', 'business-intelligence-and-analytics', 'managed-data-and-analytics']],
    ['development-and-impact', ['data-engineering-and-integration', 'data-quality-and-reliability', 'data-governance-and-metadata', 'business-intelligence-and-analytics']],
  ])('links %s to the services SEO plan §22 lists', (id, expected) => {
    const solution = pages.find((item) => item.id === id)!
    expect(solution.page.services.map((link) => link.service)).toEqual(expect.arrayContaining(expected))
  })

  it('introduces activation in buyer language, with Reverse ETL as the explanation', () => {
    expect(activationIntro.link).toBe('operational data activation using Reverse ETL')
  })

  it('invents no clients, case studies, metrics or certifications, and no AI products', () => {
    const text = JSON.stringify(pages)
    expect(text).not.toMatch(/\bclients? (include|such as)|case stud|testimonial|certified (partner|by)|\d+%|ISO \d|Fafanua Intelligence|AI-powered|DHIS/i)
  })
})

describe('solutionPages', () => {
  it('has copy for every solution, and no other', () => {
    expect(Object.keys(solutionPages).sort()).toEqual(solutions.map((solution) => solution.id).sort())
  })
})
