/**
 * Moves focus to the heading that names the section with the given id
 * (its aria-labelledby), for in-page links that should take keyboard and
 * screen-reader users to the section, not only scroll it into view (the
 * Managed Services Regrouped plan §5, #88). The browser's own fragment
 * navigation still scrolls, so focus never scrolls (preventScroll). A
 * heading without a tabindex gets tabindex="-1" until it first loses
 * focus, so no section keeps a tabindex. Does nothing when the section or
 * its heading is missing.
 */
export function focusSectionHeading(id: string): void {
  const section = document.getElementById(id)
  const headingId = section?.getAttribute('aria-labelledby')
  const heading = headingId ? document.getElementById(headingId) : null
  if (!heading) return

  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1')
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), {
      once: true,
    })
  }
  heading.focus({ preventScroll: true })
}
