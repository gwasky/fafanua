import { describe, expect, it } from 'vitest'
import { processStages } from './process.ts'

describe('processStages', () => {
  it('has the four stages in order with their ids', () => {
    expect(processStages.map((stage) => [stage.id, stage.name])).toEqual([
      ['assess', 'Assess'],
      ['design', 'Design'],
      ['build', 'Build'],
      ['govern', 'Govern'],
    ])
  })

  it('uses a straight apostrophe in "organisation\'s"', () => {
    expect(processStages[0].description).toContain("organisation's")
    expect(processStages[0].description).not.toContain('’')
  })

  it('has no markdown or " - " separator in any string', () => {
    for (const stage of processStages) {
      for (const text of [stage.name, stage.description]) {
        expect(text).not.toContain('**')
        expect(text).not.toContain(' - ')
        expect(text).toBe(text.trim())
      }
      expect(stage.description).toMatch(/\.$/)
    }
  })
})
