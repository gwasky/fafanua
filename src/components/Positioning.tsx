import { positioningProblem, positioningResponse } from '../data/positioning.ts'
import './Positioning.css'

// The positioning section (plan V2 §8, refinement plan §3), between the
// dark hero and Services: the problem as a large statement, then
// Fafanua's response as supporting copy, both read from
// src/data/positioning.ts. Plain paragraphs in a plain div: no heading, no
// links and not a named region. Side by side from 64em, the problem
// first, and stacked below it.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container positioning__layout">
        <p className="positioning__statement">{positioningProblem}</p>
        <p className="positioning__support">{positioningResponse}</p>
      </div>
    </div>
  )
}

export default Positioning
