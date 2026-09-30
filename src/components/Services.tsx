import { services, servicesIntro } from '../data/services.ts'
import ServiceCard from './ServiceCard.tsx'
import './Services.css'

// The Services section: a short intro, then the six services as cards, in
// data order. The id and h2 match the "Services" entry in
// src/data/navigation.ts; the intro heading is an h3, like the card titles.
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
      </div>
    </section>
  )
}

export default Services
