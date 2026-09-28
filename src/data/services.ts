// The six Phase 1 services. The wording is copied verbatim from
// _docs/plan.md Section 7, and services.test.ts checks it against the plan.
// Components read service copy from here and nowhere else.

export type ServiceLine = 'build' | 'govern' | 'trust' | 'insights'

export type Service = {
  id: string
  title: string
  summary: string
  typicalWork: readonly string[]
  serviceLine: ServiceLine
}

// Text labels shown beside each card's service-line colour marker.
export const serviceLines: Readonly<Record<ServiceLine, string>> = {
  build: 'Build',
  govern: 'Govern',
  trust: 'Trust',
  insights: 'Insights',
}

export const services = [
  {
    id: 'data-platform-architecture',
    title: 'Data Platform Architecture',
    summary:
      'Design a secure and scalable foundation for collecting, storing, managing and using organisational data.',
    typicalWork: [
      'Current-state data-platform assessment',
      'Target architecture and implementation roadmap',
      'Cloud warehouse and lakehouse design',
      'Technology selection',
      'Security and access architecture',
      'Cost and performance planning',
    ],
    serviceLine: 'build',
  },
  {
    id: 'data-integration-and-engineering',
    title: 'Data Integration and Engineering',
    summary:
      'Connect databases, applications, APIs, files, and external systems through reliable and maintainable data pipelines.',
    typicalWork: [
      'Database, API, file, and SaaS integration',
      'Batch and change-data-capture pipelines',
      'Pipeline orchestration and monitoring',
      'Historical migration and backfills',
      'Source-to-target reconciliation',
      'Pipeline reliability improvements',
    ],
    serviceLine: 'build',
  },
  {
    id: 'data-warehouse-and-analytics-modelling',
    title: 'Data Warehouse and Analytics Modelling',
    summary:
      'Transform fragmented source data into reusable business datasets with explicit grains, relationships, and definitions.',
    typicalWork: [
      'Data warehouse and lakehouse implementation',
      'Dimensional and semantic modelling',
      'Facts, dimensions, and analytical marts',
      'Shared business entities and conformed dimensions',
      'Metric definition and standardisation',
      'Query and model performance optimisation',
    ],
    serviceLine: 'build',
  },
  {
    id: 'data-quality-and-reliability',
    title: 'Data Quality and Reliability',
    summary:
      'Establish measurable controls that make important organisational data dependable.',
    typicalWork: [
      'Automated data-quality testing',
      'Freshness and completeness monitoring',
      'Reconciliation controls',
      'Data contracts',
      'Incident detection and traceability',
      'Service-level objectives for critical datasets',
    ],
    serviceLine: 'trust',
  },
  {
    id: 'data-governance-and-metadata',
    title: 'Data Governance and Metadata',
    summary:
      'Make organisational data understandable, accountable, discoverable, and easier to manage.',
    typicalWork: [
      'Business glossaries',
      'Data ownership and business-domain definition',
      'Metadata-catalogue implementation',
      'Data lineage',
      'Sensitivity classification',
      'Dataset certification',
      'Documentation standards and enforcement',
    ],
    serviceLine: 'govern',
  },
  {
    id: 'analytics-and-reporting-products',
    title: 'Analytics and Reporting Products',
    summary:
      'Turn governed datasets into reporting and analytical products designed around real organisational decisions.',
    typicalWork: [
      'Executive and operational dashboards',
      'Regulatory and stakeholder reporting',
      'Domain-specific analytical products',
      'Self-service reporting models',
      'Metric reconciliation',
      'Embedded analytics and reporting APIs',
    ],
    serviceLine: 'insights',
  },
] as const satisfies readonly Service[]
