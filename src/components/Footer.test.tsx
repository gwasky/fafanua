import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { footerNavigation } from '../data/navigation.ts'
import Footer from './Footer.tsx'

const EMAIL = 'info@fafanua.tech'
const COPYRIGHT = /^© \d{4} Fafanua Technologies Limited$/

// Claims the footer must not make, and details it must not invent.
const FORBIDDEN = [
  'Fafanua Intelligence',
  'SaaS',
  'AI-powered',
  'All rights reserved',
  'Privacy',
  'Terms',
  'Back to top',
]

function renderFooter() {
  render(<Footer />)
  return screen.getByRole('contentinfo')
}

function copyright(footer: HTMLElement) {
  return within(footer).getByText(COPYRIGHT)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Footer', () => {
  it('is the one contentinfo landmark', () => {
    const footer = renderFooter()

    expect(footer.tagName).toBe('FOOTER')
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  it('shows the positive logo as an image, not a link', () => {
    const footer = renderFooter()
    const logo = within(footer).getByRole('img', { name: 'Fafanua Technologies' })

    expect(logo.tagName).toBe('IMG')
    expect(logo).toHaveAttribute('src', '/fafanua-logo.svg')
    expect(logo).toHaveAttribute('width', '296')
    expect(logo).toHaveAttribute('height', '42')
    expect(logo.closest('a')).toBeNull()
    expect(footer.querySelectorAll('img, svg')).toHaveLength(1)
  })

  it('has a nav named "Footer" with five plain links: the four sections, then Contact', () => {
    const footer = renderFooter()
    const nav = within(footer).getByRole('navigation', { name: 'Footer' })
    const links = within(nav).getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual(
      footerNavigation.map((item) => item.label),
    )
    expect(links.map((link) => link.textContent)).toEqual([
      'Services',
      'Solutions',
      'How We Work',
      'About',
      'Contact',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      footerNavigation.map((item) => `#${item.id}`),
    )
    for (const link of links) expect(link).not.toHaveClass('button')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#services',
      '#solutions',
      '#how-we-work',
      '#about',
      '#contact',
    ])
  })

  it('links the address to the plain mailto', () => {
    const footer = renderFooter()
    const link = within(footer).getByRole('link', { name: EMAIL })

    expect(link.textContent).toBe(EMAIL)
    expect(link.getAttribute('href')).toBe(`mailto:${EMAIL}`)
    expect(link).not.toHaveAttribute('target')
    expect(footer.querySelectorAll('a[href^="mailto:"]')).toHaveLength(1)
  })

  it('shows the copyright line with the current year', () => {
    const footer = renderFooter()
    const line = copyright(footer)

    expect(line.tagName).toBe('P')
    expect(line.textContent).toMatch(COPYRIGHT)
    expect(line.textContent).toContain(String(new Date().getFullYear()))
    expect(line.textContent).not.toContain('(c)')
  })

  it('reads the year when it renders', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2030, 0, 1))
    const footer = renderFooter()

    expect(copyright(footer).textContent).toBe(
      '© 2030 Fafanua Technologies Limited',
    )
  })

  it('orders the logo, nav, email link and copyright line', () => {
    const footer = renderFooter()
    const parts = [
      within(footer).getByRole('img'),
      within(footer).getByRole('navigation'),
      within(footer).getByRole('link', { name: EMAIL }),
      copyright(footer),
    ]

    for (let i = 1; i < parts.length; i++) {
      expect(
        parts[i - 1].compareDocumentPosition(parts[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('contains nothing else: six links, no headings, ids or forms', () => {
    const footer = renderFooter()
    const year = new Date().getFullYear()

    expect(within(footer).getAllByRole('link')).toHaveLength(6)
    expect(footer.textContent).toBe(
      footerNavigation.map((item) => item.label).join('') +
        EMAIL +
        `© ${year} Fafanua Technologies Limited`,
    )
    expect(footer.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
    expect(footer.querySelectorAll('[id]')).toHaveLength(0)
    expect(
      footer.querySelectorAll('form, input, textarea, button, iframe'),
    ).toHaveLength(0)
  })

  it.each(FORBIDDEN)('does not say "%s"', (phrase) => {
    const footer = renderFooter()

    expect(footer.textContent?.toLowerCase()).not.toContain(phrase.toLowerCase())
  })

  it('has no phone number or web link', () => {
    const footer = renderFooter()
    // Digits appear only in the year.
    const text = footer.textContent?.replace(/© \d{4}/, '')

    expect(text).not.toMatch(/\d/)
    expect(footer.querySelector('a[href^="http"], a[href^="tel:"]')).toBeNull()
  })

  it('is light: no dark or alternate surface', () => {
    const footer = renderFooter()

    expect(footer).not.toHaveClass('surface-dark')
    expect(footer).not.toHaveClass('surface-alt')
    expect(footer.querySelector('.surface-dark, .surface-alt')).toBeNull()
  })
})
