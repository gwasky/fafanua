import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { email } from './data/contact.ts'
import { navigation } from './data/navigation.ts'
import { services } from './data/services.ts'
import { accessibleNames, expectNoAxeViolations } from './test/axe.ts'

// jsdom has no matchMedia, which the header uses for its breakpoint.
// matches: false is the narrow layout, where the Menu toggle is used.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const disclosureName = (name: string) => `Typical engagements for ${name}`

describe('App accessibility (axe)', () => {
  it('has no axe violations as rendered', async () => {
    const { container } = render(<App />)

    await expectNoAxeViolations(container)
  })

  it('has no axe violations with the mobile menu open', async () => {
    const { container } = render(<App />)
    const toggle = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expectNoAxeViolations(container)
  })

  it('has no axe violations with all six Typical engagements disclosures open', async () => {
    const { container } = render(<App />)
    const buttons = screen.getAllByRole('button', { name: /^Typical engagements for / })
    for (const button of buttons) fireEvent.click(button)

    expect(buttons).toHaveLength(6)
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    }
    await expectNoAxeViolations(container)
  })
})

describe('App structure', () => {
  it('has one h1, first, and never skips a heading level going down', () => {
    render(<App />)
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    const levels = headings.map((heading) => Number(heading.tagName[1]))

    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    levels.forEach((level, index) => {
      if (index === 0) return
      const previous = levels[index - 1]
      expect(
        level,
        `"${headings[index].textContent}" is an h${level} after an h${previous}`,
      ).toBeLessThanOrEqual(previous + 1)
    })
  })

  it('names the two nav landmarks Main and Footer', () => {
    render(<App />)

    expect(
      screen.getAllByRole('navigation').map((nav) => accessibleNames([nav])[0]),
    ).toEqual(['Main', 'Footer'])
  })
})

describe('App links and buttons', () => {
  const controls = () => {
    const elements = [
      ...screen.getAllByRole('link'),
      ...screen.getAllByRole('button'),
    ]
    const names = accessibleNames(elements)
    return elements.map((element, index) => ({
      element,
      name: names[index],
      href: element.getAttribute('href'),
    }))
  }

  it('gives every link and button a non-empty name', () => {
    render(<App />)
    const list = controls()

    expect(list.length).toBeGreaterThan(0)
    for (const { element, name } of list) {
      expect(name, element.outerHTML).not.toBe('')
    }
  })

  it('points links with the same name at the same href', () => {
    render(<App />)
    const hrefs = new Map<string, Set<string | null>>()
    for (const { element, name, href } of controls()) {
      if (element.tagName !== 'A') continue
      hrefs.set(name, (hrefs.get(name) ?? new Set()).add(href))
    }

    for (const [name, set] of hrefs) {
      expect([...set], `links named "${name}"`).toHaveLength(1)
    }
    expect([...(hrefs.get(email) ?? [])]).toEqual([`mailto:${email}`])
  })

  it('matches the header and footer nav links to each other', () => {
    render(<App />)
    const links = (landmark: HTMLElement) =>
      within(landmark)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')])
    const [main, footer] = screen.getAllByRole('navigation')

    expect(links(main)).toEqual(
      navigation.map((item) => [item.label, `#${item.id}`]),
    )
    expect(links(footer)).toEqual(links(main))
  })

  it('sends both info@fafanua.tech links to the mailto address', () => {
    render(<App />)
    const links = controls().filter(({ name }) => name === email)

    expect(links).toHaveLength(2)
    for (const { href } of links) expect(href).toBe(`mailto:${email}`)
  })

  it('names the six disclosures Typical engagements for each service, starting with the visible label', () => {
    render(<App />)
    // Every disclosure button: the Menu toggle is the only other button.
    const disclosures = controls().filter(
      ({ element }) =>
        element.tagName === 'BUTTON' && element.textContent !== 'Menu',
    )
    const names = disclosures.map(({ name }) => name)

    expect(names).toEqual(
      services.map((service) => disclosureName(service.name)),
    )
    expect(new Set(names).size).toBe(6)
    for (const { element, name } of disclosures) {
      // WCAG 2.5.3: the visible text starts the accessible name.
      const visible = [...element.childNodes]
        .filter(
          (node) =>
            !(node instanceof Element && node.matches('.visually-hidden, svg')),
        )
        .map((node) => node.textContent)
        .join('')
        .trim()
      expect(visible).toBe('Typical engagements')
      expect(name.startsWith(visible)).toBe(true)
    }
  })
})
