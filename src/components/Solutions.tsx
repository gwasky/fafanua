import { solutions } from '../data/solutions.ts'
import './Solutions.css'

// The Solutions section: the sectors Fafanua applies its services to, as
// plain cards in data order, each with its themes. The id and h2 match the
// "Solutions" entry in src/data/navigation.ts. Sectors are not lifecycle
// stages, so the cards have no marker, label, link or disclosure, and the
// section adds no tab stops.
function Solutions() {
  return (
    <section
      id="solutions"
      className="solutions"
      aria-labelledby="solutions-heading"
    >
      <div className="container">
        <h2 id="solutions-heading" className="solutions__heading">
          Solutions
        </h2>
        <ul className="solutions__list" role="list">
          {solutions.map((solution) => (
            <li key={solution.id} className="solution-card">
              <h3 className="solution-card__title">{solution.title}</h3>
              <ul className="solution-card__themes" role="list">
                {solution.themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Solutions
