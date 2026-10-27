import type { IconName } from './iconNames.ts'
import type { ServiceKey } from './servicePages.ts'

// The solution landing pages' copy (SEO plan §6, §16 and §18,
// _docs/fafanua-seo-keyword-and-implementation-plan.md, #67), by the id of
// the sector in solutions.ts, whose title, heading, themes (the pages'
// use cases) and slug it does not repeat. A module of its own, which only
// the landing pages' entry imports, so the homepage, which shows the rows
// and links to the pages, does not ship it. No clients, case studies,
// metrics, certifications or performance claims (§18), and no DHIS2
// positioning (§9). Public Sector, Health, Financial Services, Education
// and Retail & Distribution are on the shared landing-page foundation
// (#93, #94, #98, issue 100, issue 101): their copy is section 4 of
// _docs/fafanua-public-sector-landing-page-plan.md, of
// _docs/fafanua-health-landing-page-plan.md, of
// _docs/fafanua-financial-services-landing-page-plan.md, of
// _docs/fafanua-education-landing-page-plan.md and of
// _docs/fafanua-retail-distribution-landing-page-plan.md, which replaced
// their §18 sections, and solutionPages.publicSector.plan.test.ts,
// solutionPages.health.plan.test.ts,
// solutionPages.financialServices.plan.test.ts,
// solutionPages.education.plan.test.ts and
// solutionPages.retailDistribution.plan.test.ts check it against the
// plans. The owner added strings to them on 2026-10-23, marked below: on
// Public Sector (#93) four carry the SEO plan §12 keywords the plan copy
// had dropped, and on both one makes "trusted data foundation" visible in
// the closing panel (#93, #94). On Financial Services (#98) the owner
// added two strings on 2026-10-24, marked below: one after the Financial
// institutions card's text, and one that makes the protected phrase
// visible in the closing panel. On Education (issue 100) the owner added
// the same two on 2026-10-26, replaced the item on learners under 18 and
// restored two service links, and on 2026-10-27 put the learner journey
// under "What happens next", approved its opening sentence and the two
// added service cards' copy and replaced the first handling item, all
// marked below and recorded in the plan's section 4. On Retail &
// Distribution (issue 101) the title, the description and three added
// strings, A1 to A3, are proposals pending the owner's decision, each
// marked below.

export type SolutionService = {
  readonly service: ServiceKey
  /** Descriptive anchor text (SEO plan §22). */
  readonly label: string
  readonly text: string
}

/** The existing landing page (SEO plan §18, #67): context, problems,
 * services, governance and activation. One sector (Development &
 * Impact) still uses it. */
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

/** A checklist item: plain text, or a name shown in bold, then an em
 * dash and its text (Health, #94). */
export type ChecklistItem = string | { readonly name: string; readonly text: string }

/** A card with a round icon badge (the paired cards). */
export type BadgeCard = {
  readonly heading: string
  readonly text: string
  readonly icon: IconName
}

/** A paired card that may carry a label above its heading and a second
 * paragraph after its text (Financial Services, #98). */
export type PairedCard = BadgeCard & {
  readonly label?: string
  readonly detail?: string
}

/** Who we work with's single card. `detail`: an optional paragraph after
 * the card's text; `itemsLabel`: an optional label that names the
 * checklist; `itemsLayout`: 'stacked' shows each named item's name on its
 * own line, its text below and no colon (Financial Services, #98). */
export type AudienceCardData = BadgeCard & {
  readonly detail?: string
  readonly itemsLabel?: string
  readonly itemsLayout?: 'stacked'
  readonly items: readonly ChecklistItem[]
}

/** One segment's card in Who we work with (Retail & Distribution, issue
 * 101): its heading, a one-line description, its icon and a checklist. */
export type AudienceSegment = {
  readonly heading: string
  readonly text: string
  readonly icon: IconName
  readonly items: readonly string[]
}

