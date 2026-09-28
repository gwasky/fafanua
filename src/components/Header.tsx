import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { navigation } from '../data/navigation.ts'
import './Header.css'

// The width at which the inline nav replaces the menu toggle. Keep it in
// step with the 768px media query in Header.css (see tokens.css).
const INLINE_NAV_QUERY = '(min-width: 768px)'
const LIST_ID = 'main-nav-list'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
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
    <header id="top" className="site-header" onKeyDown={onKeyDown}>
      <a className="skip-link visually-hidden-focusable" href="#main">
        Skip to content
      </a>
      <div className="container site-header__inner">
        <a className="site-header__logo" href="#top">
          <img
            src="/fafanua-logo.svg"
            alt="Fafanua Technologies"
            width="296"
            height="42"
          />
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
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
              <li key={item.id}>
                <a
                  className="site-nav__link"
                  href={`#${item.id}`}
                  onClick={onLinkClick}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
