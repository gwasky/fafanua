import type { IconName } from './iconNames.ts'
import type { ServiceKey } from './servicePages.ts'

// The solution landing pages' copy (SEO plan §6, §16 and §18,
// _docs/fafanua-seo-keyword-and-implementation-plan.md, #67), by the id of
// the sector in solutions.ts, whose title, heading, themes (the pages'
// use cases) and slug it does not repeat. A module of its own, which only
// the landing pages' entry imports, so the homepage, which shows the rows
// and links to the pages, does not ship it. No clients, case studies,
// metrics, certifications or performance claims (§18), and no DHIS2
// positioning (§9). Public Sector is on the shared landing-page
// foundation (#93): its copy is
// _docs/fafanua-public-sector-landing-page-plan.md section 4, which
// replaced its §18 sections, and solutionPages.publicSector.plan.test.ts
// checks it against the plan. The owner added five strings to it on
// 2026-10-23 (#93), marked below: four carry the SEO plan §12 keywords
// the plan copy had dropped, and one makes "trusted data foundation"
// visible in the closing panel.

export type SolutionService = {
  readonly service: ServiceKey
  /** Descriptive anchor text (SEO plan §22). */
  readonly label: string
  readonly text: string
}

/** The existing landing page (SEO plan §18, #67): context, problems,
 * services, governance and activation. Five sectors still use it. */
