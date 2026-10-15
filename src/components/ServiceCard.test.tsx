import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services, stages, type Service } from '../data/services.ts'
import { servicePath } from '../paths.ts'
import ServiceCard from './ServiceCard.tsx'

// The governance service has the longest engagements list (ten items),
// none of which the cell shows since the open grid plan (#83).
const governance = services.find(
  (service) => service.id === 'data-governance-and-metadata',
)!

// The text a screen reader reads: the element's text without its
// aria-hidden parts.
function spokenText(element: Element) {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
}

// One cell, rendered in a list item as Services.tsx does.
function renderCell(service: Service = governance) {
  const { container } = render(
    <ol>
      <li>
        <ServiceCard service={service} />
      </li>
    </ol>,
  )
  const cell = container.querySelector('li')!
  const heading = within(cell).getByRole('heading', { level: 3 })
  const [stage, , description, tags] = [...cell.children] as HTMLElement[]
  return { cell, heading, stage, description, tags }
}

describe('ServiceCard', () => {
  it('shows the stage line, title, description and tags, in that order and nothing else', () => {
    const { cell, heading, stage, description, tags } = renderCell()

    expect([...cell.children].map((child) => child.tagName)).toEqual(['P', 'H3', 'P', 'P'])
    expect(cell.children[1]).toBe(heading)
    expect(spokenText(stage)).toBe('Govern')
    expect(spokenText(heading)).toBe(governance.name)
    expect(description.textContent).toBe(governance.description)
    expect(tags.textContent).toBe(governance.tags.join(' · '))
  })

  it.each(services.map((service, index) => [service.stage, service, index]))(
    'shows the %s stage as visible text after its hidden number',
    (_stage, service, index) => {
      const { stage } = renderCell(service)
      const [number] = stage.querySelectorAll('[aria-hidden="true"]')
      const stageNumber = String(index + 1).padStart(2, '0')

      expect(stage.tagName).toBe('P')
      // Seen as "01 Design", read as "Design".
      expect(stage.textContent).toBe(`${stageNumber}${stages[service.stage]}`)
      expect(spokenText(stage)).toBe(stages[service.stage])
      expect(number.textContent).toBe(stageNumber)
      expect(stage.firstElementChild).toBe(number)
      expect(stage.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
      expect(stage.lastChild?.nodeType).toBe(Node.TEXT_NODE)
      // Plain text: no link, button or tab stop.
      expect(stage.querySelector('a, button, [tabindex]')).toBeNull()
    },
  )

  it.each(services.map((service) => [service.name, service]))(
    'shows the tags for %s as one paragraph, in order, joined with " · "',
    (_name, service) => {
      const { tags } = renderCell(service)

      expect(tags.tagName).toBe('P')
      expect(tags.textContent).toBe(service.tags.join(' · '))
      expect(tags.children).toHaveLength(0)
      expect(tags).toBeVisible()
    },
  )

  it('gives the tags no list, links, buttons, names or tab stops', () => {
    const { cell, tags } = renderCell()

    expect(within(cell).queryAllByRole('list')).toHaveLength(0)
    expect(within(tags).queryAllByRole('link')).toHaveLength(0)
    expect(within(tags).queryAllByRole('button')).toHaveLength(0)
    expect(tags.querySelector('a, button, [tabindex], [aria-label]')).toBeNull()
    expect(tags).not.toHaveAttribute('aria-label')
  })

  it('adds no other headings', () => {
    renderCell()
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('has one link, in the title, named by the service, with a hidden arrow', () => {
    const { cell, heading } = renderCell()
    const links = within(cell).getAllByRole('link')
    const arrow = links[0].querySelector('[aria-hidden="true"]')!

    expect(links).toHaveLength(1)
    expect(heading).toContainElement(links[0])
    expect(links[0]).toHaveAccessibleName(governance.name)
    expect(links[0]).toHaveAttribute('href', servicePath(governance.id))
    expect(arrow.textContent!.trim()).toBe('→')
    expect(links[0].lastElementChild).toBe(arrow)
    expect(cell.querySelectorAll('a, button, [tabindex]')).toHaveLength(1)
  })

  it('has no button, disclosure or Typical engagements (#83)', () => {
    const { cell } = renderCell()

    expect(within(cell).queryAllByRole('button')).toHaveLength(0)
    expect(cell.querySelector('[aria-expanded], [aria-controls], [hidden], svg')).toBeNull()
    expect(cell.textContent).not.toContain('Typical engagements')
    for (const item of governance.engagements) {
      expect(screen.queryByText(item)).toBeNull()
    }
    expect(document.getElementById(`${governance.id}-typical-engagements`)).toBeNull()
  })

  it('has no stage colour classes', () => {
    const { cell } = renderCell()
    expect(cell.querySelector('[class*="--design"], [class*="--govern"], [class*="--open"]')).toBeNull()
    expect(cell.innerHTML).not.toContain('--marker')
  })

  it('builds the title id from the service id', () => {
    const { heading } = renderCell()
    expect(heading).toHaveAttribute('id', `${governance.id}-heading`)
  })
})
