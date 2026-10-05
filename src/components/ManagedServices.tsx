import { managedServices } from '../data/services.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './ManagedServices.css'

// The Managed Services section (plan V2 §10), directly after Services: an
// ongoing engagement model, not a seventh service card, so it has no stage
// label, marker, tags or disclosure. On paper, it holds one graphite 900
// panel (.surface-dark) inset within the container. The eyebrow and the
// V2 heading (the section's h2) come first, then the approved eyebrow,
// h3 and description, the capability rail, the capabilities in data order
// and the journey, an ordered list. The rail's separators and the
// journey's arrows are drawn in CSS and never announced. No links or
// buttons. All copy comes from managedServices in services.ts.
function ManagedServices() {
  return (
    <section
      id="managed-services"
      className="managed-services"
      aria-labelledby="managed-services-heading"
    >
      <div className="container">
        <div className="managed-services__panel surface-dark">
          <div className="managed-services__intro">
            <div className="managed-services__lead">
              <SectionEyebrow number="02" label={managedServices.sectionLabel} />
              <h2 id="managed-services-heading" className="managed-services__title">
                {managedServices.sectionHeading}
              </h2>
            </div>
            <div className="managed-services__proposition">
              <p className="managed-services__eyebrow">{managedServices.eyebrow}</p>
              <h3 className="managed-services__heading">{managedServices.heading}</h3>
              <p className="managed-services__description">
                {managedServices.description}
              </p>
            </div>
          </div>
          <ul className="managed-services__rail" role="list">
            {managedServices.rail.map((word, index) => (
              <li key={word} className="managed-services__rail-item">
                {word}
                {index < managedServices.rail.length - 1 && (
                  <span className="managed-services__rail-separator" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
          <ul className="managed-services__capabilities" role="list">
            {managedServices.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
          <ol className="managed-services__journey" role="list">
            {managedServices.journey.map((step) => (
              <li key={step} className="managed-services__step">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default ManagedServices
