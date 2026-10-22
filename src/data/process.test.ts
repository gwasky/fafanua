import { describe, expect, it } from 'vitest'
import { processIntro, processStages } from './process.ts'
import { managedServices } from './services.ts'

describe('processStages', () => {
  it('has the four stages in order with their ids', () => {
    expect(processStages.map((stage) => [stage.id, stage.name])).toEqual([
      ['assess', 'Assess'],
      ['design', 'Design'],
      ['build', 'Build'],
      ['govern', 'Govern'],
    ])
  })

  // The Assess description no longer has "organisation's" (#90), so the
  // check covers every string instead.
  it('has no curly apostrophe in any string', () => {
    for (const stage of processStages) {
      for (const text of [stage.name, stage.description, stage.output]) {
        expect(text).not.toContain('’')
      }
    }
    for (const text of Object.values(processIntro)) expect(text).not.toContain('’')
  })

  it('has no markdown or " - " separator in any string', () => {
    for (const stage of processStages) {
      for (const text of [stage.name, stage.description, stage.output]) {
        expect(text).not.toContain('**')
        expect(text).not.toContain(' - ')
        expect(text).toBe(text.trim())
      }
      expect(stage.description).toMatch(/\.$/)
    }
    for (const text of Object.values(processIntro)) {
      expect(text).not.toContain('**')
      expect(text).not.toContain(' - ')
    }
  })

  it('puts each stage in a phase of the Managed Services journey (#90)', () => {
    expect(processStages.map((stage) => stage.phase)).toEqual([0, 1, 1, 2])
    for (const stage of processStages) {
      expect(managedServices.journey[stage.phase], stage.id).toBeDefined()
    }
  })
})

describe('processIntro', () => {
  it('has exactly the heading, the output label and the start tag, non-empty and trimmed', () => {
    expect(Object.keys(processIntro).sort()).toEqual(['heading', 'outputLabel', 'startTag'])
    for (const text of Object.values(processIntro)) {
      expect(text).not.toBe('')
      expect(text).toBe(text.trim())
    }
  })

  it('stores the labels in sentence case: CSS shows them in capitals', () => {
    for (const text of [processIntro.outputLabel, processIntro.startTag]) {
      expect(text).not.toBe(text.toUpperCase())
    }
  })
})
