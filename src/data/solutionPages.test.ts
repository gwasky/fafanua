// The solution landing pages' copy (page in solutions.ts, #67): distinct
// metadata, sector-specific content, the protected brand language, real
// service links, and no invented clients or claims (SEO plan §18).
import { describe, expect, it } from 'vitest'
import { servicePages } from './servicePages.ts'
import { solutions } from './solutions.ts'
import { activationIntro, solutionPages, type SolutionSectionsPage } from './solutionPages.ts'

const pages = solutions.map((solution) => ({ ...solution, page: solutionPages[solution.id] }))

// The three sectors still on the SEO plan §18 sections. Public Sector,
// Health and Financial Services are on the shared landing-page foundation
// (#93, #94, #98), whose copy is section 4 of
// _docs/fafanua-public-sector-landing-page-plan.md, of
// _docs/fafanua-health-landing-page-plan.md and of
// _docs/fafanua-financial-services-landing-page-plan.md, a change of
// approved specification (section 2.1 of each, section 2 of the last):
// they have their own rules below, and
// solutionPages.publicSector.plan.test.ts,
// solutionPages.health.plan.test.ts and
// solutionPages.financialServices.plan.test.ts check their copy.
const sectionPages = pages.flatMap((solution) =>
  solution.page.layout === 'sector' ? [] : [{ ...solution, page: solution.page as SolutionSectionsPage }],
)
const publicSector = solutionPages['public-sector']
const health = solutionPages.health
const financialServices = solutionPages['financial-services']

describe('solution landing pages', () => {
  it('gives every page a unique title, description and h1', () => {
    for (const field of ['title', 'description'] as const) {
      const values = pages.map((solution) => solution.page[field])
      expect(new Set(values).size, field).toBe(6)
    }
    expect(new Set(solutions.map((solution) => solution.heading)).size).toBe(6)
    // Each page's h1: the sector's heading, or the foundation hero's.
    const h1s = pages.map(({ page, heading }) => (page.layout === 'sector' ? page.hero.heading : heading))
    expect(new Set(h1s).size).toBe(6)
  })

  it('keeps the three §18 pages, and Public Sector, Health and Financial Services on the shared foundation', () => {
    expect(sectionPages.map((solution) => solution.id)).toEqual([
      'retail-and-distribution',
      'development-and-impact',
      'education',
    ])
    expect(publicSector.layout).toBe('sector')
    expect(health.layout).toBe('sector')
    expect(financialServices.layout).toBe('sector')
    expect(pages.filter(({ page }) => page.layout === 'sector').map((solution) => solution.id)).toEqual([
      'financial-services',
      'health',
      'public-sector',
    ])
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
    for (const solution of sectionPages) {
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
    for (const { page, id } of sectionPages) {
      const context = page.context.join(' ')
      expect(context, id).toMatch(/trusted data foundation/)
      expect(context, id).toMatch(/Uganda and East Africa/)
    }
  })

  it('links each sector to real, distinct services with descriptive anchors', () => {
    const keys = servicePages.map((page) => page.key)
    for (const { page } of sectionPages) {
      for (const link of page.services) {
        expect(keys).toContain(link.service)
        expect(link.label).not.toMatch(/learn more|read more|click here/i)
      }
      expect(new Set(page.services.map((link) => link.service)).size).toBe(page.services.length)
    }
  })

  // SEO plan §22: the sectors it gives links for. Health's and Financial
  // Services' are their three service cards (#94 and #98, owner note 4 of
  // each), checked below.
  it.each([
    ['development-and-impact', ['data-engineering-and-integration', 'data-quality-and-reliability', 'data-governance-and-metadata', 'business-intelligence-and-analytics']],
  ])('links %s to the services SEO plan §22 lists', (id, expected) => {
    const solution = sectionPages.find((item) => item.id === id)!
    expect(solution.page.services.map((link) => link.service)).toEqual(expect.arrayContaining(expected))
  })

  it('gives Public Sector "trusted data foundation" in its description and Uganda and East Africa in its lead', () => {
    if (publicSector.layout !== 'sector') throw new Error('Public Sector is not on the foundation')
    expect(publicSector.description).toMatch(/trusted data foundation/)
    expect(publicSector.hero.lead).toMatch(/Uganda and East Africa/)
  })

  it('keeps Public Sector\'s assigned keywords in its title and description (SEO plan §12)', () => {
    expect(publicSector.title).toContain('Government Data Analytics Uganda')
    expect(publicSector.description).toContain('public sector data analytics')
  })

  it('links Public Sector\'s service cards to real, distinct services', () => {
    if (publicSector.layout !== 'sector') throw new Error('Public Sector is not on the foundation')
    const keys = servicePages.map((page) => page.key)
    const linked = publicSector.services.items.map((item) => item.service)
    for (const key of linked) expect(keys).toContain(key)
    expect(new Set(linked).size).toBe(linked.length)
  })

  it('links Health\'s service cards to exactly its three real, distinct services (#94)', () => {
    if (health.layout !== 'sector') throw new Error('Health is not on the foundation')
    const keys = servicePages.map((page) => page.key)
    const linked = health.services.items.map((item) => item.service)
    expect(linked).toEqual(['data-engineering-and-integration', 'data-quality-and-reliability', 'business-intelligence-and-analytics'])
    for (const key of linked) expect(keys).toContain(key)
    expect(new Set(linked).size).toBe(linked.length)
  })

  it('gives Health "trusted data foundation", "healthcare analytics" and Uganda and East Africa in its description, and Uganda and East Africa in its lead', () => {
    if (health.layout !== 'sector') throw new Error('Health is not on the foundation')
    expect(health.description).toMatch(/trusted data foundation/)
    expect(health.description).toContain('healthcare analytics')
    expect(health.description).toContain('Uganda and East Africa')
    expect(health.hero.lead).toMatch(/Uganda and East Africa/)
  })

  it('keeps Health\'s assigned keyword in its title (SEO plan §9)', () => {
    expect(health.title).toContain('Health Data Analytics Uganda')
  })

  it('links Financial Services\' service cards to exactly its three real, distinct services (#98, SEO plan §22)', () => {
    if (financialServices.layout !== 'sector') throw new Error('Financial Services is not on the foundation')
    const keys = servicePages.map((page) => page.key)
    const linked = financialServices.services.items.map((item) => item.service)
    expect(linked).toEqual(['data-engineering-and-integration', 'data-quality-and-reliability', 'business-intelligence-and-analytics'])
    for (const key of linked) expect(keys).toContain(key)
    expect(new Set(linked).size).toBe(linked.length)
  })

  it('gives Financial Services "trusted data foundation", "financial services analytics" and Uganda in its description, and "Banking Analytics Uganda" in its title (SEO plan §7)', () => {
    expect(financialServices.description).toMatch(/trusted data foundation/)
    expect(financialServices.description).toContain('financial services analytics')
    expect(financialServices.description).toContain('Uganda')
    expect(financialServices.title).toContain('Banking Analytics Uganda')
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
