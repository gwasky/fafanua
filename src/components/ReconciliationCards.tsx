import type { SectorLandingPage } from '../data/solutionPages.ts'
import Icon from './Icon.tsx'

type Reconciliation = NonNullable<SectorLandingPage['reconciliation']>

// The reconciliation cards after the assessment band (Financial Services,
// #98), on paper and named by its h2: the eyebrow, h2 and text, then a ul
// of three white cards, three across from 64em and stacked below it. Each
// card names its record in an h3, then the source it is compared with,
// after a decorative swap icon and the visually hidden comparison words
// the icon stands for, then the status as text after a decorative icon: a
// teal check-circle, or an amber alert-circle for an exception. The
// caption under the row describes the list.
function ReconciliationCards({ reconciliation }: { reconciliation: Reconciliation }) {
  return (
    <section className="sector-section" aria-labelledby="reconciliation-heading">
      <div className="container">
        <p className="sector-eyebrow">{reconciliation.eyebrow}</p>
        <h2 id="reconciliation-heading" className="sector-heading">
          {reconciliation.heading}
        </h2>
        <p className="sector-subheading">{reconciliation.text}</p>
        <ul className="reconciliation" role="list" aria-describedby="reconciliation-caption">
          {reconciliation.cards.map((card) => (
            <li key={card.record} className="reconciliation__card">
              <h3 className="sector-card-heading sector-card-heading--small">{card.record}</h3>
              <p className="reconciliation__source">
                <Icon name="swap" className="reconciliation__icon" />
                <span>
                  <span className="visually-hidden">{reconciliation.comparedLabel}</span> {card.source}
                </span>
              </p>
              <p className="reconciliation__status">
                <Icon
                  name={card.statusIcon}
                  className={`reconciliation__icon reconciliation__icon--${card.statusIcon}`}
                />
                <span>{card.status}</span>
              </p>
            </li>
          ))}
        </ul>
        <p id="reconciliation-caption" className="reconciliation__caption">
          {reconciliation.caption}
        </p>
      </div>
    </section>
  )
}

export default ReconciliationCards
