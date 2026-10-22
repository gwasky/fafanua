// The Solutions section: the sectors Fafanua applies its services to, in
// the order of _docs/plan-fafanua-services-positioning.md Sections 15-19,
// with Health after Development & Impact. Each title and theme list is
// copied from those sections. The doc's "Potential client types" are left
// out. Each summary is the four-item line under the sector in
// _docs/fafanua-v2-visual-upgrade-plan.md §12, except for Health,
// Financial Services and Education, whose tag lines are W7 in
// _docs/fafanua-trust-lineage-positioning-plan.md (#73) as amended by
// section A of _docs/fafanua-homepage-sections-refinement-plan.md (#89),
// which removes "Lineage": three items each. The homepage shows the tag
// line on each sector's row; it no longer shows the themes, which the
// landing pages list as their use cases.
//
// This order drives the landing pages (src/pages.ts), their "Other
// sectors" lists and the sitemap, so it does not change. W7 decides which
// sectors the homepage shows, and in what order: homepageSolutions. The
// others are linked from the footer's "More sectors" line instead:
// footerSolutions, in data order. Together they cover every sector once,
// so every landing page keeps a link from the homepage or the footer.
//
// Health is the SEO plan's first-class sixth domain (§9,
// _docs/fafanua-seo-keyword-and-implementation-plan.md, #67). No earlier
// plan has it, so its themes are written from the plan's §9 clusters,
// covering healthcare providers and health programmes alike; its summary
// is W7's, as amended.
//
// Each sector also has a landing page at /solutions/<slug> (SEO plan §6,
// §16 and §18), titled by its heading, whose copy is in solutionPages.ts.
// Its use cases are the themes, so they are not repeated. No clients, case studies, metrics, certifications or
// performance claims (§18), and no DHIS2 positioning (§9).

/** Section A of _docs/fafanua-homepage-sections-refinement-plan.md (#89). */
export const solutionsIntro = {
  heading: 'Built for the sectors we know',
  intro: 'In every sector, we start by tracing the numbers leadership relies on back to their source.',
} as const

export type Solution = {
  readonly id: string
  /** The landing page is /solutions/<slug>. */
  readonly slug: string
  readonly title: string
  /** The landing page's h1, and the anchor text of links to it. */
  readonly heading: string
  /** The sector's short summary: four items (plan V2 §12), or three (W7 as amended, #89). */
  readonly summary: readonly string[]
  readonly themes: readonly string[]
}

export const solutions: readonly Solution[] = [
  {
    id: 'financial-services',
    slug: 'financial-services',
    title: 'Financial Services',
    heading: 'Financial Services Data & Analytics',
    summary: ['Payments', 'Reconciliation', 'Regulatory reporting'],
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
    summary: ['Branch comparability', 'Billing and claims', 'Pharmacy stock'],
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
    summary: ['Enrolment', 'Progression', 'Payments'],
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

const byId = (id: string) => solutions.find((solution) => solution.id === id)!

/** W7 (#73): the homepage's sectors, in its order. */
export const homepageSolutionIds = ['health', 'financial-services', 'education'] as const

/** The footer's "More sectors" links (#73): the others, in data order. */
export const footerSolutionIds = [
  'retail-and-distribution',
  'development-and-impact',
  'public-sector',
] as const

export const homepageSolutions: readonly Solution[] = homepageSolutionIds.map(byId)

export const footerSolutions: readonly Solution[] = footerSolutionIds.map(byId)
