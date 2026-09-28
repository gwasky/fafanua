// The four stages of the engagement model, in order. The wording is copied
// verbatim from _docs/plan.md Section 8, and process.plan.test.ts checks it
// against the plan. Components read stage copy from here and nowhere else.

export type ProcessStage = {
  readonly id: string
  readonly name: string
  readonly description: string
}

export const processStages: readonly ProcessStage[] = [
  {
    id: 'assess',
    name: 'Assess',
    description:
      'Understand the organisation\'s systems, data, reporting needs, constraints, and priorities.',
  },
  {
    id: 'design',
    name: 'Design',
    description:
      'Define the target architecture, business concepts, delivery roadmap, and controls.',
  },
  {
    id: 'build',
    name: 'Build',
    description:
      'Implement pipelines, data models, quality checks, governance assets, and reporting products.',
  },
  {
    id: 'govern',
    name: 'Govern',
    description:
      'Establish ownership, monitoring, documentation, traceability, and continuous improvement.',
  },
]
