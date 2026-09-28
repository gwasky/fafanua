import './Hero.css'

// Presentation-only copy. The heading and supporting line are verbatim
// from _docs/plan.md Section 5; the positioning statement is the owner's
// adaptation of Section 1.
function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <h1 id="hero-heading" className="hero__heading">
          Build a data foundation you can trust.
        </h1>
        <p className="hero__lead">
          Fafanua helps organisations design, build and strengthen the data
          foundations required for reliable reporting, better decisions and
          responsible AI.
        </p>
        <div className="hero__actions">
          <a className="button" href="#contact">
            Contact our team
          </a>
          <a className="button button--secondary" href="#services">
            See our services
          </a>
        </div>
        <p className="hero__statement">
          Fafanua helps East African businesses, government institutions and
          development organisations establish trusted data foundations for
          reliable reporting, better decisions and future governed analytics
          and AI.
        </p>
      </div>
    </section>
  )
}

export default Hero
