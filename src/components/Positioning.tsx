import {
  positioningEyebrow,
  positioningFraming,
  positioningProblem,
  positioningTransition,
} from '../data/positioning.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Positioning.css'

// The problem block (plan V2 §8, the Data Trust Assessment enhancement
// plan §5 and §6, #79), between the dark hero and the Data Trust
// Assessment (#71). Its copy is in src/data/positioning.ts. The start
// column holds the unnumbered eyebrow and a short framing line; the end
// column the problem as a large statement and, beneath it, the transition
// into the assessment. Four plain paragraphs in a plain div: no heading,
// no links and not a named region, so it reads in order without CSS.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container positioning__layout">
        <div className="positioning__context">
          <SectionEyebrow label={positioningEyebrow} />
          <p className="positioning__framing">{positioningFraming}</p>
        </div>
        <div className="positioning__main">
          <p className="positioning__statement">{positioningProblem}</p>
          <p className="positioning__transition">{positioningTransition}</p>
        </div>
      </div>
    </div>
  )
}

export default Positioning
