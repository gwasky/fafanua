import { services, stages } from '../data/services.ts'
import './LifecycleRail.css'

// The lifecycle rail above the service cards (plan V2 §9): one item per
// service, in data order, with its two-digit number and its stage label
// from services.ts, so the rail holds no copy of its own. The number and
// the colour marker are hidden from screen readers, which announce each
// item's position in the ordered list, so an item reads as its label.
// Nothing here is a link or a button. The plain wrapper is the container
// whose width decides between the row and the vertical list
// (LifecycleRail.css).
function LifecycleRail() {
  return (
    <div className="lifecycle-rail-frame" data-reveal="line">
      <ol className="lifecycle-rail" role="list">
        {services.map((service, index) => (
          <li
            key={service.id}
            className={`lifecycle-rail__stage lifecycle-rail__stage--${service.stage}`}
          >
            <span className="lifecycle-rail__marker" aria-hidden="true" />
            <span className="lifecycle-rail__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="lifecycle-rail__label">{stages[service.stage]}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default LifecycleRail
