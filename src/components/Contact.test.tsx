import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { contactNavItem, footerNavigation, navigationCta } from '../data/navigation.ts'
import Contact from './Contact.tsx'

// Plan Section 11, character for character.
const HEADING = 'Discuss your data foundation.'
const PARAGRAPH =
  'Tell us about the systems, reporting challenges, or data priorities your organisation is working through.'
const EMAIL = 'info@fafanua.tech'
const HREF = 'mailto:info@fafanua.tech'

// Claims the section must not make: an existing Intelligence product, or
// SaaS or AI features.
const FORBIDDEN = ['Fafanua Intelligence', 'SaaS', 'AI-powered']

function renderContact() {
  render(<Contact />)
  return screen.getByRole('region', { name: HEADING })
}

describe('Contact', () => {
  it('is section#contact, a region named by its h2', () => {
    const section = renderContact()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'contact')
    expect(section).toHaveAttribute('aria-labelledby', 'contact-heading')
    expect(heading).toHaveAttribute('id', 'contact-heading')
  })

  it('uses the id of the header call to action and the footer Contact entry', () => {
    const section = renderContact()

    expect(section.id).toBe(navigationCta.id)
    expect(section.id).toBe(contactNavItem.id)
    expect(footerNavigation).toContain(contactNavItem)
  })

  it('has exactly one heading, an h2 with the plan wording', () => {
    const section = renderContact()

    const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6')
    expect(headings).toHaveLength(1)
    expect(headings[0].tagName).toBe('H2')
    expect(headings[0].textContent).toBe(HEADING)
  })

  it('has exactly one paragraph with the plan wording', () => {
    const section = renderContact()
    const paragraphs = section.querySelectorAll('p')

    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].textContent).toBe(PARAGRAPH)
  })

  it('has exactly two links, "Email us" then the address, both to the mailto', () => {
    const section = renderContact()
    const links = within(section).getAllByRole('link')

    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAccessibleName('Email us')
    expect(links[0].textContent).toBe('Email us')
    expect(links[1]).toHaveAccessibleName(EMAIL)
    expect(links[1].textContent).toBe(EMAIL)
    for (const link of links) {
      expect(link.tagName).toBe('A')
      expect(link.getAttribute('href')).toBe(HREF)
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('onclick')
    }
  })

  it('styles "Email us" as the primary button and keeps the address out of it', () => {
    const section = renderContact()
    const button = within(section).getByRole('link', { name: 'Email us' })
    const address = within(section).getByRole('link', { name: EMAIL })

    expect(button).toHaveClass('button')
    expect(button).not.toHaveClass('button--secondary')
    expect(button).not.toContainElement(address)
    expect(address).not.toHaveClass('button')
  })

  it('contains only the heading, paragraph and two links', () => {
    const section = renderContact()

    expect(section.textContent).toBe(HEADING + PARAGRAPH + 'Email us' + EMAIL)
  })

  it('has no form, input, textarea, button or iframe', () => {
    const section = renderContact()

    expect(
      section.querySelectorAll('form, input, textarea, select, button, iframe'),
    ).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
  })

  it('has no images or icons', () => {
    const section = renderContact()

    expect(section.querySelectorAll('img, picture, svg, canvas')).toHaveLength(0)
  })

  it('writes the address plainly, with no entities or splitting', () => {
    const section = renderContact()

    expect(section.innerHTML).not.toMatch(/&#|\[at\]/)
    expect(section.querySelector('.contact__email')?.childNodes).toHaveLength(1)
  })

  it.each(FORBIDDEN)('does not say "%s"', (phrase) => {
    const section = renderContact()

    expect(section.textContent?.toLowerCase()).not.toContain(phrase.toLowerCase())
  })

  it('has no phone number or web link', () => {
    const section = renderContact()

    expect(section.textContent).not.toMatch(/\+?\d[\d\s().-]{6,}\d/)
    expect(section.textContent).not.toMatch(/\d/)
    expect(section.querySelector('a[href^="http"], a[href^="tel:"]')).toBeNull()
  })

  it('sits on the graphite 100 surface, not a dark one', () => {
    const section = renderContact()

    expect(section).toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-dark')).toBeNull()
  })

  it('keeps its content inside .container', () => {
    const section = renderContact()
    const container = section.querySelector('.container')

    expect(container).not.toBeNull()
    expect(container).toContainElement(within(section).getByRole('heading'))
    for (const link of within(section).getAllByRole('link')) {
      expect(container).toContainElement(link)
    }
  })
})
