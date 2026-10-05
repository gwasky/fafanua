/**
 * The ids a URL fragment can name, in the order the browser tries them:
 * the raw fragment, then its percent-decoded form when that differs. A
 * malformed percent-encoding (for example "#%E0%A4%A") leaves only the
 * raw fragment.
 */
export function hashIds(hash: string): string[] {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (raw === '') return []

  const ids = [raw]
  try {
    const decoded = decodeURIComponent(raw)
    if (decoded !== raw) ids.push(decoded)
  } catch (error) {
    if (!(error instanceof URIError)) throw error
  }
  return ids
}

/**
 * The element a URL fragment names, or null when it names nothing or
 * names an element that isn't rendered (for example a hidden disclosure
 * panel). Uses getElementById, never a selector built from the hash.
 */
export function hashTarget(doc: Document, hash: string): Element | null {
  for (const id of hashIds(hash)) {
    const element = doc.getElementById(id)
    if (element) return element.getClientRects().length > 0 ? element : null
  }
  return null
}

let done = false

/** Input that means the visitor has started moving around the page. */
const INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

/**
 * How many animation frames in a row the target must stay at the same
 * place in the page, after the fonts have loaded, before the one
 * correction. WebKit re-balances a heading's lines (text-wrap: balance)
 * two frames after document.fonts.ready, which moved every target below
 * the Services heading up by 34px at 360px (measured for #62).
 */
export const STABLE_FRAMES = 3

/**
 * How far, in CSS pixels, the target may move away from where landing
 * left it in the viewport in one frame, beyond what a layout shift
 * explains, before the page counts as scrolled away. Allows for subpixel
 * rounding.
 */
export const MOVE_TOLERANCE = 1

/**
 * Scrolls instantly to the element the URL's hash names, once, after the
 * first render of a fresh load. main.tsx renders before DOMContentLoaded,
 * so the browser then runs its own fragment navigation, which sets the
 * point Tab starts from; on its own it would scroll there smoothly under
 * the CSS scroll-behavior, and with the target already in place it
 * doesn't move. A reload or a history traversal is left to the browser,
 * which restores the visitor's scroll position.
 *
 * The stylesheet has always applied by now: the built page holds the
 * module script until it has (vite.config.ts, #62). The web font may not
 * have, and when it swaps in, text above the target can rewrap. WebKit
 * has no scroll anchoring to keep the target in place, so once the fonts
 * have loaded and the target has stopped moving, this scrolls to it once
 * more, unless the visitor has scrolled, touched, clicked or pressed a
 * key since landing (#38, #62).
 *
 * It also skips that scroll once the page has scrolled away from where
 * landing left it, whatever moved it: find-in-page, a screen reader, a
 * scroll-to-text link or a scrollbar drag fire none of those input
 * events (#62). From landing on, every frame compares the target's place
 * in the viewport with where landing left it. The page has moved away
 * when that distance grows by more than the target itself moved in the
 * page that frame. A font swap moves the target in the page (and WebKit
 * has no scroll anchoring to follow it), and scroll anchoring or WebKit's
 * own fragment scroll moves the viewport back towards the target, so
 * none of those cancel the correction.
 */
export function landOnHash() {
  if (done) return
  done = true

  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (entry && entry.type !== 'navigate') return
  const target = hashTarget(document, location.hash)
  if (!target) return
  target.scrollIntoView({ behavior: 'instant' })

  let moved = false
  const onInput = () => {
    moved = true
  }
  for (const type of INPUT) window.addEventListener(type, onInput, { capture: true, passive: true })
  const stop = () => {
    for (const type of INPUT) window.removeEventListener(type, onInput, { capture: true })
  }

  const landedTop = target.getBoundingClientRect().top
  // The target's place in the page and its distance from where landing
  // left it in the viewport, at the last frame.
  let lastPlace = landedTop + window.scrollY
  let lastDistance = 0
  let fontsReady = false
  let place = NaN
  let stable = 0

  const check = () => {
    if (moved || !target.isConnected) return stop()
    const { top } = target.getBoundingClientRect()
    const now = top + window.scrollY
    const distance = Math.abs(top - landedTop)
    if (distance - lastDistance > Math.abs(now - lastPlace) + MOVE_TOLERANCE) return stop()
    lastPlace = now
    lastDistance = distance

    if (!fontsReady) {
      requestAnimationFrame(check)
      return
    }
    stable = now === place ? stable + 1 : 0
    place = now
    if (stable < STABLE_FRAMES) {
      requestAnimationFrame(check)
      return
    }
    stop()
    target.scrollIntoView({ behavior: 'instant' })
  }
  requestAnimationFrame(check)
  void document.fonts.ready.then(() => {
    fontsReady = true
  })
}
