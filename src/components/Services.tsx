import { services, servicesIntro } from '../data/services.ts'
import LifecycleRail from './LifecycleRail.tsx'
import ManagedServices from './ManagedServices.tsx'
import SectionEyebrow from './SectionEyebrow.tsx'
import ServiceCard from './ServiceCard.tsx'
import './Services.css'

// The Services section: the "01 — Capabilities" eyebrow, the approved
// intro heading as the section's h2, the two intro paragraphs, the
// lifecycle rail (LifecycleRail.tsx), then the six services as cards, in
// data order, then the managed-services block (ManagedServices.tsx)
// outside the card list. The id matches the "Services" entry in
// src/data/navigation.ts; the section is named by its h2. The card titles
// and the managed-services heading are h3s.
function Services() {
  return (
    <section
      id="services"
      className="services"
      aria-labelledby="services-heading"
    >
      <div className="container">
        <div className="services__intro">
          <SectionEyebrow number="01" label="Capabilities" />
          <h2 id="services-heading" className="services__heading">
            {servicesIntro.heading}
          </h2>
          {servicesIntro.paragraphs.map((paragraph) => (
            <p key={paragraph} className="services__intro-text">
              {paragraph}
            </p>
          ))}
        </div>
        <LifecycleRail />
        <ul className="services__list" role="list">
          {services.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
        <ManagedServices />
      </div>
    </section>
  )
}

export default Services
