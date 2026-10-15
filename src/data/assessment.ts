// The Data Trust Assessment section's copy (W4 in
// _docs/fafanua-trust-lineage-positioning-plan.md, #71): the heading, the
// lead, the two h3s with the deliverables, then the illustrative example's
// metric names and rating categories, all labels only (the owner's
// instruction on #77). The Data Trust Assessment homepage enhancement plan
// (_docs/fafanua-data-trust-assessment-homepage-enhancement.md, #79) adds
// the eyebrow and the engagement name above the heading (its §2), replaces
// the after-line with a statement and supporting copy (§11), and sets the
// example's caption, metrics label (§8) and seven trace steps (§9). The
// eyebrow and name are stored in sentence and title case, as every eyebrow
// is, and CSS shows them in capitals. The button reads the site's one call
// to action label from contact.ts (W1, #68). assessment.plan.test.ts
// checks the wording against both plans. W11 in the trust and lineage plan
// (#81) lays the section out in three rows and adds five labels, the only
// new copy: the four deliverable tiles' labels and the example's owner row
// value. TrustAssessment.tsx reads this copy from here and nowhere else.

import { ctaLabel } from './contact.ts'

export const assessmentEyebrow = 'Start with trust'

export const assessmentName = 'Data Trust Assessment'

export const assessmentHeading = 'Know where every number comes from.'

export const assessmentLead =
  'The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee.'

export const assessmentDeliverablesHeading = 'What you receive'

export const assessmentDeliverables: readonly string[] = [
  'A lineage map showing how each key number is produced, system by system',
  'A trust scorecard rating each number as trusted, trusted with caveats, or not yet trusted, with the reasons',
  'Shared definitions for the terms your teams or branches use differently',
  'A prioritised fix list, ranked by impact and effort',
]

// The four tiles' labels (W11, #81), index-aligned with the deliverables:
// each tile shows its label above the deliverable it names.
export const assessmentDeliverableLabels: readonly string[] = [
  'Lineage map',
  'Trust scorecard',
  'Shared definitions',
  'Fix list',
]

export const assessmentAfterHeading = 'After the assessment'

export const assessmentAfterStatement = 'The assessment tells us what to fix first.'

export const assessmentAfterSupporting =
  'The findings become a prioritised roadmap. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics.'

export const assessmentCtaLabel = ctaLabel

// The representative metric names the illustrative example shows (#77),
// in the owner's words and order: labels only, never values. Any page that
// presents the Data Trust Assessment reads them from here.
export const exampleMetrics: readonly string[] = [
  'Revenue',
  'Active Customers',
  'Portfolio at Risk',
  'Programme Outcomes',
  'Cost per Customer',
]

// The illustrative example (#77, #79, laid out by W11 in #81): its
// caption, the example metric names under their label, the five trace
// steps each is traced through, in order from the report back to its
// source, then the footer's two rows: the owner label with its value, a
// role and never a name, and the trust rating label over the scorecard's
// three rating categories. The steps, then the two footer labels, are
// still the enhancement plan's seven-step sequence (§9). Labels only: no
// figure, value, rating or finding is given for any metric.
export const lineageExample: {
  readonly caption: string
  readonly metricsLabel: string
  readonly metrics: readonly string[]
  readonly stepsLabel: string
  readonly steps: readonly string[]
  readonly ownerLabel: string
  readonly ownerRole: string
  readonly ratingLabel: string
  readonly ratings: readonly string[]
} = {
  caption: 'Illustrative example',
  metricsLabel: 'Example leadership metrics',
  metrics: exampleMetrics,
  stepsLabel: 'Each traced through',
  steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
  ownerLabel: 'Owner',
  ownerRole: 'One role per metric',
  ratingLabel: 'Trust rating',
  ratings: ['Trusted', 'Trusted with caveats', 'Not yet trusted'],
}
