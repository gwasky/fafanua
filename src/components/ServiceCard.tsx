import { useState } from 'react'
import { stages, type Service } from '../data/services.ts'
import './ServiceCard.css'

type ServiceCardProps = {
  service: Service
}

// One service: name, lifecycle label with its colour marker, description
// and a disclosure for the typical-engagements list. All copy comes from
// the service passed in; the marker colour is chosen in ServiceCard.css
// from the stage modifier class.
function ServiceCard({ service }: ServiceCardProps) {
  const [open, setOpen] = useState(false)
  const headingId = `${service.id}-heading`
  const panelId = `${service.id}-typical-engagements`

  return (
    <div className={`service-card service-card--${service.stage}`}>
      <h3 id={headingId} className="service-card__title">
        {service.name}
      </h3>
      <p className="service-card__line">
        <span className="service-card__marker" aria-hidden="true" />
        {stages[service.stage]}
      </p>
      <p className="service-card__summary">{service.description}</p>
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
