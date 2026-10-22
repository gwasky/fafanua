import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import {
  footerSolutions,
  homepageSolutions,
  solutions as allSolutions,
  solutionsIntro,
} from '../data/solutions.ts'
import { solutionPath } from '../paths.ts'
import Solutions from './Solutions.tsx'

// The homepage's three sectors, in W7's order (#73). The other three are
// linked from the footer's "More sectors" line instead.
const solutions = homepageSolutions

const TITLES = ['Health', 'Financial Services', 'Education']

// Section A of the homepage sections refinement plan (#89): W7's tag
// lines with "Lineage" removed.
const TAG_LINES = [
  'Branch comparability · Billing and claims · Pharmacy stock',
  'Payments · Reconciliation · Regulatory reporting',
  'Enrolment · Progression · Payments',
]

function renderSolutions() {
  render(<Solutions />)
  const section = screen.getByRole('region', { name: solutionsIntro.heading })
  const list = section.querySelector<HTMLElement>('.solutions__list')!
  const rows = [...list.children] as HTMLElement[]
  return { section, list, rows }
}

/** A row's parts: its h3, the link in it, its tags and its arrow. */
function parts(row: HTMLElement) {
  const heading = within(row).getByRole('heading', { level: 3 })
  const link = within(heading).getByRole('link')
  const [, tags, arrow, ...rest] = [...row.children] as HTMLElement[]
  return { heading, link, tags, arrow, rest }
}

// The text a screen reader gets from an element: its text without any
// aria-hidden subtree.
function accessibleText(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove())
  return copy.textContent ?? ''
}

describe('Solutions', () => {
  it('is section#solutions, labelled by its h2', () => {
    const { section } = renderSolutions()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'solutions')
    expect(section).toHaveAttribute('aria-labelledby', 'solutions-heading')
    expect(heading).toHaveAttribute('id', 'solutions-heading')
    expect(heading.textContent).toBe(solutionsIntro.heading)
    expect(heading.textContent).toBe('Built for the sectors we know')
  })

  // The h2 no longer repeats the nav label (#89): the nav entry and the
  // eyebrow keep "Solutions".
  it('keeps the Solutions nav label and the 03 — Solutions eyebrow', () => {
    const { section } = renderSolutions()
    const nav = navigation.find((item) => item.id === 'solutions')

    expect(nav?.label).toBe('Solutions')
    expect(section.querySelector('.section-eyebrow')?.textContent).toBe('03 — Solutions')
  })

  it('opens with the eyebrow, then the h2, then the intro line, then the rows', () => {
    const { list } = renderSolutions()
    const [eyebrow, heading, intro, rows, ...rest] = [...list.parentElement!.children]

    expect(rest).toHaveLength(0)
    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect(eyebrow.textContent).toBe('03 — Solutions')
    expect(heading.tagName).toBe('H2')
    expect(intro.tagName).toBe('P')
    expect(intro).toHaveClass('solutions__intro')
    expect(intro.textContent).toBe(solutionsIntro.intro)
    expect(intro.textContent).toBe(
      'In every sector, we start by tracing the numbers leadership relies on back to their source.',
    )
    expect(rows).toBe(list)
  })

  it('has one h2, then three h3s', () => {
    const { section } = renderSolutions()

    expect(
      within(section).getAllByRole('heading').map((heading) => heading.tagName),
    ).toEqual(['H2', 'H3', 'H3', 'H3'])
  })

  it('shows the three homepage sectors as an unordered list of rows, in W7 order, unnumbered', () => {
    const { list, rows } = renderSolutions()

    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
    expect(rows.map((row) => row.tagName)).toEqual(Array(3).fill('LI'))
    expect(rows.map((row) => parts(row).heading.textContent)).toEqual(TITLES)
    expect(solutions.map((solution) => solution.title)).toEqual(TITLES)
    expect(list.textContent).not.toMatch(/0[1-3]/)
  })

  // The other sectors are left to the footer (#73): no row names them.
  it('leaves Retail & Distribution, Development & Impact and Public Sector out', () => {
    const { section } = renderSolutions()

    expect(footerSolutions.map((solution) => solution.title)).toEqual([
      'Retail & Distribution',
      'Development & Impact',
      'Public Sector',
    ])
    for (const solution of footerSolutions) {
      expect(within(section).queryByRole('link', { name: solution.title })).toBeNull()
      expect(section.textContent).not.toContain(solution.title)
      expect(section.querySelector(`a[href="/solutions/${solution.slug}"]`)).toBeNull()
    }
    expect(allSolutions).toHaveLength(6)
  })

  // Required by #89: the rows replace the panels' links, so each row must
  // go to its sector's page.
  it('links each row, once, to its sector\'s landing page, named by the sector', () => {
    const { section, rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { link } = parts(row)

      expect(within(row).getAllByRole('link')).toEqual([link])
      expect(link).toHaveAccessibleName(TITLES[index])
      expect(link.textContent).toBe(TITLES[index])
      expect(link).toHaveAttribute('href', solutionPath(solutions[index].id))
    })
    expect(rows.map((row) => parts(row).link.getAttribute('href'))).toEqual([
      '/solutions/health',
      '/solutions/financial-services',
      '/solutions/education',
    ])
    expect(within(section).getAllByRole('link')).toHaveLength(3)
  })

  it('gives each row an h3 holding only its link', () => {
    const { rows } = renderSolutions()

    for (const row of rows) {
      const { heading, link } = parts(row)
      expect(row.firstElementChild).toBe(heading)
      expect([...heading.children]).toEqual([link])
      expect(link.tagName).toBe('A')
    }
  })

  it('shows the amended tag lines as one plain-text line each, outside the link', () => {
    const { section, rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { link, tags } = parts(row)

      expect(tags.tagName).toBe('P')
      expect(tags).toHaveClass('solution-row__tags')
      expect(tags.children).toHaveLength(0)
      expect(tags.textContent).toBe(TAG_LINES[index])
      expect(tags.textContent).toBe(solutions[index].summary.join(' · '))
      expect(link).not.toContainElement(tags)
    })
    expect(section.textContent).not.toMatch(/lineage/i)
  })

  it('ends each row with an aria-hidden arrow, outside the link', () => {
    const { rows } = renderSolutions()

    rows.forEach((row, index) => {
      const { link, arrow, rest } = parts(row)

      expect(rest).toHaveLength(0)
      expect(arrow.tagName).toBe('SPAN')
      expect(arrow.textContent).toBe('→')
      expect(arrow).toHaveAttribute('aria-hidden', 'true')
      expect(link).not.toContainElement(arrow)
      expect(accessibleText(link)).toBe(TITLES[index])
    })
  })

  it('has no accordion: no button, expanded state, hidden panel, theme list or SVG', () => {
    const { section } = renderSolutions()

    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll(
        'button, [aria-expanded], [aria-controls], [hidden], svg, img, [tabindex], input, select, textarea, details',
      ),
    ).toHaveLength(0)
    for (const solution of solutions) {
      for (const theme of solution.themes) expect(section.textContent).not.toContain(theme)
      expect(section.textContent).not.toContain(solution.heading)
    }
  })

  it('shows no doc labels, client types, stage labels or colour markers', () => {
    const { section } = renderSolutions()

    expect(section.textContent).not.toMatch(
      /suggested|potential|client|\bbanks\b|sacco|\bNGOs\b|case stud|testimonial|fafanua intelligence|saas|\bAI\b/i,
    )
    expect(section.innerHTML).not.toMatch(/service-card|marker|--service|stage/)
    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
  })
})
