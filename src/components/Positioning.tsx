import {
  positioningEyebrow,
  positioningFraming,
  positioningProblemChallenge,
  positioningProblemLead,
  positioningTransition,
} from '../data/positioning.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Positioning.css'

// The problem block (plan V2 §8, the homepage enhancement plan §5 and §6,
// #79), between the dark hero and the Data Trust Assessment (#71), laid
// out as W10 in the trust and lineage plan (#80). Its copy is in
// src/data/positioning.ts. Centred, top to bottom: the unnumbered eyebrow,
// the problem as a large two-tone statement (one paragraph, its two
// sentences in two spans), then a row of the framing paragraph and the
// bridge line into the assessment. Four plain paragraphs in a plain div,
// in reading order: no heading, no links and not a named region, so it
// reads in order without CSS.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container positioning__layout">
        <SectionEyebrow label={positioningEyebrow} />
        <p className="positioning__statement">
          <span className="positioning__lead">{positioningProblemLead}</span>{' '}
          <span className="positioning__challenge">{positioningProblemChallenge}</span>
        </p>
        <div className="positioning__row">
          <p className="positioning__framing">{positioningFraming}</p>
          <p className="positioning__bridge">{positioningTransition}</p>
        </div>
      </div>
    </div>
  )
}

export default Positioning
