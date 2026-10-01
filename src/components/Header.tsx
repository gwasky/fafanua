import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react'
import { flushSync } from 'react-dom'
import { navigation, navigationCta } from '../data/navigation.ts'
import './Header.css'

// The width at which the inline nav replaces the menu toggle. Keep it in
// step with the 1024px media query in Header.css (see tokens.css).
const INLINE_NAV_QUERY = '(min-width: 1024px)'
const LIST_ID = 'main-nav-list'

// The header is transparent over a [data-header-overlay] section only
// while the page is scrolled by less than this many pixels.
const SCROLL_THRESHOLD = 8

// Whether the page is scrolled by less than SCROLL_THRESHOLD. The passive
// scroll listener makes React read only scrollY, which causes no layout,
// and React skips the render while the answer is unchanged.
const isAtTop = () => window.scrollY < SCROLL_THRESHOLD

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

// Whether a [data-header-overlay] section is on the page. It is part of
// the page's markup, so nothing needs to be told when it changes. It is
// rendered after the header, so the first render reads false; React reads
// it again after the first commit and renders again once it is there.
const hasOverlay = () => document.querySelector('[data-header-overlay]') !== null
const subscribeToNothing = () => () => {}

const LOGO = '/fafanua-logo.svg'
const LOGO_REVERSED = '/fafanua-logo-reversed.svg'

// The sticky site header. Solid (paper, with a bottom border) by default.
// While a [data-header-overlay] section exists, the page is at the top and
// the menu is closed, it is transparent and takes the dark tokens
// (.on-dark) and the reversed logo, so it reads over the dark section
// pulled up beneath it (global.css). It publishes its height as
// --header-height on :root, which the scroll margins and the overlay
// pull-up use.
function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Close the menu when the inline nav takes over, so it is closed again
  // if the window is later narrowed.
  useEffect(() => {
    const query = window.matchMedia(INLINE_NAV_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // A layout effect, so the height is on :root before App's landOnHash
  // scrolls to a hash (child effects run first) and before the first
  // paint. The ResizeObserver keeps it current after text zoom, wrapping
  // or the font swap.
  useLayoutEffect(() => {
    const header = headerRef.current
    if (!header) return
    const root = document.documentElement
    const publish = (height: number) =>
      root.style.setProperty('--header-height', `${height}px`)

    publish(header.getBoundingClientRect().height)
    // jsdom, in the unit tests, has no ResizeObserver.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(([entry]) => {
            publish(entry.borderBoxSize[0].blockSize)
          })
    observer?.observe(header)
    return () => {
      observer?.disconnect()
      root.style.removeProperty('--header-height')
    }
  }, [])

  const atTop = useSyncExternalStore(subscribeToScroll, isAtTop, () => true)
  const overlay = useSyncExternalStore(subscribeToNothing, hasOverlay, () => false)
  const transparent = overlay && atTop && !menuOpen

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !menuOpen) return
    setMenuOpen(false)
    toggleRef.current?.focus()
  }

  // Close before the default navigation runs, so the page is laid out
  // without the open menu when the browser scrolls to the target.
  const onLinkClick = () => {
    if (menuOpen) flushSync(() => setMenuOpen(false))
  }

  return (
    <header
      ref={headerRef}
      className={transparent ? 'site-header on-dark' : 'site-header'}
      onKeyDown={onKeyDown}
    >
      <a className="skip-link visually-hidden-focusable" href="#main">
        Skip to content
      </a>
      <div className="container site-header__inner">
        <a className="site-header__logo" href="#top">
          <img
            src={transparent ? LOGO_REVERSED : LOGO}
            alt="Fafanua Technologies"
            width="296"
            height="42"
          />
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="button button--secondary menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={LIST_ID}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav className="site-nav" aria-label="Main">
          <ul
            id={LIST_ID}
            className="site-nav__list"
            data-open={menuOpen || undefined}
          >
            {navigation.map((item) => (
              <li key={item.id} className="site-nav__item">
                <a
                  className="site-nav__link"
                  href={`#${item.id}`}
                  onClick={onLinkClick}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="site-nav__cta">
              <a
                className="button"
                href={`#${navigationCta.id}`}
                onClick={onLinkClick}
              >
                {navigationCta.label}
                <span className="button__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