/** A promise strip step: its name in bold and a short description. */
export type PromiseStep = { readonly name: string; readonly text: string }

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
    /** An optional second lead paragraph (Financial Services, #98). */
    readonly leadDetail?: string
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
  readonly challenge: PairedCard
  readonly approach: PairedCard
  /**
   * The promise strip after the challenge and approach (Financial
   * Services, #98); a page may leave it out. Two groups of two numbered
   * steps, each group under its label: the first (the assessment) with
   * teal-tint circles, the second (after it) with neutral ones.
   */
  readonly promise?: {
    readonly groups: readonly [
      { readonly label: string; readonly steps: readonly [PromiseStep, PromiseStep] },
      { readonly label: string; readonly steps: readonly [PromiseStep, PromiseStep] },
    ]
  }
  /** Who we work with: one card, or a card per segment (Retail &
   * Distribution, issue 101); exactly one of the two. */
  readonly audience: {
    readonly heading: string
    readonly subheading: string
  } & (
    | { readonly card: AudienceCardData; readonly segments?: never }
    | { readonly segments: readonly AudienceSegment[]; readonly card?: never }
  )
  readonly assessment: {
    readonly eyebrow: string
    readonly heading: string
    readonly text: string
    /** An optional label that names the deliverables list (#98). */
    readonly deliverablesLabel?: string
    readonly deliverables: readonly { readonly name: string; readonly text: string; readonly icon: IconName }[]
  }
  /**
   * The reconciliation cards after the assessment band (Financial
   * Services, #98); a page may leave it out. Each card compares a record
   * with a source and shows the status as text, with a decorative icon;
   * `comparedLabel` is the visually hidden text before each source, which
   * the decorative swap icon stands for.
   */
  readonly reconciliation?: {
    readonly eyebrow: string
    readonly heading: string
    readonly text: string
    readonly comparedLabel: string
    readonly cards: readonly {
      readonly record: string
      readonly source: string
      readonly status: string
      /** A teal check-circle, or an amber alert-circle (an exception). */
      readonly statusIcon: 'check' | 'alert'
    }[]
    readonly caption: string
  }
  /**
   * The learner journey after the assessment band (Education, issue 100); a
   * page may leave it out. Each step is "name: system"; `highlight` is
   * the index of the step whose definition the callout shows, and
   * `highlightNote` the visually hidden text after that step's name. The
   * callout and the caption sit inside the highlighted step.
   */
  readonly journey?: {
    readonly eyebrow: string
    readonly heading: string
    /** An optional sentence before the text, in the same paragraph. */
    readonly intro?: string
    readonly text: string
    readonly steps: readonly { readonly name: string; readonly system: string }[]
    readonly highlight: number
    readonly highlightNote: string
    readonly callout: { readonly label: string; readonly text: string }
    readonly caption: string
    /** 'end' puts the callout at the row's end, across the last two
     * columns from 64em, with the caption end-aligned under it (Retail &
     * Distribution, issue 101). */
    readonly calloutAlign?: 'end'
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
  /** The readiness card. `label`: an optional eyebrow above its heading,
   * and `chips` optional (Retail & Distribution, issue 101, has neither
   * chips nor their list). */
  readonly ai: BadgeCard & {
    readonly label?: string
    readonly chips?: readonly { readonly label: string; readonly marker: Marker }[]
  }
  /** The second card beside the AI card: a checklist under a heading. */
  readonly handling: {
    readonly heading: string
    readonly icon: IconName
    readonly items: readonly string[]
  }
  readonly services: {
    /** An optional eyebrow above the heading (Retail & Distribution,
     * issue 101). */
    readonly eyebrow?: string
    readonly heading: string
    readonly subheading: string
    /** 'accent' shows the cards' lead lines in teal 800 (#98). */
    readonly leadTone?: 'accent'
    readonly items: readonly {
      readonly name: string
      readonly text: string
      readonly icon: IconName
      readonly service: ServiceKey
      /** An optional bold line between the heading and the text (#94). */
      readonly lead?: string
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
    layout: 'sector',
    title: 'Reconciliation & Banking Analytics Uganda | Fafanua',
    description:
      'Financial figures you can reconcile: financial services analytics for banks, microfinance institutions, SACCOs and insurers in Uganda, on a trusted data foundation.',
    breadcrumb: 'Financial services',
    hero: {
      eyebrow: 'Financial services solutions',
      heading: 'Financial figures you can reconcile.',
      lead: 'Banks, microfinance institutions, SACCOs, insurers and payment providers rely on information spread across multiple systems.',
      leadDetail:
        'Fafanua helps bring that information together, reconcile key figures and build a trusted foundation for financial reporting, operational visibility and better decisions.',
      secondaryLabel: 'See how the assessment works',
    },
    diagram: {
      sourcesHeading: 'Financial systems',
      sources: [
        { label: 'CRM', icon: 'chart', feeds: false },
        { label: 'Card & ATM switch', icon: 'card', feeds: false },
        { label: 'Loan management', icon: 'list', feeds: true },
        { label: 'Payments & mobile money', icon: 'card', feeds: true },
        { label: 'General ledger', icon: 'ledger', feeds: true },
      ],
      traceHeading: 'Traced to source',
      steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
      traceFootnote: 'Owner and trust rating for every number',
      figuresHeading: 'Figures your board sees',
      figures: [
        { name: 'Portfolio at risk', rating: 'Trusted with caveats', marker: 'amber' },
        { name: 'Mobile money settlements', rating: 'Trusted', marker: 'teal' },
        { name: 'Loan book against ledger', rating: 'Not yet trusted', marker: 'hollow' },
      ],
      caption: 'Illustrative example. Sample data only.',
      description:
        'Illustrative example: portfolio at risk, mobile money settlements and loan book against ledger traced to loan, payment and ledger systems, with trust ratings.',
    },
    challenge: {
      label: 'The challenge',
      heading: 'Different systems. Different numbers.',
      text: 'Financial information often sits across core banking platforms, loan management systems, payment channels and general ledgers.',
      detail:
        "When these systems don't agree, teams spend valuable time reconciling reports, investigating discrepancies and explaining figures to management, boards and regulators.",
      icon: 'alert',
    },
    approach: {
      label: 'Our approach',
      heading: 'Start with the numbers that matter.',
      text: 'We trace critical financial figures from management and regulatory reports back to their source systems, identifying where definitions, calculations or data quality issues create discrepancies.',
      detail:
        'The findings inform a prioritised roadmap for improving data integration, reconciliation and reporting.',
      icon: 'check',
    },
    promise: {
      groups: [
        {
          label: 'The data trust assessment',
          steps: [
            { name: 'Understand the numbers', text: 'Trace key figures to their source' },
            { name: 'Establish trust', text: 'Rate each figure and agree definitions' },
          ],
        },
        {
          label: 'After the assessment',
          steps: [
            { name: 'Connect the systems', text: 'Integrate, model and reconcile' },
            { name: 'Improve reporting and decisions', text: 'Dashboards built on trusted data' },
          ],
        },
      ],
    },
    audience: {
      heading: 'Who we work with',
      subheading: 'Banks, microfinance institutions, SACCOs, insurers and payment service providers.',
      card: {
        heading: 'Financial institutions',
        text: 'We help financial organisations connect fragmented information, improve confidence in their reporting and gain a clearer view of business performance.',
        // Owner addition (2026-10-24, #98): what Fafanua does for financial institutions (A2).
        detail:
          'We help financial institutions bring together data from banking, lending, payment and accounting systems to improve reconciliation, financial reporting and visibility into business performance.',
        icon: 'ledger',
        itemsLayout: 'stacked',
        items: [
          { name: 'Loan portfolio performance', text: 'Monitor portfolio quality, arrears and repayment trends.' },
          {
            name: 'Payments and reconciliation',
            text: 'Identify discrepancies between transactions, settlements and ledger balances.',
          },
          {
            name: 'Financial and regulatory reporting',
            text: 'Improve consistency, traceability and reliability of reported figures.',
          },
          {
            name: 'Customer and product insights',
            text: 'Understand customer activity, product performance and business trends.',
          },
        ],
      },
    },
    assessment: {
      eyebrow: 'Start with trust',
      heading: 'The Data Trust Assessment: three weeks, fixed fee',
      text: 'Before building dashboards or integrating systems, we establish whether the numbers your organisation relies on can be trusted.',
      deliverablesLabel: 'The assessment delivers',
      deliverables: [
        {
          name: 'Lineage map',
          text: 'Trace critical figures from reports through calculations to their originating systems.',
          icon: 'map',
        },
        {
          name: 'Trust scorecard',
          text: 'Assess the reliability of each figure and document discrepancies or limitations.',
          icon: 'score',
        },
        {
          name: 'Shared definitions',
          text: 'Identify inconsistent business definitions and recommend common standards.',
          icon: 'book',
        },
        {
          name: 'Prioritised roadmap',
          text: 'Identify the improvements that matter most, based on business impact and implementation effort.',
          icon: 'list',
        },
      ],
    },
    reconciliation: {
      eyebrow: 'After the assessment · What we can implement',
      heading: 'Know where your financial figures come from',
      text: 'Automated controls can compare records across systems, flag discrepancies and help teams investigate differences before they reach management reports.',
      comparedLabel: 'compared with',
      cards: [
        { record: 'Loan book', source: 'General ledger', status: 'Reconciled', statusIcon: 'check' },
        { record: 'Mobile money', source: 'Settlement records', status: '3 exceptions', statusIcon: 'alert' },
        { record: 'Board report', source: 'Source systems', status: 'Validated', statusIcon: 'check' },
      ],
      caption: 'Illustrative example. Not live customer data.',
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
      heading: 'Handled responsibly',
      icon: 'shield',
      items: [
        'Customer data is pseudonymised wherever the analysis allows.',
        'Access follows your existing roles and approval processes.',
        'We work alongside your risk, compliance and internal audit teams, not around them.',
      ],
    },
    services: {
      heading: 'After the assessment',
      subheading: 'A practical roadmap to connect your systems, improve data reliability and strengthen reporting.',
      leadTone: 'accent',
      items: [
        {
          name: 'Integrate and model',
          lead: 'Bring your financial data together.',
          text: 'Connect core banking, loan management, payments and general ledger systems into a central data warehouse. Establish consistent definitions for customers, accounts, transactions and financial performance.',
          icon: 'link',
          service: 'data-engineering-and-integration',
        },
        {
          name: 'Quality and governance',
          lead: 'Build confidence in your financial data.',
          text: 'Introduce automated checks for accuracy, completeness, consistency and timeliness. Establish clear ownership, access controls and business definitions so financial information remains reliable and traceable.',
          icon: 'shield',
          service: 'data-quality-and-reliability',
        },
        {
          name: 'Reporting and dashboards',
          lead: 'Turn trusted data into better decisions.',
          text: 'Replace fragmented spreadsheets and manual reporting with reliable dashboards for portfolio performance, financial operations, payments, customer activity and regulatory reporting.',
          icon: 'chart',
          service: 'business-intelligence-and-analytics',
        },
      ],
    },
    closing: {
      eyebrow: 'Get started',
      heading: 'Build a financial data foundation you can trust',
      text: 'Your next financial report should be easier to produce, explain and defend. Start by identifying which figures can be trusted, where discrepancies originate and what needs to improve.',
      // Owner addition (2026-10-24, #98): the protected phrase, visible (A1).
      followUp: 'We help you build a trusted data foundation for reliable reporting and better decisions.',
    },
  },
  'retail-and-distribution': {
    layout: 'sector',
    // Pending the owner's decision (owner note 1, issue 101): the plan's
    // title and description break the length rules, so these are the
    // recommended resolutions, which keep its keywords and wording.
    title: 'Retail Analytics Uganda: Sales, Stock & Margin | Fafanua',
    description:
      'Retail business intelligence in Uganda and East Africa: sales analytics, inventory analytics and distribution analytics built on figures you can trace.',
    breadcrumb: 'Retail & distribution',
    hero: {
      eyebrow: 'Retail and distribution solutions',
      heading: 'Sales, stock and margin you can trace.',
      lead: 'Fafanua helps retailers, wholesalers, distributors and FMCG businesses in Uganda and East Africa build trusted retail analytics across sales, inventory, margin and distribution performance.',
      leadDetail:
        'We trace the figures your leadership relies on back to their source, so sales, stock and margin agree from the shelf to the ledger.',
      secondaryLabel: 'See how the assessment works',
    },
    diagram: {
      sourcesHeading: 'Retail systems',
      sources: [
        { label: 'Loyalty & CRM', icon: 'list', feeds: false },
        { label: 'Distribution & delivery', icon: 'truck', feeds: false },
        { label: 'Point of sale', icon: 'card', feeds: true },
        { label: 'Inventory & warehouse', icon: 'box', feeds: true },
        { label: 'Finance ledger', icon: 'ledger', feeds: true },
      ],
      traceHeading: 'Traced to source',
      steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
      traceFootnote: 'Owner and trust rating for every number',
      figuresHeading: 'Figures you report',
      figures: [
        { name: 'Sales by outlet', rating: 'Trusted', marker: 'teal' },
        { name: 'Gross margin by product', rating: 'Trusted with caveats', marker: 'amber' },
        { name: 'Stock accuracy', rating: 'Not yet trusted', marker: 'hollow' },
      ],
      caption: 'Illustrative example. Sample data only.',
      description:
        'Illustrative example: sales by outlet, gross margin by product and stock accuracy traced to point-of-sale, inventory and finance systems, with trust ratings.',
    },
    challenge: {
      heading: 'The challenge',
      text: 'Sales, stock and finance each tell a different story. The till shows one sales figure and the ledger another, and stock on hand rarely matches what is on the shelf, so margin and shrinkage are hard to explain.',
      icon: 'alert',
    },
    approach: {
      heading: 'Our approach',
      text: 'We start by tracing the figures leadership relies on most, sales, margin and stock, back to their source. Then we connect purchasing, warehouse, sales and finance, so every branch reports the same way.',
      icon: 'check',
    },
    audience: {
      heading: 'Who we work with',
      subheading: 'Retailers, wholesalers, distributors and FMCG businesses.',
      segments: [
        {
          heading: 'Retailers and supermarket chains',
          text: 'For businesses running several outlets.',
          icon: 'card',
          items: [
            'Sales analytics by outlet, product and channel',
            'Branch performance and comparability',
            'Stock accuracy and shrinkage',
          ],
        },
        {
          heading: 'Wholesalers and distributors',
          text: 'For businesses running depots, routes and trade customers.',
          icon: 'truck',
          items: [
            'Inventory analytics across warehouses and depots',
            'Distribution analytics by route and customer',
            'Supplier and purchasing performance',
          ],
        },
        {
          heading: 'FMCG and consumer brands',
          text: 'For brands selling through distributors and retailers.',
          icon: 'box',
          items: ['Sell-in and sell-out visibility', 'Distributor stock and coverage', 'Margin by product and channel'],
        },
      ],
    },
    assessment: {
      eyebrow: 'Start with trust',
      heading: 'The Data Trust Assessment: three weeks, fixed fee',
      text: 'The Data Trust Assessment takes the numbers your leadership relies on most and traces each one from the report back to its source.',
      deliverables: [
        { name: 'Lineage map', text: 'How each key number is produced, system by system', icon: 'map' },
        { name: 'Trust scorecard', text: 'Each number rated trusted, with caveats, or not yet', icon: 'score' },
        {
          name: 'Shared definitions',
          text: 'For terms like ‘net sales’ that branches define differently',
          icon: 'book',
        },
        { name: 'Prioritised roadmap', text: 'Ranked by business impact and effort', icon: 'list' },
      ],
    },
    journey: {
      eyebrow: 'One stock figure',
      heading: 'Follow every unit, from supplier to shelf',
      // Proposed owner addition (pending the owner's decision, issue 101):
      // A3, so the journey reads as work that follows the assessment.
      intro:
        'Where the assessment finds stock figures that do not agree, we can then help you follow each unit across the systems that record it.',
      text: 'We connect purchasing, warehouse, distribution and sales records, so stock on hand can be explained, not just counted.',
      steps: [
        { name: 'Ordered', system: 'Purchasing' },
        { name: 'Received', system: 'Warehouse' },
        { name: 'Transferred', system: 'Distribution' },
        { name: 'Sold', system: 'Point of sale' },
        { name: 'On hand', system: 'Stock count' },
      ],
      highlight: 4,
      // On hand's highlight, in words (owner note 6), as on Education.
      highlightNote: '(variance shown below)',
      callout: {
        label: 'Variance explained',
        text: 'System stock 1,240 · counted 1,182 · the 58-unit gap traced to unrecorded transfers and damaged goods.',
      },
      caption: 'Illustrative example. Sample data only.',
      calloutAlign: 'end',
    },
    ai: {
      label: 'Ready for what comes next',
      heading: 'Trusted data makes advanced analytics possible.',
      text: 'Once sales, stock, product and branch data is consistently defined and traceable, the same foundation can support demand forecasting, replenishment, anomaly detection and other advanced analytics.',
      icon: 'gauge',
    },
    handling: {
      heading: 'Handled responsibly',
      icon: 'shield',
      items: [
        'Where appropriate, analysis can use pseudonymised customer and loyalty data to reduce exposure of directly identifying information.',
        'Access follows your existing roles, by branch and by function.',
        'Ownership and access rules are agreed before any pipeline is built.',
      ],
    },
    services: {
      eyebrow: 'What happens next',
      heading: 'From findings to a stronger retail data foundation.',
      subheading:
        'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your retail data foundation that need attention.',
      items: [
        {
          name: 'Integrate & model',
          text: 'Connect point-of-sale, warehouse, purchasing, distribution and finance systems into one consistent view of products, outlets and stock.',
          // Proposed owner addition (pending the owner's decision, issue
          // 101): A2, the SEO plan §10 keywords on customer retention and
          // payment reconciliation, as follow-on work.
          detail:
            'Payment and loyalty data can be connected too, so customer retention can be tracked and card and mobile-money takings reconcile with sales.',
          icon: 'link',
          service: 'data-engineering-and-integration',
        },
        {
          name: 'Quality & governance',
          text: 'Completeness and timeliness checks, plus clear ownership and access rules.',
          icon: 'shield',
          service: 'data-quality-and-reliability',
        },
        {
          name: 'Reporting & dashboards',
          text: 'Retail business intelligence for sales, margin, stock and branch performance, built on the traced numbers.',
          icon: 'chart',
          service: 'business-intelligence-and-analytics',
        },
      ],
    },
    closing: {
      eyebrow: 'Get started',
      heading: 'Build a retail data foundation you can trust',
      text: 'Sales, stock or margin: which do you trust least? Tell us about the reports your branches and head office rely on.',
      // Proposed owner addition (pending the owner's decision, issue 101):
      // A1, the protected phrase, visible.
      followUp:
        'We help retailers, wholesalers and distributors build a trusted data foundation, so every branch, depot and head office works from the same figures.',
    },
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
    layout: 'sector',
    title: 'Traceable Health Data Analytics Uganda | Fafanua',
    description:
      'Health data you can trace: healthcare analytics for hospitals and clinic networks in Uganda and East Africa, built on a trusted data foundation.',
    breadcrumb: 'Health',
    hero: {
      eyebrow: 'Health solutions',
      heading: 'Health data you can trace.',
      lead: 'For hospitals and clinic networks in Uganda and East Africa. We show you where your key finance and operations numbers come from, where they disagree across branches, and what to fix first.',
      secondaryLabel: 'See how the assessment works',
    },
    diagram: {
      sourcesHeading: 'Health systems',
      sources: [
        { label: 'EMR / HMIS', icon: 'hospital', feeds: false },
        { label: 'Laboratory', icon: 'flask', feeds: false },
        { label: 'Billing & insurance', icon: 'card', feeds: true },
        { label: 'Pharmacy dispensing', icon: 'pill', feeds: true },
        { label: 'Finance ledger', icon: 'ledger', feeds: true },
      ],
      traceHeading: 'Traced to source',
      steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
      traceFootnote: 'Owner and trust rating for every number',
      figuresHeading: 'Numbers you can trust',
      figures: [
        { name: 'Revenue by branch', rating: 'Trusted with caveats', marker: 'amber' },
        { name: 'Claims rejection rate', rating: 'Trusted', marker: 'teal' },
        { name: 'Pharmacy stock variance', rating: 'Not yet trusted', marker: 'hollow' },
      ],
      caption: 'Illustrative example. Sample data only.',
      description:
        'Illustrative example: revenue by branch traced to billing, pharmacy dispensing and the finance ledger, with trust ratings for three numbers.',
    },
    challenge: {
      heading: 'The challenge',
      text: 'Each branch reports in its own way, so head office cannot compare like with like. Monthly reports are assembled by hand from billing, pharmacy and finance exports, and when a number looks wrong, nobody can say where it came from.',
      icon: 'alert',
    },
    approach: {
      heading: 'Our approach',
      text: 'We start by tracing the numbers head office relies on most back to their source. What the trace reveals tells us what to fix first, so every branch ends up reporting the same way.',
      icon: 'check',
    },
    audience: {
      heading: 'Who we work with',
      subheading: 'Hospitals, clinic networks, laboratories and pharmacies.',
      card: {
        heading: 'Healthcare providers',
        text: 'Helping healthcare organisations bring together data from different facilities, departments and systems.',
        detail:
          'We connect the systems you already use to provide a clearer, more reliable view of your operations, finances and resources — without replacing your existing software.',
        icon: 'hospital',
        itemsLabel: 'What we help you achieve',
        items: [
          { name: 'Branch and facility performance', text: 'Compare performance across locations and service lines.' },
          { name: 'Revenue and claims reconciliation', text: 'Bring together billing, payments and insurance claims.' },
          { name: 'Pharmacy and inventory visibility', text: 'Track medicine stocks, consumption and supply chain performance.' },
          {
            name: 'Reliable healthcare reporting',
            text: 'Reduce manual reporting and improve access to trusted operational data.',
          },
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
        { name: 'Shared definitions', text: 'For the terms your branches use differently', icon: 'book' },
        { name: 'Prioritised roadmap', text: 'Prioritised by impact and effort', icon: 'list' },
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
      heading: 'Handled responsibly',
      icon: 'shield',
      items: [
        'We begin with aggregated or de-identified data.',
        'Ownership, classification and access rules are agreed before any pipeline is built.',
        'We focus on operational and financial data, not clinical decision-making.',
      ],
    },
    services: {
      heading: 'After the assessment',
      subheading: 'A practical roadmap to connect your systems, improve data reliability and make reporting easier.',
      items: [
        {
          name: 'Integrate and model',
          lead: 'Bring your healthcare data together.',
          text: 'Connect billing, pharmacy, laboratory, patient management and finance systems into a central data warehouse. Establish consistent definitions for patients, visits, services, revenue and stock across your organisation.',
          icon: 'link',
          service: 'data-engineering-and-integration',
        },
        {
          name: 'Quality and governance',
          lead: 'Build confidence in your data.',
          text: 'Introduce automated checks for accuracy, completeness and timeliness. Establish clear data ownership, access controls and consistent definitions so your teams can rely on the information they use.',
          icon: 'shield',
          service: 'data-quality-and-reliability',
        },
        {
          name: 'Reporting and dashboards',
          lead: 'Turn trusted data into useful insights.',
          text: 'Replace fragmented spreadsheets and manual reporting with reliable dashboards that give management visibility into facility performance, revenue, patient flow, resource utilisation and service delivery.',
          icon: 'chart',
          service: 'business-intelligence-and-analytics',
        },
      ],
    },
    closing: {
      eyebrow: 'Get started',
      heading: 'Build a health data foundation you can trust',
      text: 'Which numbers do you trust least? Tell us about the reports your branches and head office rely on.',
      // Owner addition (2026-10-23, #94): the protected phrase, visible.
      followUp: 'Then we make sure they are built on a trusted data foundation.',
    },
  },
  education: {
    layout: 'sector',
    title: 'Learner & Education Data Analytics Uganda | Fafanua',
    description:
      'Every learner, counted the same way: education data analytics for universities, colleges, schools and training providers in Uganda, on a trusted data foundation.',
    breadcrumb: 'Education',
    hero: {
      eyebrow: 'Education solutions',
      heading: 'Every learner, counted the same way.',
      lead: 'For universities, colleges, schools, training providers and education programmes in Uganda and East Africa. We trace the figures your leadership, ministry and funders see back to their source, so enrolment, progression and fees tell one consistent story.',
      secondaryLabel: 'See how the assessment works',
    },
    diagram: {
      sourcesHeading: 'Education systems',
      sources: [
        { label: 'Admissions', icon: 'list', feeds: false },
        { label: 'Exams & grading', icon: 'score', feeds: false },
        { label: 'Student information system', icon: 'cap', feeds: true },
        { label: 'Learning platform', icon: 'chart', feeds: true },
        { label: 'Fees & finance', icon: 'card', feeds: true },
      ],
      traceHeading: 'Traced to source',
      steps: ['Report', 'Definition', 'Calculation', 'Data model', 'Source system'],
      traceFootnote: 'Owner and trust rating for every number',
      figuresHeading: 'Figures you report',
      figures: [
        { name: 'Active learners', rating: 'Trusted with caveats', marker: 'amber' },
        { name: 'Fee collection rate', rating: 'Trusted', marker: 'teal' },
        { name: 'Completion rate', rating: 'Not yet trusted', marker: 'hollow' },
      ],
      caption: 'Illustrative example. Sample data only.',
      description:
        'Illustrative example: active learners, fee collection rate and completion rate traced to student, learning and finance systems, with trust ratings.',
    },
    challenge: {
      heading: 'The challenge',
      text: 'Admissions, learning, exams and finance each keep their own records. The same learner appears differently in each system, ‘active’ means something different to every team, and ministry or funder reports take weeks to assemble.',
      icon: 'alert',
    },
    approach: {
      heading: 'Our approach',
      text: 'We start by tracing the figures leadership and funders rely on back to their source. Then we connect each learner’s records across systems, so every report describes the same learner in the same way.',
      icon: 'check',
    },
    audience: {
      heading: 'Who we work with',
      subheading: 'Universities, colleges, schools, training providers and education programmes.',
      card: {
        heading: 'Education institutions',
        text: 'For institutions and programmes that report to a board, a ministry or a funder.',
        // Owner addition (2026-10-26, issue 100): A2, the SEO plan §11 keywords.
        detail:
          'We help education institutions bring together data from admissions, learning, exams and finance systems for learner analytics, education dashboards and cohort analysis — giving teams a clearer view of student retention, learner progression and graduate outcomes.',
        icon: 'cap',
        items: [
          'Enrolment and progression tracking',
          'Fees, scholarships and payments reconciliation',
          'Learner engagement and completion',
          'Board, ministry and funder reporting',
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
        {
          name: 'Shared definitions',
          text: 'For terms like ‘active learner’ that teams define differently',
          icon: 'book',
        },
        { name: 'Prioritised roadmap', text: 'Ranked by business impact and effort', icon: 'list' },
      ],
    },
    journey: {
      // Owner decision (2026-10-27, issue 100): the section reads as work
      // that follows the assessment: "What happens next" over the heading
      // "One learner, one record".
      eyebrow: 'What happens next',
      heading: 'One learner, one record',
      // Owner-approved (2026-10-27, issue 100): the sentence before the
      // plan's text.
      intro:
        'Where the assessment identifies fragmented learner records, we can then help you unify admissions, learning, assessment, finance and outcomes data.',
      text: 'We connect records across the learner journey, so admissions, learning, exams and finance describe the same person in the same way.',
      steps: [
        { name: 'Apply', system: 'Admissions' },
        { name: 'Enrol', system: 'Student information system' },
        { name: 'Learn', system: 'Learning platform' },
        { name: 'Assess', system: 'Exams and grading' },
        { name: 'Complete', system: 'Certification records' },
      ],
      highlight: 2,
      // Plan section 6's example: Learn's highlight, in words.
      highlightNote: '(definition shown below)',
      callout: {
        label: 'Definition agreed',
        text: 'An active learner has recorded learning activity in the last 30 days.',
      },
      caption: 'Illustrative example. Sample definition only.',
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
      heading: 'Handled responsibly',
      icon: 'shield',
      items: [
        // Owner decision (2026-10-27, issue 100).
        'Where appropriate, analysis can use pseudonymised learner data to reduce exposure of directly identifying information.',
        // Owner decision (2026-10-26, issue 100): replaces the plan's item on
        // learners under 18.
        'Education data can be sensitive, particularly where it relates to children and young people. We design access, governance and reporting controls around the organisation’s policies, legal obligations and the sensitivity of the data.',
        'Ownership and access rules are agreed before any pipeline is built.',
      ],
    },
    services: {
      heading: 'After the assessment',
      subheading: 'What we fix, once we know where trust breaks down.',
      items: [
        {
          name: 'Integrate and model',
          text: 'Connect admissions, student information, learning, exams and finance systems into one consistent view of each learner.',
          icon: 'link',
          service: 'data-engineering-and-integration',
        },
        {
          name: 'Quality and governance',
          text: 'Completeness and timeliness checks, plus clear ownership and access rules.',
          icon: 'shield',
          service: 'data-quality-and-reliability',
        },
        {
          name: 'Reporting and dashboards',
          text: 'Enrolment, progression, completion and finance reporting for leadership, ministries and funders.',
          icon: 'chart',
          service: 'business-intelligence-and-analytics',
        },
        // Owner decision (2026-10-26, issue 100): the links to the data
        // warehousing and data governance service pages restored as two
        // more cards, their copy owner-approved on 2026-10-27.
        {
          name: 'Learner data warehouse',
          text: 'Model learners, programmes, cohorts and terms in one data warehouse, so progression and completion can be tracked over time.',
          icon: 'ledger',
          service: 'data-warehousing-and-analytics-modelling',
        },
        {
          name: 'Data governance and definitions',
          text: 'Agree ownership, shared definitions and access rules for learner and staff data, and keep them documented.',
          icon: 'book',
          service: 'data-governance-and-metadata',
        },
      ],
    },
    closing: {
      eyebrow: 'Get started',
      heading: 'Build an education data foundation you can trust',
      text: 'Which learner figure do you trust least? Tell us about the reports your leadership, ministry and funders rely on.',
      // Owner addition (2026-10-26, issue 100): A1, the protected phrase, visible.
      followUp:
        'We help education organisations build a trusted data foundation for reliable reporting, clearer learner journeys and better decisions.',
    },
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
        { name: 'Prioritised roadmap', text: 'Prioritised by impact and effort', icon: 'list' },
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
