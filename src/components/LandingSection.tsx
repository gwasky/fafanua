import type { ReactNode } from 'react'

type LandingSectionProps = {
  /** The section's id; its h2 takes `${id}-heading`. */
  id: string
  heading: string
  children: ReactNode
}

// One section of a landing page (#67), named by its h2: the heading in the
// start column and the content in the end column from 64em, stacked below
// it (LandingPage.css).
function LandingSection({ id, heading, children }: LandingSectionProps) {
  return (
    <section id={id} className="landing-section" aria-labelledby={`${id}-heading`}>
      <div className="container landing-section__inner">
        <h2 id={`${id}-heading`} className="landing-section__heading">
          {heading}
        </h2>
        <div className="landing-section__body">{children}</div>
      </div>
    </section>
  )
}

export default LandingSection
