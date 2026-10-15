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
// (#81) added the four deliverable tiles' labels. The Data Trust
// Assessment dark panel plan
// (_docs/fafanua-data-trust-assessment-dark-panel-plan.md, #82) supersedes
// W11 and the enhancement plan's §11 block: it adds the facts pill, a
// description for each of the seven steps, and the closing strip's
// eyebrow, statement and paragraph, and removes the after-assessment copy
// and W11's owner row value. TrustAssessment.tsx reads this copy from here
// and nowhere else.

import { ctaLabel } from './contact.ts'

export const assessmentEyebrow = 'Start with trust'

export const assessmentName = 'Data Trust Assessment'

export const assessmentHeading = 'Know where every number comes from.'

export const assessmentLead =
  'The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source. It runs for three weeks at a fixed fee.'

// The facts pill under the lead (the dark panel plan §3, #82): a middle
// dot (U+00B7) between the two facts.
export const assessmentFacts = '3 weeks · fixed fee'

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

// The closing strip (the dark panel plan §3, #82), which replaces the
// enhancement plan §11's after-assessment block: its eyebrow, stored
// in sentence case and shown in capitals like every eyebrow, the statement
// (an h3) and the paragraph.
export const assessmentNextEyebrow = 'What happens next'

export const assessmentNextStatement = 'Turn findings into a prioritised roadmap.'

export const assessmentNextSupporting =
  'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics.'

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

// The illustrative example (#77, #79, laid out by the dark panel plan in
// #82): its caption, the example metric names under their label, then the
// enhancement plan §9's seven trace steps, in order from the report back
// to its source, each with the dark panel plan §3's description, then the
// scorecard's three rating categories. Owner and Trust rating are
// attributes of a traced number rather than places it passes through:
// `attribute` marks them, and the card draws them with an ink marker and a
// muted name. Labels only: no figure, value, rating or finding is given
// for any metric.
export const lineageExample: {
  readonly caption: string
  readonly metricsLabel: string
  readonly metrics: readonly string[]
  readonly stepsLabel: string
  readonly steps: readonly {
    readonly name: string
    readonly description: string
    readonly attribute: boolean
  }[]
  readonly ratings: readonly string[]
} = {
  caption: 'Illustrative example',
  metricsLabel: 'Example leadership metrics',
  metrics: exampleMetrics,
  stepsLabel: 'Each traced through',
  steps: [
    { name: 'Report', description: 'The leadership report where the number appears', attribute: false },
    { name: 'Definition', description: 'How the number is defined', attribute: false },
    { name: 'Calculation', description: 'The logic and rules that produce it', attribute: false },
    { name: 'Data model', description: 'The tables the calculation reads from', attribute: false },
    { name: 'Source system', description: 'Where the data is first recorded', attribute: false },
    { name: 'Owner', description: 'Who is accountable for the number', attribute: true },
    { name: 'Trust rating', description: 'How far the number can be trusted, and why', attribute: true },
  ],
  ratings: ['Trusted', 'Trusted with caveats', 'Not yet trusted'],
}
