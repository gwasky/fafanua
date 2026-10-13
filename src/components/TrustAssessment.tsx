import {
  assessmentAfter,
  assessmentAfterHeading,
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentHeading,
  assessmentLead,
  lineageExample,
} from '../data/assessment.ts'
import './TrustAssessment.css'

// The Data Trust Assessment (W4 in the trust and lineage plan, #71), on
// paper directly after the problem statement and before Services. Its copy
// is in src/data/assessment.ts. The start column holds the h2, the lead,
// the two h3s with the deliverables and the after-line, and the one call
// to action (to #contact, like the hero's); the end column holds the
// illustrative example, a static figure that traces one sample number
// through five steps. The figure has no controls or tab stops: its steps
// are an ordered list, each a label then its value, so they read in order
// without CSS, and its connectors are drawn with borders in CSS. No
// numbered eyebrow and not in the navigation.
function TrustAssessment() {
  const { caption, figure, steps } = lineageExample
  return (
    <section
      id="data-trust-assessment"
      className="trust-assessment"
      aria-labelledby="data-trust-assessment-heading"
      data-reveal="section"
    >
      <div className="container trust-assessment__layout">
        <div className="trust-assessment__copy">
          <h2 id="data-trust-assessment-heading" className="trust-assessment__heading">
            {assessmentHeading}
          </h2>
          <p className="trust-assessment__lead">{assessmentLead}</p>
          <h3 className="trust-assessment__subheading">{assessmentDeliverablesHeading}</h3>
          <ul className="trust-assessment__deliverables" role="list">
            {assessmentDeliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="trust-assessment__subheading">{assessmentAfterHeading}</h3>
          <p className="trust-assessment__after">{assessmentAfter}</p>
          <div className="trust-assessment__actions">
            <a className="button" href="#contact">
              {assessmentCtaLabel}
              <span className="button__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
        <figure className="lineage-example" aria-labelledby="lineage-example-caption">
          <figcaption id="lineage-example-caption" className="lineage-example__caption">
            {caption}
          </figcaption>
          <p id="lineage-example-figure" className="lineage-example__figure">
            {figure}
          </p>
          <ol
            className="lineage-example__steps"
            role="list"
            aria-labelledby="lineage-example-figure"
          >
            {steps.map((step) => (
              <li key={step.label} className="lineage-example__step">
                <p className="lineage-example__label">{step.label}</p>
                <p
                  className={
                    step.reason
                      ? 'lineage-example__value lineage-example__value--rating'
                      : 'lineage-example__value'
                  }
                >
                  {step.value}
                </p>
                {step.reason && <p className="lineage-example__reason">{step.reason}</p>}
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  )
}

export default TrustAssessment
