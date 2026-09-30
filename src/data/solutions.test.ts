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

  it('holds only an id, a title and themes: no client types', () => {
    for (const solution of solutions) {
      expect(Object.keys(solution).sort()).toEqual(['id', 'themes', 'title'])
    }
  })
})
