import type { SectorLandingPage } from '../data/solutionPages.ts'
import Checklist from './Checklist.tsx'
import IconBadge from './IconBadge.tsx'

// Who we work with (#93): the section's h2 and subheading over one card on
// the lighter teal tint, with a round badge, the h3, its text and a
// checklist in two columns from 48em.
function AudienceCard({ audience }: { audience: SectorLandingPage['audience'] }) {
  const { card } = audience
  return (
    <section className="sector-section" aria-labelledby="audience-heading">
      <div className="container">
        <h2 id="audience-heading" className="sector-heading">
          {audience.heading}
        </h2>
        <p className="sector-subheading">{audience.subheading}</p>
        <div className="audience-card">
          <IconBadge icon={card.icon} shape="round" />
          <div className="audience-card__body">
            <h3 className="sector-card-heading">{card.heading}</h3>
            <p className="audience-card__text">{card.text}</p>
            {card.detail !== undefined && <p className="audience-card__text">{card.detail}</p>}
            <Checklist items={card.items} className="audience-card__list" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AudienceCard
