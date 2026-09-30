import { managedServices } from '../data/services.ts'
import './ManagedServices.css'

// The managed-services block: an ongoing engagement model shown after
// the six service cards, not a seventh card, so it has no stage label,
// marker or disclosure. The capabilities stay in data order; the journey
// is an ordered list whose arrows are drawn in CSS and never announced.
// All copy comes from managedServices in services.ts.
function ManagedServices() {
  return (
    <div id="managed-services" className="managed-services surface-alt">
      <p className="managed-services__eyebrow">{managedServices.eyebrow}</p>
      <h3 className="managed-services__heading">{managedServices.heading}</h3>
      <p className="managed-services__description">
        {managedServices.description}
      </p>
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
  )
}

export default ManagedServices
