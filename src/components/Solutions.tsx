import { homepageSolutions, solutionsIntro } from '../data/solutions.ts'
import { solutionPath } from '../paths.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Solutions.css'

// The Solutions section (section A of
// _docs/fafanua-homepage-sections-refinement-plan.md, #89): the "03 —
// Solutions" eyebrow, the h2 and the intro line, then the homepage's
// sectors as an editorial list of three rows: Health, Financial Services
// and Education, in the order W7 of the trust and lineage plan sets
// (homepageSolutions, #73). The other sectors are linked from the footer.
// The id matches the "Solutions" entry in src/data/navigation.ts; the
// section is named by its h2.
//
// Each row is an h3 holding the row's one link, to the sector's page
// (#67), named by the sector title alone; then the tag line as one plain
// text line joined with " · "; then a decorative arrow, hidden from
// screen readers. The link's ::after covers the whole row (the stretched
// link, Solutions.css), so a click or tap on the tags or the arrow opens
// the page too. All copy comes from src/data/solutions.ts.
function Solutions() {
  return (
    <section
      id="solutions"
      data-reveal="section"
      className="solutions"
      aria-labelledby="solutions-heading"
    >
      <div className="container">
        <SectionEyebrow number="03" label="Solutions" />
        <h2 id="solutions-heading" className="solutions__heading">
          {solutionsIntro.heading}
        </h2>
        <p className="solutions__intro">{solutionsIntro.intro}</p>
        <ul className="solutions__list" role="list">
          {homepageSolutions.map((solution) => (
            <li key={solution.id} className="solution-row">
              <h3 className="solution-row__name">
                <a className="solution-row__link" href={solutionPath(solution.id)}>
                  {solution.title}
                </a>
              </h3>
              <p className="solution-row__tags">{solution.summary.join(' · ')}</p>
              <span className="solution-row__arrow" aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Solutions
