import { services } from '../data/services.ts'
import ServiceCard from './ServiceCard.tsx'
import './Services.css'

// The six Phase 1 services as cards, in data order. The id and heading
// match the "Services" entry in src/data/navigation.ts.
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
