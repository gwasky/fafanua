import type { SectorLandingPage } from '../data/solutionPages.ts'
import IconBadge from './IconBadge.tsx'

type DeliverableCardsProps = {
  assessment: SectorLandingPage['assessment']
  /** The section's id, the secondary hero button's target. */
  id: string
}

// The Data Trust Assessment band (#93): full-bleed white between two
// hairlines, the eyebrow, h2 and text, then the four deliverables as
// paper cards with square badges, four across from 64em, two from 48em.
// A page may name the deliverables with a label above them (#98).
function DeliverableCards({ assessment, id }: DeliverableCardsProps) {
  return (
    <section id={id} className="sector-band" aria-labelledby={`${id}-heading`}>
      <div className="container">
        <p className="sector-eyebrow">{assessment.eyebrow}</p>
        <h2 id={`${id}-heading`} className="sector-heading">
          {assessment.heading}
        </h2>
        <p
          className={
            assessment.deliverablesLabel === undefined ? 'sector-subheading' : 'sector-subheading sector-subheading--tight'
          }
        >
          {assessment.text}
        </p>
        {assessment.deliverablesLabel !== undefined && (
          <p id={`${id}-deliverables-label`} className="deliverables__label">
            {assessment.deliverablesLabel}
          </p>
        )}
        <ul
          className="deliverables"
          role="list"
          aria-labelledby={assessment.deliverablesLabel !== undefined ? `${id}-deliverables-label` : undefined}
        >
          {assessment.deliverables.map((deliverable) => (
            <li key={deliverable.name} className="deliverable">
              <IconBadge icon={deliverable.icon} shape="square" />
              <h3 className="sector-card-heading sector-card-heading--small">{deliverable.name}</h3>
              <p className="deliverable__text">{deliverable.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default DeliverableCards
