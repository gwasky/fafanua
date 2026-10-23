import type { SectorLandingPage } from '../data/solutionPages.ts'
import { servicePath } from '../paths.ts'
import IconBadge from './IconBadge.tsx'

// The service cards after the assessment (#93): the h2 and subheading over three white
// cards with square badges, three across from 64em. Each h3 links to its
// service's landing page (owner note 4), in the heading's colour.
function ServiceCards({ services }: { services: SectorLandingPage['services'] }) {
  return (
    <section className="sector-section" aria-labelledby="after-heading">
      <div className="container">
        <h2 id="after-heading" className="sector-heading">
          {services.heading}
        </h2>
        <p className="sector-subheading">{services.subheading}</p>
        <ul className="service-cards" role="list">
          {services.items.map((item) => (
            <li key={item.name} className="service-card-lp">
              <IconBadge icon={item.icon} shape="square" />
              <h3 className="sector-card-heading sector-card-heading--small">
                <a href={servicePath(item.service)}>{item.name}</a>
              </h3>
              <p className="service-card-lp__text">{item.text}</p>
              {item.detail !== undefined && <p className="service-card-lp__text">{item.detail}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ServiceCards
