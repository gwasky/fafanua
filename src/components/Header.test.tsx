import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import { navigation } from '../data/navigation.ts'

// jsdom has no matchMedia. This stand-in starts narrow (below 768px) and
// lets a test fire a change as if the window had been resized.
type Listener = (event: MediaQueryListEvent) => void
let listeners: Set<Listener>

function setWide(matches: boolean) {
  act(() => {
    for (const listener of listeners) {
      listener({ matches } as MediaQueryListEvent)
    }
  })
}

beforeEach(() => {
  listeners = new Set()
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    addEventListener: (_type: string, listener: Listener) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) =>
      listeners.delete(listener),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]'

function renderPage() {
  render(<App />)
  const banner = screen.getByRole('banner')
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const toggle = screen.getByRole('button', { name: 'Menu' })
  return { banner, nav, toggle }
}

describe('Header', () => {
  it('is the banner landmark, outside main', () => {
    const { banner } = renderPage()

    expect(banner).toHaveAttribute('id', 'top')
    expect(screen.getByRole('main')).not.toContainElement(banner)
  })

  it('has one Main navigation landmark and adds no heading', () => {
    const { banner } = renderPage()

    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(within(banner).queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('links to the four sections in the order of navigation.ts', () => {
    const { nav } = renderPage()
    const links = within(nav).getAllByRole('link')

    expect(navigation.map((item) => [item.label, item.id])).toEqual([
      ['Services', 'services'],
      ['How We Work', 'how-we-work'],
      ['About', 'about'],
      ['Contact', 'contact'],
    ])
    expect(links).toHaveLength(navigation.length)
    navigation.forEach((item, index) => {
      expect(links[index]).toBe(
        within(nav).getByRole('link', { name: item.label }),
      )
      expect(links[index]).toHaveAttribute('href', `#${item.id}`)
    })
  })

  it('has one list item per link', () => {
    const { nav } = renderPage()
    const list = within(nav).getByRole('list')

    expect(within(list).getAllByRole('listitem')).toHaveLength(
      navigation.length,
    )
  })

  it('has a logo link to the top of the page', () => {
    const { banner } = renderPage()
    const logo = within(banner).getByRole('link', {
      name: 'Fafanua Technologies',
    })

    expect(logo).toHaveAttribute('href', '#top')
    const img = within(logo).getByRole('img', { name: 'Fafanua Technologies' })
    expect(img).toHaveAttribute('src', '/fafanua-logo.svg')
    // 296:42 is the SVG's 5046:714 ratio.
    expect(img).toHaveAttribute('width', '296')
    expect(img).toHaveAttribute('height', '42')
  })

  it('starts with a skip link to main', () => {
    renderPage()
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    const first = document.querySelector(FOCUSABLE)

    expect(first).toBe(skip)
    expect(skip).toHaveAttribute('href', '#main')
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('orders skip link, logo, toggle and nav inside the header', () => {
    const { banner, nav, toggle } = renderPage()
    const order = [
      screen.getByRole('link', { name: 'Skip to content' }),
      screen.getByRole('link', { name: 'Fafanua Technologies' }),
      toggle,
      nav,
    ]

    for (const element of order) expect(banner).toContainElement(element)
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('has a Menu toggle that controls the list and starts closed', () => {
    const { nav, toggle } = renderPage()
    const list = within(nav).getByRole('list')

    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveTextContent('Menu')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', list.id)
    expect(list.id).not.toBe('')
  })

  it('opens and closes on click, keeping its name and list', () => {
    const { toggle } = renderPage()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Menu')
    expect(document.getElementById(toggle.getAttribute('aria-controls')!))
      .toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAccessibleName('Menu')
    expect(document.getElementById(toggle.getAttribute('aria-controls')!))
      .toBeInTheDocument()
  })

  it('closes when a link is chosen', () => {
    const { nav, toggle } = renderPage()

    fireEvent.click(toggle)
    fireEvent.click(within(nav).getByRole('link', { name: 'How We Work' }))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape from a link and focuses the toggle', () => {
    const { nav, toggle } = renderPage()

    fireEvent.click(toggle)
    const link = within(nav).getByRole('link', { name: 'About' })
    link.focus()
    fireEvent.keyDown(link, { key: 'Escape' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('closes on Escape from the toggle', () => {
    const { toggle } = renderPage()

    fireEvent.click(toggle)
    toggle.focus()
    fireEvent.keyDown(toggle, { key: 'Escape' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('does nothing on Escape while closed', () => {
    const { nav, toggle } = renderPage()
    const link = within(nav).getByRole('link', { name: 'Contact' })
    link.focus()

    fireEvent.keyDown(link, { key: 'Escape' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(link).toHaveFocus()
  })

  it('ignores other keys while open', () => {
    const { toggle } = renderPage()

    fireEvent.click(toggle)
    fireEvent.keyDown(toggle, { key: 'Tab' })

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes when the window widens to the inline nav', () => {
    const { toggle } = renderPage()

    fireEvent.click(toggle)
    setWide(true)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    setWide(false)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('removes its media query listener on unmount', () => {
    const { unmount } = render(<App />)
    expect(listeners.size).toBe(1)

    unmount()
    expect(listeners.size).toBe(0)
  })
})
