import { services, servicesIntro } from '../data/services.ts'
import LifecycleRail from './LifecycleRail.tsx'
import SectionEyebrow from './SectionEyebrow.tsx'
import ServiceCard from './ServiceCard.tsx'
import SystemFlow from './SystemFlow.tsx'
import './Services.css'

// The Services section: the "01 — Capabilities" eyebrow, the heading
// (W3 in the trust and lineage plan, #70) as the section's h2, with no
// intro paragraphs beneath it, the lifecycle rail (LifecycleRail.tsx),
// then the six services as cards, in data order, then the system and data-flow diagram (SystemFlow.tsx),
// which shows how they connect and ends at activation, where the Managed
// Services section (ManagedServices.tsx) that follows picks up. The id
// matches the "Services" entry in src/data/navigation.ts; the section is
// named by its h2. The card titles and the diagram's heading are h3s.
function Services() {
  return (
    <section
      id="services"
      data-reveal="section"
      className="services"
      aria-labelledby="services-heading"
    >
      <div className="container">
        <div className="services__intro">
          <SectionEyebrow number="01" label="Capabilities" />
          <h2 id="services-heading" className="services__heading">
            {servicesIntro.heading}
          </h2>
        </div>
        <LifecycleRail />
        <ul className="services__list" role="list">
          {services.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
        <SystemFlow />
      </div>
    </section>
  )
}

export default Services
