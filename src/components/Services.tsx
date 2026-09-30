import { services, servicesIntro } from '../data/services.ts'
import ManagedServices from './ManagedServices.tsx'
import ServiceCard from './ServiceCard.tsx'
import './Services.css'

// The Services section: a short intro, then the six services as cards, in
// data order, then the managed-services block (ManagedServices.tsx) outside
// the card list. The id and h2 match the "Services" entry in
// src/data/navigation.ts; the intro and block headings are h3s, like the
// card titles.
function Services() {
  return (
    <section
      id="services"
      className="services"
      aria-labelledby="services-heading"
    >
      <div className="container">
        <h2 id="services-heading" className="services__heading">
          Services
        </h2>
        <div className="services__intro">
          <h3 className="services__intro-heading">{servicesIntro.heading}</h3>
          {servicesIntro.paragraphs.map((paragraph) => (
            <p key={paragraph} className="services__intro-text">
              {paragraph}
            </p>
          ))}
        </div>
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
