import {
  assessmentCtaLabel,
  assessmentDeliverableLabels,
  assessmentDeliverables,
  assessmentDeliverablesHeading,
  assessmentEyebrow,
  assessmentFacts,
  assessmentHeading,
  assessmentLead,
  assessmentName,
  assessmentNextEyebrow,
  assessmentNextStatement,
  assessmentNextSupporting,
  lineageExample,
} from '../data/assessment.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './TrustAssessment.css'

// The Data Trust Assessment (W4 in the trust and lineage plan, #71), on
// paper directly after the problem block and before Services, the entry
// engagement (the homepage enhancement plan, #79), laid out by the dark
// panel plan (#82), which supersedes W11 (#81): one graphite 900 panel
// inset within the container, like Managed Services, in three rows. Its
// copy is in src/data/assessment.ts.
//
// Row 1: the intro (the unnumbered eyebrow in a row that draws a short
// hairline after it; the engagement name, a paragraph, not a heading and
// not in the h2, so the region keeps the h2's name; the h2; the lead; the
// facts pill; and the decorative contour lines, the last child) and the
// illustrative example, a light card (.surface-light) of labels only
// (#77): the example metric names as chips; the seven trace steps, each
// with its description, the last two marked as attributes; and the
// scorecard's three rating categories, named by the last step.
// Row 2: the h3 over the four deliverables as tiles, each with its label.
// Row 3: after a hairline, the closing strip with its text group (the
// eyebrow, the h3 and the paragraph) and the one call to action (to
// #contact, like the hero's). The figure has no controls or tab stops:
// each list is named by the label before it, so it reads in order without
// CSS, and every line, ring and marker is drawn with borders in CSS. Not in
// the navigation.
function TrustAssessment() {
  const { caption, metricsLabel, metrics, stepsLabel, steps, ratings } = lineageExample
  return (
    <section
      id="data-trust-assessment"
      className="trust-assessment"
      aria-labelledby="data-trust-assessment-heading"
      data-reveal="section"
    >
      <div className="container">
        <div className="trust-assessment__panel surface-dark">
          <div className="trust-assessment__intro">
            <div className="trust-assessment__eyebrow-row">
              <SectionEyebrow label={assessmentEyebrow} />
            </div>
            <p className="trust-assessment__name">{assessmentName}</p>
            <h2 id="data-trust-assessment-heading" className="trust-assessment__heading">
              {assessmentHeading}
            </h2>
            <p className="trust-assessment__lead">{assessmentLead}</p>
            <p className="trust-assessment__facts">{assessmentFacts}</p>
            <svg
              className="trust-assessment__contours"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M0 196 C 90 160, 150 60, 230 60 C 300 60, 340 100, 370 108 C 385 112, 395 108, 400 105"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M90 200 C 160 160, 220 130, 280 132 C 330 134, 360 170, 380 182 C 390 188, 396 189, 400 188"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <figure className="lineage-example surface-light" aria-labelledby="lineage-example-caption">
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
                {steps.map((step, index) => (
                  <li
                    key={step.name}
                    className={step.attribute ? 'lineage-example__step lineage-example__step--attribute' : 'lineage-example__step'}
                  >
                    <p
                      id={index === steps.length - 1 ? 'lineage-example-rating-label' : undefined}
                      className="lineage-example__step-name"
                    >
                      {step.name}
                    </p>
                    <p className="lineage-example__step-description">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
            <ul
              className="lineage-example__ratings"
              role="list"
              aria-labelledby="lineage-example-rating-label"
            >
              {ratings.map((rating) => (
                <li key={rating}>{rating}</li>
              ))}
            </ul>
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
          <div className="trust-assessment__next">
            <div className="trust-assessment__next-text">
              <SectionEyebrow label={assessmentNextEyebrow} />
              <h3 className="trust-assessment__next-statement">{assessmentNextStatement}</h3>
              <p className="trust-assessment__next-supporting">{assessmentNextSupporting}</p>
            </div>
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
      </div>
    </section>
  )
}

export default TrustAssessment
