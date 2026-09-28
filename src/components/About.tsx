import { aboutHeading, aboutParagraph } from '../data/about.ts'
import './About.css'

// The company in the plan's own words: one heading and one paragraph, read
// from src/data/about.ts. The id matches the "About" entry in
// src/data/navigation.ts. It has no links or other tab stops.
function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-heading">
      <div className="container">
        <h2 id="about-heading">{aboutHeading}</h2>
        <p className="about__text">{aboutParagraph}</p>
      </div>
    </section>
  )
}

export default About
