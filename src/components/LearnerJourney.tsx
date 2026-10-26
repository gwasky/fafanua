import type { SectorLandingPage } from '../data/solutionPages.ts'
import DefinitionCallout from './DefinitionCallout.tsx'

type Journey = NonNullable<SectorLandingPage['journey']>

// The learner journey after the assessment band (Education, issue 100), on
// paper and named by its h2: the eyebrow (after an optional lead label
// and a middle dot), the h2 and the text (after an optional opening
// sentence), then an ol of the steps, each a decorative dot, its name and
// its system (not headings). The highlighted step's dot is filled, the
// others hollow; it carries a visually hidden note after its name, and
// holds the definition callout and the caption, so the DOM order is the
// visual order at every width and the sample label is read with the
// definition; aria-describedby points it at the callout. One row from
// 64em, three and two from 48em, one step per row below it, with a
// decorative hairline through the dots.
function LearnerJourney({ journey }: { journey: Journey }) {
  return (
    <section className="sector-section" aria-labelledby="journey-heading">
      <div className="container">
        <p className="sector-eyebrow">
          {journey.eyebrowLead === undefined ? journey.eyebrow : `${journey.eyebrowLead} · ${journey.eyebrow}`}
        </p>
        <h2 id="journey-heading" className="sector-heading">
          {journey.heading}
        </h2>
        <p className="sector-subheading">
          {journey.intro === undefined ? journey.text : `${journey.intro} ${journey.text}`}
        </p>
        <ol className="journey" role="list">
          {journey.steps.map((step, index) => {
            const highlighted = index === journey.highlight
            return (
              <li
                key={step.name}
                className={highlighted ? 'journey__step journey__step--highlight' : 'journey__step'}
                aria-describedby={highlighted ? 'journey-callout' : undefined}
              >
                <span className="journey__point">
                  <span className="journey__dot" aria-hidden="true" />
                  <span className="journey__name">{step.name}</span>
                  {highlighted && (
                    <>
                      {' '}
                      <span className="visually-hidden">{journey.highlightNote}</span>
                    </>
                  )}{' '}
                  <span className="journey__system">{step.system}</span>
                </span>
                {highlighted && (
                  <>
                    <DefinitionCallout id="journey-callout" label={journey.callout.label} text={journey.callout.text} />
                    <p className="journey__caption">{journey.caption}</p>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default LearnerJourney
