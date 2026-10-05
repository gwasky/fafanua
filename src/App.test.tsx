import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { navigation, navigationCta } from './data/navigation.ts'
import { processStages } from './data/process.ts'
import { managedServices, services, servicesIntro } from './data/services.ts'
import { solutions } from './data/solutions.ts'
import { systemFlow } from './data/systemFlow.ts'

const FUTURE_READY = 'Trusted foundations for what comes next'
const CONTACT = 'Discuss your data foundation.'
const HERO = 'Trusted Data. Better Decisions.'
// The Services section is named by its h2, the approved intro heading.
const SERVICES = servicesIntro.heading
// The Managed Services section is named by its h2, the plan V2 §10 heading.
const MANAGED = managedServices.sectionHeading
const POSITIONING =
  'Fafanua helps organisations build reliable data foundations, connect fragmented systems, improve trust in their data, and turn information into useful business intelligence.'
const STATEMENT =
  'Fafanua helps East African businesses, government institutions and development organisations establish trusted data foundations for reliable reporting, better decisions and future governed analytics and AI.'

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
    expect(headings[0]).toHaveAccessibleName(HERO)
    expect(screen.getByRole('main')).toContainElement(headings[0])
  })

  it('renders the hero as the first child of main', () => {
    render(<App />)
    const hero = screen.getByRole('region', { name: HERO })

    expect(screen.getByRole('main').firstElementChild).toBe(hero)
    expect(hero).toHaveAttribute('data-header-overlay')
    expect(hero).toHaveClass('surface-dark')
  })

  it('renders the positioning section after the hero, then Services, inside main', () => {
    render(<App />)
    const hero = screen.getByRole('region', { name: HERO })
    const lead = screen.getByText(POSITIONING)
    const statement = screen.getByText(STATEMENT)
    const positioning = hero.nextElementSibling
    const services = screen.getByRole('region', { name: SERVICES })

    expect(screen.getByRole('main')).toContainElement(services)
    expect(hero).not.toContainElement(statement)
    expect(positioning).not.toBeNull()
    expect(positioning!.tagName).toBe('DIV')
    expect(positioning).toContainElement(lead)
    expect(positioning).toContainElement(statement)
    expect(
      lead.compareDocumentPosition(statement) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(positioning).not.toHaveClass('surface-dark')
    expect(positioning).not.toHaveClass('surface-alt')
    expect(positioning!.nextElementSibling).toBe(services)
  })

  it('orders main as hero, positioning, Services, Managed, Solutions, How We Work, future-ready, About, Contact', () => {
    render(<App />)
    const children = [...screen.getByRole('main').children]

    expect(children).toEqual([
      screen.getByRole('region', { name: HERO }),
      screen.getByText(POSITIONING).closest('.positioning'),
      screen.getByRole('region', { name: SERVICES }),
      screen.getByRole('region', { name: MANAGED }),
      screen.getByRole('region', { name: 'Solutions' }),
      screen.getByRole('region', { name: 'How We Work' }),
      screen.getByRole('region', { name: FUTURE_READY }),
      screen.getByRole('region', { name: 'About Fafanua' }),
      screen.getByRole('region', { name: CONTACT }),
    ])
  })

  it('places the system diagram in Services, after the card list, last', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: SERVICES })
    const flow = screen.getByRole('list', { name: systemFlow.heading })
    const diagram = flow.parentElement!
    const cards = within(services)
      .getAllByRole('list')
      .find((list) => within(list).queryAllByRole('heading', { level: 3 }).length === 6)!

    expect(services).toContainElement(diagram)
    expect(cards.nextElementSibling).toBe(diagram)
    expect(diagram.nextElementSibling).toBeNull()
    expect(diagram.closest('section')).toBe(services)
  })

  it('renders the Managed Services section directly after Services and before Solutions', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const services = screen.getByRole('region', { name: SERVICES })
    const managed = screen.getByRole('region', { name: MANAGED })

    expect(managed.id).toBe('managed-services')
    expect(managed.parentElement).toBe(main)
    expect(services).not.toContainElement(managed)
    expect(services.nextElementSibling).toBe(managed)
    expect(managed.nextElementSibling).toBe(
      screen.getByRole('region', { name: 'Solutions' }),
    )
    expect(document.querySelectorAll('#managed-services')).toHaveLength(1)
  })

  it('has exactly two technical grids, in the hero and the future-ready section', () => {
    render(<App />)
    const grids = [...document.querySelectorAll('.technical-grid')]

    expect(grids).toHaveLength(2)
    expect(grids[0].parentElement).toBe(screen.getByRole('region', { name: HERO }))
    expect(grids[1].parentElement).toBe(
      screen.getByRole('region', { name: FUTURE_READY }),
    )
  })

  it('lands the header and hero Services links on the services section', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: SERVICES })
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Services',
      }),
      screen.getByRole('link', { name: 'Explore our capabilities' }),
    ]

    for (const link of targets) {
      expect(link).toHaveAttribute('href', `#${services.id}`)
    }
  })

  it('renders the Solutions section directly after Managed Services', () => {
    render(<App />)
    const managed = screen.getByRole('region', { name: MANAGED })
    const solutions = screen.getByRole('region', { name: 'Solutions' })
    const nav = navigation.find((item) => item.label === 'Solutions')

    expect(managed.nextElementSibling).toBe(solutions)
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

  it('lands the header call to action and the hero button on section#contact', () => {
    render(<App />)
    const contact = screen.getByRole('region', { name: CONTACT })
    const nav = navigationCta
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', { name: 'Discuss a project' }),
      screen.getByRole('link', { name: 'Discuss your data needs' }),
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

  it('has two dark sections, the hero and future-ready, and the inset Managed panel', () => {
    render(<App />)
    const dark = [...document.querySelectorAll('.surface-dark')]
    const managed = screen.getByRole('region', { name: MANAGED })

    // The full-bleed dark sections are main's children.
    expect(
      [...screen.getByRole('main').children].filter((section) =>
        section.classList.contains('surface-dark'),
      ),
    ).toEqual([
      screen.getByRole('region', { name: HERO }),
      screen.getByRole('region', { name: FUTURE_READY }),
    ])
    // The Managed panel is inside its section's container, on paper.
    expect(dark).toHaveLength(3)
    expect(dark[1].parentElement).toHaveClass('container')
    expect(dark[1].parentElement!.parentElement).toBe(managed)
    expect(managed).not.toHaveClass('surface-dark')
    for (const section of dark) {
      expect(section.querySelector('.surface-alt')).toBeNull()
    }
    // Only the hero is pulled up under the transparent header.
    expect([...document.querySelectorAll('[data-header-overlay]')]).toEqual([
      screen.getByRole('region', { name: HERO }),
    ])
  })

  // "Intelligence" is allowed only where the services-positioning doc uses
  // it for a service or solution, and in the hero's supporting copy from
  // plan V2 §5 ("turn organisational data into intelligence"), never as a
  // Fafanua product name.
  it('never names Fafanua Intelligence or shows a "Ready for AI?" callout', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toMatch(/Fafanua Intelligence/i)
    expect(text).not.toMatch(/Ready for AI/i)
    expect(text.match(/organisational data into intelligence/g)).toHaveLength(1)
    expect(
      text
        .replace(/(business|payment) intelligence/gi, '')
        .replace('organisational data into intelligence', ''),
    ).not.toMatch(/intelligence/i)
  })

  it('orders headings h1, h2 Services intro heading, six h3s, the system diagram h3, h2 Managed, its h3, h2 Solutions, five h3s, h2 How We Work, four h3s, h2 future-ready, h2 About Fafanua, h2 Contact', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading')
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toEqual([
      1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 2, 2,
    ])
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    // No level is skipped.
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading ${i + 1}`).toBeLessThanOrEqual(levels[i - 1] + 1)
    }
    expect(headings[1].textContent).toBe(servicesIntro.heading)
    expect(headings.slice(2, 8).map((heading) => heading.textContent)).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[8].textContent).toBe(systemFlow.heading)
    expect(headings[9].textContent).toBe(MANAGED)
    expect(headings[10].textContent).toBe(managedServices.heading)
    expect(headings[11].textContent).toBe('Solutions')
    expect(headings.slice(12, 17).map((heading) => heading.textContent)).toEqual(
      solutions.map((solution) => solution.title),
    )
    expect(headings[17].textContent).toBe('How We Work')
    expect(headings[22].textContent).toBe(FUTURE_READY)
    expect(headings[23].textContent).toBe('About Fafanua')
    expect(headings[24].textContent).toBe(CONTACT)
    expect(
      within(screen.getByRole('contentinfo')).queryAllByRole('heading'),
    ).toHaveLength(0)
  })
})
