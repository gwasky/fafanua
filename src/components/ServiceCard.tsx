import { useState } from 'react'
import { services, stages, type Service } from '../data/services.ts'
import './ServiceCard.css'

type ServiceCardProps = {
  service: Service
}

// One service: name, lifecycle label with its colour marker and stage
// number, description, capability tags (always shown) and a disclosure
// for the typical-engagements list. All copy comes from the service
// passed in. The stage number is the service's position in `services`,
// as in the lifecycle rail (LifecycleRail.tsx); it and the marker are
// hidden from screen readers, so the label reads as the stage alone. The
// marker colour is chosen in ServiceCard.css from the stage modifier
// class. The open modifier lets ServiceCard.css give an open card the
// extra grid track its list sits in.
function ServiceCard({ service }: ServiceCardProps) {
  const [open, setOpen] = useState(false)
  const position = (services as readonly Service[]).indexOf(service) + 1
  const number = String(position).padStart(2, '0')
  const headingId = `${service.id}-heading`
  const panelId = `${service.id}-typical-engagements`

  return (
    <div
      className={`service-card service-card--${service.stage}${open ? ' service-card--open' : ''}`}
    >
      <h3 id={headingId} className="service-card__title">
        {service.name}
      </h3>
      <p className="service-card__line">
        <span className="service-card__marker" aria-hidden="true" />
        <span className="service-card__number" aria-hidden="true">
          {number}
        </span>
        {stages[service.stage]}
      </p>
      <p className="service-card__summary">{service.description}</p>
      <ul className="service-card__tags" role="list">
        {service.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <button
        type="button"
        className="button button--secondary service-card__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        Typical engagements{' '}
        <span className="visually-hidden">for {service.name}</span>
        <svg
          className="service-card__chevron"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3.5 6 8 10.5 12.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        id={panelId}
        className="service-card__work"
        role="list"
        hidden={!open}
      >
        {service.engagements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default ServiceCard
