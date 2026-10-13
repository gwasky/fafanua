// The Data Trust Assessment section's copy (W4 in
// _docs/fafanua-trust-lineage-positioning-plan.md, #71): the heading, the
// lead, the two h3s with the deliverables and the after-line, then the
// illustrative example's caption, sample figure and its five steps. The
// button reads the site's one call to action label from contact.ts (W1,
// #68). assessment.plan.test.ts checks the plan's wording, the caption and
// the figure name against W4. The steps' sample values are proposed on
// #71 for the owner to confirm: roles, not names, and no numbers or
// amounts. TrustAssessment.tsx reads this copy from here and nowhere else.

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

export type LineageStep = {
  readonly label: string
  readonly value: string
  /** Why the number has its rating; the trust rating step only. */
  readonly reason?: string
}

// The illustrative example: one sample figure traced through five steps,
// in this order.
export const lineageExample: {
  readonly caption: string
  readonly figure: string
  readonly steps: readonly LineageStep[]
} = {
  caption: 'Illustrative example. Sample data only.',
  figure: 'Monthly revenue by branch',
  steps: [
    {
      label: 'Definition',
      value: 'Invoiced revenue for each branch in the calendar month, net of refunds and discounts.',
    },
    {
      label: 'Calculation',
      value: 'Invoice totals minus refunds, summed by branch and month.',
    },
    {
      label: 'Source systems',
      value: 'Billing system, then the finance ledger.',
    },
    {
      label: 'Owner',
      value: 'Head of finance',
    },
    {
      label: 'Trust rating',
      value: 'Trusted with caveats',
      reason: 'Two branches record refunds a day late, so month-end totals can differ from the ledger.',
    },
  ],
}
