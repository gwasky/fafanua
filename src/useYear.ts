import { useSyncExternalStore } from 'react'

// The build's year, from vite.config.ts. A pre-rendered page (#67) shows
// it until it hydrates, so the hydrated markup matches the HTML.
declare const __BUILD_YEAR__: number

const subscribe = () => () => {}
const currentYear = () => new Date().getFullYear()
const buildYear = () => __BUILD_YEAR__

/**
 * The current year. While React hydrates a pre-rendered page it is the
 * build's year, as in the HTML, then the current year; on a page rendered
 * in the browser it is the current year from the start.
 */
export function useYear() {
  return useSyncExternalStore(subscribe, currentYear, buildYear)
}
