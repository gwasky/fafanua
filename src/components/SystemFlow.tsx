import { systemFlow } from '../data/systemFlow.ts'
import './SystemFlow.css'

// The system and data-flow diagram (plan V2 §11), placed in Services
// after the card list: an h3, then an ordered list of the six layers, from
// operational sources to activation, named by the h3. Each layer is its
// label (if any), its name and its terms (if any), in that order, all real
// text, so the diagram reads top to bottom without CSS and needs no image
// alternative. The service-line markers are hidden from screen readers;
// the arrows between layers and the separators between terms are drawn in
// CSS with no text (SystemFlow.css). All copy comes from systemFlow.ts.
// It is a plain div, not a landmark, with no link, button or tab stop.
function SystemFlow() {
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
        {systemFlow.layers.map((layer) => (
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
          </li>
        ))}
      </ol>
    </div>
  )
}

export default SystemFlow
