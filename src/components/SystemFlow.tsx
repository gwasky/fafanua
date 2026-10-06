import { systemFlow } from '../data/systemFlow.ts'
import './SystemFlow.css'

// The connected data operating system diagram (plan V2 §11, refinement
// plan §5, V2 visual enhancement plan §3-§7, #66), placed in Services
// after the card list: an h3 and its lead, then an ordered list of the
// six layers, from operational systems to operational activation, named
// by the h3, then the return statement. Each layer is its lifecycle label
// and line, its central part or parts (name, then supporting line or
// terms) and its detail panel, in that order, all real text, so the
// diagram reads top to bottom without CSS and needs no image alternative.
// The arrows between layers and the separators between terms are drawn in
// CSS with no text (SystemFlow.css). All copy comes from systemFlow.ts.
//
// The return loop, from activation back to operational systems, is the one
// inline SVG the design system allows (owner decision on #63): decorative
// and aria-hidden, as the return statement already says it, stroked in
// currentColor so forced-colours mode keeps it, and with no motion. It is
// positioned against the stack, in the column (or, narrower, the gutter)
// at its inline end. Each corner is a group moved in CSS: the top one to
// the first layer and the bottom one to the last, and both to the
// column's centre, so the curves and the arrowhead keep their shape
// however tall or wide the stack is. The horizontal runs reach back to
// the SVG's start edge, where the arrowhead points into the first layer.
//
// It is a plain div, not a landmark, with no link, button or tab stop.
function SystemFlow() {
  return (
    <div className="system-flow">
      <h3 id="system-flow-heading" className="system-flow__heading">
        {systemFlow.heading}
      </h3>
      <p className="system-flow__lead">{systemFlow.lead}</p>
      <div className="system-flow__frame">
        <div className="system-flow__stack">
          <ol
            className="system-flow__layers"
            role="list"
            aria-labelledby="system-flow-heading"
          >
            {systemFlow.layers.map((layer) => (
              <li
                key={layer.id}
                className={`system-flow__layer system-flow__layer--${layer.id}`}
              >
                <div className="system-flow__stage">
                  <p className="system-flow__label">{layer.label}</p>
                  <p className="system-flow__description">{layer.description}</p>
                </div>
                <div className="system-flow__core">
                  {layer.parts.map((part) => (
                    <div
                      key={part.name}
                      className={`system-flow__part system-flow__part--${part.stage ?? 'neutral'}`}
                    >
                      <p className="system-flow__name">{part.name}</p>
                      {part.summary && <p className="system-flow__summary">{part.summary}</p>}
                      {part.terms && (
                        <ul className="system-flow__terms" role="list">
                          {part.terms.map((term) => (
                            <li key={term}>{term}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                <ul className="system-flow__details" role="list">
                  {layer.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <svg className="system-flow__loop" aria-hidden="true" focusable="false">
            <g className="system-flow__loop-arrow">
              <path d="M6.5 -5.5L1 0L6.5 5.5" />
            </g>
            <g className="system-flow__loop-top">
              <path d="M-10 0A10 10 0 0 1 0 10" />
              <line x1="-10" y1="0" x2="-50%" y2="0" />
              <line x1="0" y1="10" x2="0" y2="50%" />
            </g>
            <g className="system-flow__loop-bottom">
              <path d="M-10 0A10 10 0 0 0 0 -10" />
              <line x1="-10" y1="0" x2="-50%" y2="0" />
              <line x1="0" y1="-10" x2="0" y2="-50%" />
            </g>
          </svg>
        </div>
        <div className="system-flow__return">
          <p className="system-flow__return-title">{systemFlow.returnTitle}</p>
          <p className="system-flow__return-text">{systemFlow.returnText}</p>
        </div>
      </div>
    </div>
  )
}

export default SystemFlow
