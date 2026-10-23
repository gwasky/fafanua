// Section 4 of _docs/fafanua-health-landing-page-plan.md (#94), parsed
// into the Health page's copy, for the tests that check the data and the
// rendered page against it. The ?raw import resolves relative to this
// file and is never part of the production bundle.
import planSource from '../../_docs/fafanua-health-landing-page-plan.md?raw'
import { parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** The title and description the issue fixes (#94, section 1). */
export const TITLE = 'Traceable Health Data Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Health data you can trace: healthcare analytics for hospitals and clinic networks in Uganda and East Africa, built on a trusted data foundation.'

/**
 * The owner's addition to the plan copy (2026-10-23, #94): the closing
 * panel's follow-up sentence (the one approved for Public Sector), which
 * makes the protected "trusted data foundation" visible. The four keyword
 * lines first proposed with it (A1–A4) were withdrawn when the owner
 * rewrote the plan's audience and service-card copy
 * (a55c2b4); solutionPages.health.plan.test.ts keeps them, so it can check
 * they are gone (test files are not scanned for old strings).
 */
export const OWNER_ADDITIONS = {
  closingFollowUp: 'Then we make sure they are built on a trusted data foundation.',
} as const

/** The SEO plan §9 terms the owner's new copy carries in visible text
 * (#94, reported to the owner), each with where it appears. */
export const CARRIED_TERMS: readonly [string, RegExp][] = [
  ['data warehouse', /central data warehouse/],
  ['healthcare reporting', /Reliable healthcare reporting/],
  ['facility performance', /facility performance/i],
  ['patient flow', /patient flow/],
  ['service delivery', /service delivery/],
  ['supply chain', /supply chain performance/],
  ['access controls', /access controls/],
  ['healthcare data', /healthcare data/],
]

/** A list item cell, "**Name**: text": the name and the text. */
export function boldNamed(text: string) {
  const match = text.match(/^\*\*(.+?)\*\*: (.+)$/)
  if (!match) throw new Error(`Cannot read "${text}"`)
  return { name: match[1], text: match[2] }
}
