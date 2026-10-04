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

// The width at which the inline nav replaces the menu toggle: 64em, which
// is 1024px at the default 16px text size. In em, a larger text-size
// setting in the browser moves the switch up with the text, so enlarged
// text falls back to the Menu instead of wrapping the inline row. Keep it
// the same as the media query in Header.css (see tokens.css);
// scripts/tokens.test.ts checks that they match.
const INLINE_NAV_QUERY = '(min-width: 64em)'
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

// The largest share of the viewport's height the header may take and still
// stick. Above it the header scrolls away with the page, like the short-
// viewport rule in Header.css (WCAG 1.4.10): a sticky header that tall
// leaves too little room to read, and an element taller than the space
// left below it could never be shown whole when it takes focus (WCAG
// 2.4.11). At the default text size the header is 81px: 13% of a 360 x 640
// phone, and under 17% even at 480px of height, below which Header.css
// stops it sticking anyway. With 200% text it is 161px (20%) at 768 x 800
// and stays sticky, and 257px or more (32%) where it wraps to two rows,
// as at 320 and 360px wide, and stops sticking. 25%, the top of the 20-25%
// range agreed on #54, keeps the sticky header wherever it still leaves
// three quarters of the screen.
const MAX_STICKY_SHARE = 0.25

// The class on <html> that stops the header sticking and drops the scroll
// margins that keep content clear of it (Header.css, global.css).
const STATIC_CLASS = 'header-static'

const LOGO = '/fafanua-logo.svg'
const LOGO_REVERSED = '/fafanua-logo-reversed.svg'

// The sticky site header. Solid (paper, with a bottom border) by default.
// When `overlay` is set (App.tsx renders the dark hero, a
// [data-header-overlay] section, under it), the page is at the top and
// the menu is closed, it is transparent and takes the dark tokens
// (.on-dark) and the reversed logo, so it reads over the dark section
// pulled up beneath it (global.css). It publishes its height as
// --header-height on :root, which the scroll margins and the overlay
// pull-up use, and stops sticking when it would take more than
// MAX_STICKY_SHARE of the viewport's height.
//
// `overlay` is a prop, set by the page that renders the overlay section,
// rather than read from the DOM: the header renders before the section, so
// a DOM query is false on the first render. The header then committed
// solid, its layout effect resolved that style, and the switch to .on-dark
// ran the colour transition from paper on every load (#55 QA). With the
// prop the first render is already transparent, so nothing animates.
function Header({ overlay = false }: { overlay?: boolean }) {
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

  // A layout effect, so the height and the static class are on <html>
  // before App's landOnHash scrolls to a hash (child effects run first)
  // and before the first paint. The ResizeObserver keeps them current
  // after text zoom, wrapping or the font swap, and the resize listener
  // when the viewport's height changes. The header is the same height
  // sticky or static, so the switch cannot feed back into itself.
  useLayoutEffect(() => {
    const header = headerRef.current
    if (!header) return
    const root = document.documentElement
    let height = header.getBoundingClientRect().height
    const publish = () => {
      root.style.setProperty('--header-height', `${height}px`)
      root.classList.toggle(STATIC_CLASS, height > MAX_STICKY_SHARE * window.innerHeight)
    }

    publish()
    // jsdom, in the unit tests, has no ResizeObserver.
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(([entry]) => {
            height = entry.borderBoxSize[0].blockSize
            publish()
          })
    observer?.observe(header)
    window.addEventListener('resize', publish)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', publish)
      root.style.removeProperty('--header-height')
      root.classList.remove(STATIC_CLASS)
    }
  }, [])

  const atTop = useSyncExternalStore(subscribeToScroll, isAtTop, () => true)
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
