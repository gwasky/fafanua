import { systemFlow } from '../data/systemFlow.ts'
import './SystemFlow.css'

// The system and data-flow diagram (plan V2 §11, refinement plan §5),
// placed in Services after the card list: an h3, then an ordered list of
// the six layers, from operational sources to activation, named by the h3.
// Each layer is its label (if any), its name and its terms (if any), in
// that order, and the activation layer ends with the return label, all
// real text, so the diagram reads top to bottom without CSS and needs no
// image alternative. The layers are bands of one framed stack; the
// chevrons on the dividers and the separators between terms are drawn in
// CSS with no text (SystemFlow.css). All copy comes from systemFlow.ts.
//
// The return loop, from activation back to operational systems, is the one
// inline SVG the design system allows (owner decision on #63): decorative
// and aria-hidden, as the return label already says it, stroked in
// currentColor so forced-colours mode keeps it, and with no motion. It is
// placed in the last layer but positioned against the list, in a gutter
// at the stack's inline end. Its top half (the arrowhead into operational
// systems, a curve and a line down to the middle) is drawn from the SVG's
// top edge and its bottom half (from activation, a curve and a line up to
// the middle) from its bottom edge, each moved in CSS to the line it
// joins, so the curves and the arrowhead keep their shape however tall
// the stack is.
//
// It is a plain div, not a landmark, with no link, button or tab stop.
function SystemFlow() {
  const last = systemFlow.layers.length - 1
  return (
    <div className="system-flow">
      <h3 id="system-flow-heading" className="system-flow__heading">
        {systemFlow.heading}
      </h3>
      <ol
        className="system-flow__layers"
        role="list"
        aria-labelledby="system-flow-heading"
      >
        {systemFlow.layers.map((layer, index) => (
          <li
            key={layer.id}
            className={`system-flow__layer${layer.label ? '' : ' system-flow__layer--unlabelled'}`}
          >
            {layer.label && <p className="system-flow__label">{layer.label}</p>}
            <p className="system-flow__name">
              <span className="system-flow__markers" aria-hidden="true">
                {layer.stages.length === 0 ? (
                  <span className="system-flow__marker" />
                ) : (
                  layer.stages.map((stage) => (
                    <span
                      key={stage}
                      className={`system-flow__marker system-flow__marker--${stage}`}
                    />
                  ))
                )}
              </span>
              <span className="system-flow__name-text">{layer.name}</span>
            </p>
            {layer.terms && (
              <ul className="system-flow__terms" role="list">
                {layer.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            )}
            {index === last && (
              <>
                <p className="system-flow__return">{systemFlow.returnLabel}</p>
                <svg className="system-flow__loop" aria-hidden="true" focusable="false">
                  <g className="system-flow__loop-start">
                    <path d="M6.5 -5L1 0.5L6.5 6M1 0.5H10.5A10 10 0 0 1 20.5 10.5" />
                    <line x1="20.5" y1="10.5" x2="20.5" y2="50%" />
                  </g>
                  <g className="system-flow__loop-end">
                    <path d="M1 -0.5H10.5A10 10 0 0 0 20.5 -10.5" />
                    <line x1="20.5" y1="-10.5" x2="20.5" y2="-50%" />
                  </g>
                </svg>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default SystemFlow
