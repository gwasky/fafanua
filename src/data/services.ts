// The Services section (its intro and the six service cards) and the
// Managed Services section that follows it. The wording is copied
// verbatim from _docs/plan-fafanua-services-positioning.md (Sections 3,
// 5-12 and 13), which is authoritative for service copy, and
// services.plan.test.ts checks it against that document. Each service's
// capability tags are the lists in plan V2 Section 9
// (_docs/fafanua-v2-visual-upgrade-plan.md), checked by
// services.tags.plan.test.ts, and the Managed Services section's heading,
// eyebrow label and rail are from plan V2 Section 10, checked by
// services.managed.plan.test.ts. Components read service copy from here and
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

// The Managed Services section, directly after Services: an ongoing
// engagement model, not a seventh lifecycle card (Section 12). The
// journey is the Section 12 "Commercial intent" line, one step per item.
// Reverse ETL appears both here and under Data Engineering & Integration,
// as Section 13 requires.
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
  // From plan V2 Section 10 (_docs/fafanua-v2-visual-upgrade-plan.md),
  // checked by services.managed.plan.test.ts: the section's eyebrow label
  // (shown as "02 — Managed Services", the Section 9 numbering), its
  // heading, and the capability rail, one word per item.
  sectionLabel: 'Managed Services',
  sectionHeading: 'Your data capability, continuously operated.',
  rail: ['Monitor', 'Maintain', 'Improve', 'Activate'],
} as const

// The service landing pages (SEO plan §4, §16, §17 and §20,
// _docs/fafanua-seo-keyword-and-implementation-plan.md, #67): one per
// service above and one for Managed Data & Analytics Services, at
// /services/<slug>. Each page also shows its service's name, approved
// description (as the lead) and Typical engagements from `services` or
// `managedServices`, so that copy is not repeated here. The titles and
// descriptions the plan gives in §20 are used verbatim; the rest target
// the keyword cluster §4 assigns the page. No clients, results or
// certifications are claimed.

export type ServiceKey = (typeof services)[number]['id'] | 'managed-data-and-analytics'

export type ServicePageLink = {
  readonly service: ServiceKey
  /** Descriptive anchor text (SEO plan §22), not "learn more". */
  readonly label: string
  readonly text: string
}

export type ServicePage = {
  readonly key: ServiceKey
  readonly slug: string
  /** The <title>. */
  readonly title: string
  /** The meta description. */
  readonly description: string
  /** The h1. */
  readonly heading: string
  /** The commercial proposition, after the approved description. */
  readonly intro: string
  readonly problems: readonly string[]
  readonly delivers: readonly { readonly title: string; readonly text: string }[]
  readonly outcomes: readonly string[]
  /** Where the service fits in the operating model. */
  readonly fit: string
  /** Reverse ETL, explained in buyer language first (SEO plan §5). */
  readonly activation?: {
    readonly heading: string
    readonly text: string
    readonly items: readonly string[]
  }
  /** Solution ids, in the order shown. */
  readonly solutions: readonly string[]
  readonly related: readonly ServicePageLink[]
}

