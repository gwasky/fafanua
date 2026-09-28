import { processStages } from '../data/process.ts'
import './Process.css'

// The engagement model as four numbered stages, in data order. The id and
// heading match the "How We Work" entry in src/data/navigation.ts. The
// visible number is hidden from screen readers, which already announce each
// item's position in the ordered list.
function Process() {
  return (
    <section
      id="how-we-work"
      className="process surface-alt"
      aria-labelledby="how-we-work-heading"
    >
      <div className="container">
        <h2 id="how-we-work-heading" className="process__heading">
          How We Work
        </h2>
        <ol className="process__list" role="list">
          {processStages.map((stage, index) => (
            <li key={stage.id} className="process__stage">
              <span className="process__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="process__name">{stage.name}</h3>
              <p className="process__description">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Process
