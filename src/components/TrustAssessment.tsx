import {
  assessmentAfterHeading,
  assessmentAfterStatement,
  assessmentAfterSupporting,
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentEyebrow,
  assessmentHeading,
  assessmentLead,
  assessmentName,
  lineageExample,
} from '../data/assessment.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './TrustAssessment.css'

// The Data Trust Assessment (W4 in the trust and lineage plan, #71), on
// paper directly after the problem block and before Services, the entry
// engagement (the homepage enhancement plan, #79). Its copy is in
// src/data/assessment.ts. The start column holds the unnumbered eyebrow,
// the engagement name (a paragraph, not a heading and not in the h2, so
// the region keeps the h2's name), the h2, the lead, the two h3s with the
// deliverables and, after the assessment, a statement and its supporting
// copy, then the one call to action (to #contact, like the hero's); the
// end column holds the illustrative example, a static figure of labels
// only (#77): the example metric names, the seven trace steps each is
// traced through, and, under the last step, the scorecard's three rating
// categories, none of them given to any metric. The figure has no
// controls or tab stops: each part is a list named by the label before
// it, so it reads in order without CSS, and the steps' connectors and
// arrowheads are drawn with borders in CSS. Not in the navigation.
function TrustAssessment() {
  const { caption, metricsLabel, metrics, stepsLabel, steps, ratings } = lineageExample
  return (
    <section
      id="data-trust-assessment"
      className="trust-assessment"
      aria-labelledby="data-trust-assessment-heading"
      data-reveal="section"
    >
      <div className="container trust-assessment__layout">
        <div className="trust-assessment__copy">
          <SectionEyebrow label={assessmentEyebrow} />
          <p className="trust-assessment__name">{assessmentName}</p>
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
          <p className="trust-assessment__after-statement">{assessmentAfterStatement}</p>
          <p className="trust-assessment__after">{assessmentAfterSupporting}</p>
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
          <p id="lineage-example-metrics-label" className="lineage-example__label">
            {metricsLabel}
          </p>
          <ul
            className="lineage-example__metrics"
            role="list"
            aria-labelledby="lineage-example-metrics-label"
          >
            {metrics.map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
          <p id="lineage-example-steps-label" className="lineage-example__label">
            {stepsLabel}
          </p>
          <ol
            className="lineage-example__steps"
            role="list"
            aria-labelledby="lineage-example-steps-label"
          >
            {steps.map((step, index) => {
              const last = index === steps.length - 1
              return (
                <li key={step} className="lineage-example__step">
                  <p
                    id={last ? 'lineage-example-rating-label' : undefined}
                    className="lineage-example__label"
                  >
                    {step}
                  </p>
                  {last && (
                    <ul
                      className="lineage-example__ratings"
                      role="list"
                      aria-labelledby="lineage-example-rating-label"
                    >
                      {ratings.map((rating) => (
                        <li key={rating} className="lineage-example__rating">
                          {rating}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </figure>
      </div>
    </section>
  )
}

export default TrustAssessment
