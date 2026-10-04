import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services } from '../data/services.ts'
import { systemFlow } from '../data/systemFlow.ts'
import SystemFlow from './SystemFlow.tsx'

function renderFlow() {
  const { container } = render(<SystemFlow />)
  const wrapper = container.firstElementChild as HTMLElement
  const heading = screen.getByRole('heading')
  const list = screen.getByRole('list', { name: systemFlow.heading })
  const layers = [...list.children] as HTMLElement[]
  return { wrapper, heading, list, layers }
}

// The text a screen reader reads: the element's text without its
// aria-hidden parts.
function spokenText(element: Element) {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
}

// A layer's parts, in order: its label (if any), its name and its terms.
function parts(layer: HTMLElement) {
  const [first, ...rest] = [...layer.children] as HTMLElement[]
  const hasLabel = first.classList.contains('system-flow__label')
  const [name, terms] = hasLabel ? rest : [first, ...rest]
  return { label: hasLabel ? first : null, name, terms: terms ?? null }
}

// The integration layer's name is a service name, which may only be
// written in services.ts.
const integration = services.find((s) => s.id === 'data-engineering-and-integration')!

const NAMES = [
  'Operational Systems',
  integration.name,
  'Data Warehouse & Semantic Models',
  'Quality + Governance',
  'Analytics & Reporting',
  'Reverse ETL / Operational Activation',
]

const TERMS = [
  ['CRM', 'ERP', 'Payments', 'LMS', 'Files', 'APIs'],
  null,
  null,
  ['Quality', 'Reconciliation', 'Governance', 'Lineage'],
  ['Dashboards', 'KPIs', 'Forecasting'],
  ['Reverse ETL', 'Operational Systems'],
]

describe('SystemFlow', () => {
  it('is a plain div with an h3, "How the services connect into one operating data system"', () => {
    const { wrapper, heading } = renderFlow()

    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper).not.toHaveAttribute('role')
    expect(wrapper).not.toHaveAttribute('aria-label')
    expect(wrapper).not.toHaveAttribute('aria-labelledby')
    expect(heading.tagName).toBe('H3')
    expect(heading.textContent).toBe(
      'How the services connect into one operating data system',
    )
    expect(wrapper.firstElementChild).toBe(heading)
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('is an ordered list of six layers named by the h3', () => {
    const { heading, list, layers } = renderFlow()

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list).toHaveAttribute('aria-labelledby', heading.id)
    expect(list).toHaveAccessibleName(heading.textContent!)
    expect(heading.nextElementSibling).toBe(list)
    expect(layers).toHaveLength(6)
    for (const layer of layers) expect(layer.tagName).toBe('LI')
  })

  it('shows each layer\'s name, in order', () => {
    const { layers } = renderFlow()

    expect(layers.map((layer) => spokenText(parts(layer).name))).toEqual(NAMES)
  })

  it('reads the integration layer\'s name from services.ts', () => {
    const { layers } = renderFlow()

    expect(spokenText(parts(layers[1]).name)).toBe(integration.name)
    expect(integration.name).toMatch(/^Data Engineering/)
  })

  it('labels layers 1, 2, 4, 5 and 6, and not the warehouse layer', () => {
    const { layers } = renderFlow()
    const labels = layers.map((layer) => parts(layer).label?.textContent ?? null)

    expect(labels).toEqual([
      'Data sources',
      'Integration layer',
      null,
      'Trust layer',
      'Decision layer',
      'Activation layer',
    ])
    expect(layers[2].querySelector('.system-flow__label')).toBeNull()
  })

  it('lists each layer\'s exact terms, and none where the plan gives none', () => {
    const { layers } = renderFlow()

    layers.forEach((layer, index) => {
      const { terms } = parts(layer)
      if (TERMS[index] === null) {
        expect(terms, `layer ${index + 1}`).toBeNull()
        expect(within(layer).queryByRole('list')).toBeNull()
        return
      }
      expect(terms!.tagName).toBe('UL')
      expect(terms).toHaveAttribute('role', 'list')
      expect(
        within(terms!).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(TERMS[index])
    })
  })

  it('orders each layer as label, name, then terms, with nothing else', () => {
    const { layers } = renderFlow()

    for (const layer of layers) {
      const { label, name, terms } = parts(layer)
      const expected = [label, name, terms].filter(Boolean)
      expect([...layer.children]).toEqual(expected)
    }
  })

  it('shows "Reverse ETL" in the last layer, both in its name and its terms', () => {
    const { layers } = renderFlow()
    const last = layers[5]

    expect(spokenText(parts(last).name)).toContain('Reverse ETL')
    expect(within(parts(last).terms!).getByText('Reverse ETL')).toBeInTheDocument()
  })

  it('has no link, button, image, tab stop, title or scroll container', () => {
    const { wrapper } = renderFlow()

    expect(within(wrapper).queryAllByRole('link')).toHaveLength(0)
    expect(within(wrapper).queryAllByRole('button')).toHaveLength(0)
    expect(within(wrapper).queryAllByRole('img')).toHaveLength(0)
    expect(
      wrapper.querySelector('a, button, img, svg, canvas, picture, [tabindex], [title], section, [role="region"]'),
    ).toBeNull()
  })

  it('hides only the empty markers from screen readers', () => {
    const { layers } = renderFlow()
    const counts = [1, 1, 1, 2, 1, 1]

    layers.forEach((layer, index) => {
      const hidden = [...layer.querySelectorAll('[aria-hidden="true"]')]
      expect(hidden, `layer ${index + 1}`).toHaveLength(1)
      expect(hidden[0]).toHaveClass('system-flow__markers')
      expect(hidden[0].textContent).toBe('')
      expect(hidden[0].querySelectorAll('.system-flow__marker')).toHaveLength(counts[index])
    })
  })

  it('maps the markers to service-line stages, with a neutral one for data sources', () => {
    const { layers } = renderFlow()
    const markers = layers.map((layer) =>
      [...layer.querySelectorAll('.system-flow__marker')].map((marker) =>
        [...marker.classList].find((name) => name.startsWith('system-flow__marker--')) ?? 'neutral',
      ),
    )

    expect(markers).toEqual([
      ['neutral'],
      ['system-flow__marker--connect'],
      ['system-flow__marker--model'],
      ['system-flow__marker--trust', 'system-flow__marker--govern'],
      ['system-flow__marker--decide'],
      ['system-flow__marker--connect'],
    ])
  })

  it('has no AI wording, product name, numbering or arrow characters in its text', () => {
    const { wrapper } = renderFlow()
    const text = wrapper.textContent!

    expect(text).not.toMatch(/\bAI\b|\bML\b|\bRAG\b|agents|Fafanua Intelligence/i)
    expect(text).not.toMatch(/[←-⇿➔-➿·•—]/)
    expect(text).not.toMatch(/\d/)
    expect(text).not.toMatch(/Snowflake|dbt|Power BI|before|after/i)
  })

  it('contains no words beyond the h3, the labels, names and terms', () => {
    const { wrapper } = renderFlow()
    const allowed = [
      systemFlow.heading,
      ...systemFlow.layers.flatMap((layer) => [
        layer.label ?? '',
        layer.name,
        ...(layer.terms ?? []),
      ]),
    ].join('')

    expect(wrapper.textContent).toBe(allowed)
  })
})
