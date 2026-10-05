// The four stages of the engagement model, in order. The names and
// descriptions are copied verbatim from _docs/plan.md Section 8, and each
// stage's output from the V2 refinement plan §8
// (_docs/fafanua-v2-refinement-plan.md, #63); process.plan.test.ts checks
// them against the plans. Components read stage copy from here and
// nowhere else.

export type ProcessStage = {
  readonly id: string
  readonly name: string
  readonly description: string
  /** The stage's concise output or deliverable, shown after the description. */
  readonly output: string
}

export const processStages: readonly ProcessStage[] = [
  {
    id: 'assess',
    name: 'Assess',
    description:
      'Understand the organisation\'s systems, data, reporting needs, constraints, and priorities.',
    output: 'Systems & needs assessment',
  },
  {
    id: 'design',
    name: 'Design',
    description:
      'Define the target architecture, business concepts, delivery roadmap, and controls.',
    output: 'Architecture & delivery roadmap',
  },
  {
    id: 'build',
    name: 'Build',
    description:
      'Implement pipelines, data models, quality checks, governance assets, and reporting products.',
    output: 'Pipelines, models & analytical products',
  },
  {
    id: 'govern',
    name: 'Govern',
    description:
      'Establish ownership, monitoring, documentation, traceability, and continuous improvement.',
    output: 'Ownership, monitoring & continuous improvement',
  },
]
