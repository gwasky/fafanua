import {
  assessmentCtaLabel,
  assessmentDeliverables,
  assessmentDeliverablesLabel,
  assessmentEyebrow,
  assessmentHeading,
  assessmentLead,
  assessmentName,
  assessmentNextEyebrow,
  assessmentNextStatement,
  assessmentNextSupporting,
  lineageTrace,
} from '../data/assessment.ts'
import { focusSectionOnClick } from '../focusSectionHeading.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './TrustAssessment.css'

// The Data Trust Assessment (W4 in the trust and lineage plan, #71), on
// paper directly after the problem block and before Services, the entry
// engagement (the homepage enhancement plan, #79), laid out by the dark
// panel plan (#82, revised by the owner for #99): one graphite 900 panel
// inset within the container, like Managed Services, in two parts. Its
// copy is in src/data/assessment.ts.
//
// Row 1: the left column (the unnumbered eyebrow in a row that draws a
// short hairline after it; the engagement name, a paragraph, not a
// heading and not in the h2, so the region keeps the h2's name; the h2;
// the lead; the small deliverables label; and the four tiles, each a
// label over its description) and the light card (.surface-light): its
// h3, the five trace steps, each its name and description; after a
// hairline, the establish label over its two items; and the scorecard's
// three rating categories, named by the second establish item.
// Then, after a hairline, the closing strip: its text group (the eyebrow,
// the h3 and the paragraph) and the one call to action (to #contact, like
// the hero's; a plain click or Enter also moves focus to the Contact
// heading, the owner's decision on #99). Each list is named by the label or heading before it, so it
// reads in order without CSS, and every line, ring and marker is drawn
// with borders in CSS. Nothing is interactive but the button. Not in the
// navigation.
function TrustAssessment() {
  const { heading, steps, establishLabel, establish, ratings } = lineageTrace
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
            <p id="trust-assessment-receive-label" className="trust-assessment__label">
              {assessmentDeliverablesLabel}
            </p>
            <ul className="trust-assessment__tiles" role="list" aria-labelledby="trust-assessment-receive-label">
              {assessmentDeliverables.map((item) => (
                <li key={item.label}>
                  <p className="trust-assessment__tile-label">{item.label}</p>
                  <p className="trust-assessment__tile-text">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lineage-trace surface-light">
            <h3 id="lineage-trace-heading" className="lineage-trace__heading">
              {heading}
            </h3>
            <ol className="lineage-trace__steps" role="list" aria-labelledby="lineage-trace-heading">
              {steps.map((step) => (
                <li key={step.name} className="lineage-trace__step">
                  <span className="lineage-trace__step-name">{step.name}</span>{' '}
                  <span className="lineage-trace__step-description">{step.description}</span>
                </li>
              ))}
            </ol>
            <div className="lineage-trace__establish">
              <p id="lineage-trace-establish-label" className="lineage-trace__label">
                {establishLabel}
              </p>
              <ul
                className="lineage-trace__establish-list"
                role="list"
                aria-labelledby="lineage-trace-establish-label"
              >
                {establish.map((item, index) => (
                  <li key={item.name}>
                    <p
                      id={index === establish.length - 1 ? 'lineage-trace-rating-label' : undefined}
                      className="lineage-trace__establish-name"
                    >
                      {item.name}
                    </p>
                    <p className="lineage-trace__establish-description">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="lineage-trace__ratings" role="list" aria-labelledby="lineage-trace-rating-label">
              {ratings.map((rating) => (
                <li key={rating}>{rating}</li>
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
              <a className="button" href="#contact" onClick={focusSectionOnClick('contact')}>
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
