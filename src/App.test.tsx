import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { navigation } from './data/navigation.ts'
import { processStages } from './data/process.ts'
import { managedServices, servicesIntro } from './data/services.ts'
import { solutions } from './data/solutions.ts'

const FUTURE_READY = 'Trusted foundations for what comes next'
const CONTACT = 'Discuss your data foundation.'

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

  it('renders the Solutions section directly after Services', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: 'Services' })
    const solutions = screen.getByRole('region', { name: 'Solutions' })
    const nav = navigation.find((item) => item.label === 'Solutions')

    expect(services.nextElementSibling).toBe(solutions)
    expect(solutions.id).toBe(nav?.id)
    expect(solutions).not.toHaveClass('surface-alt')
    expect(solutions).not.toHaveClass('surface-dark')
    for (const landmark of [screen.getByRole('banner'), screen.getByRole('contentinfo')]) {
      expect(
        within(landmark).getByRole('link', { name: 'Solutions' }),
      ).toHaveAttribute('href', `#${solutions.id}`)
    }
  })

  it('renders the How We Work section directly after Solutions', () => {
    render(<App />)
    const solutions = screen.getByRole('region', { name: 'Solutions' })
    const process = screen.getByRole('region', { name: 'How We Work' })
    const nav = navigation.find((item) => item.label === 'How We Work')

    expect(solutions.nextElementSibling).toBe(process)
    expect(process.id).toBe(nav?.id)
    expect(
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'How We Work',
      }),
    ).toHaveAttribute('href', `#${process.id}`)
  })

  it('never puts two .surface-alt sections next to each other', () => {
    render(<App />)
    const sections = [...screen.getByRole('main').children]

    for (let i = 1; i < sections.length; i++) {
      expect(
        sections[i - 1].classList.contains('surface-alt') &&
          sections[i].classList.contains('surface-alt'),
      ).toBe(false)
    }
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

  it('renders the About section directly after future-ready', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const futureReady = screen.getByRole('region', { name: FUTURE_READY })
    const about = screen.getByRole('region', { name: 'About Fafanua' })

    expect(about.parentElement).toBe(main)
    expect(futureReady.nextElementSibling).toBe(about)
    expect(main.lastElementChild).not.toBe(about)
  })

  it('renders the Contact section directly after About, last in main', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const about = screen.getByRole('region', { name: 'About Fafanua' })
    const contact = screen.getByRole('region', { name: CONTACT })

    expect(contact.parentElement).toBe(main)
    expect(about.nextElementSibling).toBe(contact)
    expect(main.lastElementChild).toBe(contact)
  })

  it('lands the header Contact link and the hero button on section#contact', () => {
    render(<App />)
    const contact = screen.getByRole('region', { name: CONTACT })
    const nav = navigation.find((item) => item.label === 'Contact')
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', { name: 'Contact' }),
      screen.getByRole('link', { name: 'Contact our team' }),
    ]

    expect(contact.tagName).toBe('SECTION')
    expect(contact.id).toBe('contact')
    expect(contact.id).toBe(nav?.id)
    for (const link of targets) {
      expect(link).toHaveAttribute('href', '#contact')
    }
    expect(document.querySelectorAll('#contact')).toHaveLength(1)
  })

  it('renders the footer after main, outside it, as the only contentinfo', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const footers = screen.getAllByRole('contentinfo')

    expect(footers).toHaveLength(1)
    expect(main).not.toContainElement(footers[0])
    expect(footers[0].closest('main, section, article')).toBeNull()
    expect(footers[0].parentElement).toBe(main.parentElement)
    expect(main.nextElementSibling).toBe(footers[0])
  })

  it('orders the landmarks banner, main, contentinfo', () => {
    render(<App />)
    const landmarks = [
      screen.getByRole('banner'),
      screen.getByRole('main'),
      screen.getByRole('contentinfo'),
    ]

    for (let i = 1; i < landmarks.length; i++) {
      expect(
        landmarks[i - 1].compareDocumentPosition(landmarks[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('gives every mailto link on the page the exact address, three in all', () => {
    render(<App />)
    const links = document.querySelectorAll('a[href^="mailto:"]')

    expect(links).toHaveLength(3)
    for (const link of links) {
      expect(link.getAttribute('href')).toBe('mailto:info@fafanua.tech')
      expect(link).not.toHaveAttribute('target')
    }
    expect(document.querySelectorAll('a[href*="mailto" i]')).toHaveLength(3)
  })

  it('has no form, iframe or Turnstile script', () => {
    render(<App />)

    expect(document.querySelectorAll('form, iframe, textarea')).toHaveLength(0)
    expect(
      document.querySelector('script[src*="challenges.cloudflare.com"]'),
    ).toBeNull()
    expect(document.body.innerHTML).not.toContain('challenges.cloudflare.com')
  })

  it('has no duplicate ids', () => {
    render(<App />)
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id)

    expect(new Set(ids).size).toBe(ids.length)
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

  // "Intelligence" is allowed only where the services-positioning doc uses
  // it for a service or solution, never as a Fafanua product name.
  it('never names Fafanua Intelligence or shows a "Ready for AI?" callout', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toMatch(/Fafanua Intelligence/i)
    expect(text).not.toMatch(/Ready for AI/i)
    expect(
      text.replace(/(business|payment) intelligence/gi, ''),
    ).not.toMatch(/intelligence/i)
  })

  it('orders headings h1, h2 Services, intro h3, six h3s, managed-services h3, h2 Solutions, five h3s, h2 How We Work, four h3s, h2 future-ready, h2 About Fafanua, h2 Contact', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading')
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toEqual([
      1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 2, 2,
    ])
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(headings[1].textContent).toBe('Services')
    expect(headings[2].textContent).toBe(servicesIntro.heading)
    expect(headings[9].textContent).toBe(managedServices.heading)
    expect(headings[10].textContent).toBe('Solutions')
    expect(headings.slice(11, 16).map((heading) => heading.textContent)).toEqual(
      solutions.map((solution) => solution.title),
    )
    expect(headings[16].textContent).toBe('How We Work')
    expect(headings[21].textContent).toBe(FUTURE_READY)
    expect(headings[22].textContent).toBe('About Fafanua')
    expect(headings[23].textContent).toBe(CONTACT)
    expect(
      within(screen.getByRole('contentinfo')).queryAllByRole('heading'),
    ).toHaveLength(0)
  })
})
