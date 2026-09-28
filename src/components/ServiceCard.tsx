import { useState } from 'react'
import { serviceLines, type Service } from '../data/services.ts'
import './ServiceCard.css'

type ServiceCardProps = {
  service: Service
}

// One service: title, service-line label with its colour marker, summary
// and a disclosure for the typical-work list. All copy comes from the
// service passed in; the marker colour is chosen in ServiceCard.css from
// the service-line modifier class.
function ServiceCard({ service }: ServiceCardProps) {
  const [open, setOpen] = useState(false)
  const headingId = `${service.id}-heading`
  const panelId = `${service.id}-typical-work`

  return (
    <div className={`service-card service-card--${service.serviceLine}`}>
      <h3 id={headingId} className="service-card__title">
        {service.title}
      </h3>
      <p className="service-card__line">
        <span className="service-card__marker" aria-hidden="true" />
        {serviceLines[service.serviceLine]}
      </p>
      <p className="service-card__summary">{service.summary}</p>
      <button
        type="button"
        className="button button--secondary service-card__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        Typical work{' '}
        <span className="visually-hidden">for {service.title}</span>
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
        {service.typicalWork.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default ServiceCard
