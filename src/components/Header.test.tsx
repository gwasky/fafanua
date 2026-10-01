import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import { navigation, navigationCta } from '../data/navigation.ts'
import Header from './Header.tsx'

// jsdom has no matchMedia. This stand-in starts narrow (below 1024px) and
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
  setScrollY(0)
})

/** Sets window.scrollY and fires the scroll event the header listens to. */
function setScrollY(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

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

    expect(screen.getByRole('main')).not.toContainElement(banner)
  })

  it('leaves #top to an empty element just before it, as it is sticky', () => {
    const { banner } = renderPage()
    const top = document.getElementById('top')

    expect(banner).not.toHaveAttribute('id')
    expect(top).not.toBeNull()
    expect(top).toBeEmptyDOMElement()
    expect(top?.nextElementSibling).toBe(banner)
    expect(top?.previousElementSibling).toBeNull()
  })

  it('has one Main navigation landmark and adds no heading', () => {
    const { banner } = renderPage()

    // The footer's nav is the page's other one, named "Footer".
    expect(screen.getAllByRole('navigation', { name: 'Main' })).toHaveLength(1)
    expect(within(banner).getAllByRole('navigation')).toHaveLength(1)
    expect(within(banner).queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('links to the four sections in the order of navigation.ts, then the call to action', () => {
    const { nav } = renderPage()
    const links = within(nav).getAllByRole('link')

    expect(navigation.map((item) => [item.label, item.id])).toEqual([
      ['Services', 'services'],
      ['Solutions', 'solutions'],
      ['How We Work', 'how-we-work'],
      ['About', 'about'],
    ])
    expect(links).toHaveLength(navigation.length + 1)
    navigation.forEach((item, index) => {
      expect(links[index]).toBe(
        within(nav).getByRole('link', { name: item.label }),
      )
      expect(links[index]).toHaveAttribute('href', `#${item.id}`)
    })
    expect(links.at(-1)).toBe(
      within(nav).getByRole('link', { name: navigationCta.label }),
    )
  })

  it('has no Contact link: the call to action replaces it', () => {
    const { banner } = renderPage()

    expect(
      within(banner).queryByRole('link', { name: 'Contact' }),
    ).not.toBeInTheDocument()
  })

  it('ends with "Discuss a project →", named without the arrow, to #contact', () => {
    const { nav } = renderPage()
    const cta = within(nav).getByRole('link', { name: 'Discuss a project' })

    expect(navigationCta).toEqual({ label: 'Discuss a project', id: 'contact' })
    expect(cta).toHaveAttribute('href', '#contact')
    expect(cta).toHaveClass('button')
    expect(cta).not.toHaveClass('button--secondary')
    expect(cta.textContent).toBe('Discuss a project→')
    const arrow = cta.querySelector('.button__arrow')
    expect(arrow?.textContent).toBe('→')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
  })

  it('has one list item per link, with the call to action last', () => {
    const { nav } = renderPage()
    const list = within(nav).getByRole('list')
    const items = within(list).getAllByRole('listitem')

    expect(items).toHaveLength(navigation.length + 1)
    expect(within(items.at(-1)!).getByRole('link')).toHaveAccessibleName(
      'Discuss a project',
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

  it.each([...navigation.map((item) => item.label), 'Discuss a project'])(
    'closes when "%s" is chosen',
    (name) => {
      const { nav, toggle } = renderPage()

      fireEvent.click(toggle)
      fireEvent.click(within(nav).getByRole('link', { name }))

      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    },
  )

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
    const link = within(nav).getByRole('link', { name: 'Discuss a project' })
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

  it('publishes its height as --header-height on :root, and removes it on unmount', () => {
    const { unmount } = render(<Header />)
    const value = () =>
      document.documentElement.style.getPropertyValue('--header-height')

    // jsdom lays nothing out, so the measured height is 0.
    expect(value()).toBe('0px')
    unmount()
    expect(value()).toBe('')
  })

  it('removes its media query listener on unmount', () => {
    const { unmount } = render(<App />)
    expect(listeners.size).toBe(1)

    unmount()
    expect(listeners.size).toBe(0)
  })
})

describe('Header over a [data-header-overlay] section', () => {
  const POSITIVE = '/fafanua-logo.svg'
  const REVERSED = '/fafanua-logo-reversed.svg'

  /** The header, followed by a marked section when `overlay` is set. */
  function renderHeader({ overlay }: { overlay: boolean }) {
    render(
      <>
        <Header />
        {overlay && <section data-header-overlay aria-label="Overlay" />}
      </>,
    )
    const banner = screen.getByRole('banner')
    const logo = within(banner).getByRole('img', { name: 'Fafanua Technologies' })
    const toggle = screen.getByRole('button', { name: 'Menu' })
    return { banner, logo, toggle }
  }

  const expectSolid = (banner: HTMLElement, logo: HTMLElement) => {
    expect(banner).not.toHaveClass('on-dark')
    expect(logo).toHaveAttribute('src', POSITIVE)
  }

  const expectTransparent = (banner: HTMLElement, logo: HTMLElement) => {
    expect(banner).toHaveClass('on-dark')
    expect(logo).toHaveAttribute('src', REVERSED)
  }

  it('is solid at scroll 0 with no marker on the page', () => {
    const { banner, logo } = renderHeader({ overlay: false })

    expectSolid(banner, logo)
  })

  it('stays solid at every scroll position with no marker', () => {
    const { banner, logo } = renderHeader({ overlay: false })

    for (const y of [0, 7, 8, 400, 0]) {
      setScrollY(y)
      expectSolid(banner, logo)
    }
  })

  it('is transparent at scroll 0 with a marker', () => {
    const { banner, logo } = renderHeader({ overlay: true })

    expectTransparent(banner, logo)
  })

  it('turns solid at 8px of scroll and transparent again below it', () => {
    const { banner, logo } = renderHeader({ overlay: true })

    setScrollY(7)
    expectTransparent(banner, logo)
    setScrollY(8)
    expectSolid(banner, logo)
    setScrollY(600)
    expectSolid(banner, logo)
    setScrollY(0)
    expectTransparent(banner, logo)
  })

  it('turns solid while the menu is open', () => {
    const { banner, logo, toggle } = renderHeader({ overlay: true })

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expectSolid(banner, logo)

    fireEvent.click(toggle)
    expectTransparent(banner, logo)
  })

  it('keeps the logo the same size in both states', () => {
    const { banner, logo } = renderHeader({ overlay: true })
    const size = () => [logo.getAttribute('width'), logo.getAttribute('height')]
    const transparentSize = size()

    setScrollY(100)
    expectSolid(banner, logo)
    expect(size()).toEqual(transparentSize)
    expect(transparentSize).toEqual(['296', '42'])
  })

  it('stops listening to scroll on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Header />)
    const scrollListeners = (spy: typeof add) =>
      spy.mock.calls.filter(([type]) => type === 'scroll').map(([, listener]) => listener)

    const added = scrollListeners(add)
    expect(added).toHaveLength(1)
    expect(add.mock.calls.find(([type]) => type === 'scroll')?.[2]).toEqual({ passive: true })
    unmount()
    expect(scrollListeners(remove)).toEqual(added)
    add.mockRestore()
    remove.mockRestore()
  })
})
