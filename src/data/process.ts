// The four stages of the engagement model, in order. The names, the
// Design and Build descriptions and the Govern description's other words
// are copied verbatim from _docs/plan.md Section 8. The Design, Build and
// Govern outputs come from the V2 refinement plan §8
// (_docs/fafanua-v2-refinement-plan.md, #63). The Assess description and
// output, "lineage" in place of "traceability" in Govern, and
// processIntro come from section B of the homepage sections refinement
// plan (_docs/fafanua-homepage-sections-refinement-plan.md, #90).
// process.plan.test.ts checks them against the plans. Components read
// stage copy from here and nowhere else.

export type ProcessStage = {
  readonly id: string
  readonly name: string
  readonly description: string
  /** The stage's concise output or deliverable, shown after the description. */
  readonly output: string
  /**
   * The stage's phase, an index into managedServices.journey (#90): the
   * stage band reuses those labels, so they are not copied here.
   */
  readonly phase: 0 | 1 | 2
}

export const processStages: readonly ProcessStage[] = [
  {
    id: 'assess',
    name: 'Assess',
    description:
      'The Data Trust Assessment: trace the numbers leadership relies on most back to their source, and rate how far to trust them.',
    output: 'Lineage map, trust scorecard, shared definitions and a fix list',
    phase: 0,
  },
  {
    id: 'design',
    name: 'Design',
    description:
      'Define the target architecture, business concepts, delivery roadmap, and controls.',
    output: 'Architecture & delivery roadmap',
    phase: 1,
  },
  {
    id: 'build',
    name: 'Build',
    description:
      'Implement pipelines, data models, quality checks, governance assets, and reporting products.',
    output: 'Pipelines, models & analytical products',
    phase: 1,
  },
  {
    id: 'govern',
    name: 'Govern',
    description:
      'Establish ownership, monitoring, documentation, lineage, and continuous improvement.',
    output: 'Ownership, monitoring & continuous improvement',
    phase: 2,
  },
]

// Section B of _docs/fafanua-homepage-sections-refinement-plan.md (#90):
// the h2, the label above each output and step 01's tag, stored in
// sentence case and shown in capitals by CSS, as every eyebrow is.
export const processIntro = {
  heading: 'From first assessment to ongoing support',
  outputLabel: 'You get',
  startTag: 'Start here',
} as const
