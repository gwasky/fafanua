import { email } from '../data/contact.ts'
import { footerNavigation } from '../data/navigation.ts'
import './Footer.css'

// The page footer, outside main: the positive logo (an image, not a link),
// the five footer links (footerNavigation in src/data/navigation.ts), the
// email link from src/data/contact.ts and the copyright line. The year is
// read when the component renders, so it is never fixed at build time. It
// uses no ids, so nothing duplicates the header's.
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <img
          className="site-footer__logo"
          src="/fafanua-logo.svg"
          alt="Fafanua Technologies"
          width="296"
          height="42"
        />
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
        <a className="site-footer__email" href={`mailto:${email}`}>
          {email}
        </a>
        <p className="site-footer__copyright">
          {`© ${year} Fafanua Technologies Limited`}
        </p>
      </div>
    </footer>
  )
}

export default Footer
