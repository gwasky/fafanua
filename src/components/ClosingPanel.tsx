import { ctaLabel, email } from '../data/contact.ts'
import type { SectorLandingPage } from '../data/solutionPages.ts'

// The landing page's closing panel (#93), which replaces the Contact
// section there: a graphite 900 panel (.surface-dark, no grid) with
// rounded corners, inset in the container on paper, so paper separates it
// from the dark footer. It carries id contact, where the header's call to
// action and the footer's Contact link land. The eyebrow, h2 and text,
// then the primary button and the address, styled as the secondary
// button on dark; both open an email.
function ClosingPanel({ closing }: { closing: SectorLandingPage['closing'] }) {
  const href = `mailto:${email}`
  return (
    <section id="contact" className="sector-closing" aria-labelledby="contact-heading">
      <div className="container">
        <div className="sector-closing__panel surface-dark">
          <div className="sector-closing__text">
            <p className="sector-eyebrow">{closing.eyebrow}</p>
            <h2 id="contact-heading" className="sector-heading sector-closing__heading">
              {closing.heading}
            </h2>
            <p className="sector-closing__body">
              {closing.followUp === undefined ? closing.text : `${closing.text} ${closing.followUp}`}
            </p>
          </div>
          <div className="sector-closing__actions">
            <a className="button" href={href}>
              {ctaLabel}
              <span className="button__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a className="button button--secondary" href={href}>
              {email}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClosingPanel
