import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import About from './About.tsx'

// Plan Section 6 item 7 and Section 10, character for character.
const HEADING = 'About Fafanua'
const PARAGRAPH =
  'Fafanua Technologies Limited helps African organisations build dependable data platforms and analytical systems. We combine data engineering, business modelling, governance, and reporting expertise to turn fragmented organisational data into trusted assets for decision-making.'

// Claims the section must not make: an existing Intelligence product, SaaS
// or AI features, or a founder-led company.
const FORBIDDEN = ['Fafanua Intelligence', 'SaaS', 'AI-powered', 'founder', 'CEO']

function renderAbout() {
  render(<About />)
  return screen.getByRole('region', { name: HEADING })
}

describe('About', () => {
  it('is section#about, a region named by its h2', () => {
    const section = renderAbout()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'about')
    expect(section).toHaveAttribute('aria-labelledby', 'about-heading')
    expect(heading).toHaveAttribute('id', 'about-heading')
  })

  it('uses the id of the About navigation entry', () => {
    const section = renderAbout()
    const nav = navigation.find((item) => item.label === 'About')

    expect(section.id).toBe(nav?.id)
  })

  it('has exactly one heading, an h2 with the plan wording', () => {
    const section = renderAbout()
    const headings = within(section).getAllByRole('heading')

    expect(headings).toHaveLength(1)
    expect(headings[0].tagName).toBe('H2')
    expect(headings[0].textContent).toBe(HEADING)
    expect(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1)
  })

  it('has exactly one paragraph with the plan wording', () => {
    const section = renderAbout()
    const paragraphs = section.querySelectorAll('p')

    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].textContent).toBe(PARAGRAPH)
  })

  it('keeps "African organisations" rather than "East African"', () => {
    const section = renderAbout()

    expect(section.textContent).toContain('helps African organisations')
    expect(section.textContent).not.toContain('East African')
  })

  it('contains only the heading and the paragraph, nothing else', () => {
    const section = renderAbout()

    expect(section.textContent).toBe(HEADING + PARAGRAPH)
  })

  it('has no eyebrow, number or second column: one heading and one paragraph in the container (#60)', () => {
    const section = renderAbout()
    const container = section.querySelector('.container')!

    expect(section.querySelector('.section-eyebrow')).toBeNull()
    expect(section.children).toHaveLength(1)
    expect([...container.children].map((child) => child.tagName)).toEqual(['H2', 'P'])
  })

  it('uses plain ASCII text with no manual line breaks or non-breaking spaces', () => {
    const section = renderAbout()

    expect(section.querySelector('br')).toBeNull()
    expect(section.textContent).not.toMatch(/\u00a0/)
    expect(section.textContent).toMatch(/^[\x20-\x7e]+$/)
    expect(section.innerHTML).not.toContain('&nbsp;')
  })

  it('contains no links, buttons, form controls or other tab stops', () => {
    const section = renderAbout()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll(
        'a, button, input, select, textarea, iframe, [tabindex], [contenteditable], summary',
      ),
    ).toHaveLength(0)
  })

  it('has no images, icons, logos or charts', () => {
    const section = renderAbout()

    expect(
      section.querySelectorAll('img, picture, svg, canvas, video, iframe, object'),
    ).toHaveLength(0)
  })

  it.each(FORBIDDEN)('does not say "%s"', (phrase) => {
    const section = renderAbout()

    expect(section.textContent?.toLowerCase()).not.toContain(phrase.toLowerCase())
  })

  it('contains no digits, so no figures, years or registration numbers', () => {
    const section = renderAbout()

    expect(section.textContent).not.toMatch(/\d/)
  })

  it('sits on the page background, not an alternate or dark surface', () => {
    const section = renderAbout()

    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt, .surface-dark')).toBeNull()
  })

  it('keeps the heading and paragraph inside .container', () => {
    const section = renderAbout()
    const container = section.querySelector('.container')

    expect(container).not.toBeNull()
    expect(container).toContainElement(within(section).getByRole('heading'))
    expect(container).toContainElement(section.querySelector('p'))
  })
})
