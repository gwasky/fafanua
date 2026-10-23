import TechnicalGrid from './TechnicalGrid.tsx'
import {
  futureReadyConditions,
  futureReadyGoal,
  futureReadyHeading,
  futureReadyLead,
  futureReadyLinkText,
  futureReadyVerdictLine,
  futureReadyVerdicts,
} from '../data/futureReady.ts'
import { focusSectionOnClick } from '../focusSectionHeading.ts'
import './FutureReady.css'

// The section the link leads to: an id, not copy.
const ASSESSMENT_ID = 'data-trust-assessment'

// One of the page's two full-bleed dark sections, with the hero (plan V2
// §14): a readiness diagram, not a product, laid out per section C of the
// homepage sections refinement plan (#91). The technical grid sits behind
// the content. The top row holds the h2 and the lead. The four conditions
// and the goal are one ordered list, named by the heading, because they
// lead to the goal; the decorative arrow is aria-hidden text inside the
// goal's item, before its tile, so the list holds only items. Keys are
// plain text, not headings. The verdict line names the list of three
// chips, plain text like the assessment's rating chips. The link, the
// section's one tab stop, jumps to the Data Trust Assessment and moves
// focus to its heading, as the Managed Services journey links do (#88).
// Dots, rings and the dashed border are CSS. All copy comes from
// src/data/futureReady.ts; only the "→" glyphs are here.
function FutureReady() {
  return (
    <section
      id="future-ready"
      data-reveal="section"
      className="future-ready surface-dark"
      aria-labelledby="future-ready-heading"
    >
      <TechnicalGrid />
      <div className="container future-ready__layout">
        <div className="future-ready__top">
          <h2 id="future-ready-heading" className="future-ready__heading">
            {futureReadyHeading}
          </h2>
          <p className="future-ready__lead">{futureReadyLead}</p>
        </div>
        <ol
          className="future-ready__flow"
          role="list"
          aria-labelledby="future-ready-heading"
        >
          {futureReadyConditions.map(({ key, text }) => (
            <li key={key} className="future-ready__tile">
              <span className="future-ready__key">{key}</span>
              <span className="future-ready__condition">{text}</span>
            </li>
          ))}
          <li className="future-ready__goal">
            <span className="future-ready__arrow" aria-hidden="true">
              →
            </span>
            <span className="future-ready__tile future-ready__tile--goal">
              <span className="future-ready__key">{futureReadyGoal.key}</span>
              <span className="future-ready__condition">{futureReadyGoal.text}</span>
            </span>
          </li>
        </ol>
        <div className="future-ready__verdict">
          <div className="future-ready__verdicts">
            <p id="future-ready-verdict-line" className="future-ready__verdict-line">
              {futureReadyVerdictLine}
            </p>
            <ul
              className="future-ready__chips"
              role="list"
              aria-labelledby="future-ready-verdict-line"
            >
              {futureReadyVerdicts.map((verdict) => (
                <li key={verdict}>{verdict}</li>
              ))}
            </ul>
          </div>
          <a
            className="future-ready__link"
            href={`#${ASSESSMENT_ID}`}
            onClick={focusSectionOnClick(ASSESSMENT_ID)}
          >
            {futureReadyLinkText}
            <span className="future-ready__link-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default FutureReady
