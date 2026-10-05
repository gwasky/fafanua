import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import { solutions } from '../data/solutions.ts'
import Solutions from './Solutions.tsx'

const TITLES = [
  'Financial Services',
  'Retail & Distribution',
  'Development & Impact',
  'Education',
  'Public Sector',
]

function renderSolutions() {
  render(<Solutions />)
  const section = screen.getByRole('region', { name: 'Solutions' })
  const list = section.querySelector<HTMLElement>('.solutions__list')!
  const rows = [...list.children] as HTMLElement[]
  return { section, list, rows }
}

/** A row's parts: its h3, the button in it, its summary and its panel. */
function parts(row: HTMLElement) {
  const heading = within(row).getByRole('heading', { level: 3 })
  const button = within(heading).getByRole('button')
  const panel = row.querySelector<HTMLElement>(`[id="${button.getAttribute('aria-controls')}"]`)!
  const [, summary] = [...row.children] as HTMLElement[]
  return { heading, button, summary, panel }
}

// The text a screen reader gets from an element: its text without any
// aria-hidden subtree.
function accessibleText(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove())
  return copy.textContent ?? ''
}

describe('Solutions', () => {
  it('is section#solutions, labelled by the Solutions h2 from the navigation', () => {
    const { section } = renderSolutions()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.id === 'solutions')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'solutions')
    expect(section).toHaveAttribute('aria-labelledby', 'solutions-heading')
    expect(heading).toHaveAttribute('id', 'solutions-heading')
    expect(heading.textContent).toBe('Solutions')
    expect(nav?.label).toBe(heading.textContent)
  })

  it('opens with the 03 — Solutions eyebrow, then the h2, then the rows', () => {
    const { list } = renderSolutions()
    const [eyebrow, heading, rows, ...rest] = [...list.parentElement!.children]

    expect(rest).toHaveLength(0)
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect(eyebrow.textContent).toBe('03 — Solutions')
    expect(heading.tagName).toBe('H2')
    expect(rows).toBe(list)
  })

  it('has one h2, then five h3s, and no introduction paragraph', () => {
    const { section } = renderSolutions()

    expect(
      within(section).getAllByRole('heading').map((heading) => heading.tagName),
    ).toEqual(['H2', 'H3', 'H3', 'H3', 'H3', 'H3'])
    // The eyebrow is the section's only paragraph.
    expect([...section.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      '03 — Solutions',
    ])
  })

  it('shows the five sectors as an ordered list of rows, in data order', () => {
    const { list, rows } = renderSolutions()

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(rows.map((row) => row.tagName)).toEqual(Array(5).fill('LI'))
    expect(rows.map((row) => parts(row).heading.textContent)).toEqual(
      TITLES.map((title, index) => `0${index + 1}${title}`),
    )
    expect(solutions.map((solution) => solution.title)).toEqual(TITLES)
  })

  it('gives each row an h3 holding one button, named exactly the sector title', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { heading, button } = parts(row)

      expect([...heading.children]).toEqual([button])
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAccessibleName(TITLES[index])
      expect(
        within(row).getByRole('button', { name: TITLES[index] }),
      ).toBe(button)
    })
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('shows the number 01 to 05 and a chevron in each button, both aria-hidden', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { button } = parts(row)
      const [number, title, chevron, ...rest] = [...button.children]

      expect(rest).toHaveLength(0)
      expect(number.textContent).toBe(`0${index + 1}`)
      expect(number).toHaveAttribute('aria-hidden', 'true')
      expect(title.textContent).toBe(TITLES[index])
      expect(chevron.tagName.toLowerCase()).toBe('svg')
      expect(chevron).toHaveAttribute('aria-hidden', 'true')
      expect(chevron).toHaveAttribute('focusable', 'false')
      expect(accessibleText(button)).toBe(TITLES[index])
    })
  })

  it('lists each row\'s plan V2 summary outside the button, always visible', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { button, summary } = parts(row)

      expect(summary.tagName).toBe('UL')
      expect(summary).toHaveAttribute('role', 'list')
      expect(button).not.toContainElement(summary)
      expect(summary).toBeVisible()
      expect(
        within(summary).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(solutions[index].summary)
      // The separators are drawn in CSS: no text and no extra elements.
      expect(summary.textContent).toBe(solutions[index].summary.join(''))
    })
  })

  it('has every row collapsed on load, with its panel hidden', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { button, panel } = parts(row)

      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-controls', `${solutions[index].id}-themes`)
      expect(panel).toHaveAttribute('hidden')
      expect(panel).not.toBeVisible()
      expect(row.lastElementChild).toBe(panel)
    })
  })

  it('reveals the full theme list, in data order, once a row is opened', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { button, panel } = parts(row)
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(panel).not.toHaveAttribute('hidden')
      expect(panel).toBeVisible()
      const themes = within(panel).getByRole('list')
      expect(themes.tagName).toBe('UL')
      expect(themes).toHaveAttribute('role', 'list')
      expect(
        within(themes).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(solutions[index].themes)
    })
  })

  it('toggles each row with a click, Enter and Space, keeping focus on its button', () => {
    const { rows } = renderSolutions()

    // jsdom does not turn a key into a click, as a browser does for a
    // native button: Enter on keydown and Space on keyup. So each key is
    // sent, checked not to be cancelled, and followed by the click the
    // browser fires for it (detail 0, as for a keyboard click). The real
    // keys are pressed in Chromium and WebKit in e2e/keyboard.spec.ts.
    const press = (button: HTMLElement, key: 'Enter' | ' ') => {
      expect(fireEvent.keyDown(button, { key }), `${key} keydown not cancelled`).toBe(true)
      expect(fireEvent.keyUp(button, { key }), `${key} keyup not cancelled`).toBe(true)
      fireEvent.click(button, { detail: 0 })
    }

    for (const row of rows) {
      const { button, panel } = parts(row)

      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(panel).toBeVisible()
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(panel).not.toBeVisible()

      button.focus()
      press(button, 'Enter')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveFocus()
      press(button, 'Enter')
      expect(button).toHaveAttribute('aria-expanded', 'false')

      press(button, ' ')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(panel).toBeVisible()
      expect(button).toHaveFocus()
      press(button, ' ')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(panel).not.toBeVisible()
    }
  })

  it('opens nothing on focus or hover', () => {
    const { rows } = renderSolutions()

    for (const row of rows) {
      const { button, summary } = parts(row)
      button.focus()
      expect(button).toHaveFocus()
      for (const target of [button, summary, row]) {
        fireEvent.pointerEnter(target)
        fireEvent.mouseEnter(target)
        fireEvent.mouseOver(target)
      }
      button.blur()
    }
    for (const row of rows) {
      expect(parts(row).button).toHaveAttribute('aria-expanded', 'false')
      expect(parts(row).panel).not.toBeVisible()
    }
  })

  it('does not toggle a row from its summary', () => {
    const { rows } = renderSolutions()
    const { button, summary } = parts(rows[0])

    fireEvent.click(summary)
    fireEvent.click(within(summary).getAllByRole('listitem')[0])
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps rows independent: all five can be open at once', () => {
    const { rows } = renderSolutions()
    const buttons = rows.map((row) => parts(row).button)

    fireEvent.click(buttons[1])
    fireEvent.click(buttons[3])
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'false', 'true', 'false', 'true', 'false',
    ])

    for (const button of [buttons[0], buttons[2], buttons[4]]) fireEvent.click(button)
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual(
      Array(5).fill('true'),
    )
    for (const row of rows) expect(parts(row).panel).toBeVisible()

    fireEvent.click(buttons[2])
    expect(buttons.map((button) => button.getAttribute('aria-expanded'))).toEqual([
      'true', 'true', 'false', 'true', 'true',
    ])
  })

  it('has no links, images or tab stops other than the five buttons', () => {
    const { section } = renderSolutions()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(
      section.querySelectorAll('a, input, select, textarea, details, img, [tabindex]'),
    ).toHaveLength(0)
    expect(section.querySelectorAll('button')).toHaveLength(5)
  })

  it('shows no doc labels, client types, stage labels or colour markers', () => {
    const { section } = renderSolutions()
    for (const button of within(section).getAllByRole('button')) fireEvent.click(button)

    expect(section.textContent).not.toMatch(
      /suggested|potential|client|\bbanks\b|sacco|\bNGOs\b|case stud|testimonial|fafanua intelligence|saas|\bAI\b/i,
    )
    expect(section.innerHTML).not.toMatch(/service-card|marker|--service|stage/)
    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
  })
})
