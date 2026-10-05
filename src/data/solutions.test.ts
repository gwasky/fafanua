import { describe, expect, it } from 'vitest'
import { solutions } from './solutions.ts'

describe('solutions', () => {
  it('has exactly five solutions', () => {
    expect(solutions).toHaveLength(5)
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

  it('holds only an id, a title, a summary and themes: no client types', () => {
    for (const solution of solutions) {
      expect(Object.keys(solution).sort()).toEqual(['id', 'summary', 'themes', 'title'])
    }
  })
})
