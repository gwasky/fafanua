import { services, stages, type Service } from '../data/services.ts'
import { servicePath } from '../paths.ts'
import './ServiceCard.css'

type ServiceCardProps = {
  service: Service
}

// The content of one capability cell in the open grid (Capabilities Open
// Grid plan §4, #83), top to bottom: the stage line, the title as the
// cell's one link, to the service's own page (#67), the description and
// the tags as one line of plain text. All copy comes from the service
// passed in. The stage number is the service's position in `services`,
// hidden from screen readers (the list announces the position), so the
// line reads as the stage alone. The arrow after the title is decorative
// and shows on hover and focus; the link's name is the service's name. A
// no-break space joins it to the last word, so it never wraps alone.
// The cell itself (the list item, styled in Services.css) carries the
// hover and focus tint and the stretched link's overlay.
function ServiceCard({ service }: ServiceCardProps) {
  const position = (services as readonly Service[]).indexOf(service) + 1
  const number = String(position).padStart(2, '0')

  return (
    <>
      <p className="service-card__stage">
        <span className="service-card__number" aria-hidden="true">
          {number}
        </span>
        {stages[service.stage]}
      </p>
      <h3 id={`${service.id}-heading`} className="service-card__title">
        <a className="service-card__link" href={servicePath(service.id)}>
          {service.name}
          <span className="service-card__arrow" aria-hidden="true">
            {'\u00A0→'}
          </span>
        </a>
      </h3>
      <p className="service-card__summary">{service.description}</p>
      <p className="service-card__tags">{service.tags.join(' · ')}</p>
    </>
  )
}

export default ServiceCard
