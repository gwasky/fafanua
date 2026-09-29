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

/**
 * Lands on the element the URL's hash names, once, after the first
 * render. The page is rendered in the browser, so the target doesn't
 * exist yet when the browser looks for it on load.
 *
 * It scrolls the target into view instantly, whatever the CSS scroll
 * behaviour, then repeats the fragment navigation in place so that Tab
 * starts from the target, as it does after an in-page link. With the same
 * hash, location.replace adds no history entry, fires no hashchange and,
 * as the target is already in place, doesn't scroll again. It also
 * focuses a target that can take focus (#main), so that focus is taken
 * off it again: opening the page doesn't move focus.
 * A reload or a history traversal is left to the browser, which restores
 * the visitor's scroll position.
 */
export function landOnHash() {
  if (done) return
  done = true

  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (entry && entry.type !== 'navigate') return
  const target = hashTarget(document, location.hash)
  if (!target) return

  target.scrollIntoView({ behavior: 'instant' })
  const focused = document.activeElement
  location.replace(location.hash)
  if (document.activeElement !== focused && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
