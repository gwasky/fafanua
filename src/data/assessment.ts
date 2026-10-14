// The Data Trust Assessment section's copy (W4 in
// _docs/fafanua-trust-lineage-positioning-plan.md, #71): the heading, the
// lead, the two h3s with the deliverables and the after-line, then the
// illustrative example's caption, sample metric names, lineage steps and
// rating categories, all labels only (the owner's instruction on #77). The
// button reads the site's one call to action label from contact.ts (W1,
// #68). assessment.plan.test.ts checks the plan's wording, the caption,
// the metric names, the steps and the ratings against W4. The two list
// labels are proposed on #77 for the owner to confirm. TrustAssessment.tsx
// reads this copy from here and nowhere else.

import { ctaLabel } from './contact.ts'

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

export const assessmentAfterHeading = 'After the assessment'

export const assessmentAfter =
  'Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.'

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

// The illustrative example (#77): its caption, the sample metric names
// under their label, the five lineage steps each is traced through, in
// this order, and the scorecard's three rating categories, nested under
// the last step. Labels only: no figure, value, rating or finding is given
// for any metric.
export const lineageExample: {
  readonly caption: string
  readonly metricsLabel: string
  readonly metrics: readonly string[]
  readonly stepsLabel: string
  readonly steps: readonly string[]
  readonly ratings: readonly string[]
} = {
  caption: 'Illustrative example. Sample data only.',
  metricsLabel: 'Sample metrics',
  metrics: exampleMetrics,
  stepsLabel: 'Each traced through',
  steps: ['Definition', 'Calculation', 'Source systems', 'Owner', 'Trust rating'],
  ratings: ['Trusted', 'Trusted with caveats', 'Not yet trusted'],
}
