import type { ServiceKey } from './services.ts'

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
// §16 and §18), whose copy is `page`. Its use cases are the themes, so they
// are not repeated. No clients, case studies, metrics, certifications or
// performance claims (§18), and no DHIS2 positioning (§9).

export type SolutionService = {
  readonly service: ServiceKey
  /** Descriptive anchor text (SEO plan §22). */
  readonly label: string
  readonly text: string
}

export type SolutionPage = {
  /** The <title>. */
  readonly title: string
  /** The meta description. */
  readonly description: string
  /** The h1. */
  readonly heading: string
  /** Who the page is for, under the h1. */
  readonly lead: string
  readonly context: readonly string[]
  /** Distinct audiences within the sector, each with its own focus. */
  readonly audiences?: readonly {
    readonly heading: string
    readonly text: string
    readonly items: readonly string[]
  }[]
  readonly problems: readonly string[]
  /** The relevant Fafanua services, each linked. */
  readonly services: readonly SolutionService[]
  readonly governance: readonly string[]
  readonly activation: readonly string[]
}

export type Solution = {
  readonly id: string
  readonly slug: string
  readonly title: string
  /** Plan V2 §12: the sector's short summary, four items. */
  readonly summary: readonly string[]
  readonly themes: readonly string[]
  readonly page: SolutionPage
}

