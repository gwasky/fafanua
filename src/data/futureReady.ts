// The future-ready section's copy: section C of
// _docs/fafanua-homepage-sections-refinement-plan.md (#91), which
// supersedes W5's paragraph and list in
// _docs/fafanua-trust-lineage-positioning-plan.md. The heading is the
// owner's amended wording on #52, which plan V2 §14 gives exactly and
// section C keeps. The keys are held in sentence case, as the site's
// other eyebrow-style labels are (#82, #90); CSS shows them in capitals.
// The link's "→" is aria-hidden in the component, so it is not here.
// futureReady.plan.test.ts checks this copy against section C's table.
// FutureReady.tsx reads this copy from here and holds none.

export const futureReadyHeading = 'Trusted foundations for what comes next'

export const futureReadyLead =
  'AI and advanced analytics work only when four things are true.'

type FutureReadyTile = {
  key: string
  text: string
}

// The four conditions, in section C's order.
export const futureReadyConditions: readonly FutureReadyTile[] = [
  { key: 'Business definitions', text: 'Metrics are clearly defined' },
  { key: 'Lineage', text: 'Inputs can be traced to their source' },
  { key: 'Quality signals', text: 'Data quality is known' },
  { key: 'Access controls', text: 'Access is controlled' },
]

// What the four conditions lead to: a readiness outcome, not a product.
export const futureReadyGoal: FutureReadyTile = {
  key: 'What comes next',
  text: 'Advanced analytics & AI',
}

export const futureReadyVerdictLine =
  'The Data Trust Assessment gives you a plain verdict for each use case you are considering:'

// The three verdicts, a legend shown as chips.
export const futureReadyVerdicts: readonly string[] = [
  'Ready now',
  'Ready after specific fixes',
  'Not ready yet',
]

export const futureReadyLinkText = 'See how the assessment works'
