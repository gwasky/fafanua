import './FutureReady.css'

// Plan Section 9, verbatim, split into a heading and a paragraph. Not
// service copy, so it lives here rather than in src/data/services.ts.
const futureReadyHeading =
  'The strongest analytics and AI systems begin with trusted data.'
const futureReadyStatement =
  'Fafanua designs data foundations that preserve business definitions, access controls, quality signals, and provenance as organisations introduce more advanced analytics and AI capabilities.'

// The graphic's labels, taken word for word from the statement, in order.
const futureReadyLabels = [
  'business definitions',
  'access controls',
  'quality signals',
  'provenance',
] as const

// The page's only dark section: a statement of direction, not a product.
// The graphic repeats words already in the paragraph, so it is hidden
// from screen readers. It has no links or other tab stops.
function FutureReady() {
  return (
    <section
      id="future-ready"
      className="future-ready surface-dark"
      aria-labelledby="future-ready-heading"
    >
      <div className="container future-ready__layout">
        <div className="future-ready__text">
          <h2 id="future-ready-heading">{futureReadyHeading}</h2>
          <p className="future-ready__statement">{futureReadyStatement}</p>
        </div>
        <div className="future-ready__graphic" aria-hidden="true">
          <ul className="future-ready__list" role="list">
            {futureReadyLabels.map((label) => (
              <li key={label} className="future-ready__item">
                {label}
              </li>
            ))}
          </ul>
          <span className="future-ready__end" />
        </div>
      </div>
    </section>
  )
}

export default FutureReady
