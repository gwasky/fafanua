import './Positioning.css'

// The positioning section (plan V2 §8), between the dark hero and
// Services: a large statement, the core message from
// _docs/plan-fafanua-services-positioning.md Section 1, then supporting
// copy, the positioning statement #55 moved out of the hero, unchanged.
// Both verbatim. Plain paragraphs in a plain div: no heading, no links
// and not a named region. Side by side from 64em, stacked below it.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container positioning__layout">
        <p className="positioning__statement">
          Fafanua helps organisations build reliable data foundations, connect
          fragmented systems, improve trust in their data, and turn
          information into useful business intelligence.
        </p>
        <p className="positioning__support">
          Fafanua helps East African businesses, government institutions and
          development organisations establish trusted data foundations for
          reliable reporting, better decisions and future governed analytics
          and AI.
        </p>
      </div>
    </div>
  )
}

export default Positioning
