import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { email } from './data/contact.ts'
import { footerNavigation, navigation, navigationCta } from './data/navigation.ts'
import { services } from './data/services.ts'
import { homepageSolutions } from './data/solutions.ts'
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

  // The disclosures this test opened left with the open grid (#83); it
  // now checks the grid with focus on a capability title.
  it('has no axe violations with focus on a capability title link', async () => {
    const { container } = render(<App />)
    const region = screen.getByRole('region', { name: /^From fragmented data/ })
    const link = within(region).getByRole('link', { name: services[4].name })
    link.focus()

    expect(link).toHaveFocus()
    expect(screen.queryAllByRole('button', { name: /^Typical engagements/ })).toHaveLength(0)
    await expectNoAxeViolations(container)
  })

  it('has no axe violations with all three Solutions rows open', async () => {
    const { container } = render(<App />)
    const region = screen.getByRole('region', { name: 'Solutions' })
    const buttons = within(region).getAllByRole('button')
    for (const button of buttons) fireEvent.click(button)

    expect(buttons).toHaveLength(3)
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

    // The one accepted exception (#68, as on #60, WCAG 2.4.4 in context):
    // the header's, the hero's and the Data Trust Assessment's (#71) "Book
    // a data trust assessment" land on the closing call to action, whose
    // button of the same name opens the email. All of them start the
    // conversation.
    expect([...(hrefs.get('Book a data trust assessment') ?? [])]).toEqual([
      '#contact',
      `mailto:${email}`,
    ])
    hrefs.delete('Book a data trust assessment')
    for (const [name, set] of hrefs) {
      expect([...set], `links named "${name}"`).toHaveLength(1)
    }
    expect([...(hrefs.get(email) ?? [])]).toEqual([`mailto:${email}`])
  })

  it('gives the header and footer navs the same four section links, then the header call to action and the footer Contact link', () => {
    render(<App />)
    const links = (landmark: HTMLElement) => {
      const found = within(landmark).getAllByRole('link')
      const names = accessibleNames(found)
      return found.map((link, i) => [names[i], link.getAttribute('href')])
    }
    const [main, footer] = screen.getAllByRole('navigation')
    const sections = navigation.map((item) => [item.label, `#${item.id}`])

    expect(links(main)).toEqual([
      ...sections,
      [navigationCta.label, `#${navigationCta.id}`],
    ])
    expect(links(footer)).toEqual(
      footerNavigation.map((item) => [item.label, `#${item.id}`]),
    )
    expect(links(footer)).toEqual([...sections, ['Contact', '#contact']])
  })

  it('sends both info@fafanua.tech links to the mailto address', () => {
    render(<App />)
    const links = controls().filter(({ name }) => name === email)

    expect(links).toHaveLength(2)
    for (const { href } of links) expect(href).toBe(`mailto:${email}`)
  })

  it('has two kinds of button: the Menu toggle and three Solutions rows (#83)', () => {
    render(<App />)
    const buttons = controls().filter(({ element }) => element.tagName === 'BUTTON')

    expect(buttons.map(({ name }) => name)).toEqual([
      'Menu',
      ...homepageSolutions.map((solution) => solution.title),
    ])
  })

  it('shows no Typical engagements on the homepage, and names each capability title link by its service (#83)', () => {
    render(<App />)
    const region = screen.getByRole('region', { name: /^From fragmented data/ })
    const titles = controls().filter(({ element }) => region.contains(element))

    expect(document.body.textContent).not.toContain('Typical engagements')
    expect(titles.map(({ element }) => element.tagName)).toEqual(services.map(() => 'A'))
    expect(titles.map(({ name }) => name)).toEqual(services.map((service) => service.name))
    expect(new Set(titles.map(({ name }) => name)).size).toBe(6)
    for (const { element } of titles) {
      // WCAG 2.5.3: the visible text, without the hidden arrow, is the name.
      const visible = [...element.childNodes]
        .filter((node) => !(node instanceof Element && node.getAttribute('aria-hidden') === 'true'))
        .map((node) => node.textContent)
        .join('')
      expect(services.map((service) => service.name)).toContain(visible)
      expect(element.closest('h3')).not.toBeNull()
    }
  })
})
