import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { aboutPrinciples } from './data/about.ts'
import {
  assessmentDeliverablesHeading,
  assessmentHeading,
  assessmentLead,
  assessmentNextStatement,
} from './data/assessment.ts'
import { futureReadyLinkText } from './data/futureReady.ts'
import { footerNavigation, navigation, navigationCta } from './data/navigation.ts'
import {
  positioningEyebrow,
  positioningFraming,
  positioningProblem,
  positioningTransition,
} from './data/positioning.ts'
import { processIntro, processStages } from './data/process.ts'
import { managedServices, services, servicesIntro } from './data/services.ts'
import { homepageSolutions, solutions, solutionsIntro } from './data/solutions.ts'
import { systemFlow } from './data/systemFlow.ts'

const FUTURE_READY = 'Trusted foundations for what comes next'
// About's h2 names its region (section D, #92); "About Fafanua" is now
// its eyebrow.
const ABOUT = 'Data foundations built for how organisations actually operate.'
// Plan V2 §16, with its typographic apostrophe (U+2019).
const CONTACT = 'Let\u2019s build a data foundation your organisation can trust.'
const HERO = 'Trusted Data. Better Decisions.'
// The Services section is named by its h2, W3's heading in the trust and
// lineage plan (#70; services.plan.test.ts checks it against the plan).
const SERVICES = servicesIntro.heading
// The Managed Services section is named by its h2, the plan V2 §10 heading.
const MANAGED = managedServices.sectionHeading
// The positioning section's problem (refinement plan §3), its statement,
// after the eyebrow and before the framing and the transition (#80). Its
// two sentences are two spans (W10, #80), so it is found as the paragraph
// whose whole text it is.
const POSITIONING = positioningProblem
const byPositioning = (_content: string, element: Element | null) =>
  element?.tagName === 'P' && element.textContent === POSITIONING
