import TechnicalGrid from './TechnicalGrid.tsx'
import './Hero.css'

// Presentation-only copy, verbatim from _docs/fafanua-v2-visual-upgrade-plan.md
// Section 5: the headline, the supporting copy and the two calls to
// action. Each sentence of the headline is a block-level span, so it
// starts on its own line at every width; the space between them keeps the
// heading's accessible name "Trusted Data. Better Decisions.".
//
// A dark section (.surface-dark) with the technical grid behind it. It is
// marked data-header-overlay, so it is pulled up under the sticky header,
// which is transparent over it while the page is at the top (global.css,
// Header.tsx).
function Hero() {
  return (
    <section
      className="hero surface-dark"
      aria-labelledby="hero-heading"
      data-header-overlay=""
    >
      <TechnicalGrid />
      <div className="container">
        <h1 id="hero-heading" className="hero__heading">
          <span className="hero__line">Trusted Data.</span>{' '}
          <span className="hero__line">Better Decisions.</span>
        </h1>
        <p className="hero__lead">
          Fafanua designs and operates the data foundations that connect
          business systems, establish trust, and turn organisational data into
          intelligence.
        </p>
        <div className="hero__actions">
          <a className="button" href="#contact">
            Discuss your data needs
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="button button--secondary" href="#services">
            Explore our capabilities
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
