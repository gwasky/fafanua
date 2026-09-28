import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import { processStages } from '../data/process.ts'
import Process from './Process.tsx'

function renderProcess() {
  render(<Process />)
  const section = screen.getByRole('region', { name: 'How We Work' })
  const list = within(section).getByRole('list')
  const stages = within(list).getAllByRole('listitem')
  return { section, list, stages }
}

// The text a screen reader gets from an element: its text without any
// aria-hidden subtree.
function accessibleText(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove())
  return copy.textContent ?? ''
}

describe('Process', () => {
  it('is section#how-we-work, labelled by the How We Work h2 from the navigation', () => {
    const { section } = renderProcess()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.id === 'how-we-work')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'how-we-work')
    expect(section).toHaveAttribute('aria-labelledby', 'how-we-work-heading')
    expect(heading).toHaveAttribute('id', 'how-we-work-heading')
    expect(heading.textContent).toBe('How We Work')
    expect(nav?.label).toBe(heading.textContent)
  })

  it('has one h2 and then four h3s, and no introduction paragraph', () => {
    const { section, list } = renderProcess()

    expect(
      within(section).getAllByRole('heading').map((heading) => heading.tagName),
    ).toEqual(['H2', 'H3', 'H3', 'H3', 'H3'])
    // Only the heading and the list sit above the stages.
    const container = list.parentElement!
    expect([...container.children].map((child) => child.tagName)).toEqual([
      'H2',
      'OL',
    ])
  })

  it('is an ordered list of four stages with no start or reversed', () => {
    const { list, stages } = renderProcess()

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list).not.toHaveAttribute('start')
    expect(list).not.toHaveAttribute('reversed')
    expect(stages).toHaveLength(4)
  })

  it('shows each stage as number, h3 name, then description, in data order', () => {
    const { stages } = renderProcess()

    stages.forEach((stage, index) => {
      const { name, description } = processStages[index]
      const [number, heading, paragraph, ...rest] = stage.children

      expect(rest).toHaveLength(0)
      expect(number.textContent).toBe(String(index + 1).padStart(2, '0'))
      expect(heading.tagName).toBe('H3')
      expect(heading).toBe(within(stage).getByRole('heading', { level: 3 }))
      expect(heading.textContent).toBe(name)
      expect(paragraph.tagName).toBe('P')
      expect(paragraph.textContent).toBe(description)
    })
    expect(
      stages.map((stage) => within(stage).getByRole('heading').textContent),
    ).toEqual(['Assess', 'Design', 'Build', 'Govern'])
  })

  it('announces no stage number: the visible number is aria-hidden', () => {
    const { stages } = renderProcess()

    stages.forEach((stage, index) => {
      expect(stage.textContent).toContain(String(index + 1))
      expect(accessibleText(stage)).not.toMatch(/\d/)
      expect(accessibleText(stage)).toBe(
        processStages[index].name + processStages[index].description,
      )
    })
  })

  it('contains no links, buttons or other tab stops', () => {
    const { section } = renderProcess()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll('a, button, input, select, textarea, [tabindex]'),
    ).toHaveLength(0)
  })

  it('does not mention Fafanua Intelligence, SaaS, AI, timelines or prices', () => {
    const { section } = renderProcess()

    expect(section.textContent).not.toMatch(
      /intelligence|saas|\bAI\b|week|month|day|price|cost|\$|journey|transformation/i,
    )
  })
})
