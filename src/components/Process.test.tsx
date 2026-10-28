import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { navigation } from '../data/navigation.ts'
import { processIntro, processStages } from '../data/process.ts'
import { managedServices } from '../data/services.ts'
import Process from './Process.tsx'

// jsdom has no matchMedia. This stand-in answers every query with
// `hoverRow` (the highlight's '(hover: hover) and (min-width: 64em)'),
// records the queries asked, and lets a test fire a change as if the
// window had been resized or the mouse had gone.
type Listener = (event: MediaQueryListEvent) => void
let hoverRow: boolean
let queries: string[]
let listeners: Set<Listener>

beforeEach(() => {
  hoverRow = false
  queries = []
  listeners = new Set()
  vi.stubGlobal('matchMedia', (media: string) => {
    queries.push(media)
    return {
      media,
      matches: hoverRow,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
    }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderProcess() {
  render(<Process />)
  const section = screen.getByRole('region', { name: processIntro.heading })
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

// A pointer event with its pointerType set, whether or not jsdom's
// PointerEvent carries one.
function pointerEnter(element: Element, pointerType: string) {
  const event = new MouseEvent('pointerover', { bubbles: true })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  // React's onPointerEnter listens for pointerover/pointerout pairs.
  fireEvent(element, event)
}

function pointerLeave(element: Element) {
  const event = new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  fireEvent(element, event)
}

// Which step is highlighted: the indices with data-highlighted, and those
// whose card is .surface-dark.
function highlighted(stages: HTMLElement[]) {
  return {
    items: stages.flatMap((stage, index) => (stage.hasAttribute('data-highlighted') ? [index] : [])),
    cards: stages.flatMap((stage, index) =>
      stage.querySelector('.process__card')!.classList.contains('surface-dark') ? [index] : [],
    ),
  }
}

describe('Process', () => {
  it('is section#how-we-work, labelled by its h2', () => {
    const { section } = renderProcess()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'how-we-work')
    expect(section).toHaveAttribute('aria-labelledby', 'how-we-work-heading')
    expect(heading).toHaveAttribute('id', 'how-we-work-heading')
    expect(heading.textContent).toBe(processIntro.heading)
    expect(heading.textContent).toBe('From first assessment to ongoing support')
  })

  it('keeps the How We Work label in the navigation and the eyebrow (#90)', () => {
    const { section } = renderProcess()

    expect(navigation.find((item) => item.id === 'how-we-work')?.label).toBe('How We Work')
    expect(section.querySelector('.section-eyebrow')?.textContent).toBe('04 — How We Work')
  })

  it('opens with the 04 — How We Work eyebrow, then the h2, then the list', () => {
    const { list } = renderProcess()
    const [eyebrow, heading, timeline, ...rest] = [...list.parentElement!.children]

    expect(rest).toHaveLength(0)
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect(eyebrow.textContent).toBe('04 — How We Work')
    expect(heading.tagName).toBe('H2')
    expect(timeline).toBe(list)
  })

  it('has one h2 and then four h3s, and no introduction paragraph', () => {
    const { section } = renderProcess()

    expect(
      within(section).getAllByRole('heading').map((heading) => heading.tagName),
    ).toEqual(['H2', 'H3', 'H3', 'H3', 'H3'])
    // Besides the eyebrow, the only paragraphs are each step's stage label
    // (the first step of each phase), step 01's tag, the description, the
    // output label and the output (#63, #90).
    expect([...section.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      '04 — How We Work',
      managedServices.journey[0],
      'Start here',
      processStages[0].description,
      'You get',
      processStages[0].output,
      managedServices.journey[1],
      processStages[1].description,
      'You get',
      processStages[1].output,
      processStages[2].description,
      'You get',
      processStages[2].output,
      managedServices.journey[2],
      processStages[3].description,
      'You get',
      processStages[3].output,
    ])
  })

  it('is an ordered list of four steps with no start or reversed', () => {
    const { list, stages } = renderProcess()

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list).not.toHaveAttribute('start')
    expect(list).not.toHaveAttribute('reversed')
    expect(stages).toHaveLength(4)
  })

  it('shows each step as its stage label, its track, then its card, in data order', () => {
    const { stages } = renderProcess()
    const labels = [managedServices.journey[0], managedServices.journey[1], null, managedServices.journey[2]]

    stages.forEach((stage, index) => {
      const children = [...stage.children]
      const label = labels[index]
      if (label !== null) {
        const phase = children.shift()!
        expect(phase.tagName).toBe('P')
        expect(phase).toHaveClass('process__phase')
        expect(phase.textContent).toBe(label)
        expect(phase.classList.contains('process__phase--current')).toBe(index === 0)
      }
      const [track, card, ...rest] = children
      expect(rest).toHaveLength(0)
      expect(track.tagName).toBe('SPAN')
      expect(track).toHaveClass('process__track')
      expect(track).toHaveAttribute('aria-hidden', 'true')
      expect(track.childNodes).toHaveLength(0)
      expect(card.tagName).toBe('DIV')
      expect(card).toHaveClass('process__card')
    })
    expect(stages.map((stage) => stage.dataset.phase)).toEqual([
      'assessment',
      'implementation',
      'implementation',
      'managed',
    ])
  })

  it('takes the stage labels from the Managed Services journey, not a copy', () => {
    const { section } = renderProcess()

    expect([...section.querySelectorAll('.process__phase')].map((p) => p.textContent)).toEqual([
      ...managedServices.journey,
    ])
  })

  it('shows each card as the tag (step 01), the h3 (its hidden numeral, then the name), the description, then the output', () => {
    const { stages } = renderProcess()

    stages.forEach((stage, index) => {
      const { name, description, output } = processStages[index]
      const card = stage.querySelector('.process__card')!
      const children = [...card.children]
      if (index === 0) {
        const tag = children.shift()!
        expect(tag.tagName).toBe('P')
        expect(tag).toHaveClass('process__tag')
        expect(tag).toHaveClass('surface-light')
        expect(tag.textContent).toBe(processIntro.startTag)
      }
      const [heading, paragraph, outputBlock, ...rest] = children

      expect(rest).toHaveLength(0)
      expect(heading.tagName).toBe('H3')
      expect(heading).toBe(within(stage).getByRole('heading', { level: 3 }))
      // The small numeral is the h3's first child, inline before the name
      // and hidden, so the accessible name is the step name alone (issue 102).
      // The space between them is CSS, not a typed character.
      const [number, ...others] = [...heading.children]
      expect(others).toHaveLength(0)
      expect(number.tagName).toBe('SPAN')
      expect(number).toHaveClass('process__number')
      expect(number.textContent).toBe(String(index + 1).padStart(2, '0'))
      expect(number).toHaveAttribute('aria-hidden', 'true')
      expect(heading.firstChild).toBe(number)
      expect(heading.textContent).toBe(`${number.textContent}${name}`)
      expect(heading).toHaveAccessibleName(name)
      expect(paragraph.tagName).toBe('P')
      expect(paragraph.textContent).toBe(description)
      expect(outputBlock).toHaveClass('process__output')
      // The label, then the output: plain text, not a heading, link or
      // button.
      const [label, outputParagraph, ...more] = [...outputBlock.children]
      expect(more).toHaveLength(0)
      expect(label.tagName).toBe('P')
      expect(label.textContent).toBe(processIntro.outputLabel)
      expect(outputParagraph.tagName).toBe('P')
      expect(outputParagraph.textContent).toBe(output)
      expect(outputParagraph.children).toHaveLength(0)
    })
    expect(stages.map((stage) => stage.querySelector('.process__output-text')!.textContent)).toEqual([
      // "a fix list" became "a prioritised roadmap" (the owner's decision on #99).
      'Lineage map, trust scorecard, shared definitions and a prioritised roadmap',
      'Architecture & delivery roadmap',
      'Pipelines, models & analytical products',
      'Ownership, monitoring & continuous improvement',
    ])
    stages.forEach((stage, index) => {
      expect(within(stage).getByRole('heading')).toHaveAccessibleName(
        ['Assess', 'Design', 'Build', 'Govern'][index],
      )
    })
    // Only step 01 carries the tag.
    expect(stages.map((stage) => stage.querySelectorAll('.process__tag').length)).toEqual([1, 0, 0, 0])
  })

  it('stores the labels in sentence case: CSS shows them in capitals', () => {
    const { section } = renderProcess()

    for (const text of [...managedServices.journey, 'You get', 'Start here']) {
      expect(section.textContent).toContain(text)
      expect(section.textContent).not.toContain(text.toUpperCase())
    }
  })

  it('announces no step number: the visible numeral is aria-hidden', () => {
    const { stages } = renderProcess()
    const [assessment, implementation, managed] = managedServices.journey
    const labels = [assessment, implementation, '', managed]

    stages.forEach((stage, index) => {
      const { name, description, output } = processStages[index]
      expect(stage.textContent).toContain(String(index + 1))
      expect(accessibleText(stage)).not.toMatch(/\d/)
      expect(accessibleText(stage)).toBe(
        labels[index] + (index === 0 ? 'Start here' : '') + name + description + 'You get' + output,
      )
    })
  })

  it('draws the track in CSS: one empty span per step, no images, SVG or rules', () => {
    const { section, stages } = renderProcess()

    for (const stage of stages) {
      const tracks = stage.querySelectorAll('.process__track')
      expect(tracks).toHaveLength(1)
      expect(tracks[0].textContent).toBe('')
    }
    expect(section.querySelectorAll('img, svg, canvas, hr')).toHaveLength(0)
  })

  it('contains no links, buttons, titles or other tab stops', () => {
    const { section } = renderProcess()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll('a, button, input, select, textarea, [tabindex], [title]'),
    ).toHaveLength(0)
  })

  it('does not mention Fafanua Intelligence, SaaS, AI, timelines or prices', () => {
    const { section } = renderProcess()

    expect(section.textContent).not.toMatch(
      /intelligence|saas|\bAI\b|week|month|day|price|cost|\$|journey|transformation/i,
    )
    expect(section.textContent).not.toMatch(/traceability/i)
  })
})

describe('Process highlight (#90)', () => {
  it('highlights step 01, and only step 01, at rest, with its tag', () => {
    const { stages } = renderProcess()

    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
    expect(stages[0]).toHaveAttribute('data-highlighted', '')
    expect(stages[0].querySelector('.process__card .process__tag')?.textContent).toBe('Start here')
  })

  it('asks the hover-capable row query', () => {
    renderProcess()

    expect(queries).toContain('(hover: hover) and (min-width: 64em)')
  })

  it('moves to the step a mouse enters on a hover-capable row, and back to 01 when the pointer leaves the section', () => {
    hoverRow = true
    const { section, stages } = renderProcess()

    pointerEnter(stages[2], 'mouse')
    expect(highlighted(stages)).toEqual({ items: [2], cards: [2] })
    // Step 01 keeps its tag in its light style.
    expect(stages[0].querySelector('.process__tag')).not.toBeNull()

    pointerEnter(stages[1], 'mouse')
    expect(highlighted(stages)).toEqual({ items: [1], cards: [1] })

    pointerLeave(section)
    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
  })

  it('stays on step 01 for a touch', () => {
    hoverRow = true
    const { stages } = renderProcess()

    pointerEnter(stages[2], 'touch')
    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
    pointerEnter(stages[3], 'pen')
    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
  })

  it('stays on step 01 for a mouse when the query does not match (below 64em, or no hover)', () => {
    const { stages } = renderProcess()

    pointerEnter(stages[2], 'mouse')
    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
  })

  it('returns to step 01 when the query stops matching', () => {
    hoverRow = true
    const { stages } = renderProcess()

    pointerEnter(stages[3], 'mouse')
    expect(highlighted(stages)).toEqual({ items: [3], cards: [3] })
    act(() => {
      for (const listener of listeners) listener({ matches: false } as MediaQueryListEvent)
    })
    expect(highlighted(stages)).toEqual({ items: [0], cards: [0] })
  })

  it('reveals nothing on hover but the highlight', () => {
    hoverRow = true
    const { section, stages } = renderProcess()
    const strip = (html: string) =>
      html.replace(/ data-highlighted=""/g, '').replace(/ surface-dark/g, '')
    const before = strip(section.outerHTML)

    pointerEnter(stages[2], 'mouse')
    expect(strip(section.outerHTML)).toBe(before)
  })
})
