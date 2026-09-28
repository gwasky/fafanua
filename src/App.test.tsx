import { render, screen } from '@testing-library/react'
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
})
