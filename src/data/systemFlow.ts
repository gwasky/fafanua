// The system and data-flow diagram in the Services section (#57): six
// layers, from operational sources to Reverse ETL and operational
// activation. The wording is copied from plan V2 §11
// (_docs/fafanua-v2-visual-upgrade-plan.md, "System / Data Flow Visual"):
// each name from its "Preferred conceptual flow", each label from its
// "Technical layer labels", and the terms from the flow's source line and
// its "Possible supporting terms". systemFlow.plan.test.ts checks them
// against that section. The heading is the section's stated goal,
// sentence-cased. SystemFlow.tsx reads its copy from here and holds none.
//
// The labels are stored in sentence case and uppercased in CSS, so screen
// readers read them as words rather than spelling them out. The
// warehouse layer has no label, as the plan gives none.
//
// Each layer's markers are the stages of the services it maps to, so the
// colours come from the same stage-to-token mapping as the lifecycle rail
// and the cards; a layer with none shows a neutral marker.
import { services, type Stage } from './services.ts'

export type SystemFlowLayer = {
  id: string
  /** The small uppercase label; the warehouse layer has none. */
  label?: string
  name: string
  /** Shown as a list after the name; absent where the plan gives none. */
  terms?: readonly string[]
  /** The stages whose service-line markers the layer shows, in order. */
  stages: readonly Stage[]
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
  layers: readonly SystemFlowLayer[]
} = {
  heading: 'How the services connect into one operating data system',
  layers: [
    {
      id: 'sources',
      label: 'Data sources',
      name: 'Operational Systems',
      terms: ['CRM', 'ERP', 'Payments', 'LMS', 'Files', 'APIs'],
      stages: [],
    },
    {
      id: 'integration',
      label: 'Integration layer',
      name: serviceName('data-engineering-and-integration'),
      stages: ['connect'],
    },
    {
      id: 'warehouse',
      name: 'Data Warehouse & Semantic Models',
      stages: ['model'],
    },
    {
      id: 'trust',
      label: 'Trust layer',
      name: 'Quality + Governance',
      terms: ['Quality', 'Reconciliation', 'Governance', 'Lineage'],
      stages: ['trust', 'govern'],
    },
    {
      id: 'decision',
      label: 'Decision layer',
      name: 'Analytics & Reporting',
      terms: ['Dashboards', 'KPIs', 'Forecasting'],
      stages: ['decide'],
    },
    {
      id: 'activation',
      label: 'Activation layer',
      name: 'Reverse ETL / Operational Activation',
      terms: ['Reverse ETL', 'Operational Systems'],
      stages: ['connect'],
    },
  ],
}
