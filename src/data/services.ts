// The Services section: its intro and the six service cards. The wording
// is copied verbatim from _docs/plan-fafanua-services-positioning.md
// (Sections 3 and 5-11), which is authoritative for service copy, and
// services.plan.test.ts checks it against that document. Components read
// service copy from here and nowhere else.

export type Stage = 'design' | 'connect' | 'model' | 'trust' | 'govern' | 'decide'

export type Service = {
  id: string
  name: string
  description: string
  engagements: readonly string[]
  stage: Stage
}

// Lifecycle labels shown beside each card's colour marker.
export const stages: Readonly<Record<Stage, string>> = {
  design: 'Design',
  connect: 'Connect',
  model: 'Model',
  trust: 'Trust',
  govern: 'Govern',
  decide: 'Decide',
}

// Shown under the Services heading, above the cards.
export const servicesIntro = {
  heading: 'From fragmented data to trusted business intelligence',
  paragraphs: [
    'Fafanua helps organisations design modern data platforms, connect business systems, establish trusted analytical models, improve data quality and governance, and build reporting products that support real decisions.',
    'Our capabilities span the full data lifecycle — from architecture and engineering to analytics and ongoing platform management.',
  ],
} as const

export const services = [
  {
    id: 'data-strategy-and-platform-architecture',
    name: 'Data Strategy & Platform Architecture',
    description:
      'Design secure, scalable data foundations that bring organisational information together and support reliable analytics, reporting, and future growth.',
    engagements: [
      'Current-state data-platform assessment',
      'Target architecture and implementation roadmap',
      'Cloud warehouse and lakehouse design',
      'Technology selection',
      'Security and access architecture',
      'Cost and performance planning',
      'Platform modernisation strategy',
      'Data architecture advisory',
    ],
    stage: 'design',
  },
  {
    id: 'data-engineering-and-integration',
    name: 'Data Engineering & Integration',
    description:
      'Connect databases, applications, APIs, files, and external systems while automating the reliable movement and processing of business data.',
    engagements: [
      'Database, API, file, and SaaS integration',
      'ERP, CRM, payments, and operational-system integration',
      'Batch and change-data-capture pipelines',
      'Pipeline orchestration and monitoring',
      'Historical migrations and backfills',
      'Data synchronisation',
      'Reverse ETL and operational data activation',
      'Reporting and data-processing automation',
      'Source-system integration',
    ],
    stage: 'connect',
  },
  {
    id: 'data-warehousing-and-analytics-modelling',
    name: 'Data Warehousing & Analytics Modelling',
    description:
      'Transform fragmented operational data into trusted, reusable business datasets with consistent definitions, relationships, and metrics.',
    engagements: [
      'Data warehouse and lakehouse implementation',
      'Dimensional and semantic modelling',
      'Facts, dimensions, and analytical marts',
      'Shared business entities and common data models',
      'Metric definition and standardisation',
      'Historical data consolidation',
      'Analytics-ready datasets',
      'Query and model performance optimisation',
    ],
    stage: 'model',
  },
  {
    id: 'data-quality-and-reliability',
    name: 'Data Quality & Reliability',
    description:
      'Establish measurable controls that make critical organisational data accurate, complete, timely, and dependable.',
    engagements: [
      'Automated data-quality testing',
      'Freshness and completeness monitoring',
      'Source-to-target reconciliation',
      'Financial and operational reconciliation controls',
      'Data contracts and schema controls',
      'Incident detection and traceability',
      'Reliability targets and service-level objectives for critical data',
      'Pipeline reliability improvements',
    ],
    stage: 'trust',
  },
  {
    id: 'data-governance-and-metadata',
    name: 'Data Governance & Metadata',
    description:
      'Make organisational data understandable, accountable, discoverable, and easier to manage through clear ownership, definitions, metadata, and governance practices.',
    engagements: [
      'Business glossaries',
      'Data ownership and business-domain definition',
      'Metadata-catalogue implementation',
      'Data lineage',
      'Sensitive-data classification and access policies',
      'Dataset certification',
      'Documentation standards',
      'Stewardship workflows',
      'Governance operating models',
      'Master-data standardisation',
    ],
    stage: 'govern',
  },
  {
    id: 'business-intelligence-and-analytics',
    name: 'Business Intelligence & Analytics',
    description:
      'Turn trusted organisational data into dashboards, reporting, and analytical products designed around real operational and strategic decisions.',
    engagements: [
      'Executive and operational dashboards',
      'KPI frameworks and performance scorecards',
      'Regulatory and stakeholder reporting',
      'Domain-specific analytical products',
      'Self-service reporting models',
      'Financial and performance reporting',
      'Forecasting and trend analysis',
      'Customer, product, and operational segmentation',
      'Embedded analytics and reporting APIs',
    ],
    stage: 'decide',
  },
] as const satisfies readonly Service[]
