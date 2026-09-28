import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'

// jsdom has no matchMedia, which the header uses for its breakpoint.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders the header before the main landmark', () => {
    render(<App />)
    const banner = screen.getByRole('banner')
    const main = screen.getByRole('main')

    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).not.toContainElement(banner)
    expect(
      banner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('has exactly one h1, the hero heading, inside main', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading', { level: 1 })

    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveAccessibleName(
      'Build a data foundation you can trust.',
    )
    expect(screen.getByRole('main')).toContainElement(headings[0])
  })

  it('renders the hero as the first child of main', () => {
    render(<App />)
    const hero = screen.getByRole('region', {
      name: 'Build a data foundation you can trust.',
    })

    expect(screen.getByRole('main').firstElementChild).toBe(hero)
  })

  it('renders the services section directly after the hero, inside main', () => {
    render(<App />)
    const hero = screen.getByRole('region', {
      name: 'Build a data foundation you can trust.',
    })
    const services = screen.getByRole('region', { name: 'Services' })

    expect(screen.getByRole('main')).toContainElement(services)
    expect(hero.nextElementSibling).toBe(services)
  })

  it('lands the header and hero Services links on the services section', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: 'Services' })
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Services',
      }),
      screen.getByRole('link', { name: 'See our services' }),
    ]

    for (const link of targets) {
      expect(link).toHaveAttribute('href', `#${services.id}`)
    }
  })

  it('orders headings h1, h2 Services, then six h3s', () => {
    render(<App />)
    const levels = screen
      .getAllByRole('heading')
      .map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toEqual([1, 2, 3, 3, 3, 3, 3, 3])
  })
})
