import { useEffect } from 'react'
import { hashTarget } from './landOnHash.ts'

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
 * - The rail's line waits for its section's own reveal to end before it
 *   draws, so the stage labels and markers are fully shown, at rest, for
 *   the whole of the draw.
 * - A hash change (a typed hash, or a link to an element inside a
 *   section) whose target is inside a section that is hidden or still
 *   revealing shows that section in its final state at once and scrolls
 *   to the target again, so it lands clear of the header, not
 *   --reveal-shift too high. A section's own id needs nothing: the
 *   section never moves.
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

const SECTION = `[${REVEAL_ATTRIBUTE}="section"]`

/**
 * The reveal transitions still running on a section's children, the
 * only elements a reveal moves. Element.getAnimations flushes pending
 * style first, so a reveal started in the same task is included. Empty
 * where the Web Animations API is missing.
 */
function revealing(section: Element): Animation[] {
  return [...section.children].flatMap((child) =>
    typeof child.getAnimations === 'function' ? child.getAnimations() : [],
  )
}

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
  let stopped = false

  // Draws the line once its section's reveal, if one is running, has
  // ended or been cut short.
  const drawLine = (element: Element) => {
    const section = element.closest(SECTION)
    const pending = section ? revealing(section) : []
    if (pending.length === 0) {
      element.setAttribute(REVEAL_STATE, 'in')
      return
    }
    void Promise.allSettled(pending.map((animation) => animation.finished)).then(() => {
      if (!stopped) element.setAttribute(REVEAL_STATE, 'in')
    })
  }

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
        if (!ready) continue
        observer.unobserve(element)
        if (element.getAttribute(REVEAL_ATTRIBUTE) === 'line') drawLine(element)
        else element.setAttribute(REVEAL_STATE, 'in')
      }
    },
    { threshold: [0, LINE_THRESHOLD] },
  )

  // Removing the state shows the final state at once: a hidden section
  // skips its transition, and one still revealing has it cancelled.
  const show = (section: Element) => {
    section.removeAttribute(REVEAL_STATE)
    observer.unobserve(section)
  }

  const onFocusIn = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return
    const section = event.target.closest(SECTION)
    if (section?.hasAttribute(REVEAL_STATE)) show(section)
  }

  // The browser has already scrolled to the target where it was, moved
  // down with its hidden or revealing content; once that content is in
  // its final place, scroll to the target again (smoothly, or not, as
  // the CSS scroll-behavior says).
  const onHashChange = () => {
    const target = hashTarget(doc, doc.location.hash)
    const section = target?.parentElement?.closest(SECTION)
    if (!target || !section) return
    const state = section.getAttribute(REVEAL_STATE)
    if (state !== 'hidden' && !(state === 'in' && revealing(section).length > 0)) return
    show(section)
    target.scrollIntoView()
  }

  for (const target of targets) observer.observe(target)
  doc.addEventListener('focusin', onFocusIn, true)
  const view = doc.defaultView
  view?.addEventListener('hashchange', onHashChange)

  return () => {
    stopped = true
    observer.disconnect()
    doc.removeEventListener('focusin', onFocusIn, true)
    view?.removeEventListener('hashchange', onHashChange)
    for (const target of targets) {
      if (target.getAttribute(REVEAL_STATE) === 'hidden') target.removeAttribute(REVEAL_STATE)
    }
  }
}

/** Runs the reveals while the page is mounted. */
export function useReveal() {
  useEffect(() => startReveal(), [])
}
