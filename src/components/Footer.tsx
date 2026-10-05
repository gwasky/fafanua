import { email, phone, phoneHref } from '../data/contact.ts'
import { footerNavigation } from '../data/navigation.ts'
import './Footer.css'

// A forced-colours theme with a light background (Windows contrast themes).
// Header.tsx holds the same query.
const FORCED_LIGHT = '(forced-colors: active) and (prefers-color-scheme: light)'

// The page footer, outside main, dark and minimal (plan V2 §17): the
// reversed logo (an image, not a link), the five footer links
// (footerNavigation in src/data/navigation.ts), the email and phone links
// from src/data/contact.ts and the copyright line. The year is read when
// the component renders, so it is never fixed at build time. It uses no
// ids, so nothing duplicates the header's.
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer surface-dark">
      <div className="container site-footer__inner">
        {/* A light forced-colours theme paints the footer white, where the
            reversed logo's paper wordmark disappears, so it takes the
            positive logo there (#60). The source matches only then, so the
            normal colours and a dark forced theme are unchanged. */}
        <picture>
          <source media={FORCED_LIGHT} srcSet="/fafanua-logo.svg" />
          <img
            className="site-footer__logo"
            src="/fafanua-logo-reversed.svg"
            alt="Fafanua Technologies"
            width="296"
            height="42"
          />
        </picture>
        <nav className="site-footer__nav" aria-label="Footer">
          <ul className="site-footer__list">
            {footerNavigation.map((item) => (
              <li key={item.id}>
                <a className="site-footer__link" href={`#${item.id}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-footer__contact">
          <a className="site-footer__email" href={`mailto:${email}`}>
            {email}
          </a>
          <a className="site-footer__phone" href={phoneHref}>
            {phone}
          </a>
        </div>
        <p className="site-footer__copyright">
          {`© ${year} Fafanua Technologies Limited`}
        </p>
      </div>
    </footer>
  )
}

export default Footer
