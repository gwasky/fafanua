import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { contactNavItem, footerNavigation, navigationCta } from '../data/navigation.ts'
import Contact from './Contact.tsx'

// Plan V2 §16 and plan Section 11, character for character: the heading
// with its typographic apostrophe (U+2019), the supporting copy and the
// button label without its arrow. The phone number is the owner's
// decision on #60.
const HEADING = 'Let\u2019s build a data foundation your organisation can trust.'
const PARAGRAPH =
  'Tell us about the systems, reporting challenges, or data priorities your organisation is working through.'
const LABEL = 'Discuss your data needs'
const EMAIL = 'info@fafanua.tech'
const HREF = 'mailto:info@fafanua.tech'
const PHONE = '+256 752 008822'
const TEL = 'tel:+256752008822'

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

  it('has exactly three links: the button and the address, both to the mailto, then the phone number', () => {
    const section = renderContact()
    const links = within(section).getAllByRole('link')

    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAccessibleName(LABEL)
    expect(links[1]).toHaveAccessibleName(EMAIL)
    expect(links[1].textContent).toBe(EMAIL)
    expect(links[2]).toHaveAccessibleName(PHONE)
    expect(links[2].textContent).toBe(PHONE)
    expect(links.map((link) => link.getAttribute('href'))).toEqual([HREF, HREF, TEL])
    for (const link of links) {
      expect(link.tagName).toBe('A')
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('onclick')
    }
  })

  it('styles the button as the primary one, with a hidden arrow, and keeps the address and number out of it', () => {
    const section = renderContact()
    const button = within(section).getByRole('link', { name: LABEL })
    const address = within(section).getByRole('link', { name: EMAIL })
    const phone = within(section).getByRole('link', { name: PHONE })
    const arrow = button.querySelector('.button__arrow')

    expect(button).toHaveClass('button')
    expect(button).not.toHaveClass('button--secondary')
    expect(button.textContent).toBe(LABEL + '→')
    expect(arrow?.tagName).toBe('SPAN')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(arrow?.textContent).toBe('→')
    for (const link of [address, phone]) {
      expect(button).not.toContainElement(link)
      expect(link).not.toHaveClass('button')
    }
  })

  it('gives the phone number the address link\'s treatment, after it', () => {
    const section = renderContact()
    const address = within(section).getByRole('link', { name: EMAIL })
    const phone = within(section).getByRole('link', { name: PHONE })

    expect(address).toHaveClass('contact__email')
    expect(phone).toHaveClass('contact__phone')
    expect(phone.parentElement).toBe(address.parentElement)
    expect(address.nextElementSibling).toBe(phone)
  })

  it('contains only the heading, paragraph and three links', () => {
    const section = renderContact()

    expect(section.textContent).toBe(HEADING + PARAGRAPH + LABEL + '→' + EMAIL + PHONE)
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

  it('has one phone number, the tel: link, and no web link', () => {
    const section = renderContact()

    expect(section.textContent?.replace(PHONE, '')).not.toMatch(/\d/)
    expect([...section.querySelectorAll('a[href^="tel:"]')].map((link) => link.getAttribute('href'))).toEqual([TEL])
    expect(section.querySelector('a[href^="http"]')).toBeNull()
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
