import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { navigation } from './data/navigation.ts'
import { processStages } from './data/process.ts'

const FUTURE_READY =
  'The strongest analytics and AI systems begin with trusted data.'

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

  it('renders the How We Work section directly after services', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: 'Services' })
    const process = screen.getByRole('region', { name: 'How We Work' })
    const nav = navigation.find((item) => item.label === 'How We Work')

    expect(services.nextElementSibling).toBe(process)
    expect(process.id).toBe(nav?.id)
    expect(
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'How We Work',
      }),
    ).toHaveAttribute('href', `#${process.id}`)
  })

  it('shows the four stages inside the How We Work section', () => {
    render(<App />)
    const process = screen.getByRole('region', { name: 'How We Work' })

    expect(
      within(process)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(processStages.map((stage) => stage.name))
  })

  it('renders the future-ready section directly after How We Work', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const process = screen.getByRole('region', { name: 'How We Work' })
    const futureReady = screen.getByRole('region', { name: FUTURE_READY })

    expect(futureReady.id).toBe('future-ready')
    expect(futureReady.parentElement).toBe(main)
    expect(process.nextElementSibling).toBe(futureReady)
    expect(main.lastElementChild).not.toBe(futureReady)
  })

  it('renders the About section directly after future-ready, last in main', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const futureReady = screen.getByRole('region', { name: FUTURE_READY })
    const about = screen.getByRole('region', { name: 'About Fafanua' })

    expect(about.parentElement).toBe(main)
    expect(futureReady.nextElementSibling).toBe(about)
    expect(main.lastElementChild).toBe(about)
  })

  it('lands the header About link, desktop and mobile, on the About section', () => {
    render(<App />)
    const about = screen.getByRole('region', { name: 'About Fafanua' })
    const nav = navigation.find((item) => item.label === 'About')
    // The desktop row and the mobile menu are the same list, so there is
    // one About link for both.
    const links = within(screen.getByRole('banner')).getAllByRole('link', {
      name: 'About',
    })

    expect(about.id).toBe(nav?.id)
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '#about')
  })

  it('keeps the future-ready section out of the navigation and unlinked', () => {
    render(<App />)

    expect(navigation.map((item) => item.id)).not.toContain('future-ready')
    expect(document.querySelector('a[href*="future-ready"]')).toBeNull()
  })

  it('uses .surface-dark only on the future-ready section', () => {
    render(<App />)
    const dark = document.querySelectorAll('.surface-dark')

    expect(dark).toHaveLength(1)
    expect(dark[0]).toBe(screen.getByRole('region', { name: FUTURE_READY }))
    expect(dark[0].querySelector('.surface-alt')).toBeNull()
  })

  it('orders headings h1, h2 Services, six h3s, h2 How We Work, four h3s, h2 future-ready, h2 About Fafanua', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading')
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toEqual([1, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 2])
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(headings[1].textContent).toBe('Services')
    expect(headings[8].textContent).toBe('How We Work')
    expect(headings[13].textContent).toBe(FUTURE_READY)
    expect(headings[14].textContent).toBe('About Fafanua')
  })
})
