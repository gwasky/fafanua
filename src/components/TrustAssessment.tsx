import {
  assessmentAfterHeading,
  assessmentAfterStatement,
  assessmentAfterSupporting,
  assessmentCtaLabel,
  assessmentDeliverableLabels,
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
// engagement (the homepage enhancement plan, #79), laid out by W11 (#81)
// in three rows. Its copy is in src/data/assessment.ts.
//
// Row 1: the intro (the unnumbered eyebrow with the engagement name beside
// it as a tag, a paragraph, not a heading and not in the h2, so the region
// keeps the h2's name; the h2; the lead) and the illustrative example, a
// static figure of labels only (#77): the example metric names as chips,
// the first shown as selected by CSS alone; the five trace steps beside a
// rule; then, after a hairline, a definition list of the owner row and the
// trust rating row with the scorecard's three rating categories, none of
// them given to any metric. Row 2: the h3 over the four deliverables as
// tiles, each with its label. Row 3: a band with the h3, the statement,
// its supporting copy and the one call to action (to #contact, like the
// hero's). The figure has no controls or tab stops: each list is named by
// the label before it, so it reads in order without CSS, and every rule,
// ring and marker is drawn with borders in CSS. Not in the navigation.
function TrustAssessment() {
  const { caption, metricsLabel, metrics, stepsLabel, steps, ownerLabel, ownerRole, ratingLabel, ratings } =
    lineageExample
  return (
    <section
      id="data-trust-assessment"
      className="trust-assessment"
      aria-labelledby="data-trust-assessment-heading"
      data-reveal="section"
    >
      <div className="container trust-assessment__layout">
        <div className="trust-assessment__intro">
          <div className="trust-assessment__labels">
            <SectionEyebrow label={assessmentEyebrow} />
            <p className="trust-assessment__tag">{assessmentName}</p>
          </div>
          <h2 id="data-trust-assessment-heading" className="trust-assessment__heading">
            {assessmentHeading}
          </h2>
          <p className="trust-assessment__lead">{assessmentLead}</p>
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
          <div className="lineage-example__trace">
            <p id="lineage-example-steps-label" className="lineage-example__label">
              {stepsLabel}
            </p>
            <ol
              className="lineage-example__steps"
              role="list"
              aria-labelledby="lineage-example-steps-label"
            >
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <dl className="lineage-example__footer">
            <div>
              <dt>{ownerLabel}</dt>
              <dd>{ownerRole}</dd>
            </div>
            <div>
              <dt id="lineage-example-rating-label">{ratingLabel}</dt>
              <dd>
                <ul
                  className="lineage-example__ratings"
                  role="list"
                  aria-labelledby="lineage-example-rating-label"
                >
                  {ratings.map((rating) => (
                    <li key={rating}>{rating}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </figure>
        <div className="trust-assessment__receive">
          <h3 className="trust-assessment__receive-heading">{assessmentDeliverablesHeading}</h3>
          <ul className="trust-assessment__tiles" role="list">
            {assessmentDeliverables.map((item, index) => (
              <li key={item}>
                <p className="trust-assessment__tile-label">{assessmentDeliverableLabels[index]}</p>
                <p className="trust-assessment__tile-text">{item}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="trust-assessment__band">
          <h3 className="trust-assessment__band-label">{assessmentAfterHeading}</h3>
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
      </div>
    </section>
  )
}

export default TrustAssessment
