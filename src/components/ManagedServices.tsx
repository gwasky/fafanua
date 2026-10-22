import type { MouseEvent } from 'react'
import { managedServices } from '../data/services.ts'
import { focusSectionHeading } from '../focusSectionHeading.ts'
import { servicePath } from '../paths.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './ManagedServices.css'

// The sections the journey's first two steps lead to: ids, not copy.
const JOURNEY_TARGETS = ['data-trust-assessment', 'capabilities'] as const

// A plain click on a journey link also moves focus to the target section's
// heading (the Managed Services Regrouped plan §5). The browser still
// follows the link, so the hash updates and the page scrolls: smoothly
// only without a reduced-motion preference, below the sticky header
// through the scroll margins (global.css). Modified and non-primary
// clicks, which open a new tab or window, are left alone.
function focusTarget(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    focusSectionHeading(id)
  }
}

// The Managed Services section (plan V2 §10), directly after Services: an
// ongoing engagement model, not a seventh capability, so it has no stage
// line or tags. On paper, it holds one graphite 900 panel (.surface-dark)
// inset within the container, laid out per the Managed Services Regrouped
// plan (#88): the eyebrow; the journey, an ordered list in a named nav
// whose first two steps link to the sections they name and whose last is
// the current step; the h2 beside the description and the link to the
// Managed Data & Analytics page; the capabilities under the four verb h3s;
// and the "How you can engage" label with the two fractional offers. The
// arrows are aria-hidden text. All copy comes from managedServices in
// services.ts.
function ManagedServices() {
  const { journey } = managedServices
  const current = journey[journey.length - 1]

  return (
    <section
      id="managed-services"
      data-reveal="section"
      className="managed-services"
      aria-labelledby="managed-services-heading"
    >
      <div className="container">
        <div className="managed-services__panel surface-dark">
          <SectionEyebrow number="02" label={managedServices.sectionLabel} />
          <nav className="managed-services__journey" aria-label={managedServices.journeyLabel}>
            <ol role="list">
              {JOURNEY_TARGETS.map((id, index) => (
                <li key={id} className="managed-services__step">
                  <a
                    className="managed-services__step-link"
                    href={`#${id}`}
                    onClick={focusTarget(id)}
                  >
                    {journey[index]}
                  </a>
                  <span className="managed-services__step-arrow" aria-hidden="true">
                    →
                  </span>
                </li>
              ))}
              <li className="managed-services__step">
                <span className="managed-services__step-current" aria-current="step">
                  {current}
                </span>
              </li>
            </ol>
          </nav>
          <div className="managed-services__intro">
            <h2 id="managed-services-heading" className="managed-services__title">
              {managedServices.sectionHeading}
            </h2>
            <div className="managed-services__proposition">
              <p className="managed-services__description">
                {managedServices.description}
              </p>
              <a
                className="managed-services__link"
                href={servicePath('managed-data-and-analytics')}
              >
                {managedServices.heading}
                <span className="managed-services__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
          <div className="managed-services__groups">
            {managedServices.groups.map((group) => {
              const headingId = `managed-services-${group.heading.toLowerCase()}`
              return (
                <div key={group.heading} className="managed-services__group">
                  <h3 id={headingId} className="managed-services__verb">
                    {group.heading}
                  </h3>
                  <ul
                    className="managed-services__list"
                    role="list"
                    aria-labelledby={headingId}
                  >
                    {group.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="managed-services__engage">
            <p id="managed-services-engage-label" className="managed-services__engage-label">
              {managedServices.engagementLabel}
            </p>
            <ul
              className="managed-services__offers"
              role="list"
              aria-labelledby="managed-services-engage-label"
            >
              {managedServices.offers.map((offer) => (
                <li key={offer}>{offer}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManagedServices
