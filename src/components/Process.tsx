import { processStages } from '../data/process.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Process.css'

// How We Work (plan V2 §13): the "04 — How We Work" eyebrow, the h2, then
// the engagement model as a numbered timeline of four stages, in data
// order: horizontal from 64em and vertical below it (Process.css). It
// answers how Fafanua delivers an engagement, so it is kept distinct from
// the Services lifecycle rail: no service-line colours, and every stage
// shows its full description. The id and heading match the "How We Work"
// entry in src/data/navigation.ts. The visible number is hidden from
// screen readers, which already announce each item's position in the
// ordered list; the timeline's line and node markers are drawn in CSS, so
// they have no text. No introduction paragraph (#30), and no links,
// buttons or tab stops.
function Process() {
  return (
    <section
      id="how-we-work"
      className="process surface-alt"
      aria-labelledby="how-we-work-heading"
    >
      <div className="container">
        <SectionEyebrow number="04" label="How We Work" />
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
