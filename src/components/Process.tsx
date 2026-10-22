import { useEffect, useState } from 'react'
import { processIntro, processStages } from '../data/process.ts'
import { managedServices } from '../data/services.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Process.css'

// The highlight follows a mouse only on a hover-capable device from
// 1024px, where the steps sit in one row. 64em is the literal breakpoint
// in Process.css (see tokens.css), as INLINE_NAV_QUERY in Header.tsx.
const HOVER_QUERY = '(hover: hover) and (min-width: 64em)'

// The class hook for each phase's segment style (Process.css), by index
// into managedServices.journey. Not copy: the labels come from the journey.
const PHASE_HOOKS = ['assessment', 'implementation', 'managed'] as const

// How We Work (section B of the homepage sections refinement plan, #90):
// the "04 — How We Work" eyebrow, the h2, then the engagement model as an
// ordered list of four steps, in data order. Each step holds its stage
// label (the first step of each phase only), its piece of the track and
// its card: the numeral, the h3 name, the description, then the output
// under its label. The stage labels are the Managed Services journey's
// (#88), reused, not copied. The track is CSS on an empty aria-hidden
// span per step: its dot, and its segment as ::after. The visible numeral
// is hidden from screen readers, which already announce each item's
// position in the ordered list. The id and the eyebrow match the "How We
// Work" entry in src/data/navigation.ts. Still no service-line colours,
// so it does not read as the Services lifecycle (#59), and no links,
// buttons or tab stops.
//
// The highlight: step 01's card is a .surface-dark card at rest. With a
// mouse on a hover-capable device from 64em, the step under the pointer
// takes it, and keeps it while the pointer crosses the gaps, the band or
// the heading, until the pointer leaves the section and step 01 takes it
// back. That needs React state: CSS :hover cannot remember the last
// hovered step, and :has() would carry required behaviour beyond the
// build's browser baseline. Touch and keyboard never change it, so they
// always see the resting state, and hover reveals nothing but colour.
function Process() {
  const [active, setActive] = useState(0)

  // Back to the resting state when the row layout or the mouse goes.
  useEffect(() => {
    const query = window.matchMedia(HOVER_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setActive(0)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <section
      id="how-we-work"
      data-reveal="section"
      className="process surface-alt"
      aria-labelledby="how-we-work-heading"
      onPointerLeave={() => setActive(0)}
    >
      <div className="container">
        <SectionEyebrow number="04" label="How We Work" />
        <h2 id="how-we-work-heading" className="process__heading">
          {processIntro.heading}
        </h2>
        <ol className="process__list" role="list">
          {processStages.map((stage, index) => {
            const firstOfPhase = index === 0 || processStages[index - 1].phase !== stage.phase
            const highlighted = index === active
            return (
              <li
                key={stage.id}
                className="process__stage"
                data-phase={PHASE_HOOKS[stage.phase]}
                data-highlighted={highlighted ? '' : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse' && window.matchMedia(HOVER_QUERY).matches) {
                    setActive(index)
                  }
                }}
              >
                {firstOfPhase && (
                  <p
                    className={
                      stage.phase === 0 ? 'process__phase process__phase--current' : 'process__phase'
                    }
                  >
                    {managedServices.journey[stage.phase]}
                  </p>
                )}
                <span className="process__track" aria-hidden="true" />
                <div className={highlighted ? 'process__card surface-dark' : 'process__card'}>
                  {index === 0 && (
                    <p className="process__tag surface-light">{processIntro.startTag}</p>
                  )}
                  <span className="process__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="process__name">{stage.name}</h3>
                  <p className="process__description">{stage.description}</p>
                  <div className="process__output">
                    <p className="process__output-label">{processIntro.outputLabel}</p>
                    <p className="process__output-text">{stage.output}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default Process
