// The Solutions section: the sectors Fafanua applies its services to, in
// the order of _docs/plan-fafanua-services-positioning.md Sections 15-19.
// Each title and theme list is copied from those sections. The doc's
// "Potential client types" are deliberately left out: it gives them for
// only three of the five sectors.

export type Solution = {
  readonly id: string
  readonly title: string
  readonly themes: readonly string[]
}

export const solutions: readonly Solution[] = [
  {
    id: 'financial-services',
    title: 'Financial Services',
    themes: [
      'Payment intelligence',
      'Portfolio analytics',
      'Revenue reconciliation',
      'Customer analytics',
      'Management reporting',
      'Risk-monitoring dashboards',
      'Regulatory reporting datasets',
    ],
  },
  {
    id: 'retail-and-distribution',
    title: 'Retail & Distribution',
    themes: [
      'Branch-performance analytics',
      'Inventory analytics',
      'Product-performance dashboards',
      'Sales and margin reporting',
      'Customer-retention analytics',
      'Payment reconciliation',
      'Demand and trend analysis',
    ],
  },
  {
    id: 'development-and-impact',
    title: 'Development & Impact',
    themes: [
      'Beneficiary-data consolidation',
      'Monitoring, Evaluation, Accountability and Learning dashboards',
      'Programme-performance reporting',
      'Survey-data integration',
      'Longitudinal outcome tracking',
      'Donor-reporting automation',
      'Impact analytical models',
    ],
  },
  {
    id: 'education',
    title: 'Education',
    themes: [
      'Learner lifecycle analytics',
      'Enrolment dashboards',
      'Progression and completion analytics',
      'Payment-status reporting',
      'Cohort analysis',
      'Graduate-outcome tracking',
      'Programme-performance reporting',
    ],
  },
  {
    id: 'public-sector',
    title: 'Public Sector',
    themes: [
      'Institutional performance dashboards',
      'Service-delivery analytics',
      'Data warehouse implementation',
      'Data-quality frameworks',
      'Metadata and governance programmes',
      'Automated reporting',
      'Cross-system integration',
    ],
  },
]
