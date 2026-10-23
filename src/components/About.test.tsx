import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import About from './About.tsx'

// Section D of the homepage sections refinement plan (§7, #92), character
// for character. The eyebrow and the principles label are in sentence
// case in the DOM, and shown in capitals by CSS.
const EYEBROW = '05 — About Fafanua'
const HEADING = 'Data foundations built for how organisations actually operate.'
const WORD = 'fafanua'
const NOTE = 'Swahili, verb'
const DEFINITION = 'To explain; to make clear. It is what we do with your numbers.'
const PARAGRAPH =
  'Fafanua Technologies Limited helps organisations in Africa build and strengthen dependable data platforms and analytical systems. We combine data engineering, business modelling, governance and reporting expertise to turn fragmented organisational data into trusted assets for decision-making.'
const LOCATION = 'Based in Kampala, working across East Africa'
const LABEL = 'How we work with data'
const PRINCIPLES = [
  ['Explicit over automatic', 'Every definition, rule and owner is written down, not assumed.'],
  ['One source of truth', 'Each metric is defined once and used the same way everywhere.'],
  ['Built as code', 'Pipelines and platforms are versioned, reviewed and repeatable.'],
]

// Claims the section must not make: an existing Intelligence product, SaaS
// or AI features, or a founder-led company (W8's founder block is
// deferred, #75).
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
    expect(heading.textContent).toBe(HEADING)
  })

  it('uses the id of the About navigation entry', () => {
    const section = renderAbout()
    const nav = navigation.find((item) => item.label === 'About')

    expect(section.id).toBe(nav?.id)
  })

  it('has one h2, then three h3s, the principle names in order, and no other heading', () => {
    const section = renderAbout()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ['H2', HEADING],
      ...PRINCIPLES.map(([name]) => ['H3', name]),
    ])
    expect(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(4)
    for (const text of [EYEBROW, WORD, DEFINITION, LOCATION, LABEL, 'About Fafanua']) {
      expect(within(section).queryByRole('heading', { name: text })).toBeNull()
    }
  })

  it('shows the "05 — About Fafanua" eyebrow as a paragraph, before the h2', () => {
    const section = renderAbout()
    const eyebrow = section.querySelector('.section-eyebrow')!

    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow.textContent).toBe(EYEBROW)
    expect(
      eyebrow.compareDocumentPosition(within(section).getByRole('heading', { level: 2 })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('marks the word as a dfn in Swahili, and nothing else in the section', () => {
    const section = renderAbout()
    const dfn = section.querySelector('dfn')!

    expect(section.querySelectorAll('dfn')).toHaveLength(1)
    expect(dfn).toHaveAttribute('lang', 'sw')
    expect(dfn.textContent).toBe(WORD)
    expect([...section.querySelectorAll('[lang]')]).toEqual([dfn])
  })

  it('holds the word, its note and the definition in one paragraph, with the word and note apart', () => {
    const section = renderAbout()
    const paragraph = section.querySelector('dfn')!.closest('p')!

    expect(paragraph.textContent).toBe(`${WORD} ${NOTE} ${DEFINITION}`)
    expect(paragraph.textContent).not.toContain(`${WORD}${NOTE}`)
  })

  it('shows the unchanged paragraph and the location line, each a paragraph', () => {
    const section = renderAbout()

    expect(within(section).getByText(PARAGRAPH).tagName).toBe('P')
    expect(within(section).getByText(LOCATION).tagName).toBe('P')
    expect(section.textContent?.split(HEADING)).toHaveLength(2)
  })

  it('lists the three principles in one list named by its label, each an h3 then its description', () => {
    const section = renderAbout()
    const list = within(section).getByRole('list', { name: LABEL })
    const items = within(list).getAllByRole('listitem')

    expect(section.querySelectorAll('ul, ol')).toHaveLength(1)
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
    expect(document.getElementById(list.getAttribute('aria-labelledby')!)?.tagName).toBe('P')
    expect(items.map((item) => [...item.children].map((child) => [child.tagName, child.textContent]))).toEqual(
      PRINCIPLES.map(([name, description]) => [
        ['H3', name],
        ['P', description],
      ]),
    )
  })

  it('says "organisations in Africa", not "African organisations" or "East African" (#72)', () => {
    const section = renderAbout()

    expect(section.textContent).toContain('helps organisations in Africa')
    expect(section.textContent).not.toMatch(/African organisations/i)
    expect(section.textContent).not.toContain('East African')
  })

  it('contains section D\'s text in DOM order, and nothing else', () => {
    const section = renderAbout()

    expect(section.textContent).toBe(
      EYEBROW +
        HEADING +
        `${WORD} ${NOTE} ${DEFINITION}` +
        PARAGRAPH +
        LOCATION +
        LABEL +
        PRINCIPLES.flat().join(''),
    )
  })

  it('uses plain ASCII text apart from the eyebrow\'s U+2014 dash, with no manual line breaks or non-breaking spaces', () => {
    const section = renderAbout()
    const text = section.textContent!

    expect(section.querySelector('br')).toBeNull()
    expect(text).not.toMatch(/\u00a0/)
    expect(text.split('—')).toHaveLength(2)
    expect(text.replace(EYEBROW, '')).toMatch(/^[\x20-\x7e]+$/)
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

  it('contains no digits outside the eyebrow\'s 05, so no figures, years or registration numbers', () => {
    const section = renderAbout()

    expect(section.textContent?.match(/\d+/g)).toEqual(['05'])
    expect(section.textContent?.replace(EYEBROW, '')).not.toMatch(/\d/)
  })

  it('sits on the page background, not an alternate or dark surface', () => {
    const section = renderAbout()

    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt, .surface-dark')).toBeNull()
  })

  it('has the .container as its one child, holding all the content', () => {
    const section = renderAbout()
    const container = section.querySelector('.container')

    expect(section.children).toHaveLength(1)
    expect(section.children[0]).toBe(container)
    expect(container?.textContent).toBe(section.textContent)
  })
})
