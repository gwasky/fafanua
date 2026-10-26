// The Data Trust Assessment section's copy (W4 in
// _docs/fafanua-trust-lineage-positioning-plan.md, #71): the heading and
// the lead. The Data Trust Assessment homepage enhancement plan
// (_docs/fafanua-data-trust-assessment-homepage-enhancement.md, #79) adds
// the eyebrow and the engagement name above the heading (its §2). The
// eyebrow and name are stored in sentence and title case, as every eyebrow
// is, and CSS shows them in capitals. The button reads the site's one call
// to action label from contact.ts (W1, #68). The dark panel plan
// (_docs/fafanua-data-trust-assessment-dark-panel-plan.md, #82, revised by
// the owner on 2026-10-23, #99) sets everything else in its §3: the
// deliverables label and the four tiles, each a label and a description;
// the light card's heading, its five trace steps, each a name and a
// description, the "What we establish" label and its two items, and the
// three rating categories; and the closing strip's eyebrow, statement and
// paragraph. Labels and descriptions only (the owner's instruction on
// #77): no value, figure, finding, rating given or name. The example
// metrics, the facts pill and the card's caption are gone from the
// homepage (#99). assessment.plan.test.ts checks the wording against the
// plans. TrustAssessment.tsx reads this copy from here and nowhere else.

import { ctaLabel } from './contact.ts'

export const assessmentEyebrow = 'Start with trust'

export const assessmentName = 'Data Trust Assessment'

export const assessmentHeading = 'Know where every number comes from.'

export const assessmentLead =
  'The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee.'

// The small label over the tiles (a paragraph, not a heading), stored in
// sentence case and shown in capitals.
export const assessmentDeliverablesLabel = 'What you receive'

// The four tiles, in order: each a label over its description.
export const assessmentDeliverables: readonly {
  readonly label: string
  readonly description: string
}[] = [
  { label: 'Lineage map', description: 'See where each key number comes from and how it is produced.' },
  { label: 'Trust scorecard', description: 'Know which figures are trusted, trusted with caveats, or not yet trusted.' },
  { label: 'Shared definitions', description: 'Align the terms different teams or branches use differently.' },
  { label: 'Prioritised roadmap', description: 'Know what to fix first, based on impact and effort.' },
]

// The light card: its heading, the five trace steps in order from the
// report back to its source, each a name and its description, then the
// "What we establish" label (stored in sentence case, shown in capitals)
// over its two items, and the scorecard's three rating categories, a
// legend named by the Trust rating item.
export const lineageTrace: {
  readonly heading: string
  readonly steps: readonly { readonly name: string; readonly description: string }[]
  readonly establishLabel: string
  readonly establish: readonly { readonly name: string; readonly description: string }[]
  readonly ratings: readonly string[]
} = {
  heading: 'How we trace your numbers',
  steps: [
    { name: 'Report', description: 'The leadership report where the number appears' },
    { name: 'Definition', description: 'How the number is defined' },
    { name: 'Calculation', description: 'The logic and rules that produce it' },
    { name: 'Data model', description: 'The tables the calculation reads from' },
    { name: 'Source system', description: 'Where the data is first recorded' },
  ],
  establishLabel: 'What we establish',
  establish: [
    { name: 'Accountable owner', description: 'Who is responsible for the number' },
    { name: 'Trust rating', description: 'How far the number can be trusted, and why' },
  ],
  ratings: ['Trusted', 'Trusted with caveats', 'Not yet trusted'],
}

// The closing strip: its eyebrow, stored in sentence case and shown in
// capitals like every eyebrow, the statement (an h3) and the paragraph.
export const assessmentNextEyebrow = 'What happens next'

export const assessmentNextStatement = 'From findings to meaningful improvements.'

export const assessmentNextSupporting =
  'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics.'

export const assessmentCtaLabel = ctaLabel