// The Data Trust Assessment section is named by its h2 (W4 in the trust
// and lineage plan, #71; assessment.plan.test.ts checks it).
const ASSESSMENT = assessmentHeading
// The paragraphs W3 in the trust and lineage plan removed because they
// restated the hero (#70): the positioning section's response and the two
// Services intro paragraphs.
const REMOVED = [
  'Fafanua helps organisations build and strengthen the foundations underneath reporting, analytics and operations',
  'Fafanua helps organisations design modern data platforms, connect business systems',
  'Our capabilities span the full data lifecycle',
]

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

  // W4 in the trust and lineage plan (#71) puts the Data Trust Assessment
  // between the positioning section and Services, which plan V2 and the
  // refinement plan had as neighbours; W4 wins there (plan §2.6).
  it('renders the positioning section after the hero, then the Data Trust Assessment, then Services, inside main', () => {
    render(<App />)
    const hero = screen.getByRole('region', { name: HERO })
    const lead = screen.getByText(byPositioning)
    const positioning = hero.nextElementSibling
    const assessment = screen.getByRole('region', { name: ASSESSMENT })
    const services = screen.getByRole('region', { name: SERVICES })

    expect(screen.getByRole('main')).toContainElement(services)
    expect(hero).not.toContainElement(lead)
    expect(positioning).not.toBeNull()
    expect(positioning!.tagName).toBe('DIV')
    expect(positioning).toContainElement(lead)
    // Four paragraphs, the eyebrow, the problem, the framing and the
    // transition (#79, in W10's order, #80), and nothing focusable (#70).
    expect([...positioning!.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      positioningEyebrow,
      positioningProblem,
      positioningFraming,
      positioningTransition,
    ])
    expect(positioning!.querySelectorAll('p')[1]).toBe(lead)
    expect(positioning!.querySelector('h1, h2, h3, a, button, [tabindex]')).toBeNull()
    expect(positioning).not.toHaveClass('surface-dark')
    expect(positioning).not.toHaveClass('surface-alt')
    expect(positioning!.nextElementSibling).toBe(assessment)
    expect(assessment.previousElementSibling).toBe(positioning)
    expect(assessment.nextElementSibling).toBe(services)
    expect(services.previousElementSibling).toBe(assessment)
  })

  it('renders the Data Trust Assessment as a section#data-trust-assessment on paper holding a dark panel, out of the navigation (#71, #82)', () => {
    render(<App />)
    const assessment = screen.getByRole('region', { name: ASSESSMENT })
    const main = screen.getByRole('main')

    expect(assessment.tagName).toBe('SECTION')
    expect(assessment.id).toBe('data-trust-assessment')
    expect(assessment.parentElement).toBe(main)
    expect(assessment).toHaveAttribute('data-reveal', 'section')
    // On paper: neither an alternate nor a dark surface itself, holding
    // one dark panel inset in its container (#82), with a light card in it,
    // and no alternate surface or technical grid.
    expect(assessment).not.toHaveClass('surface-alt')
    expect(assessment).not.toHaveClass('surface-dark')
    expect(assessment.querySelector('.surface-alt, .technical-grid')).toBeNull()
    const panels = assessment.querySelectorAll('.surface-dark')
    expect(panels).toHaveLength(1)
    expect(panels[0].parentElement).toHaveClass('container')
    expect(panels[0].parentElement!.parentElement).toBe(assessment)
    expect(panels[0].querySelectorAll('.surface-light')).toHaveLength(1)
    expect(assessment).not.toHaveAttribute('data-header-overlay')
    // Its two eyebrows are unnumbered, as the problem block's is (#79,
    // #82), so 01 to 05 keep their numbers.
    expect(
      [...assessment.querySelectorAll('.section-eyebrow')].map((eyebrow) => eyebrow.textContent),
    ).toEqual(['Start with trust', 'What happens next'])
    expect(
      [...document.querySelectorAll('.section-eyebrow')].map((eyebrow) => eyebrow.textContent),
    ).toEqual([
      'The problem',
      'Start with trust',
      'What happens next',
      '01 — Capabilities',
      '02 — Managed Services',
      '03 — Solutions',
      '04 — How We Work',
      '05 — About Fafanua',
    ])
    // Not in the header or footer navigation, and nothing links to it.
    for (const item of [...navigation, ...footerNavigation, navigationCta]) {
      expect(item.id).not.toBe(assessment.id)
    }
    // Exactly two links lead to it, outside the header and footer: the
    // first step of the Managed Services journey (#88), and the
    // future-ready section's "See how the assessment works" (#91).
    const toAssessment = [...document.querySelectorAll(`a[href*="${assessment.id}"]`)]
    expect(toAssessment).toHaveLength(2)
    for (const link of toAssessment) {
      expect(link).toHaveAttribute('href', `#${assessment.id}`)
      expect(screen.getByRole('banner')).not.toContainElement(link as HTMLElement)
      expect(screen.getByRole('contentinfo')).not.toContainElement(link as HTMLElement)
    }
    expect(toAssessment[0].textContent).toBe(managedServices.journey[0])
    expect(
      screen.getByRole('navigation', { name: managedServices.journeyLabel }),
    ).toContainElement(toAssessment[0] as HTMLElement)
    expect(screen.getByRole('region', { name: MANAGED })).toContainElement(
      toAssessment[0] as HTMLElement,
    )
    expect(screen.getByRole('region', { name: FUTURE_READY })).toContainElement(
      toAssessment[1] as HTMLElement,
    )
    expect(toAssessment[1]).toHaveAccessibleName(futureReadyLinkText)
    expect(
      within(screen.getByRole('banner')).getAllByRole('link').map((link) => link.textContent),
    ).not.toContain(ASSESSMENT)
  })

  // The inline SVG illustrations the design system allows are the system
  // diagram's return loop (owner decision on #63) and the decorative
  // contour lines in the assessment's dark panel (#82); the only other
  // inline SVG is the header logo (#86), the one SVG with role="img" and
  // a name. The capability cells have no chevrons since the open grid
  // (#83), and the Solutions rows none since they became links (#89). Its sprite is in
  // index.html, not rendered by App. No canvas anywhere, and the only
  // image is the footer logo.
  it('has no inline SVG but the header logo, the diagram\'s loop and the assessment\'s contours, and no canvas', () => {
    render(<App />)
    const svgs = [...document.querySelectorAll('svg')]
    const count = (name: string) => svgs.filter((svg) => svg.getAttribute('class') === name).length

    expect(count('system-flow__loop')).toBe(1)
    expect(document.querySelector('.system-flow svg')).toHaveClass('system-flow__loop')
    expect(count('service-card__chevron')).toBe(0)
    expect(document.querySelector('#capabilities .services__list svg')).toBeNull()
    // The Solutions rows are links with a text arrow, no chevron (#89).
    expect(count('solution-row__chevron')).toBe(0)
    expect(document.querySelector('#solutions svg')).toBeNull()
    expect(count('trust-assessment__contours')).toBe(1)
    expect(document.querySelector('#data-trust-assessment svg')).toHaveClass('trust-assessment__contours')
    expect(count('site-header__logo-art')).toBe(1)
    expect(svgs).toHaveLength(1 + 1 + 1)
    const logo = within(screen.getByRole('banner')).getByRole('img', { name: 'Fafanua Technologies' })
    expect(logo).toHaveClass('site-header__logo-art')
    for (const svg of svgs) {
      if (svg === (logo as Element)) expect(svg).not.toHaveAttribute('aria-hidden')
      else expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
    expect(document.querySelectorAll('canvas')).toHaveLength(0)
    expect([...document.querySelectorAll('img')].map((img) => img.closest('header, footer')?.tagName)).toEqual([
      'FOOTER',
    ])
  })

  it('shows neither paragraph the refinement replaced anywhere on the page (#63)', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toContain('Fafanua helps organisations build reliable data foundations')
    expect(text).not.toContain('Fafanua helps East African businesses')
  })

  it('shows none of the paragraphs that restated the hero (#70)', () => {
    render(<App />)
    const text = document.body.textContent!

    for (const removed of REMOVED) expect(text).not.toContain(removed)
    // The hero paragraph is the only text about tracing numbers to their
    // source, apart from the problem block's transition into the
    // assessment, the owner's bridge (#79), and the lead of the
    // Data Trust Assessment, W4's own description of the offer (#71), and
    // the capabilities section's promise line, the open grid plan's one
    // new string (#83), and the Solutions intro line, section A of the
    // homepage sections refinement plan (#89), and the Assess step's
    // description in How We Work, section B of the same plan (#90): no
    // other paragraph in main repeats it. ("Traceable" in the diagram's
    // terms is not the hero's claim, and "traceability" is gone from the
    // process stages, #90.)
    const hero = screen.getByRole('region', { name: HERO })
    const tracing = [...screen.getByRole('main').querySelectorAll('p')].filter((p) =>
      /\btrace\b|to the source|back to (its|their) source/i.test(p.textContent!),
    )
    expect(tracing).toHaveLength(6)
    expect(hero).toContainElement(tracing[0])
    expect(tracing[1]).toBe(screen.getByText(positioningTransition))
    expect(tracing[1].closest('.positioning')).toBe(hero.nextElementSibling)
    expect(tracing[2]).toBe(screen.getByText(assessmentLead))
    expect(screen.getByRole('region', { name: ASSESSMENT })).toContainElement(tracing[2])
    expect(tracing[3]).toBe(screen.getByText(servicesIntro.promise))
    expect(screen.getByRole('region', { name: SERVICES })).toContainElement(tracing[3])
    expect(tracing[4]).toBe(screen.getByText(solutionsIntro.intro))
    expect(screen.getByRole('region', { name: solutionsIntro.heading })).toContainElement(tracing[4])
    expect(tracing[5].textContent).toBe(processStages[0].description)
    expect(screen.getByRole('region', { name: processIntro.heading })).toContainElement(tracing[5])
  })

  it('has the Services h2 W3 names, and no h2 that says "business intelligence" (#70)', () => {
    render(<App />)
    const h2s = screen.getAllByRole('heading', { level: 2 })

    expect(SERVICES).toMatch(/^From fragmented data to numbers you can /)
    expect(screen.getByRole('heading', { level: 2, name: SERVICES })).toHaveAttribute(
      'id',
      'capabilities-heading',
    )
    for (const h2 of h2s) expect(h2.textContent).not.toMatch(/business intelligence/i)
    // The card h3 is service copy and stays (read from the data, as service
    // copy may not be repeated outside services.ts).
    const bi = services.find((service) => /business intelligence/i.test(service.name))!
    expect(screen.getByRole('heading', { level: 3, name: bi.name })).toBeInTheDocument()
  })

  it('orders main as hero, positioning, Data Trust Assessment, Services, Managed, Solutions, How We Work, future-ready, About, Contact', () => {
    render(<App />)
    const children = [...screen.getByRole('main').children]

    expect(children).toEqual([
      screen.getByRole('region', { name: HERO }),
      screen.getByText(byPositioning).closest('.positioning'),
      screen.getByRole('region', { name: ASSESSMENT }),
      screen.getByRole('region', { name: SERVICES }),
      screen.getByRole('region', { name: MANAGED }),
      screen.getByRole('region', { name: solutionsIntro.heading }),
      screen.getByRole('region', { name: processIntro.heading }),
      screen.getByRole('region', { name: FUTURE_READY }),
      screen.getByRole('region', { name: ABOUT }),
      screen.getByRole('region', { name: CONTACT }),
    ])
  })

  it('places the system diagram in Services, after the card list, last', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: SERVICES })
    const flow = screen.getByRole('list', { name: systemFlow.heading })
    const diagram = flow.closest('.system-flow') as HTMLElement
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
      screen.getByRole('region', { name: solutionsIntro.heading }),
    )
    expect(document.querySelectorAll('#managed-services')).toHaveLength(1)
    // The capabilities section, on paper, separates the assessment's dark
    // panel from this one (the Managed Services Regrouped plan §4, #88).
    expect(services.id).toBe('capabilities')
    expect(services.previousElementSibling?.id).toBe('data-trust-assessment')
    expect(services).not.toHaveClass('surface-dark')
    expect(services.querySelector('.surface-dark')).toBeNull()
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

  it('lands the header and footer Services links and the hero\'s capabilities link on the capabilities section (#68, #83)', () => {
    render(<App />)
    const services = screen.getByRole('region', { name: SERVICES })
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Services',
      }),
      within(screen.getByRole('contentinfo')).getByRole('link', {
        name: 'Services',
      }),
    ]

    const heroLink = within(screen.getByRole('region', { name: HERO })).getByRole('link', {
      name: 'Explore our capabilities',
    })
    const nav = navigation.find((item) => item.label === 'Services')!

    expect(services.id).toBe('capabilities')
    expect(nav.id).toBe(services.id)
    for (const link of [...targets, heroLink]) {
      expect(link).toHaveAttribute('href', `#${services.id}`)
    }
    // The hero has no "Services" link of its own.
    expect(
      within(screen.getByRole('region', { name: HERO })).queryByRole('link', { name: 'Services' }),
    ).not.toBeInTheDocument()
  })

  it('renders the Solutions section directly after Managed Services', () => {
    render(<App />)
    const managed = screen.getByRole('region', { name: MANAGED })
    const solutions = screen.getByRole('region', { name: solutionsIntro.heading })
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
    const solutions = screen.getByRole('region', { name: solutionsIntro.heading })
    const process = screen.getByRole('region', { name: processIntro.heading })
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

  it('names the Solutions and How We Work regions by their h2s, after their eyebrows', () => {
    render(<App />)
    const solutionsRegion = screen.getByRole('region', { name: solutionsIntro.heading })
    const process = screen.getByRole('region', { name: processIntro.heading })

    expect(solutionsRegion.querySelector('.section-eyebrow')?.textContent).toBe(
      '03 — Solutions',
    )
    expect(process.querySelector('.section-eyebrow')?.textContent).toBe(
      '04 — How We Work',
    )
    // The eyebrows are paragraphs, so they add nothing to the outline.
    expect(screen.queryByRole('heading', { name: /03 — |04 — / })).toBeNull()
  })

  it('shows the four stages inside the How We Work section', () => {
    render(<App />)
    const process = screen.getByRole('region', { name: processIntro.heading })

    expect(
      within(process)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(processStages.map((stage) => stage.name))
  })

  it('renders the future-ready section directly after How We Work', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const process = screen.getByRole('region', { name: processIntro.heading })
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
    const about = screen.getByRole('region', { name: ABOUT })

    expect(about.parentElement).toBe(main)
    expect(futureReady.nextElementSibling).toBe(about)
    expect(main.lastElementChild).not.toBe(about)
  })

  it('renders the Contact section directly after About, last in main', () => {
    render(<App />)
    const main = screen.getByRole('main')
    const about = screen.getByRole('region', { name: ABOUT })
    const contact = screen.getByRole('region', { name: CONTACT })

    expect(contact.parentElement).toBe(main)
    expect(about.nextElementSibling).toBe(contact)
    expect(main.lastElementChild).toBe(contact)
  })

  it('shows the W9 supporting line in the homepage closing section, once (#74)', () => {
    render(<App />)
    const contact = screen.getByRole('region', { name: CONTACT })
    const line =
      'Which number do you trust least? Tell us about the reports and figures your organisation relies on.'

    expect([...contact.querySelectorAll('p')].map((p) => p.textContent)).toEqual([line])
    expect(document.body.textContent?.split(line)).toHaveLength(2)
    expect(document.body.textContent).not.toContain('reporting challenges')
  })

  it('lands the header call to action and the hero button on section#contact', () => {
    render(<App />)
    const contact = screen.getByRole('region', { name: CONTACT })
    const nav = navigationCta
    // The closing call to action shares the header's and the hero's
    // name but opens an email, so each is found inside its landmark.
    const targets = [
      within(screen.getByRole('banner')).getByRole('link', { name: 'Book a data trust assessment' }),
      within(screen.getByRole('region', { name: HERO })).getByRole('link', {
        name: 'Book a data trust assessment',
      }),
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

  it('has two tel: links, in the closing call to action and the footer, to the one number', () => {
    render(<App />)
    const links = [...document.querySelectorAll('a[href^="tel:"]')]

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'tel:+256752008822',
      'tel:+256752008822',
    ])
    expect(links.map((link) => link.textContent)).toEqual(['+256 752 008 822', '+256 752 008 822'])
    expect(screen.getByRole('region', { name: CONTACT })).toContainElement(links[0] as HTMLElement)
    expect(screen.getByRole('contentinfo')).toContainElement(links[1] as HTMLElement)
  })

  it('gives the header, hero, Data Trust Assessment and closing buttons one label, with the retired labels gone (#68, #71)', () => {
    render(<App />)
    const buttons = [
      within(screen.getByRole('banner')).getByRole('link', { name: navigationCta.label }),
      within(screen.getByRole('region', { name: HERO })).getByRole('link', {
        name: navigationCta.label,
      }),
      within(screen.getByRole('region', { name: ASSESSMENT })).getByRole('link', {
        name: navigationCta.label,
      }),
      within(screen.getByRole('region', { name: CONTACT })).getByRole('link', {
        name: navigationCta.label,
      }),
    ]

    expect(navigationCta.label).toBe('Book a data trust assessment')
    expect(buttons.map((button) => button.getAttribute('href'))).toEqual([
      '#contact',
      '#contact',
      '#contact',
      'mailto:info@fafanua.tech',
    ])
    for (const button of buttons) {
      expect(button).toHaveClass('button')
      expect(button.textContent).toBe('Book a data trust assessment→')
      expect(button.lastElementChild).toHaveAttribute('aria-hidden', 'true')
    }
    expect(screen.getAllByRole('link', { name: navigationCta.label })).toHaveLength(4)
    for (const retired of ['Discuss a project', 'Discuss your data needs']) {
      expect(document.body.textContent).not.toContain(retired)
    }
    // Restored on #83 as the hero's text link, not a button: once on the
    // page.
    expect(document.body.textContent!.split('Explore our capabilities')).toHaveLength(2)
    const heroLinks = within(screen.getByRole('region', { name: HERO })).getAllByRole('link')
    expect(heroLinks.map((link) => link.textContent)).toEqual([
      'Book a data trust assessment→',
      'Explore our capabilities',
    ])
    expect(heroLinks[1]).not.toHaveClass('button')
    expect(screen.getByRole('region', { name: HERO }).querySelectorAll('.button')).toHaveLength(1)
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
    const about = screen.getByRole('region', { name: ABOUT })
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

  it('has two dark sections, the hero and future-ready, the inset assessment and Managed panels and the dark footer', () => {
    render(<App />)
    const dark = [...document.querySelectorAll('.surface-dark')]
    const managed = screen.getByRole('region', { name: MANAGED })
    const assessment = screen.getByRole('region', { name: ASSESSMENT })

    // The full-bleed dark sections are main's children.
    expect(
      [...screen.getByRole('main').children].filter((section) =>
        section.classList.contains('surface-dark'),
      ),
    ).toEqual([
      screen.getByRole('region', { name: HERO }),
      screen.getByRole('region', { name: FUTURE_READY }),
    ])
    // In order: the hero, the assessment panel (#82), the Managed panel,
    // How We Work's highlighted step 01 card (#90), future-ready and the
    // footer. Each panel is inside its section's container, on paper, the
    // card is inside its step, on the graphite 100 section, and the footer
    // (#60) is the last dark surface, outside main.
    const process = screen.getByRole('region', { name: processIntro.heading })
    expect(dark).toHaveLength(6)
    expect(dark[0]).toBe(screen.getByRole('region', { name: HERO }))
    expect(dark[3]).toHaveClass('process__card')
    expect(dark[3].closest('li')).toBe(process.querySelector('li'))
    expect(process).not.toHaveClass('surface-dark')
    expect(process).toHaveClass('surface-alt')
    expect(dark[4]).toBe(screen.getByRole('region', { name: FUTURE_READY }))
    expect(dark[5]).toBe(screen.getByRole('contentinfo'))
    expect(dark[1].parentElement).toHaveClass('container')
    expect(dark[1].parentElement!.parentElement).toBe(assessment)
    expect(assessment).not.toHaveClass('surface-dark')
    expect(dark[2].parentElement).toHaveClass('container')
    expect(dark[2].parentElement!.parentElement).toBe(managed)
    expect(managed).not.toHaveClass('surface-dark')
    for (const section of dark) {
      expect(section.querySelector('.surface-alt')).toBeNull()
    }
    // Only the hero is pulled up under the transparent header.
    expect([...document.querySelectorAll('[data-header-overlay]')]).toEqual([
      screen.getByRole('region', { name: HERO }),
    ])
  })

  // The vocabulary rules in section 6 of the trust and lineage plan (W6,
  // #72): "provenance" and "data operating system" are retired, and
  // homepage copy says "organisations in Africa" rather than "African
  // organisations" or a single region's businesses.
  it('uses none of the retired vocabulary anywhere on the homepage (W6)', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toMatch(/provenance/i)
    expect(text).not.toMatch(/data operating system/i)
    expect(text).not.toMatch(/operating data system/i)
    expect(text).not.toMatch(/African organisations/i)
    expect(text).not.toMatch(/East African businesses/i)
    expect(text).toContain('organisations in Africa')
    expect(text).toContain(systemFlow.heading)
  })

  // Section 6 also says not to stack "trusted", "reliable" and
  // "dependable" in one section. The Services section and the Managed
  // Services panel are service copy (the services-positioning doc), out of
  // scope for #72, so they are not checked here.
  it('stacks "trusted", "reliable" and "dependable" in no section outside service copy (W6)', () => {
    render(<App />)
    // Every child of main (the positioning block is not a section).
    const sections = [...screen.getByRole('main').children].filter(
      (section) => !['capabilities', 'managed-services'].includes(section.id),
    )

    expect(sections).toHaveLength(8)
    for (const section of sections) {
      const text = section.textContent!
      const all = [/\btrust/i, /\breliab/i, /\bdependab/i].every((word) => word.test(text))
      expect(all, `${section.id || section.className} stacks all three`).toBe(false)
    }
  })

  // "Intelligence" is allowed only as "business intelligence" (the
  // services-positioning doc's services and solutions) and "payment
  // intelligence", never as a Fafanua product name. The hero's supporting
  // copy no longer says "business intelligence" (W2 in the trust and
  // lineage plan, #69).
  it('never names Fafanua Intelligence or shows a "Ready for AI?" callout', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toMatch(/Fafanua Intelligence/i)
    expect(text).not.toMatch(/Ready for AI/i)
    expect(text).not.toMatch(/organisational information into reliable business intelligence/)
    expect(text).toMatch(/business intelligence/i)
    expect(text.replace(/(business|payment) intelligence/gi, '')).not.toMatch(/intelligence/i)
  })

  // The dark panel plan removed these from the homepage (#79, #82). The
  // Public Sector landing page's plan copy uses both, on that page only
  // (#93), so assessment.plan.test.ts leaves its copy module out of the
  // source scan; the homepage must still show neither.
  it('shows neither the old example caption nor the after-assessment label', () => {
    render(<App />)
    const text = document.body.textContent!

    expect(text).not.toContain('Illustrative example. Sample data only.')
    expect(text).not.toContain('After the assessment')
  })

  it('orders headings h1, h2 Data Trust Assessment, its two h3s, h2 Services intro heading, six h3s, the system diagram h3, h2 Managed, its four verb h3s, h2 Solutions heading, four h3s, h2 How We Work heading, four h3s, h2 future-ready, h2 About heading, its three principle h3s, h2 Contact', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading')
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)))

    expect(levels).toEqual([
      1, 2, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2,
      2, 3, 3, 3, 2,
    ])
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    // No level is skipped.
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading ${i + 1}`).toBeLessThanOrEqual(levels[i - 1] + 1)
    }
    expect(headings.slice(1, 4).map((heading) => heading.textContent)).toEqual([
      ASSESSMENT,
      assessmentDeliverablesHeading,
      assessmentNextStatement,
    ])
    expect(headings[4].textContent).toBe(servicesIntro.heading)
    // Each title's arrow is aria-hidden; its text is the service's name.
    expect(headings.slice(5, 11).map((heading) => heading.textContent!.replace(/\u00A0→$/, ''))).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[11].textContent).toBe(systemFlow.heading)
    expect(headings[12].textContent).toBe(MANAGED)
    // Its four verb h3s (#88); the service link is no longer a heading.
    expect(headings.slice(13, 17).map((heading) => heading.textContent)).toEqual([
      'Monitor',
      'Maintain',
      'Improve',
      'Activate',
    ])
    expect(headings.map((heading) => heading.textContent)).not.toContain(managedServices.heading)
    expect(headings[17].textContent).toBe(solutionsIntro.heading)
    // Each sector h3 holds its row's one link, named by the title alone
    // (#89). The homepage's four sectors, in W7's order (#73) with Public
    // Sector added second by section A (#95).
    expect(headings.slice(18, 22).map((heading) => heading.textContent)).toEqual([
      'Health',
      'Public Sector',
      'Financial Services',
      'Education',
    ])
    headings.slice(18, 22).forEach((heading, index) => {
      expect(heading).toHaveAccessibleName(homepageSolutions[index].title)
      expect(within(heading).getByRole('link')).toHaveAccessibleName(
        homepageSolutions[index].title,
      )
    })
    expect(headings[22].textContent).toBe(processIntro.heading)
    expect(headings.slice(23, 27).map((heading) => heading.textContent)).toEqual(
      processStages.map((stage) => stage.name),
    )
    expect(headings[27].textContent).toBe(FUTURE_READY)
    expect(headings[28].textContent).toBe(ABOUT)
    // About's three principles (section D, #92).
    expect(headings.slice(29, 32).map((heading) => heading.textContent)).toEqual(
      aboutPrinciples.map((principle) => principle.name),
    )
    expect(headings[32].textContent).toBe(CONTACT)
    expect(headings).toHaveLength(33)
    expect(
      within(screen.getByRole('contentinfo')).queryAllByRole('heading'),
    ).toHaveLength(0)
  })

  // W7 (#73): every sector's landing page keeps a crawlable link from the
  // homepage, as its Solutions row's link (#89), or from the footer's "More
  // sectors" line, and no page is linked from both.
  it('links every solution landing page from either a Solutions row or the footer', () => {
    render(<App />)
    const region = screen.getByRole('region', { name: solutionsIntro.heading })
    expect(within(region).queryAllByRole('button')).toHaveLength(0)
    const footer = screen.getByRole('contentinfo')
    const hrefs = (root: HTMLElement) =>
      [...root.querySelectorAll<HTMLAnchorElement>('a[href^="/solutions/"]')].map((link) =>
        link.getAttribute('href'),
      )
    const fromRows = hrefs(region)
    const fromFooter = hrefs(footer)

    // Four rows, in section A's order, and the other two in the footer (#95).
    expect(fromRows).toEqual([
      '/solutions/health',
      '/solutions/public-sector',
      '/solutions/financial-services',
      '/solutions/education',
    ])
    expect(fromFooter).toEqual(['/solutions/retail-distribution', '/solutions/development-impact'])
    expect([...fromRows, ...fromFooter].sort()).toEqual(
      solutions.map((solution) => `/solutions/${solution.slug}`).sort(),
    )
    expect(document.querySelectorAll('a[href^="/solutions/"]')).toHaveLength(solutions.length)
    expect(within(footer).getByText('More sectors')).toBeVisible()
  })
})
