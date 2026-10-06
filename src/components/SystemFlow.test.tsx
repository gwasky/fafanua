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

// A layer's parts, in order: its lifecycle stage, its central card and
// its detail panel.
function parts(layer: HTMLElement) {
  const [stage, core, details] = [...layer.children] as HTMLElement[]
  return { stage, core, details }
}

// The integration layer's name is a service name, which may only be
// written in services.ts.
const integration = services.find((s) => s.id === 'data-engineering-and-integration')!

const LABELS = ['Data sources', 'Integration', 'Modelling', 'Trust', 'Understand', 'Act']

const NAMES = [
  ['Operational Systems'],
  [integration.name],
  ['Data Warehouse & Semantic Layer'],
  ['Data Quality', 'Governance'],
  ['Analytics & Reporting'],
  ['Operational Activation'],
]

describe('SystemFlow', () => {
  it('is a plain div with an h3, "One connected data operating system", and its lead', () => {
    const { wrapper, heading } = renderFlow()

    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper).not.toHaveAttribute('role')
    expect(wrapper).not.toHaveAttribute('aria-label')
    expect(wrapper).not.toHaveAttribute('aria-labelledby')
    expect(heading.tagName).toBe('H3')
    expect(heading.textContent).toBe('One connected data operating system')
    expect(wrapper.firstElementChild).toBe(heading)
    expect(heading.nextElementSibling!.tagName).toBe('P')
    expect(heading.nextElementSibling!.textContent).toBe(
      'From operational systems to trusted reporting — and back into the tools your teams use every day.',
    )
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('is an ordered list of six layers named by the h3, then the return statement', () => {
    const { wrapper, heading, list, layers } = renderFlow()

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list).toHaveAttribute('aria-labelledby', heading.id)
    expect(list).toHaveAccessibleName(heading.textContent!)
    expect(layers).toHaveLength(6)
    for (const layer of layers) expect(layer.tagName).toBe('LI')
    // In reading order: the list, then the return statement, last.
    const text = spokenText(wrapper)!
    expect(text.indexOf(systemFlow.returnTitle)).toBeGreaterThan(text.indexOf('Personalise experiences'))
    expect(text.endsWith(`${systemFlow.returnTitle}${systemFlow.returnText}`)).toBe(true)
  })

  it('orders each layer as lifecycle stage, central card, then detail panel', () => {
    const { layers } = renderFlow()

    for (const layer of layers) {
      const { stage, core, details } = parts(layer)
      expect(layer.children).toHaveLength(3)
      expect(stage).toHaveClass('system-flow__stage')
      expect(core).toHaveClass('system-flow__core')
      expect(details.tagName).toBe('UL')
      expect(details).toHaveAttribute('role', 'list')
    }
  })

  it('shows each layer\'s lifecycle label and line', () => {
    const { layers } = renderFlow()

    expect(layers.map((layer) => parts(layer).stage.firstElementChild!.textContent)).toEqual(LABELS)
    layers.forEach((layer, i) => {
      const [label, description] = [...parts(layer).stage.children]
      expect(label.tagName).toBe('P')
      expect(description.tagName).toBe('P')
      expect(description.textContent).toBe(systemFlow.layers[i].description)
    })
  })

  it('shows each central part\'s name, in order, with Data Quality and Governance as two parts', () => {
    const { layers } = renderFlow()

    expect(
      layers.map((layer) =>
        [...parts(layer).core.querySelectorAll('.system-flow__name')].map((name) => name.textContent),
      ),
    ).toEqual(NAMES)
    expect(spokenText(parts(layers[1]).core)).toContain(integration.name)
  })

  it('lists each part\'s terms, or Operational Systems\' supporting sentence', () => {
    const { layers } = renderFlow()

    layers.forEach((layer, i) => {
      const elements = [...parts(layer).core.querySelectorAll('.system-flow__part')]
      expect(elements).toHaveLength(systemFlow.layers[i].parts.length)
      elements.forEach((element, j) => {
        const part = systemFlow.layers[i].parts[j]
        const terms = element.querySelector('ul')
        if (part.summary) {
          expect(terms).toBeNull()
          expect(element.querySelector('.system-flow__summary')!.textContent).toBe(part.summary)
          return
        }
        expect(terms).toHaveAttribute('role', 'list')
        expect(within(terms!).getAllByRole('listitem').map((item) => item.textContent)).toEqual(part.terms)
      })
    })
    expect(spokenText(layers[0])).toContain('Your business systems that generate data')
  })

  it('lists each layer\'s detail panel', () => {
    const { layers } = renderFlow()

    layers.forEach((layer, i) => {
      expect(
        within(parts(layer).details).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(systemFlow.layers[i].details)
    })
  })

  it('shows "Reverse ETL" as one term of Operational Activation', () => {
    const { layers } = renderFlow()
    const { core } = parts(layers[5])

    expect(core.querySelector('.system-flow__name')!.textContent).toBe('Operational Activation')
    expect(within(core).getByRole('list')).toHaveTextContent('Reverse ETL')
  })

  it('gives each part an accent class for its stage, and Operational Systems a neutral one', () => {
    const { wrapper } = renderFlow()

    expect(
      [...wrapper.querySelectorAll('.system-flow__part')].map((part) =>
        [...part.classList].find((name) => name.startsWith('system-flow__part--')),
      ),
    ).toEqual([
      'system-flow__part--neutral',
      'system-flow__part--connect',
      'system-flow__part--model',
      'system-flow__part--trust',
      'system-flow__part--govern',
      'system-flow__part--decide',
      'system-flow__part--connect',
    ])
  })

  it('says, as visible text after the list, that trusted data flows back to operational systems', () => {
    const { wrapper } = renderFlow()
    const statement = wrapper.querySelector('.system-flow__return')!
    const [title, text] = [...statement.children]

    expect(title.tagName).toBe('P')
    expect(title.textContent).toBe('Trusted data flows back into your operational systems')
    expect(text.textContent).toBe('to drive better decisions and action, every day.')
    expect(statement.closest('ol')).toBeNull()
  })

  it('draws the return loop as the one decorative SVG: hidden, unfocusable, textless, unanimated', () => {
    const { wrapper, list } = renderFlow()
    const svgs = wrapper.querySelectorAll('svg')
    const loop = svgs[0]

    expect(svgs).toHaveLength(1)
    expect(loop.parentElement).toBe(list.parentElement)
    expect(loop.previousElementSibling).toBe(list)
    expect(loop).toHaveAttribute('aria-hidden', 'true')
    expect(loop).toHaveAttribute('focusable', 'false')
    expect(loop).toHaveClass('system-flow__loop')
    expect(loop.textContent).toBe('')
    expect(loop).not.toHaveAttribute('role')
    // Only shapes and groups: no text, title, image, link or animation.
    expect(
      [...loop.querySelectorAll('*')].map((element) => element.tagName.toLowerCase()).sort(),
    ).toEqual(['g', 'g', 'g', 'line', 'line', 'line', 'line', 'path', 'path', 'path'])
    // Colour from CSS (currentColor), none set on the shapes.
    for (const element of loop.querySelectorAll('*')) {
      expect(element.getAttribute('stroke')).toBeNull()
      expect(element.getAttribute('fill')).toBeNull()
      expect(element.getAttribute('style')).toBeNull()
    }
  })

  it('has no link, button, image, tab stop, title or scroll container, and no graphic but the loop', () => {
    const { wrapper } = renderFlow()

    expect(within(wrapper).queryAllByRole('link')).toHaveLength(0)
    expect(within(wrapper).queryAllByRole('button')).toHaveLength(0)
    expect(within(wrapper).queryAllByRole('img')).toHaveLength(0)
    expect(
      wrapper.querySelector('a, button, img, canvas, picture, [tabindex], [title], section, [role="region"]'),
    ).toBeNull()
    expect([...wrapper.querySelectorAll('svg')].map((svg) => svg.getAttribute('class'))).toEqual([
      'system-flow__loop',
    ])
  })

  it('hides only the loop from screen readers', () => {
    const { wrapper } = renderFlow()

    expect([...wrapper.querySelectorAll('[aria-hidden="true"]')]).toEqual([wrapper.querySelector('svg')])
  })

  it('has no AI wording, product name, numbering or arrow characters in its text', () => {
    const { wrapper } = renderFlow()
    const text = wrapper.textContent!

    expect(text).not.toMatch(/\bAI\b|\bML\b|\bRAG\b|agents|Fafanua Intelligence/i)
    // The lead's dash is the plan's; no arrows or separator characters.
    expect(text).not.toMatch(/[←-⇿➔-➿·•]/)
    expect(text).not.toMatch(/\d/)
    expect(text).not.toMatch(/Snowflake|dbt|Power BI/i)
  })

  it('contains no words beyond the h3, lead, layers and return statement', () => {
    const { wrapper } = renderFlow()
    const allowed = [
      systemFlow.heading,
      systemFlow.lead,
      ...systemFlow.layers.flatMap((layer) => [
        layer.label,
        layer.description,
        ...layer.parts.flatMap((part) => [part.name, part.summary ?? '', ...(part.terms ?? [])]),
        ...layer.details,
      ]),
      systemFlow.returnTitle,
      systemFlow.returnText,
    ].join('')

    expect(wrapper.textContent).toBe(allowed)
  })
})
