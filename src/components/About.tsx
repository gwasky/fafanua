import SectionEyebrow from './SectionEyebrow.tsx'
import {
  aboutDefinition,
  aboutEyebrow,
  aboutHeading,
  aboutLocation,
  aboutParagraph,
  aboutPrinciples,
  aboutPrinciplesLabel,
  aboutWord,
  aboutWordNote,
} from '../data/about.ts'
import './About.css'

// The company, composed per section D of the homepage sections
// refinement plan (#92): the "05 — About Fafanua" eyebrow and the h2,
// then the definition of the Swahili word fafanua, the company paragraph
// and the location line, then the principles under a hairline. The word
// is a dfn marked lang="sw", the only Swahili in the section: the brand
// name elsewhere stays in the page language. The word, its note and its
// definition are one paragraph, so the dfn's paragraph holds its
// definition. The principles are one list named by its label, each an h3
// and its description. Rules, the hairline and the dot are CSS. W8's
// founder block is deferred (#75), so nothing here stands in for it. The
// id matches the "About" entry in src/data/navigation.ts. It has no links
// or other tab stops. All copy comes from src/data/about.ts.
function About() {
  return (
    <section
      id="about"
      className="about"
      aria-labelledby="about-heading"
      data-reveal="section"
    >
      <div className="container about__layout">
        <SectionEyebrow number={aboutEyebrow.number} label={aboutEyebrow.label} />
        <h2 id="about-heading" className="about__heading">
          {aboutHeading}
        </h2>
        <div className="about__body">
          <p className="about__definition">
            <span className="about__term">
              <dfn lang="sw" className="about__word">
                {aboutWord}
              </dfn>{' '}
              <span className="about__note">{aboutWordNote}</span>
            </span>{' '}
            <span className="about__meaning">{aboutDefinition}</span>
          </p>
          <p className="about__text">{aboutParagraph}</p>
          <p className="about__location">{aboutLocation}</p>
        </div>
        <div className="about__principles">
          <p id="about-principles-label" className="about__label">
            {aboutPrinciplesLabel}
          </p>
          <ul
            className="about__list"
            role="list"
            aria-labelledby="about-principles-label"
          >
            {aboutPrinciples.map(({ name, description }) => (
              <li key={name} className="about__principle">
                <h3 className="about__name">{name}</h3>
                <p className="about__description">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default About
