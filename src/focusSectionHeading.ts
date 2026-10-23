import type { MouseEvent } from 'react'

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

/**
 * A click handler for an in-page link to the section with the given id
 * (#88, shared with the future-ready section's link in #91): a plain
 * click also moves focus to the section's heading. The browser still
 * follows the link, so the hash updates and the page scrolls: smoothly
 * only without a reduced-motion preference, below the sticky header
 * through the scroll margins (global.css). Chromium and WebKit clear focus
 * when they apply a fragment whose target cannot take focus, in the first
 * frame after the click, so the heading is focused after that frame has
 * rendered (a task queued from an animation frame callback). Modified and
 * non-primary clicks, which open a new tab or window, are left alone.
 */
export function focusSectionOnClick(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>): void => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    requestAnimationFrame(() => setTimeout(() => focusSectionHeading(id)))
  }
}
