// The solution landing pages' copy module (#93), which repeats a few
// homepage strings by design (section 4 of
// _docs/fafanua-public-sector-landing-page-plan.md). The homepage's
// single-source scans (assessment.plan.test.ts, futureReady.plan.test.ts)
// still scan it, with only their allow-listed quoted literals taken out
// first; every other check applies to it in full. Each scan keeps its
// allow-list in its own test file (test files are not scanned) and checks
// each literal occurs the expected number of times, so the list cannot
// grow silently.
export const LANDING_COPY = '/src/data/solutionPages.ts'

/** An allow-listed literal, with the number of times it may occur. */
export type Allowed = readonly (readonly [literal: string, count: number])[]

/** How many times a literal occurs in a source. */
export const occurrences = (source: string, literal: string) => source.split(literal).length - 1

/** The source as a scan reads it: solutionPages.ts without the allowed
 * literals, any other file unchanged. */
export function scanned(file: string, source: string, allowed: Allowed): string {
  if (file !== LANDING_COPY) return source
  return allowed.reduce((rest, [literal]) => rest.split(literal).join(''), source)
}
