// The Services section: its intro, the six service cards and the Managed
// Data & Analytics Services block. The wording is copied verbatim from
// _docs/plan-fafanua-services-positioning.md (Sections 3, 5-12 and 13),
// which is authoritative for service copy, and
// services.plan.test.ts checks it against that document. Each service's
// capability tags are the lists in plan V2 Section 9
// (_docs/fafanua-v2-visual-upgrade-plan.md), checked by
// services.tags.plan.test.ts. Components read service copy from here and
// nowhere else: the lifecycle rail (LifecycleRail.tsx) and the cards
// number the stages from each service's position in `services`.

export type Stage = 'design' | 'connect' | 'model' | 'trust' | 'govern' | 'decide'

export type Service = {
  id: string
  name: string
  description: string
  engagements: readonly string[]
  stage: Stage
  /** Capability tags, always shown on the card: 3 to 5, in plan order. */
  tags: readonly string[]
}

// Lifecycle labels shown beside each card's colour marker and in the
// lifecycle rail above the cards.
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
    tags: ['Architecture', 'Cloud', 'Security', 'Modernisation'],
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
    tags: ['APIs', 'CDC', 'ERP / CRM', 'Reverse ETL', 'Orchestration'],
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
    tags: ['Dimensional', 'Semantic', 'Metrics', 'Data Marts'],
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
    tags: ['Freshness', 'Reconciliation', 'Data Contracts', 'Monitoring'],
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
    tags: ['Lineage', 'Glossary', 'Ownership', 'Metadata'],
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
    tags: ['Dashboards', 'KPIs', 'Forecasting', 'Segmentation'],
  },
] as const satisfies readonly Service[]

// Shown after the six cards as an ongoing engagement model, not a seventh
// lifecycle card (Section 12). The journey is the Section 12 "Commercial
// intent" line, one step per item. Reverse ETL appears both here and under
// Data Engineering & Integration, as Section 13 requires.
export const managedServices = {
  eyebrow: 'Need ongoing data capability?',
  heading: 'Managed Data & Analytics Services',
  description:
    'Extend your team with ongoing data engineering, analytics, reporting, and platform expertise without having to build an entire internal data function.',
  capabilities: [
    'Managed data pipelines',
    'Data-platform monitoring',
    'Data-quality monitoring',
    'Dashboard and reporting support',
    'Analytics development',
    'Reverse ETL and operational data activation',
    'Platform optimisation',
    'Cost and performance optimisation',
    'Incident support',
    'Data-model enhancements',
    'Fractional data engineering',
    'Fractional analytics support',
    'Documentation and knowledge transfer',
  ],
  journey: ['Assessment', 'Implementation', 'Managed Service'],
} as const
