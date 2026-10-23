import type { SectorLandingPage } from '../data/solutionPages.ts'
import Icon from './Icon.tsx'
import RatingMarker from './RatingMarker.tsx'

type TraceDiagramProps = {
  diagram: SectorLandingPage['diagram']
  /** The id of the visually hidden description. */
  descriptionId: string
}

// The landing hero's trace diagram (#93), in HTML: the sources, the trace
// to source and the rated figures, in three columns from 48em and stacked
// below it. Every connector is an empty aria-hidden span drawn with a
// border (SectorLanding.css): solid from a source that feeds the figures,
// dashed and faded from one that does not, and solid to each figure, so
// each starts or ends at its row's centre whatever the text wraps to. The
// column headings are plain text, not headings. The figure is named by
// its caption and described by a visually hidden paragraph.
function TraceDiagram({ diagram, descriptionId }: TraceDiagramProps) {
  return (
    <figure className="trace" aria-describedby={descriptionId}>
      <p id={descriptionId} className="visually-hidden">
        {diagram.description}
      </p>
      <div className="trace__columns">
        <div className="trace__box trace__sources">
          <p className="trace__heading">{diagram.sourcesHeading}</p>
          <ul className="trace__list" role="list">
            {diagram.sources.map((source) => (
              <li
                key={source.label}
                className={source.feeds ? 'trace__source' : 'trace__source trace__source--faded'}
              >
                <Icon name={source.icon} className="trace__icon" />
                <span>{source.label}</span>
                <span
                  className={
                    source.feeds ? 'trace__connector' : 'trace__connector trace__connector--dashed'
                  }
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="trace__box trace__middle">
          <p className="trace__heading trace__heading--middle">{diagram.traceHeading}</p>
          <ol className="trace__steps" role="list">
            {diagram.steps.map((step) => (
              <li key={step} className="trace__step">
                {step}
              </li>
            ))}
          </ol>
          <p className="trace__footnote">{diagram.traceFootnote}</p>
        </div>
        <div className="trace__box trace__figures">
          <p className="trace__heading">{diagram.figuresHeading}</p>
          <ul className="trace__list" role="list">
            {diagram.figures.map((figure) => (
              <li key={figure.name} className="trace__figure">
                <span className="trace__connector trace__connector--in" aria-hidden="true" />
                <p className="trace__figure-name">{figure.name}</p>
                <p className="trace__rating">
                  <RatingMarker marker={figure.marker} />
                  <span>{figure.rating}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="trace__caption">{diagram.caption}</figcaption>
    </figure>
  )
}

export default TraceDiagram
