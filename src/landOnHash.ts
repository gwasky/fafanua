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
 * How far in all, in CSS pixels, the target may have moved away from
 * where landing left it in the viewport, beyond what layout shifts
 * explain, before the page counts as scrolled away. It is summed across
 * frames, so a slow scroll of a pixel a frame adds up (#62). Allows for
 * subpixel rounding.
 */
export const DRIFT_TOLERANCE = 1

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
 * in the viewport with where landing left it. Whatever that distance grew
 * by, beyond how far the target itself moved in the page that frame, is
 * drift, and the drift is summed across frames: once it passes
 * DRIFT_TOLERANCE, the page has moved away, however slowly. A font swap
 * moves the target in the page (and WebKit has no scroll anchoring to
 * follow it), and scroll anchoring or WebKit's own fragment scroll moves
 * the viewport back towards the target, so none of those add drift. Nor
 * does a scroll after boxes above the target grew or shrank, up to how
 * much they did in all, since the browser can follow one shift and not
 * another, which moves the viewport away from the target: in WebKit at
 * 1440px a font swap grows the positioning statement 41px and the
 * Services heading re-balances 60px shorter in one frame, and WebKit then
 * scrolls 42px or 60px, in that frame or a later one (#63).
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

  // The boxes before the target, at its level and each ancestor's, that
  // are in the flow: a layout shift above the target is one of them
  // growing or shrinking.
  const above: Element[] = []
  for (let node: Element | null = target; node && node !== document.body; node = node.parentElement) {
    for (let box = node.previousElementSibling; box; box = box.previousElementSibling) {
      if (!['fixed', 'absolute'].includes(getComputedStyle(box).position)) above.push(box)
    }
  }
  const sizesAbove = () => above.map((box) => box.getBoundingClientRect().height)

  const landedTop = target.getBoundingClientRect().top
  // The target's place in the page and its distance from where landing
  // left it in the viewport, the scroll position and the sizes of the
  // boxes above it, at the last frame; how far the browser may still
  // scroll to follow their changes; and the drift so far.
  let lastPlace = landedTop + window.scrollY
  let lastScroll = window.scrollY
  let lastAbove = sizesAbove()
  let followable = 0
  let lastDistance = 0
  let drift = 0
  let fontsReady = false
  let place = NaN
  let stable = 0

  const check = () => {
    if (moved || !target.isConnected) return stop()
    const { top } = target.getBoundingClientRect()
    const now = top + window.scrollY
    const distance = Math.abs(top - landedTop)
    // The browser may scroll as far as the boxes above the target have
    // grown and shrunk in all (scroll anchoring, or WebKit following its
    // fragment), in this frame or a later one, even away from the target.
    const nowAbove = sizesAbove()
    followable += nowAbove.reduce((sum, size, i) => sum + Math.abs(size - lastAbove[i]), 0)
    const followed = Math.min(Math.abs(window.scrollY - lastScroll), followable)
    followable -= followed
    drift += Math.max(0, distance - lastDistance - Math.abs(now - lastPlace) - followed)
    if (drift > DRIFT_TOLERANCE) return stop()
    lastPlace = now
    lastScroll = window.scrollY
    lastAbove = nowAbove
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
