// The connected data operating system diagram in the Services section
// (#57, looped in #63, upgraded in #66). The wording is copied from the V2
// visual enhancement plan
// (_docs/fafanua-v2-visual-enhancements-services-and-operating-system.md):
// the heading and lead from §4.1, each layer's lifecycle label and its
// line from §4.3, its central layer (name, and supporting line or terms)
// from §4.4, its detail panel from §5 and the return statement from §6.
// systemFlow.plan.test.ts checks them against those sections.
// SystemFlow.tsx reads its copy from here and holds none.
//
// The lifecycle labels are stored in sentence case and uppercased in CSS,
// so screen readers read them as words rather than spelling them out.
//
// The plan's supporting lines are " · "-separated terms, stored as lists
// and shown with drawn separators; Operational Systems' line is a
// sentence, stored as `summary`. The trust layer keeps Data Quality and
// Governance distinct (§4.4), so it has two parts; every other layer has
// one.
//
// Each part's stage gives its accent the same stage-to-token mapping as
// the lifecycle rail and the cards; Operational Systems maps to no stage
// and has a neutral accent.
import { services, type Stage } from './services.ts'

export type SystemFlowPart = {
  name: string
  /** A sentence under the name; only Operational Systems has one. */
  summary?: string
  /** Shown as a list under the name. */
  terms?: readonly string[]
  /** The stage whose service-line colour the part's accent uses. */
  stage: Stage | null
}

export type SystemFlowLayer = {
  id: string
  /** The lifecycle label beside the layer. */
  label: string
  /** The label's supporting line. */
  description: string
  /** The central layer: one part, or two for Data Quality and Governance. */
  parts: readonly SystemFlowPart[]
  /** The secondary detail panel. */
  details: readonly string[]
}

// Where a layer's name is also a service's name, it is read from
// services.ts rather than repeated.
function serviceName(id: string): string {
  const service = services.find((candidate) => candidate.id === id)
  if (!service) throw new Error(`No service with id "${id}"`)
  return service.name
}

export const systemFlow: {
  heading: string
  lead: string
  layers: readonly SystemFlowLayer[]
  /** The return loop, from activation back to operational systems, as text. */
  returnTitle: string
  returnText: string
} = {
  heading: 'One connected data operating system',
  lead: 'From operational systems to trusted reporting — and back into the tools your teams use every day.',
  returnTitle: 'Trusted data flows back into your operational systems',
  returnText: 'to drive better decisions and action, every day.',
  layers: [
    {
      id: 'sources',
      label: 'Data sources',
      description: 'Bring data from across your organisation.',
      parts: [
        {
          name: 'Operational Systems',
          summary: 'Your business systems that generate data',
          stage: null,
        },
      ],
      details: ['CRM', 'ERP', 'Payments', 'LMS', 'Files', 'APIs'],
    },
    {
      id: 'integration',
      label: 'Integration',
      description: 'Connect and move data reliably.',
      parts: [
        {
          name: serviceName('data-engineering-and-integration'),
          terms: ['Ingestion', 'CDC', 'APIs', 'Batch & Streaming'],
          stage: 'connect',
        },
      ],
      details: [
        'Change Data Capture',
        'API & SaaS connectors',
        'Batch processing',
        'Data orchestration',
      ],
    },
    {
      id: 'modelling',
      label: 'Modelling',
      description: 'Clean, unify and model your data for the business.',
      parts: [
        {
          name: 'Data Warehouse & Semantic Layer',
          terms: ['Clean', 'Conformed', 'Business-ready'],
          stage: 'model',
        },
      ],
      details: ['Data warehouse', 'Conformed models', 'Semantic layer', 'Business definitions'],
    },
    {
      id: 'trust',
      label: 'Trust',
      description: 'Ensure data is accurate, traceable and governed.',
      parts: [
        {
          name: 'Data Quality',
          terms: ['Testing', 'Reconciliation', 'Monitoring', 'Alerts'],
          stage: 'trust',
        },
        {
          name: 'Governance',
          terms: ['Metadata', 'Lineage', 'Access', 'Ownership'],
          stage: 'govern',
        },
      ],
      details: [
        'Data quality checks',
        'Reconciliation',
        'Metadata & lineage',
        'Policies & access control',
      ],
    },
    {
      id: 'understand',
      label: 'Understand',
      description: 'Turn trusted data into insights.',
      parts: [
        {
          name: 'Analytics & Reporting',
          terms: ['Dashboards', 'KPIs', 'Forecasting', 'Ad-hoc analysis'],
          stage: 'decide',
        },
      ],
      details: ['Dashboards', 'KPIs & metrics', 'Forecasting', 'Self-service analytics'],
    },
    {
      id: 'act',
      label: 'Act',
      description: 'Put trusted data to work in your operational tools.',
      parts: [
        {
          name: 'Operational Activation',
          terms: ['Reverse ETL', 'CRM', 'Marketing', 'Operations'],
          stage: 'connect',
        },
      ],
      details: [
        'Sync to operational systems',
        'Trigger workflows',
        'Segment audiences',
        'Personalise experiences',
      ],
    },
  ],
}
