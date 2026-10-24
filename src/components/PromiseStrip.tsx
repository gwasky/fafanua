import type { SectorLandingPage } from '../data/solutionPages.ts'

type PromiseData = NonNullable<SectorLandingPage['promise']>

// The promise strip (Financial Services, #98): one white card holding an
// ol of four numbered steps in two groups of two, each group under its
// label, the first (the assessment) with teal-tint circles and the second
// (after it) with neutral ones, which marks where the assessment ends.
// The visible labels sit in the first step of each group, spanning both
// of its steps from 48em (SectorLanding.css), and are hidden from
// assistive technology; instead each step begins with a visually hidden
// copy of its group's label, so the grouping is read once per step. The
// labels are not headings. The step numbers are text; the circles are
// decorative styling.
function PromiseStrip({ promise }: { promise: PromiseData }) {
  return (
    <section className="sector-section">
      <div className="container">
        <div className="promise">
          <ol className="promise__steps" role="list">
            {promise.groups.flatMap((group, groupIndex) => {
              const tone = groupIndex === 0 ? 'accent' : 'neutral'
              return group.steps.map((step, stepIndex) => (
                <li
                  key={step.name}
                  className={stepIndex === 0 ? 'promise__step promise__step--group-start' : 'promise__step'}
                >
                  <span className="visually-hidden">{group.label}</span>{' '}
                  {stepIndex === 0 && (
                    <span className={`promise__label promise__label--${tone}`} aria-hidden="true">
                      {group.label}
                    </span>
                  )}{' '}
                  <span className="promise__body">
                    <span className={`promise__number promise__number--${tone}`}>
                      {groupIndex * group.steps.length + stepIndex + 1}
                    </span>{' '}
                    <span className="promise__words">
                      <span className="promise__name">{step.name}</span>{' '}
                      <span className="promise__text">{step.text}</span>
                    </span>
                  </span>
                </li>
              ))
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default PromiseStrip
