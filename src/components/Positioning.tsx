import './Positioning.css'

// The positioning statement, the owner's adaptation of _docs/plan.md
// Section 1, unchanged. It sat in the hero until #55 moved it out; #56
// replaces this block with the plan V2 §8 positioning section. A plain
// paragraph: no heading, no links and not a named region.
function Positioning() {
  return (
    <div className="positioning">
      <div className="container">
        <p className="positioning__statement">
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
