import type { SectorLandingPage } from '../data/solutionPages.ts'

type Stages = NonNullable<SectorLandingPage['stages']>

// Delivered in stages (#93): the eyebrow, h2 and subheading over an ol of
// the stages under a 3px teal rule, four across from 64em and two from
// 48em, divided by hairlines; one per row below 48em, each under its own
// rule. Each stage: "Stage n", its h3 name, its description, then an exit
// box on the lighter tint with the exit label above the condition. No
// icons.
function StagesList({ stages }: { stages: Stages }) {
  return (
    <section className="sector-section" aria-labelledby="stages-heading">
      <div className="container">
        <p className="sector-eyebrow">{stages.eyebrow}</p>
        <h2 id="stages-heading" className="sector-heading">
          {stages.heading}
        </h2>
        <p className="sector-subheading">{stages.subheading}</p>
        <ol className="stages" role="list">
          {stages.items.map((stage, index) => (
            <li key={stage.name} className="stage">
              <p className="stage__number">{`${stages.stageLabel} ${index + 1}`}</p>
              <h3 className="sector-card-heading stage__name">{stage.name}</h3>
              <p className="stage__description">{stage.description}</p>
              <div className="stage__exit">
                <p className="stage__exit-label">{stages.exitLabel}</p>
                <p className="stage__exit-condition">{stage.exit}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default StagesList
