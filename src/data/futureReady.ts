// The future-ready section's copy. The heading is the owner's amended
// wording on #52, which plan V2 §14 gives exactly. The paragraph and the
// graphic's four labels are W5 in
// _docs/fafanua-trust-lineage-positioning-plan.md (#72), which replaced
// _docs/plan.md Section 9's paragraph and its "provenance" label (retired
// by the plan's section 6 vocabulary). The destination is the refinement
// plan §9's preferred label (#63): a readiness outcome, not a product.
// futureReady.plan.test.ts checks the paragraph and the list against W5.
// FutureReady.tsx reads this copy from here and holds none.

export const futureReadyHeading = 'Trusted foundations for what comes next'

export const futureReadyStatement =
  'AI and advanced analytics work only when three things are true: metrics are clearly defined, inputs can be traced to their source, and data quality is known. The Data Trust Assessment gives you a plain verdict for each use case you are considering: ready now, ready after specific fixes, or not ready yet.'

// The graphic's four foundations, in W5's order.
export const futureReadyLabels: readonly string[] = [
  'business definitions',
  'access controls',
  'quality signals',
  'lineage',
]

// What the four foundations lead to.
export const futureReadyDestination = 'advanced analytics & AI'
