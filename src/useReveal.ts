import { useEffect } from 'react'

/**
 * The one-time reveals (plan V2 §18, #61). An element marked
 * data-reveal="section" (each main section after the positioning block)
 * has its content rise and fade in the first time it scrolls into view;
 * one marked data-reveal="line" (the lifecycle rail) has its connector
 * drawn the first time it is at least half in view.
 *
 * Nothing is hidden by the markup or by CSS alone: content is hidden only
 * while this sets data-reveal-state="hidden" on it, and the CSS that
 * hides it (components.css, LifecycleRail.css) applies only on screen
 * with motion allowed. So without this script, without
 * IntersectionObserver, under reduced motion and in print, everything
 * shows in its final state.
 *
 * - An element already in view when the observer first reports it, on a
 *   cold load or a hash landing, is never hidden, so it shows in its final
 *   state with no animation. A reload or a history traversal hides
 *   nothing, as the browser restores the scroll position later.
 * - One out of view is hidden, then revealed ("in", which transitions)
 *   the first time it comes into view, and unobserved: it never hides
 *   again.
 * - Keyboard focus entering a section that is hidden or still revealing
 *   shows it in its final state at once, during the focus event, so the
 *   browser scrolls the focused element into view at its final place,
 *   clear of the header.
 *
 * Only the section's children move, never the section, so an anchor
 * target is never transformed when the browser or landOnHash measures it.
 * One IntersectionObserver for the page and no scroll listener.
 */
export const REVEAL_ATTRIBUTE = 'data-reveal'
export const REVEAL_STATE = 'data-reveal-state'

/** The share of the rail that must be in view before its line draws. */
export const LINE_THRESHOLD = 0.5

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Starts the reveals for every marked element in the document, and
 * returns a function that stops them and shows anything still hidden.
 */
export function startReveal(doc: Document = document): () => void {
  if (typeof IntersectionObserver !== 'function') return () => {}
  if (typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION).matches) return () => {}
  // A reload or a history traversal restores the visitor's scroll
  // position after the observer's first report, so what is in view then
  // could not be told apart: nothing is hidden at all.
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (navigation && navigation.type !== 'navigate') return () => {}

  const targets = doc.querySelectorAll<HTMLElement>(`[${REVEAL_ATTRIBUTE}]`)
  // Elements the observer has reported at least once.
  const seen = new WeakSet<Element>()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target
        if (!seen.has(element)) {
          seen.add(element)
          if (entry.isIntersecting) {
            // In view on load: final state, no animation.
            observer.unobserve(element)
          } else {
            element.setAttribute(REVEAL_STATE, 'hidden')
          }
          continue
        }
        const ready =
          element.getAttribute(REVEAL_ATTRIBUTE) === 'line'
            ? entry.intersectionRatio >= LINE_THRESHOLD
            : entry.isIntersecting
        if (ready) {
          element.setAttribute(REVEAL_STATE, 'in')
          observer.unobserve(element)
        }
      }
    },
    { threshold: [0, LINE_THRESHOLD] },
  )

  // Removing the state shows the final state at once: a hidden section
  // skips its transition, and one still revealing has it cancelled.
  const onFocusIn = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return
    const section = event.target.closest(`[${REVEAL_ATTRIBUTE}="section"]`)
    if (!section?.hasAttribute(REVEAL_STATE)) return
    section.removeAttribute(REVEAL_STATE)
    observer.unobserve(section)
  }

  for (const target of targets) observer.observe(target)
  doc.addEventListener('focusin', onFocusIn, true)

  return () => {
    observer.disconnect()
    doc.removeEventListener('focusin', onFocusIn, true)
    for (const target of targets) {
      if (target.getAttribute(REVEAL_STATE) === 'hidden') target.removeAttribute(REVEAL_STATE)
    }
  }
}

/** Runs the reveals while the page is mounted. */
export function useReveal() {
  useEffect(() => startReveal(), [])
}