export type SolutionSectionsPage = {
  readonly layout?: undefined
  /** The <title>. */
  readonly title: string
  /** The meta description. */
  readonly description: string
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

/** A rating or chip marker: a teal dot, an amber dot or a hollow ring. */
export type Marker = 'teal' | 'amber' | 'hollow'

/** A card with a round icon badge (the paired cards). */
export type BadgeCard = {
  readonly heading: string
  readonly text: string
  readonly icon: IconName
}

/**
 * A page on the shared landing-page foundation (#93, section 2a of
 * _docs/fafanua-public-sector-landing-page-plan.md, styled as section 5 of
 * _docs/fafanua-health-landing-page-plan.md): every string the page
 * shows, in its order, and the diagram's and cards' data. The components
 * hold no copy. The call to action's label and the address come from
 * contact.ts. Labels shown in capitals are stored in sentence case.
 */
export type SectorLandingPage = {
  readonly layout: 'sector'
  readonly title: string
  readonly description: string
  /** The current page's name, last in the breadcrumbs. */
  readonly breadcrumb: string
  readonly hero: {
    readonly eyebrow: string
    readonly heading: string
    readonly lead: string
    /** The secondary button's label; it jumps to #assessment. */
    readonly secondaryLabel: string
  }
  /** The trace diagram: sources, the trace, and the rated figures. */
  readonly diagram: {
    readonly sourcesHeading: string
    /** `feeds`: whether it feeds the figures (solid connector) or not
     * (dashed, faded). */
    readonly sources: readonly { readonly label: string; readonly icon: IconName; readonly feeds: boolean }[]
    readonly traceHeading: string
    readonly steps: readonly string[]
    readonly traceFootnote: string
    readonly figuresHeading: string
    readonly figures: readonly { readonly name: string; readonly rating: string; readonly marker: Marker }[]
    readonly caption: string
    /** The figure's accessible description (plan section 6). */
    readonly description: string
  }
  readonly challenge: BadgeCard
  readonly approach: BadgeCard
  readonly audience: {
    readonly heading: string
    readonly subheading: string
    /** `detail`: an optional line after the card's text. */
    readonly card: BadgeCard & { readonly detail?: string; readonly items: readonly string[] }
  }
  readonly assessment: {
    readonly eyebrow: string
    readonly heading: string
    readonly text: string
    readonly deliverables: readonly { readonly name: string; readonly text: string; readonly icon: IconName }[]
  }
  /** Delivered in stages; a page may leave it out. */
  readonly stages?: {
    readonly eyebrow: string
    readonly heading: string
    readonly subheading: string
    /** Shown as "<stageLabel> <n>". */
    readonly stageLabel: string
    readonly exitLabel: string
    readonly items: readonly { readonly name: string; readonly description: string; readonly exit: string }[]
  }
  readonly ai: BadgeCard & {
    readonly chips: readonly { readonly label: string; readonly marker: Marker }[]
  }
  /** The second card beside the AI card: a checklist under a heading. */
  readonly handling: {
    readonly heading: string
    readonly icon: IconName
    readonly items: readonly string[]
  }
  readonly services: {
    readonly heading: string
    readonly subheading: string
    readonly items: readonly {
      readonly name: string
      readonly text: string
      readonly icon: IconName
      readonly service: ServiceKey
      /** An optional line after the card's text. */
      readonly detail?: string
    }[]
  }
  readonly closing: {
    readonly eyebrow: string
    readonly heading: string
    readonly text: string
    /** An optional sentence after the text, in the same paragraph. */
    readonly followUp?: string
  }
}

export type SolutionPage = SolutionSectionsPage | SectorLandingPage

// Each sector's landing-page copy, by solution id.
export const solutionPages: Readonly<Record<string, SolutionPage>> = {
  'financial-services': {
    title: 'Financial Services & Banking Analytics Uganda | Fafanua',
    description:
      'Data engineering, reconciliation and business intelligence for banks, SACCOs, microfinance institutions, fintechs and insurers in Uganda and East Africa.',
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
  'retail-and-distribution': {
    title: 'Retail & Distribution Analytics Uganda | Fafanua',
    description:
      'Sales, inventory and branch-performance analytics for supermarkets, pharmacy chains, wholesalers and distributors in Uganda and East Africa.',
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
  'development-and-impact': {
    title: 'NGO & Development Data Analytics Uganda | Fafanua',
    description:
      'Data systems, MEAL dashboards and donor-reporting automation for NGOs, foundations and development programmes in Uganda and East Africa.',
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
  health: {
    title: 'Healthcare & Health Data Analytics Uganda | Fafanua',
    description:
      'Fafanua helps healthcare providers and health programmes connect data systems, improve data quality, build trusted reporting and create actionable healthcare analytics.',
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
  education: {
    title: 'Education Data Analytics Uganda | Fafanua',
    description:
      'Learner, enrolment and progression analytics for universities, colleges, schools and education programmes in Uganda and East Africa.',
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
  'public-sector': {
    layout: 'sector',
    title: 'Accountable Government Data Analytics Uganda | Fafanua',
    description:
      'Public data you can account for: public sector data analytics for ministries, agencies and local governments in Uganda, built on a trusted data foundation.',
    breadcrumb: 'Public sector',
    hero: {
      eyebrow: 'Public sector solutions',
      heading: 'Public data you can account for.',
      lead: 'For ministries, departments, agencies and local governments in Uganda and East Africa. We trace the figures you report to your ministry, Parliament and the public back to their source, and build the platform that keeps them right.',
      secondaryLabel: 'See how the assessment works',
    },
    diagram: {
      sourcesHeading: 'Agency systems',
      sources: [
        { label: 'HR & payroll', icon: 'book', feeds: false },
        { label: 'Programme monitoring', icon: 'chart', feeds: false },
        { label: 'Case & applications', icon: 'list', feeds: true },
        { label: 'Finance & budget', icon: 'ledger', feeds: true },
        { label: 'Revenue & collections', icon: 'card', feeds: true },
      ],
      traceHeading: 'Traced to source',
      steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
      traceFootnote: 'Owner and trust rating for every number',
      figuresHeading: 'Figures you report',
      figures: [
        { name: 'Service turnaround time', rating: 'Trusted with caveats', marker: 'amber' },
        { name: 'Budget execution rate', rating: 'Trusted', marker: 'teal' },
        { name: 'Revenue against target', rating: 'Not yet trusted', marker: 'hollow' },
      ],
      caption: 'Illustrative example. Sample data only.',
      description:
        'Illustrative example: service turnaround time, budget execution rate and revenue against target traced to case, finance and revenue systems, with trust ratings.',
    },
    challenge: {
      heading: 'The challenge',
      text: 'Statutory and performance reports are compiled by hand from separate systems. Each department defines key measures its own way, and leadership cannot easily answer simple questions, such as how long a service really takes to deliver.',
      icon: 'alert',
    },
    approach: {
      heading: 'Our approach',
      text: 'We start by tracing the figures leadership reports on most back to their source. Then we build the data platform in stages, each with clear conditions before the next one begins.',
      icon: 'check',
    },
    audience: {
      heading: 'Who we work with',
      subheading: 'Ministries, departments, agencies and local governments.',
      card: {
        heading: 'Public institutions',
        text: 'For regulators, revenue-collecting agencies, service-delivery institutions and local governments.',
        // Owner addition (2026-10-23, #93): SEO plan §12 keyword.
        detail: 'We work with the government data systems your institution already runs in Uganda.',
        icon: 'book',
        items: [
          'Service delivery and turnaround tracking',
          'Revenue, budget and expenditure reporting',
          'Programme and performance indicators',
          'Statutory and audit-ready reporting',
        ],
      },
    },
    assessment: {
      eyebrow: 'Start with trust',
      heading: 'The Data Trust Assessment: three weeks, fixed fee',
      text: 'The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source.',
      deliverables: [
        { name: 'Lineage map', text: 'How each key number is produced, system by system', icon: 'map' },
        { name: 'Trust scorecard', text: 'Each number rated trusted, with caveats, or not yet', icon: 'score' },
        { name: 'Shared definitions', text: 'For the terms your departments use differently', icon: 'book' },
        { name: 'Fix list', text: 'Prioritised by impact and effort', icon: 'list' },
      ],
    },
    stages: {
      eyebrow: 'Delivered in stages',
      heading: 'No big-bang projects',
      subheading:
        'Each stage has clear conditions before the next one begins, so leadership decides on evidence, not promises.',
      stageLabel: 'Stage',
      exitLabel: 'Moves on when',
      items: [
        {
          name: 'Assess',
          description: 'The Data Trust Assessment traces the figures leadership relies on.',
          exit: 'Findings accepted and a sponsor named',
        },
        {
          name: 'Foundation',
          description: 'The core data platform, shared definitions and quality checks.',
          exit: 'Hosting model approved and data owners named',
        },
        {
          name: 'First use cases',
          description: 'Two or three pilots, such as service turnaround, revenue and budget execution.',
          exit: 'Dashboards used in management meetings',
        },
        {
          name: 'Extend',
          description: 'More departments, self-service reporting and readiness for AI.',
          exit: 'Each extension agreed on evidence from the last',
        },
      ],
    },
    ai: {
      heading: 'What this means for AI',
      text: 'AI and advanced analytics work only when metrics are clearly defined, inputs can be traced to their source, data quality is known and access is controlled. The assessment gives each use case a plain verdict.',
      icon: 'gauge',
      chips: [
        { label: 'Ready now', marker: 'teal' },
        { label: 'Ready after specific fixes', marker: 'amber' },
        { label: 'Not ready yet', marker: 'hollow' },
      ],
    },
    handling: {
      heading: 'Working within public rules',
      icon: 'shield',
      items: [
        'We work within public procurement rules, and the assessment does not commit you to any provider.',
        'Findings, architecture and roadmap belong to your institution.',
        'Citizen and staff personal data is protected, with hosting and access agreed with your ICT and legal teams before any pipeline is built.',
      ],
    },
    services: {
      heading: 'After the assessment',
      subheading: 'What we fix, once we know where trust breaks down.',
      items: [
        {
          name: 'Integrate and model',
          text: 'Connect case management, finance, revenue and HR systems into one consistent view of services, money and people.',
          icon: 'link',
          service: 'data-engineering-and-integration',
          // Owner addition (2026-10-23, #93): SEO plan §12 keywords.
          detail: 'Government data integration in Uganda, into one public sector data warehouse.',
        },
        {
          name: 'Quality and governance',
          text: 'Completeness and timeliness checks, plus clear ownership and access rules.',
          icon: 'shield',
          service: 'data-quality-and-reliability',
          // Owner addition (2026-10-23, #93): SEO plan §12 keyword.
          detail: 'Government data governance that your departments can keep up.',
        },
        {
          name: 'Reporting and dashboards',
          text: 'Management, statutory and performance reports built on the traced numbers.',
          icon: 'chart',
          service: 'business-intelligence-and-analytics',
          // Owner addition (2026-10-23, #93): SEO plan §12 keywords.
          detail:
            'Government dashboards in Uganda, from service delivery dashboards and institutional performance dashboards to government reporting automation.',
        },
      ],
    },
    closing: {
      eyebrow: 'Get started',
      heading: 'Build a public data foundation you can trust',
      text: 'Which figure in your next statutory report do you trust least? Tell us about the reports leadership answers for.',
      // Owner addition (2026-10-23, #93): the protected phrase, visible.
      followUp: 'Then we make sure they are built on a trusted data foundation.',
    },
  },
}

// The sentence above each solution page's activation list, around a link
// to the data engineering and integration page, which explains Reverse ETL
// (SEO plan §5: buyer language first, Reverse ETL as the explanation).
export const activationIntro = {
  before: 'Trusted data does not have to stop at a dashboard. With ',
  link: 'operational data activation using Reverse ETL',
  after: ', it flows back into the systems where teams work, for example:',
} as const
