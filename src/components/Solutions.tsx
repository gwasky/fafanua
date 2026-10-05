import { useState } from 'react'
import { solutions } from '../data/solutions.ts'
import SectionEyebrow from './SectionEyebrow.tsx'
import './Solutions.css'

// The Solutions section (plan V2 §12): the "03 — Solutions" eyebrow, the
// h2, then the five sectors as compact, editorial rows numbered 01 to 05,
// in data order. The id and h2 match the "Solutions" entry in
// src/data/navigation.ts.
//
// Each row is the WAI-ARIA accordion header pattern: an h3 wrapping one
// button, named by the sector title alone (the number and the chevron are
// aria-hidden), then the plan V2 §12 summary, always visible and outside
// the button, then the panel the button controls, holding the full
// approved theme list. Rows open only on a click, a tap, or Enter or Space
// on the focused button: focus and hover open nothing (owner decision on
// #59). Each row has its own open state, so any number can be open at
// once. The summary's separators are drawn in Solutions.css and never
// announced. All copy comes from src/data/solutions.ts.
function Solutions() {
  const [open, setOpen] = useState<Readonly<Record<string, boolean>>>({})

  const toggle = (id: string) =>
    setOpen((current) => ({ ...current, [id]: !current[id] }))

  return (
    <section
      id="solutions"
      className="solutions"
      aria-labelledby="solutions-heading"
    >
      <div className="container">
        <SectionEyebrow number="03" label="Solutions" />
        <h2 id="solutions-heading" className="solutions__heading">
          Solutions
        </h2>
        <ol className="solutions__list" role="list">
          {solutions.map((solution, index) => {
            const isOpen = open[solution.id] === true
            const panelId = `${solution.id}-themes`
            return (
              <li
                key={solution.id}
                className={`solution-row${isOpen ? ' solution-row--open' : ''}`}
              >
                <h3 className="solution-row__heading">
                  <button
                    type="button"
                    className="solution-row__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(solution.id)}
                  >
                    <span className="solution-row__number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="solution-row__title">{solution.title}</span>
                    <svg
                      className="solution-row__chevron"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M3.5 6 8 10.5 12.5 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </h3>
                <ul className="solution-row__summary" role="list">
                  {solution.summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div id={panelId} className="solution-row__panel" hidden={!isOpen}>
                  <ul className="solution-row__themes" role="list">
                    {solution.themes.map((theme) => (
                      <li key={theme}>{theme}</li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default Solutions
