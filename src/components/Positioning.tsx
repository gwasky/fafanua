import { positioningProblem } from '../data/positioning.ts'
import './Positioning.css'

// The positioning section (plan V2 §8, refinement plan §3), between the
// dark hero and Services: the problem as a large statement, read from
// src/data/positioning.ts. Fafanua's response no longer follows it, as it
// restated the hero (W3 in the trust and lineage plan, #70). A plain
// paragraph in a plain div: no heading, no links and not a named region.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container">
        <p className="positioning__statement">{positioningProblem}</p>
      </div>
    </div>
  )
}

export default Positioning
