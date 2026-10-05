import {
  heroHeadingLines,
  heroPrimaryLabel,
  heroPromise,
  heroSecondaryLabel,
  heroSupporting,
} from '../data/hero.ts'
import TechnicalGrid from './TechnicalGrid.tsx'
import './Hero.css'

// The hero's copy is in src/data/hero.ts: the headline, the core brand
// promise, the supporting copy and the two calls to action. Each sentence
// of the headline is a block-level span, so it starts on its own line at
// every width; the space between them keeps a space between the sentences
// in the heading's accessible name. The brand promise is a paragraph, not
// a heading, directly after the h1, so the heading outline is unchanged.
//
// A dark section (.surface-dark) with the technical grid behind it. It is
// marked data-header-overlay, so it is pulled up under the sticky header,
// which is transparent over it while the page is at the top (global.css,
// Header.tsx).
function Hero() {
  const [first, second] = heroHeadingLines
  return (
    <section
      className="hero surface-dark"
      aria-labelledby="hero-heading"
      data-header-overlay=""
    >
      <TechnicalGrid />
      <div className="container">
        <h1 id="hero-heading" className="hero__heading">
          <span className="hero__line">{first}</span>{' '}
          <span className="hero__line">{second}</span>
        </h1>
        <p className="hero__promise">{heroPromise}</p>
        <p className="hero__lead">{heroSupporting}</p>
        <div className="hero__actions">
          <a className="button" href="#contact">
            {heroPrimaryLabel}
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="button button--secondary" href="#services">
            {heroSecondaryLabel}
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
