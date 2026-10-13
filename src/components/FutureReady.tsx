import TechnicalGrid from './TechnicalGrid.tsx'
import {
  futureReadyDestination,
  futureReadyHeading,
  futureReadyLabels,
  futureReadyStatement,
} from '../data/futureReady.ts'
import './FutureReady.css'

// One of the page's two full-bleed dark sections, with the hero (plan V2
// §14): a statement of direction, not a product.
// Its copy is in src/data/futureReady.ts. The paragraph (W5, #72) no
// longer names the graphic's four labels, so the graphic is exposed to
// screen readers: a list named by the section heading, then the
// destination. Its dots, rail and ring are empty CSS pseudo-elements, so
// they stay hidden. It has no links or other tab stops. The technical grid
// sits behind the content.
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
        <div className="future-ready__text">
          <h2 id="future-ready-heading" className="future-ready__heading">
            {futureReadyHeading}
          </h2>
          <p className="future-ready__statement">{futureReadyStatement}</p>
        </div>
        <div className="future-ready__graphic">
          <ul
            className="future-ready__list"
            role="list"
            aria-labelledby="future-ready-heading"
          >
            {futureReadyLabels.map((label) => (
              <li key={label} className="future-ready__item">
                {label}
              </li>
            ))}
          </ul>
          <span className="future-ready__end">{futureReadyDestination}</span>
        </div>
      </div>
    </section>
  )
}

export default FutureReady
