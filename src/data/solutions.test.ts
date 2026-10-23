import { describe, expect, it } from 'vitest'
import {
  footerSolutionIds,
  footerSolutions,
  homepageSolutionIds,
  homepageSolutions,
  solutions,
  solutionsIntro,
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

  // Three items for the homepage sectors, whose W7 tag lines lost
  // "Lineage" (#89) and whose fourth, Public Sector, takes section A's
  // line (#95), and plan V2's four for the others.
  it('has a three-item summary for each homepage sector and four for the others, with no empty or repeated item', () => {
    for (const solution of solutions) {
      const length = (homepageSolutionIds as readonly string[]).includes(solution.id) ? 3 : 4
      expect(solution.summary).toHaveLength(length)
      expect(new Set(solution.summary).size).toBe(length)
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

// Section A of the homepage sections refinement plan (#89).
describe('solutionsIntro', () => {
  it('holds a heading and an intro line, both non-empty and trimmed', () => {
    expect(Object.keys(solutionsIntro).sort()).toEqual(['heading', 'intro'])
    for (const text of Object.values(solutionsIntro)) {
      expect(text).toBe(text.trim())
      expect(text).not.toBe('')
    }
  })
})

// W7 in the trust and lineage plan (#73), as amended by section A of the
// refinement plan (#95): the homepage lists four sectors, and the footer's
// "More sectors" line links to the other two.
describe('the homepage and footer selections', () => {
  it('shows Health, Public Sector, Financial Services and Education on the homepage, in that order', () => {
    expect(homepageSolutionIds).toEqual(['health', 'public-sector', 'financial-services', 'education'])
    expect(homepageSolutions.map((solution) => solution.title)).toEqual([
      'Health',
      'Public Sector',
      'Financial Services',
      'Education',
    ])
  })

  it('links the other two from the footer, in data order', () => {
    expect(footerSolutionIds).toEqual(['retail-and-distribution', 'development-and-impact'])
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