// The Reverse ETL use cases are the services-positioning doc's §13 list.
export const servicePages: readonly ServicePage[] = [
  {
    key: 'data-strategy-and-platform-architecture',
    slug: 'data-strategy-platform-architecture',
    title: 'Data Strategy & Platform Architecture Uganda | Fafanua',
    description:
      'Data strategy and architecture consulting in Uganda and East Africa: assess your data estate, design a modern data platform and plan a trusted data foundation.',
    heading: 'Data Strategy & Platform Architecture Consulting',
    intro:
      'Most organisations build their systems one need at a time: a core banking or ERP platform, a CRM, payment and mobile-money channels, survey tools and spreadsheets. Fafanua assesses that landscape, designs a target data platform that fits your scale, skills and budget, and sets out a practical roadmap to a trusted data foundation, so that investment in engineering, warehousing and analytics builds on a clear design rather than one-off fixes.',
    problems: [
      'Data sits in separate systems, spreadsheets and exports, with no agreed place where it comes together.',
      'Platform and tool choices are made project by project, and the estate grows harder and costlier to run.',
      'Reporting depends on a few people and manual workarounds that do not scale.',
      'Security, access and data-protection requirements are handled differently in every system.',
      'There is no shared roadmap linking data investment to business priorities.',
    ],
    delivers: [
      {
        title: 'Current-state and data maturity assessment',
        text: 'A clear picture of your systems, data flows, reporting dependencies and skills, with the risks and gaps that matter most.',
      },
      {
        title: 'Target data architecture',
        text: 'A platform design, whether a cloud data warehouse, a lakehouse or a simpler starting point, covering ingestion, storage, modelling, security and access.',
      },
      {
        title: 'Technology selection',
        text: 'Recommendations for cloud and on-premise components, weighed against cost, skills, connectivity and where your data must be held.',
      },
      {
        title: 'Implementation roadmap',
        text: 'A phased plan that delivers early reporting value while building towards the full foundation, with cost and performance planned in.',
      },
    ],
    outcomes: [
      'A shared view of where data lives, how it moves and who depends on it.',
      'A platform design the organisation can grow into, rather than replace.',
      'Data investment prioritised against business decisions, not tools.',
      'Security and access designed in from the start.',
    ],
    fit: 'Design is the first stage of the Fafanua lifecycle. The architecture and roadmap set the direction for the engineering, modelling, quality, governance and analytics work that follows, and for how the platform is operated over time.',
    solutions: ['financial-services', 'public-sector', 'health', 'development-and-impact'],
    related: [
      {
        service: 'data-engineering-and-integration',
        label: 'Data engineering and integration services',
        text: 'Build the pipelines that connect the systems in the target architecture.',
      },
      {
        service: 'data-warehousing-and-analytics-modelling',
        label: 'Data warehouse implementation',
        text: 'Turn the design into a working warehouse and analytical models.',
      },
      {
        service: 'data-governance-and-metadata',
        label: 'Data governance services',
        text: 'Define ownership, definitions and access rules alongside the platform.',
      },
      {
        service: 'managed-data-and-analytics',
        label: 'Managed data and analytics services',
        text: 'Keep the platform monitored, optimised and evolving after launch.',
      },
    ],
  },
  {
    key: 'data-engineering-and-integration',
    slug: 'data-engineering-integration',
    title: 'Data Engineering & Integration Services Uganda | Fafanua',
    description:
      'Connect databases, APIs, ERP, CRM and payment systems with reliable pipelines, CDC, orchestration and operational data activation from Fafanua.',
    heading: 'Data Engineering & Integration Services',
    intro:
      'Fafanua designs and builds the pipelines that move data reliably between the systems your organisation already runs: core databases, ERP and CRM platforms, payment and mobile-money channels, SaaS applications, files and external APIs. For organisations in Uganda and East Africa that usually means a mix of cloud, on-premise and partner-hosted systems, so pipelines are built to recover, re-run and report on their own health. The result is a dependable flow of data into your trusted data foundation, and back out to the teams that use it.',
    problems: [
      'Reports are assembled by exporting from several systems and combining them by hand.',
      'Integrations are point-to-point scripts that fail silently or depend on one person.',
      'ERP, CRM and payment data disagree because they are never reconciled at source.',
      'Historical data is locked in legacy systems that are due to be replaced.',
      'Insight produced in the warehouse never reaches the CRM, finance or operational tools where teams act.',
    ],
    delivers: [
      {
        title: 'Source-system and API integration',
        text: 'Connectors for databases, APIs, files and SaaS platforms, including ERP, CRM and payment systems.',
      },
      {
        title: 'Batch and change-data-capture pipelines',
        text: 'Scheduled loads where they are enough, and change data capture (CDC) where freshness matters.',
      },
      {
        title: 'Orchestration and monitoring',
        text: 'Pipelines that run in the right order, retry safely and raise an alert when something fails.',
      },
      {
        title: 'Data migration and backfills',
        text: 'Historical data moved out of legacy systems and reconciled, so nothing is lost in the transition.',
      },
      {
        title: 'Operational data activation',
        text: 'Trusted warehouse data moved back into CRM platforms, support and finance systems, marketing tools and internal applications.',
      },
    ],
    outcomes: [
      'Less manual extraction and re-keying of data.',
      'Fresher, more complete data for reporting and analysis.',
      'Integrations that are documented, monitored and maintainable.',
      'Trusted data in the systems where teams work, not only in dashboards.',
    ],
    fit: 'Connect is the second stage of the lifecycle. It feeds the warehouse and analytical models, gives data-quality controls something dependable to test, and, through operational activation, closes the loop back to the operational systems the data came from.',
    activation: {
      heading: 'Operational data activation using Reverse ETL',
      text: 'Fafanua can move trusted analytical data back into the systems where business teams work. Reverse ETL syncs curated warehouse data to CRM and operational tools, for example:',
      items: [
        'Pushing customer segments into CRM platforms',
        'Synchronising customer or learner lifecycle status',
        'Activating payment, eligibility, or risk attributes',
        'Exposing trusted metrics inside operational applications',
        'Replacing manually maintained spreadsheet logic with governed warehouse data',
      ],
    },
    solutions: ['financial-services', 'retail-and-distribution', 'health', 'development-and-impact'],
    related: [
      {
        service: 'data-warehousing-and-analytics-modelling',
        label: 'Data warehouse implementation',
        text: 'Model the integrated data into consistent, reusable datasets.',
      },
      {
        service: 'data-quality-and-reliability',
        label: 'Data quality and reconciliation services',
        text: 'Test and reconcile what the pipelines deliver.',
      },
      {
        service: 'data-strategy-and-platform-architecture',
        label: 'Data platform architecture',
        text: 'Design the platform the pipelines feed.',
      },
      {
        service: 'managed-data-and-analytics',
        label: 'Managed data pipelines',
        text: 'Have the pipelines run, monitored and improved as a service.',
      },
    ],
  },
  {
    key: 'data-warehousing-and-analytics-modelling',
    slug: 'data-warehousing-analytics-modelling',
    title: 'Data Warehouse & Analytics Modelling Uganda | Fafanua',
    description:
      'Build trusted data warehouses, semantic layers and business-ready analytical models for consistent reporting and decision-making.',
    heading: 'Data Warehouse Implementation & Analytics Modelling',
    intro:
      'When every report is built straight from source systems, the same question gets different answers. Fafanua designs and implements data warehouses and lakehouses that bring operational data together into one consistent model of facts, dimensions, shared business entities and agreed metrics, so that finance, operations and leadership work from the same numbers. We help organisations in Uganda and East Africa make the warehouse the centre of a trusted data foundation, not another silo.',
    problems: [
      'Different reports show different figures for the same measure.',
      'Every new dashboard repeats the same joins, filters and business rules.',
      'History is lost when source systems overwrite or archive records.',
      'Analytical queries against operational systems slow them down.',
      'Terms such as customer, active account or revenue mean different things to different teams.',
    ],
    delivers: [
      {
        title: 'Warehouse and lakehouse implementation',
        text: 'A cloud or on-premise analytical store sized to your data, budget and skills.',
      },
      {
        title: 'Dimensional modelling and a semantic layer',
        text: 'Facts, dimensions and data marts, with a semantic layer that presents business-ready datasets to reporting tools.',
      },
      {
        title: 'Shared entities and metric definitions',
        text: 'Conformed dimensions for customers, products, locations and periods, and metrics defined once and reused.',
      },
      {
        title: 'Historical consolidation',
        text: 'History preserved and brought together, so that trends and comparisons hold up.',
      },
    ],
    outcomes: [
      'A single source of truth for reporting and analysis.',
      'Faster delivery of new reports, because the modelling is already done.',
      'Business-ready datasets analysts can use without rebuilding logic.',
      'Less load on operational systems.',
    ],
    fit: 'Model is the third stage of the lifecycle. It turns the data that engineering connects into reusable datasets, which quality controls then test, governance documents and business intelligence presents.',
    solutions: ['financial-services', 'retail-and-distribution', 'public-sector', 'health', 'education'],
    related: [
      {
        service: 'data-engineering-and-integration',
        label: 'Data integration services',
        text: 'Bring source-system data into the warehouse reliably.',
      },
      {
        service: 'data-quality-and-reliability',
        label: 'Automated data-quality testing',
        text: 'Check every load against the model’s rules.',
      },
      {
        service: 'data-governance-and-metadata',
        label: 'Metadata management and data lineage',
        text: 'Document what each dataset means and where it came from.',
      },
      {
        service: 'business-intelligence-and-analytics',
        label: 'Business intelligence and analytics',
        text: 'Present the modelled data as dashboards and analytical products.',
      },
    ],
  },
  {
    key: 'data-quality-and-reliability',
    slug: 'data-quality-reliability',
    title: 'Data Quality & Reliability Services Uganda | Fafanua',
    description:
      'Data quality services in Uganda and East Africa: automated testing, reconciliation, freshness monitoring and data contracts that make critical data dependable.',
    heading: 'Data Quality & Reliability Services',
    intro:
      'Quality and reliability answer one question: can we trust this data today? Fafanua puts measurable controls around the data your organisation depends on, with automated tests, source-to-target reconciliation, freshness and completeness monitoring and clear reliability targets for critical datasets, so problems are found by the data team before they reach a board pack, a regulator or a customer.',
    problems: [
      'Errors are discovered by report users, after decisions have been made.',
      'Totals in reports do not reconcile with finance or source systems.',
      'Nobody knows whether last night’s load arrived complete or on time.',
      'A change in a source system silently breaks the reports downstream.',
      'The same data issues are fixed by hand again and again, without their cause being traced.',
    ],
    delivers: [
      {
        title: 'Automated data-quality testing',
        text: 'Tests for completeness, validity, uniqueness and business rules that run with every load.',
      },
      {
        title: 'Reconciliation controls',
        text: 'Source-to-target, financial and operational reconciliations with agreed tolerances.',
      },
      {
        title: 'Freshness monitoring and data observability',
        text: 'Monitoring that shows when data last arrived, and alerts when it is late, partial or unusual.',
      },
      {
        title: 'Data contracts and schema controls',
        text: 'Agreed expectations between source owners and data consumers, checked automatically.',
      },
      {
        title: 'Incident detection and traceability',
        text: 'Issues detected, traced to their cause and followed through to resolution.',
      },
    ],
    outcomes: [
      'Issues caught before they reach decision-makers.',
      'Reports that reconcile, with the evidence that they do.',
      'Clear reliability targets for the data that matters most.',
      'Less time spent firefighting, and more on improvement.',
    ],
    fit: 'Trust is the fourth stage of the lifecycle, where a data foundation becomes a trusted data foundation, and it is deliberately separate from governance. Quality controls test the pipelines and models built in Connect and Model; governance then records what the data means and who owns it.',
    solutions: ['financial-services', 'health', 'public-sector', 'development-and-impact'],
    related: [
      {
        service: 'data-governance-and-metadata',
        label: 'Data governance and metadata',
        text: 'Agree what the data means and who owns it.',
      },
      {
        service: 'data-engineering-and-integration',
        label: 'Pipeline orchestration and monitoring',
        text: 'Build pipelines that recover and report on their own health.',
      },
      {
        service: 'data-warehousing-and-analytics-modelling',
        label: 'Analytics data modelling',
        text: 'Give quality rules a consistent model to test.',
      },
      {
        service: 'managed-data-and-analytics',
        label: 'Managed data-quality monitoring',
        text: 'Keep the controls running as an ongoing service.',
      },
    ],
  },
  {
    key: 'data-governance-and-metadata',
    slug: 'data-governance-metadata',
    title: 'Data Governance & Metadata Services Uganda | Fafanua',
    description:
      'Improve data ownership, definitions, lineage, metadata and governance with practical data governance services from Fafanua Technologies.',
    heading: 'Data Governance Consulting & Metadata Management',
    intro:
      'Governance answers a different question from quality: what does this data mean, who owns it, where did it come from, and how should it be managed? Fafanua helps organisations in Uganda and East Africa put practical data governance in place, with business glossaries, clear ownership, metadata catalogues, lineage and access policies sized to how the organisation actually works, rather than a framework that lives only in a policy document.',
    problems: [
      'Teams use the same terms to mean different things.',
      'No one is clearly accountable for key datasets or their definitions.',
      'Analysts cannot find existing data, or do not know whether to trust it.',
      'It is hard to trace where a reported figure came from.',
      'Sensitive and personal data is not consistently classified or protected.',
    ],
    delivers: [
      {
        title: 'Business glossary and definitions',
        text: 'Agreed definitions for key terms and metrics, linked to the data that implements them.',
      },
      {
        title: 'Data ownership and stewardship',
        text: 'Owners and stewards for each business domain, with workflows for changes and issues.',
      },
      {
        title: 'Data catalogue and lineage',
        text: 'A searchable catalogue of datasets, with lineage from source system to report.',
      },
      {
        title: 'Classification and access policies',
        text: 'Sensitive-data classification and access rules that support your data-protection obligations.',
      },
      {
        title: 'Dataset certification and master data',
        text: 'A visible mark for datasets that are documented, owned and quality-checked, and standardised master data behind them.',
      },
    ],
    outcomes: [
      'A shared language for the organisation’s key measures.',
      'Clear accountability for data and its definitions.',
      'Datasets that are easier to find, understand and trust.',
      'Evidence of where reported figures come from.',
    ],
    fit: 'Govern is the fifth stage of the lifecycle. It documents, and assigns owners to, what Design, Connect, Model and Trust have built, and gives business intelligence certified datasets to present, so the trusted data foundation stays understandable as it grows.',
    solutions: ['public-sector', 'health', 'financial-services', 'development-and-impact'],
    related: [
      {
        service: 'data-quality-and-reliability',
        label: 'Data quality services',
        text: 'Measure whether governed data meets its standards.',
      },
      {
        service: 'data-warehousing-and-analytics-modelling',
        label: 'Semantic modelling and metric definitions',
        text: 'Implement agreed definitions once, in the model.',
      },
      {
        service: 'data-strategy-and-platform-architecture',
        label: 'Data strategy and architecture',
        text: 'Build security and access into the platform design.',
      },
      {
        service: 'business-intelligence-and-analytics',
        label: 'Trusted reporting and dashboards',
        text: 'Present certified datasets to decision-makers.',
      },
    ],
  },
  {
    key: 'business-intelligence-and-analytics',
    slug: 'business-intelligence-analytics',
    title: 'Business Intelligence & Analytics Uganda | Fafanua',
    description:
      'Build executive dashboards, KPI frameworks, reporting automation and analytical products on top of a trusted data foundation.',
    heading: 'Business Intelligence & Analytics Consulting',
    intro:
      'Fafanua turns trusted organisational data into reporting and analytical products designed around the decisions people actually make, from executive and board reporting to the operational views teams use every day. We start from the questions and KPIs that matter to your organisation, then build dashboards, scorecards and analysis on modelled, tested data, so the numbers hold up when they are challenged. We work with organisations in Uganda and East Africa on the BI tools they already use, or on a platform chosen with them.',
    problems: [
      'Management reports take days of manual work to produce each month.',
      'Dashboards exist but go unused, because they do not answer the questions leaders ask.',
      'KPIs are defined differently from one report to the next.',
      'Regulatory and stakeholder reports are rebuilt from scratch every period.',
      'Analysts spend more time preparing data than analysing it.',
    ],
    delivers: [
      {
        title: 'Executive and operational dashboards',
        text: 'Reporting designed around specific decisions, audiences and review cycles.',
      },
      {
        title: 'KPI frameworks and scorecards',
        text: 'Agreed measures, targets and definitions that connect strategy to operations.',
      },
      {
        title: 'Management reporting automation',
        text: 'Regulatory, financial and stakeholder reports produced from governed data rather than spreadsheets.',
      },
      {
        title: 'Analytical products',
        text: 'Forecasting, trend analysis and customer, product or operational segmentation for specific business questions.',
      },
      {
        title: 'Self-service and embedded analytics',
        text: 'Reporting models analysts can use directly, and embedded analytics or reporting APIs for applications.',
      },
    ],
    outcomes: [
      'Faster, more consistent management reporting.',
      'Decisions made on figures that reconcile and can be explained.',
      'Less manual effort in each reporting cycle.',
      'Analysts focused on insight rather than data preparation.',
    ],
    fit: 'Decide is the sixth stage of the lifecycle. It is where the foundation becomes visible to the business, and it depends on the stages before it: connected data, consistent models, quality controls and governed definitions.',
    solutions: [
      'financial-services',
      'retail-and-distribution',
      'health',
      'education',
      'development-and-impact',
      'public-sector',
    ],
    related: [
      {
        service: 'data-warehousing-and-analytics-modelling',
        label: 'Data warehouse and semantic layer',
        text: 'Give every report the same modelled data.',
      },
      {
        service: 'data-quality-and-reliability',
        label: 'Data reconciliation services',
        text: 'Make sure the figures reconcile before they are published.',
      },
      {
        service: 'data-governance-and-metadata',
        label: 'KPI definitions and business glossaries',
        text: 'Agree what each measure means, and who owns it.',
      },
      {
        service: 'managed-data-and-analytics',
        label: 'Dashboard and reporting support',
        text: 'Keep reporting current and evolving as a managed service.',
      },
    ],
  },
  {
    key: 'managed-data-and-analytics',
    slug: 'managed-data-analytics',
    title: 'Managed Data & Analytics Services Uganda | Fafanua',
    description:
      'Extend your team with ongoing data engineering, analytics, platform monitoring, reporting support and operational data activation.',
    heading: 'Managed Data & Analytics Services',
    intro:
      'Building a data platform is the start, not the end. Pipelines need monitoring, models need extending as the business changes, reports need support and costs need managing. Fafanua’s managed data and analytics services give organisations in Uganda and East Africa ongoing data engineering and analytics capacity, as a managed service or as fractional data engineering and analytics support, so the trusted data foundation keeps working after launch.',
    problems: [
      'The platform was delivered, but no one is responsible for running and improving it.',
      'Recruiting and keeping a full in-house data team is slow and costly.',
      'Pipeline failures and data issues are noticed late, by report users.',
      'Requests for new reports and data changes queue behind other work.',
      'Platform costs grow without anyone reviewing them.',
    ],
    delivers: [
      {
        title: 'Platform and pipeline operations',
        text: 'Managed data pipelines, data-platform monitoring and incident support.',
      },
      {
        title: 'Data-quality monitoring',
        text: 'Ongoing checks on the data that matters, with issues raised and resolved.',
      },
      {
        title: 'Analytics and BI support',
        text: 'Dashboard and reporting support, analytics development and data-model enhancements.',
      },
      {
        title: 'Optimisation and activation',
        text: 'Platform, cost and performance optimisation as usage grows, and Reverse ETL and operational data activation.',
      },
      {
        title: 'Fractional data engineering and analytics',
        text: 'Fractional data engineering and analytics capacity, with documentation and knowledge transfer to your team.',
      },
    ],
    outcomes: [
      'A data platform that stays dependable after launch.',
      'Data engineering and analytics skills without building a full internal team.',
      'Predictable support for reporting and data changes.',
      'Knowledge kept in the organisation through documentation and transfer.',
    ],
    fit: 'Operate follows the six lifecycle stages. Engagements typically move from assessment, to implementation, to a managed service that keeps the foundation monitored, maintained, improved and activated.',
    solutions: [
      'financial-services',
      'health',
      'development-and-impact',
      'retail-and-distribution',
      'education',
      'public-sector',
    ],
    related: [
      {
        service: 'data-engineering-and-integration',
        label: 'Data engineering services',
        text: 'Build or rebuild the pipelines the service will run.',
      },
      {
        service: 'data-quality-and-reliability',
        label: 'Data reliability and observability',
        text: 'Set the quality controls the service monitors.',
      },
      {
        service: 'business-intelligence-and-analytics',
        label: 'Business intelligence consulting',
        text: 'Design the reporting the service supports.',
      },
      {
        service: 'data-strategy-and-platform-architecture',
        label: 'Data platform modernisation',
        text: 'Plan the platform before it is operated.',
      },
    ],
  },
]
