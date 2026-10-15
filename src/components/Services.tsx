import { services, servicesIntro } from '../data/services.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import ServiceCard from './ServiceCard.tsx'
import SystemFlow from './SystemFlow.tsx'
import './Services.css'

// The capabilities section, laid out as the Capabilities Open Grid plan's
// open hairline grid (#83): the "01 — Capabilities" eyebrow, the heading
// (W3 in the trust and lineage plan, #70) as the section's h2 with its
// highlight in teal, and the promise line beneath it; then the six
// services as an ordered list of cells (ServiceCard.tsx), in lifecycle
// order, then the system and data-flow diagram (SystemFlow.tsx), which
// shows how they connect and ends at activation, where the Managed
// Services section (ManagedServices.tsx) that follows picks up. The id
// matches the "Services" entry in src/data/navigation.ts and is the
// target of the hero's secondary text link; the section is
// named by its h2. The cell titles and the diagram's heading are h3s.
//
// The highlight is a phrase of the heading named in services.ts and found
// here, so the heading stays one string and the h2's text (and the
// region's name) is exactly that string. The span is styling only.
function Services() {
  const { heading, highlight, promise } = servicesIntro
  const at = heading.indexOf(highlight)
  return (
    <section
      id="capabilities"
      data-reveal="section"
      className="services"
      aria-labelledby="capabilities-heading"
    >
      <div className="container">
        <div className="services__intro">
          <SectionEyebrow number="01" label="Capabilities" />
          <h2 id="capabilities-heading" className="services__heading">
            {at < 0 ? (
              heading
            ) : (
              <>
                {heading.slice(0, at)}
                <span className="services__highlight">{highlight}</span>
                {heading.slice(at + highlight.length)}
              </>
            )}
          </h2>
          <p className="services__promise">{promise}</p>
        </div>
        <ol className="services__list" role="list">
          {services.map((service) => (
            <li key={service.id} className="services__cell">
              <ServiceCard service={service} />
            </li>
          ))}
        </ol>
        <SystemFlow />
      </div>
    </section>
  )
}

export default Services
