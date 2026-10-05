import { aboutHeading, aboutParagraph, aboutStatement } from '../data/about.ts'
import './About.css'

// The company in the refinement plan's words (§10, #63), read from
// src/data/about.ts: the h2 with a supporting statement beneath it, then
// the company description. From 64em the heading and statement are the
// start column and the description the end column; below it they stack
// in DOM order. The statement is a paragraph, so the section has one
// heading. Minimal and institutional: no eyebrow, number, card, image or
// team content. The id matches the "About" entry in
// src/data/navigation.ts. It has no links or other tab stops.
function About() {
  return (
    <section
      id="about"
      className="about"
      aria-labelledby="about-heading"
      data-reveal="section"
    >
      <div className="container about__layout">
        <div>
          <h2 id="about-heading" className="about__heading">
            {aboutHeading}
          </h2>
          <p className="about__statement">{aboutStatement}</p>
        </div>
        <p className="about__text">{aboutParagraph}</p>
      </div>
    </section>
  )
}

export default About
