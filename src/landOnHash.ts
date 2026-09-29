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
 * Scrolls instantly to the element the URL's hash names, once, after the
 * first render of a fresh load. main.tsx renders before DOMContentLoaded,
 * so the browser then runs its own fragment navigation, which sets the
 * point Tab starts from; on its own it would scroll there smoothly under
 * the CSS scroll-behavior, and with the target already in place it
 * doesn't move. A reload or a history traversal is left to the browser,
 * which restores the visitor's scroll position.
 */
export function landOnHash() {
  if (done) return
  done = true

  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (entry && entry.type !== 'navigate') return
  hashTarget(document, location.hash)?.scrollIntoView({ behavior: 'instant' })
}
