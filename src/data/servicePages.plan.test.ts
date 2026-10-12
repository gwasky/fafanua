// Checks the service landing pages' copy (servicePages in services.ts)
// against the SEO plan (_docs/fafanua-seo-keyword-and-implementation-plan.md,
// #67): the §20 titles and descriptions verbatim, one distinct page per
// service, the protected brand language, and links that resolve.
import { describe, expect, it } from 'vitest'
import seoPlan from '../../_docs/fafanua-seo-keyword-and-implementation-plan.md?raw'
import { servicePages, services } from './services.ts'
import { solutions } from './solutions.ts'

const plan = seoPlan.replace(/\r\n/g, '\n')
const section20 = /\n# 20\. ([\s\S]*?)\n# 21\./.exec(plan)![1]

// §20's examples: a `## Name` heading, then a Title and a Description,
// each a `> **…**` line.
const examples = [...section20.matchAll(/^## (.+)\n\nTitle:\n\n> \*\*(.+)\*\*\n\nDescription:\n\n> \*\*(.+)\*\*$/gm)].map(
  ([, name, title, description]) => ({ name, title, description }),
)

const byName = (name: string) =>
  servicePages.find(
    (page) =>
      services.find((service) => service.id === page.key)?.name === name ||
      (page.key === 'managed-data-and-analytics' && name === 'Managed Data & Analytics'),
  )!

const copyOf = (page: (typeof servicePages)[number]) =>
  [page.heading, page.intro, ...page.problems, ...page.delivers.flatMap((item) => [item.title, item.text]), ...page.outcomes, page.fit].join(' ')

describe('service landing pages', () => {
  it('finds five examples in SEO plan §20', () => {
    expect(examples.map((example) => example.name)).toEqual([
      services[1].name,
      services[2].name,
      services[4].name,
      services[5].name,
      'Managed Data & Analytics',
    ])
  })

  it.each(examples.map((example) => [example.name, example] as const))(
    'uses the §20 title and description for %s verbatim',
    (_name, example) => {
      const page = byName(example.name)
      expect(page.title).toBe(example.title)
      expect(page.description).toBe(example.description)
    },
  )

  it('gives every page a unique title, description, h1 and slug', () => {
    for (const field of ['title', 'description', 'heading', 'slug'] as const) {
      const values = servicePages.map((page) => page[field])
      expect(new Set(values).size, field).toBe(7)
    }
  })

  it('names Fafanua at the end of every title, and keeps titles to 60 characters', () => {
    for (const page of servicePages) {
      expect(page.title).toMatch(/ \| Fafanua$/)
      expect(page.title.length, page.title).toBeLessThanOrEqual(60)
    }
  })

  it('keeps meta descriptions between 100 and 170 characters', () => {
    for (const page of servicePages) {
      expect(page.description.length, page.description).toBeGreaterThanOrEqual(100)
      expect(page.description.length, page.description).toBeLessThanOrEqual(170)
    }
  })

  it('has problems, deliverables and outcomes on every page', () => {
    for (const page of servicePages) {
      expect(page.problems.length).toBeGreaterThanOrEqual(4)
      expect(page.delivers.length).toBeGreaterThanOrEqual(4)
      expect(page.outcomes.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('uses "trusted data foundation" naturally on every page', () => {
    for (const page of servicePages) {
      expect(copyOf(page) + page.description, page.slug).toMatch(/trusted data foundation/)
    }
  })

  it('names Uganda or East Africa on every page, without stuffing it', () => {
    for (const page of servicePages) {
      const text = [page.title, page.description, copyOf(page)].join(' ')
      expect(text, page.slug).toMatch(/Uganda|East Africa/)
      expect((text.match(/Uganda/g) ?? []).length, page.slug).toBeLessThanOrEqual(3)
    }
  })

  it('explains Reverse ETL as operational data activation on the engineering page (SEO plan §5)', () => {
    const page = servicePages.find((item) => item.key === 'data-engineering-and-integration')!
    expect(page.activation?.heading).toBe('Operational data activation using Reverse ETL')
    expect(servicePages.filter((item) => item.activation)).toHaveLength(1)
  })

  it('links only to other services and to real solutions, with descriptive anchors', () => {
    const keys = servicePages.map((page) => page.key)
    const ids = solutions.map((solution) => solution.id)
    for (const page of servicePages) {
      expect(page.related.length).toBeGreaterThanOrEqual(3)
      for (const link of page.related) {
        expect(keys).toContain(link.service)
        expect(link.service).not.toBe(page.key)
        expect(link.label).not.toMatch(/learn more|read more|click here/i)
      }
      expect(new Set(page.related.map((link) => link.service)).size).toBe(page.related.length)
      for (const id of page.solutions) expect(ids).toContain(id)
    }
  })

  it('invents no clients, results or certifications, and no AI products', () => {
    const text = JSON.stringify(servicePages)
    expect(text).not.toMatch(/\bclients? (include|such as)|case stud|testimonial|certified (partner|by)|\d+%|ISO \d|Fafanua Intelligence|AI-powered|world-class|cutting-edge/i)
  })
})
