import { describe, expect, it } from 'vitest'
import {
  footerSolutionIds,
  footerSolutions,
  homepageSolutionIds,
  homepageSolutions,
  solutions,
} from './solutions.ts'

describe('solutions', () => {
  it('has exactly six solutions', () => {
    expect(solutions).toHaveLength(6)
  })

  it('has unique kebab-case ids', () => {
    const ids = solutions.map((solution) => solution.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })

  it('has a non-empty title and theme list for each', () => {
    for (const solution of solutions) {
      expect(solution.title.trim()).not.toBe('')
      expect(solution.themes.length).toBeGreaterThan(0)
      for (const theme of solution.themes) {
        expect(theme).toBe(theme.trim())
        expect(theme).not.toBe('')
      }
    }
  })

  it('has a four-item summary for each, with no empty or repeated item', () => {
    for (const solution of solutions) {
      expect(solution.summary).toHaveLength(4)
      expect(new Set(solution.summary).size).toBe(4)
      for (const item of solution.summary) {
        expect(item).toBe(item.trim())
        expect(item).not.toBe('')
      }
    }
  })

  it('holds an id, a slug, a title, a heading, a summary and themes', () => {
    for (const solution of solutions) {
      expect(Object.keys(solution).sort()).toEqual(['heading', 'id', 'slug', 'summary', 'themes', 'title'])
    }
  })

  it('keeps every solution in its data order, which drives the pages and the sitemap', () => {
    expect(solutions.map((solution) => solution.id)).toEqual([
      'financial-services',
      'retail-and-distribution',
      'development-and-impact',
      'health',
      'education',
      'public-sector',
    ])
  })
})

// W7 in the trust and lineage plan (#73): the homepage lists three
// sectors, and the footer's "More sectors" line links to the rest.
describe('the homepage and footer selections', () => {
  it('shows Health, Financial Services and Education on the homepage, in that order', () => {
    expect(homepageSolutionIds).toEqual(['health', 'financial-services', 'education'])
    expect(homepageSolutions.map((solution) => solution.title)).toEqual([
      'Health',
      'Financial Services',
      'Education',
    ])
  })

  it('links the other three from the footer, in data order', () => {
    expect(footerSolutionIds).toEqual([
      'retail-and-distribution',
      'development-and-impact',
      'public-sector',
    ])
    expect(footerSolutions.map((solution) => solution.id)).toEqual(
      solutions
        .filter((solution) => !(homepageSolutionIds as readonly string[]).includes(solution.id))
        .map((solution) => solution.id),
    )
  })

  it('selects the very objects in solutions', () => {
    for (const solution of [...homepageSolutions, ...footerSolutions]) {
      expect(solutions).toContain(solution)
    }
  })

  it('covers every solution exactly once between them, so every page keeps a link', () => {
    const selected = [...homepageSolutionIds, ...footerSolutionIds]

    expect(new Set(selected).size).toBe(selected.length)
    expect([...selected].sort()).toEqual(solutions.map((solution) => solution.id).sort())
  })
})
