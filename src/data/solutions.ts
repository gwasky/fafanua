// The Solutions section: the sectors Fafanua applies its services to, in
// the order of _docs/plan-fafanua-services-positioning.md Sections 15-19,
// with Health after Development & Impact. Each title and theme list is
// copied from those sections. The doc's "Potential client types" are left
// out of the rows: it gives them for only three of the five sectors. Each
// summary is the four-item line under the sector in
// _docs/fafanua-v2-visual-upgrade-plan.md §12, shown on the collapsed row;
// the themes are the full list its row reveals when opened.
//
// Health is the SEO plan's first-class sixth domain (§9,
// _docs/fafanua-seo-keyword-and-implementation-plan.md, #67). No earlier
// plan has it, so its summary and themes are written from the plan's §9
// clusters, covering healthcare providers and health programmes alike.
//
// Each sector also has a landing page at /solutions/<slug> (SEO plan §6,
// §16 and §18), titled by its heading, whose copy is in solutionPages.ts.
// Its use cases are the themes, so they are not repeated. No clients, case studies, metrics, certifications or
// performance claims (§18), and no DHIS2 positioning (§9).

export type Solution = {
  readonly id: string
  /** The landing page is /solutions/<slug>. */
  readonly slug: string
  readonly title: string
  /** The landing page's h1, and the anchor text of links to it. */
  readonly heading: string
  /** Plan V2 §12: the sector's short summary, four items. */
  readonly summary: readonly string[]
  readonly themes: readonly string[]
}

export const solutions: readonly Solution[] = [
  {
    id: 'financial-services',
    slug: 'financial-services',
    title: 'Financial Services',
    heading: 'Financial Services Data & Analytics',
    summary: ['Payments', 'Portfolio', 'Reconciliation', 'Reporting'],
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
    slug: 'retail-distribution',
    title: 'Retail & Distribution',
    heading: 'Retail & Distribution Analytics',
    summary: ['Inventory', 'Branch performance', 'Sales', 'Margins'],
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
    slug: 'development-impact',
    title: 'Development & Impact',
    heading: 'Development & Impact Data Systems',
    summary: ['Beneficiaries', 'Outcomes', 'Surveys', 'Donor reporting'],
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
    id: 'health',
    slug: 'health',
    title: 'Health',
    heading: 'Health Data & Analytics Solutions',
    summary: ['Facilities', 'Programmes', 'Data quality', 'Interoperability'],
    themes: [
      'Facility performance and utilisation dashboards',
      'Patient flow and service-delivery analytics',
      'Health programme performance reporting',
      'Public-health reporting automation',
      'Health supply-chain and pharmacy analytics',
      'Health data-quality frameworks',
      'Health-system integration and interoperability',
    ],
  },
  {
    id: 'education',
    slug: 'education',
    title: 'Education',
    heading: 'Education Data & Analytics',
    summary: ['Enrolment', 'Progression', 'Outcomes', 'Payments'],
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
    slug: 'public-sector',
    title: 'Public Sector',
    heading: 'Public Sector Data & Analytics',
    summary: ['Service delivery', 'Governance', 'Reporting', 'Integration'],
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
