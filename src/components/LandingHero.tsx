import { ctaLabel, email } from '../data/contact.ts'
import type { SectorLandingPage } from '../data/solutionPages.ts'
import Breadcrumbs from './Breadcrumbs.tsx'
import TraceDiagram from './TraceDiagram.tsx'

type LandingHeroProps = {
  hero: SectorLandingPage['hero']
  diagram: SectorLandingPage['diagram']
  /** The breadcrumb trail's current item. */
  breadcrumb: string
  /** The trail before it, from the homepage down. */
  trail: readonly { readonly label: string; readonly href: string }[]
  /** The id of the section the secondary button jumps to. */
  assessmentId: string
}

// The landing-page hero (#93) on the hero tint, named by its h1: the
// breadcrumbs, eyebrow, h1, lead (one paragraph, or two where the page
// gives a second, #98) and two buttons, then the trace diagram, beside
// them from 64em. The primary button is the site's one call to
// action (contact.ts), opening an email; the secondary jumps to the
// assessment section, and page.tsx moves focus to its heading
// (data-focus-section).
function LandingHero({ hero, diagram, breadcrumb, trail, assessmentId }: LandingHeroProps) {
  return (
    <section className="sector-hero" aria-labelledby="sector-hero-heading">
      <div className="container sector-hero__inner">
        <div className="sector-hero__text">
          <Breadcrumbs trail={trail} current={breadcrumb} />
          <p className="sector-eyebrow">{hero.eyebrow}</p>
          <h1 id="sector-hero-heading" className="sector-hero__heading">
            {hero.heading}
          </h1>
          {hero.leadDetail === undefined ? (
            <p className="sector-hero__lead">{hero.lead}</p>
          ) : (
            <>
              <p className="sector-hero__lead sector-hero__lead--first">{hero.lead}</p>
              <p className="sector-hero__lead">{hero.leadDetail}</p>
            </>
          )}
          <div className="sector-hero__actions">
            <a className="button" href={`mailto:${email}`}>
              {ctaLabel}
              <span className="button__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a
              className="button button--secondary"
              href={`#${assessmentId}`}
              data-focus-section={assessmentId}
            >
              {hero.secondaryLabel}
            </a>
          </div>
        </div>
        <div className="sector-hero__diagram">
          <TraceDiagram diagram={diagram} descriptionId="trace-description" />
        </div>
      </div>
    </section>
  )
}

export default LandingHero