export const solutions: readonly Solution[] = [
  {
    id: 'financial-services',
    slug: 'financial-services',
    title: 'Financial Services',
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
    page: {
      title: 'Financial Services & Banking Analytics Uganda | Fafanua',
      description:
        'Data engineering, reconciliation and business intelligence for banks, SACCOs, microfinance institutions, fintechs and insurers in Uganda and East Africa.',
      heading: 'Financial Services Data & Analytics',
      lead: 'For banks, SACCOs, microfinance institutions, fintechs, payment processors and insurers.',
      context: [
        'Financial institutions run on many systems at once: a core banking or loan-management platform, mobile-money and agent channels, card and payment switches, CRM and accounting systems. Each holds part of the picture of a customer, a loan or a transaction, and management, risk and regulatory reporting all depend on bringing those parts together accurately.',
        'Fafanua helps banks, SACCOs and microfinance institutions in Uganda and East Africa build the trusted data foundation behind that reporting: connecting the systems, reconciling transactions, and modelling portfolio and customer data once, so every report starts from the same numbers.',
      ],
      problems: [
        'Customer and transaction data fragmented across core banking, mobile-money and payment platforms.',
        'Portfolio monitoring that relies on monthly extracts rather than current data.',
        'Payment and revenue reconciliation done by hand in spreadsheets.',
        'Revenue leakage that stays hidden while channels do not reconcile.',
        'Regulatory returns assembled manually from several systems each period.',
        'Limited customer segmentation, because customer records are not linked across products.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Payment and core-system integration',
          text: 'Connect core banking, loan-management, mobile-money, payment and CRM systems with monitored pipelines.',
        },
        {
          service: 'data-warehousing-and-analytics-modelling',
          label: 'Portfolio and customer data models',
          text: 'Model loans, accounts, customers and transactions consistently, with their history preserved.',
        },
        {
          service: 'data-quality-and-reliability',
          label: 'Payment reconciliation controls',
          text: 'Automated reconciliation between channels, switches and the ledger, with exceptions surfaced every day.',
        },
        {
          service: 'data-governance-and-metadata',
          label: 'Financial data governance',
          text: 'Ownership, definitions and access policies for customer and financial data.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'Banking and portfolio dashboards',
          text: 'Credit portfolio, risk-monitoring and management dashboards, and financial reporting automation.',
        },
      ],
      governance: [
        'Reconciliation tolerances and exception workflows agreed with finance.',
        'Consistent definitions of active customers, portfolio at risk and other key measures.',
        'Classification and access controls for personal and financial data.',
        'Lineage from regulatory figures back to the source transactions.',
      ],
      activation: [
        'Pushing customer segments and product eligibility into CRM and engagement tools.',
        'Sharing arrears and risk flags with collections and relationship teams.',
        'Exposing trusted portfolio metrics inside operational applications.',
      ],
    },
  },
  {
    id: 'retail-and-distribution',
    slug: 'retail-distribution',
    title: 'Retail & Distribution',
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
    page: {
      title: 'Retail & Distribution Analytics Uganda | Fafanua',
      description:
        'Sales, inventory and branch-performance analytics for supermarkets, pharmacy chains, wholesalers and distributors in Uganda and East Africa.',
      heading: 'Retail & Distribution Analytics',
      lead: 'For supermarkets, pharmacy chains, wholesalers, distributors, multi-branch retailers and consumer-goods businesses.',
      context: [
        'Retail and distribution businesses generate data at every till, warehouse and delivery route: point-of-sale systems, ERP and stock tools, card and mobile-money payments, distributor orders and loyalty programmes. Margins depend on knowing what is selling, where the stock is, and which branches, products and customers are performing.',
        'Fafanua helps retailers and distributors in Uganda and East Africa build a trusted data foundation that joins sales, stock, payment and customer data across branches and channels, so performance reporting is consistent and on time.',
      ],
      problems: [
        'Sales, stock and payment data held in separate systems for each branch or channel.',
        'Inventory positions that do not match the stock on the shelf or in the warehouse.',
        'Card and mobile-money takings reconciled against sales by hand.',
        'Branches and products compared using different definitions.',
        'Little view of customer retention or repeat purchasing.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Point-of-sale, ERP and payment integration',
          text: 'Bring point-of-sale, ERP, stock, payment and distributor data together across branches.',
        },
        {
          service: 'data-warehousing-and-analytics-modelling',
          label: 'Sales and inventory data models',
          text: 'Model products, branches, customers and stock movements, so every report uses the same structure.',
        },
        {
          service: 'data-quality-and-reliability',
          label: 'Retail payment reconciliation',
          text: 'Automated reconciliation of card and mobile-money payments against sales.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'Sales and branch-performance dashboards',
          text: 'Branch, product, sales and margin reporting for management and operations.',
        },
      ],
      governance: [
        'One product and branch master, with clear ownership of changes.',
        'Agreed definitions of sales, margin and stock measures.',
        'Reconciliation rules and tolerances for payments and stock.',
      ],
      activation: [
        'Sending replenishment and low-stock signals to purchasing and branch teams.',
        'Pushing customer segments into loyalty and marketing tools.',
        'Sharing distributor and route performance with field sales teams.',
      ],
    },
  },
  {
    id: 'development-and-impact',
    slug: 'development-impact',
    title: 'Development & Impact',
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
    page: {
      title: 'NGO & Development Data Analytics Uganda | Fafanua',
      description:
        'Data systems, MEAL dashboards and donor-reporting automation for NGOs, foundations and development programmes in Uganda and East Africa.',
      heading: 'Development & Impact Data Systems',
      lead: 'For NGOs, foundations, development organisations, implementing partners and international programmes.',
      context: [
        'Development programmes collect data from many places: beneficiary registers, mobile survey tools, partner reports, finance systems and spreadsheets kept in the field. Monitoring, evaluation, accountability and learning (MEAL) teams then spend much of each reporting cycle bringing that data together for donors and programme managers.',
        'Fafanua helps NGOs and development organisations in Uganda and East Africa build a trusted data foundation for their programmes, consolidating beneficiary and survey data, tracking outcomes over time and automating the reports donors and boards require, so more time goes into learning and less into compiling.',
      ],
      problems: [
        'Beneficiary records duplicated across projects, partners and survey rounds.',
        'Survey data collected in several tools, in formats that change between rounds.',
        'Donor reports compiled by hand, in a different format for each funder.',
        'Outcomes that are hard to follow over time, because records cannot be linked between rounds.',
        'Programme managers waiting weeks for performance data.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Survey and programme data integration',
          text: 'Bring survey tools, beneficiary registers, partner submissions and finance data together through repeatable pipelines.',
        },
        {
          service: 'data-quality-and-reliability',
          label: 'Programme data quality',
          text: 'Completeness, duplication and validity checks on beneficiary and indicator data.',
        },
        {
          service: 'data-governance-and-metadata',
          label: 'Beneficiary data governance',
          text: 'Ownership, consent and access rules for beneficiary data, and shared indicator definitions.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'MEAL dashboards and donor reporting',
          text: 'Programme monitoring dashboards and automated donor reports from a single dataset.',
        },
      ],
      governance: [
        'Consent and data-protection rules for personal and sensitive beneficiary data.',
        'Shared indicator definitions across projects, partners and donors.',
        'Matching and deduplication rules for beneficiaries across data sources.',
        'Audit trails from reported indicators back to the source records.',
      ],
      activation: [
        'Returning beneficiary status and eligibility to case-management and field tools.',
        'Sharing follow-up lists with field teams from trusted programme data.',
        'Feeding agreed indicators into partner and donor reporting systems.',
      ],
    },
  },
  {
    id: 'health',
    slug: 'health',
    title: 'Health',
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
    page: {
      title: 'Healthcare & Health Data Analytics Uganda | Fafanua',
      description:
        'Fafanua helps healthcare providers and health programmes connect data systems, improve data quality, build trusted reporting and create actionable healthcare analytics.',
      heading: 'Health Data & Analytics Solutions',
      lead: 'For hospitals, clinic networks, laboratories and pharmacies, and for public and global-health programmes.',
      context: [
        'Health organisations depend on data from many systems: electronic medical records, hospital and laboratory systems, pharmacy and stock tools, billing and insurance platforms, national health information systems and programme survey tools. Each serves its own purpose, but few give managers, clinicians or programme teams a reliable combined view.',
        'Fafanua helps healthcare providers and health programmes in Uganda and East Africa build a trusted data foundation: integrating health systems, improving health data quality and governance, and delivering healthcare analytics and reporting that people can act on.',
      ],
      audiences: [
        {
          heading: 'Healthcare providers',
          text: 'For hospitals, clinic networks, laboratories and pharmacies, analytics starts with operations and finance.',
          items: [
            'Facility performance and utilisation dashboards',
            'Patient flow and service-delivery analytics',
            'Revenue, billing and insurance-claims reporting',
            'Pharmacy and medical inventory analytics',
            'Healthcare reporting automation',
          ],
        },
        {
          heading: 'Public and global-health programmes',
          text: 'For health ministries, district health teams, implementing partners and global-health programmes, analytics centres on coverage, quality and outcomes.',
          items: [
            'Health programme performance dashboards',
            'Public-health reporting and indicator tracking',
            'Longitudinal patient and programme outcomes',
            'Health supply-chain analytics',
            'Donor and stakeholder reporting',
          ],
        },
      ],
      problems: [
        'Patient, service and financial data held in separate systems that do not exchange data.',
        'Reports to national systems, donors and boards prepared by hand from different sources.',
        'Incomplete, late or inconsistent facility data that undermines trust in indicators.',
        'Little visibility of stock levels and expiries across facilities.',
        'Patient and programme outcomes that are hard to follow over time.',
        'Sensitive health data shared without clear ownership or access rules.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Health system integration and interoperability',
          text: 'Connect medical-record, laboratory, pharmacy, billing and health information systems through APIs, data exchange and monitored pipelines.',
        },
        {
          service: 'data-warehousing-and-analytics-modelling',
          label: 'Health data warehousing',
          text: 'A health data warehouse that models patients, encounters, facilities, services and stock consistently.',
        },
        {
          service: 'data-quality-and-reliability',
          label: 'Health data quality',
          text: 'Completeness, timeliness and consistency checks on facility and programme data before it reaches reports.',
        },
        {
          service: 'data-governance-and-metadata',
          label: 'Health data governance',
          text: 'Ownership, classification and access policies for patient and programme data, and shared indicator definitions.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'Healthcare analytics and dashboards',
          text: 'Facility, programme and public-health dashboards, and automated health reporting.',
        },
        {
          service: 'managed-data-and-analytics',
          label: 'Managed health data services',
          text: 'Ongoing monitoring, support and improvement of health data pipelines and reporting.',
        },
      ],
      governance: [
        'Classification and access controls for patient-level and other sensitive health data.',
        'Shared indicator definitions across facilities, programmes and reporting levels.',
        'Data-quality rules for the completeness, timeliness and consistency of facility reporting.',
        'Lineage from published indicators back to the source records.',
      ],
      activation: [
        'Sharing stock and expiry alerts with pharmacy and supply teams.',
        'Returning follow-up lists to facility and outreach teams.',
        'Exposing trusted facility indicators inside operational and management tools.',
      ],
    },
  },
  {
    id: 'education',
    slug: 'education',
    title: 'Education',
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
    page: {
      title: 'Education Data Analytics Uganda | Fafanua',
      description:
        'Learner, enrolment and progression analytics for universities, colleges, schools and education programmes in Uganda and East Africa.',
      heading: 'Education Data & Analytics',
      lead: 'For universities, colleges, school networks and education programmes.',
      context: [
        'Education institutions and programmes hold learner data across admissions, student-information and learning-management systems, fees and payment platforms, and examination records. Each office reports from its own system, which makes it hard to follow a learner from enrolment to completion.',
        'Fafanua helps education organisations in Uganda and East Africa build a trusted data foundation that links learner records across the whole lifecycle, so enrolment, progression, retention and outcomes are reported consistently.',
      ],
      problems: [
        'Learner records duplicated or inconsistent across admissions, academic and finance systems.',
        'Enrolment and progression figures that differ between departments.',
        'Fee and payment status checked by hand before registration or examinations.',
        'Retention and drop-out risks identified too late to act on.',
        'Little visibility of graduate or programme outcomes.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Student-system integration',
          text: 'Connect admissions, student-information, learning-management and payment systems.',
        },
        {
          service: 'data-warehousing-and-analytics-modelling',
          label: 'Learner lifecycle data models',
          text: 'Model learners, programmes, cohorts and terms, so progression can be followed over time.',
        },
        {
          service: 'data-governance-and-metadata',
          label: 'Education data governance',
          text: 'Ownership, definitions and access rules for learner and staff data.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'Education dashboards',
          text: 'Enrolment, progression, cohort and programme-performance reporting.',
        },
      ],
      governance: [
        'Consistent learner identifiers across systems.',
        'Agreed definitions of enrolment, progression, completion and retention.',
        'Access controls for personal learner data.',
      ],
      activation: [
        'Synchronising learner lifecycle and payment status with student services and communication tools.',
        'Flagging learners at risk of dropping out to academic advisers.',
        'Sharing cohort progress with programme teams.',
      ],
    },
  },
  {
    id: 'public-sector',
    slug: 'public-sector',
    title: 'Public Sector',
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
    page: {
      title: 'Government & Public Sector Data Analytics Uganda | Fafanua',
      description:
        'Data integration, warehousing, governance and performance dashboards for ministries, agencies and public institutions in Uganda and East Africa.',
      heading: 'Public Sector Data & Analytics',
      lead: 'For ministries, departments, agencies, local governments and public institutions.',
      context: [
        'Public institutions manage data across many systems: financial and human-resource management, sector management information systems, registries, licensing and revenue platforms, and reports submitted by districts and partners. Performance and accountability reporting depends on bringing that data together reliably and explaining where each figure came from.',
        'Fafanua helps public-sector organisations in Uganda and East Africa build a trusted data foundation: integrating government data systems, establishing data-quality and governance practices, and delivering dashboards that track service delivery and institutional performance.',
      ],
      problems: [
        'Data held in separate systems across departments, agencies and districts.',
        'Performance reports compiled by hand, often late and hard to verify.',
        'The same indicator defined differently by different institutions.',
        'Unclear ownership and documentation of key datasets.',
        'Sensitive citizen data without consistent classification or access controls.',
      ],
      services: [
        {
          service: 'data-engineering-and-integration',
          label: 'Government data integration',
          text: 'Cross-system integration between financial, administrative and sector systems.',
        },
        {
          service: 'data-warehousing-and-analytics-modelling',
          label: 'Public sector data warehouse',
          text: 'A data warehouse that consolidates institutional data, with its history preserved.',
        },
        {
          service: 'data-quality-and-reliability',
          label: 'Data-quality frameworks',
          text: 'Measurable quality controls for the data behind official reporting.',
        },
        {
          service: 'data-governance-and-metadata',
          label: 'Government data governance',
          text: 'Metadata and governance programmes: ownership, glossaries, lineage and access policies.',
        },
        {
          service: 'business-intelligence-and-analytics',
          label: 'Government dashboards',
          text: 'Institutional-performance and service-delivery dashboards, and government reporting automation.',
        },
      ],
      governance: [
        'Data ownership and stewardship across ministries, departments and agencies.',
        'Shared indicator definitions and metadata standards.',
        'Classification and access policies for citizen and other sensitive data.',
        'Lineage that shows how published figures were produced.',
      ],
      activation: [
        'Sharing service-delivery alerts with the teams responsible for them.',
        'Returning verified registry data to operational systems.',
        'Exposing trusted indicators in the management tools departments use.',
      ],
    },
  },
]

// The sentence above each solution page's activation list, around a link
// to the data engineering and integration page, which explains Reverse ETL
// (SEO plan §5: buyer language first, Reverse ETL as the explanation).
export const activationIntro = {
  before: 'Trusted data does not have to stop at a dashboard. With ',
  link: 'operational data activation using Reverse ETL',
  after: ', it flows back into the systems where teams work, for example:',
} as const
