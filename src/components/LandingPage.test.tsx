import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { email, phoneHref } from '../data/contact.ts'
import { managedServices, services } from '../data/services.ts'
import { footerSolutions, solutions } from '../data/solutions.ts'
import { notFound, pages, type Page } from '../pages.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import * as eduPlan from '../test/educationPlan.ts'
import * as fsPlan from '../test/financialServicesPlan.ts'
import * as healthPlan from '../test/healthPlan.ts'
import * as retailPlan from '../test/retailDistributionPlan.ts'
import { buttonLabel, cell, figureDescription, list, marked, named, OWNER_ADDITIONS, stage } from '../test/publicSectorPlan.ts'
import LandingPage from './LandingPage.tsx'

// The landing pages (#67): every service and solution page, and the
// not-found page, in their shared frame.

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

const servicePages = pages.filter((page) => page.kind === 'service')
const solutionPages = pages.filter((page) => page.kind === 'solution')
const sectionPages = solutionPages.filter((page) => page.kind === 'solution' && page.copy.layout !== 'sector')
const publicSector = solutionPages.find((page) => page.path === '/solutions/public-sector')!
const health = solutionPages.find((page) => page.path === '/solutions/health')!
const financialServices = solutionPages.find((page) => page.path === '/solutions/financial-services')!
const education = solutionPages.find((page) => page.path === '/solutions/education')!
const retail = solutionPages.find((page) => page.path === '/solutions/retail-distribution')!
const developmentImpact = solutionPages.find((page) => page.path === '/solutions/development-impact')!
// The pages on the shared landing-page foundation (#93, #94, #98, issue
// 100, issue 101).
const foundationPages: readonly Page[] = [publicSector, health, financialServices, education, retail]

// Each foundation page's closing panel: its heading, and its text after
// the eyebrow (the plan's text and the owner's follow-up).
const CLOSING: Record<string, { heading: string; text: string }> = {
  '/solutions/public-sector': {
    heading: 'Build a public data foundation you can trust',
    text: 'Which figure in your next statutory report do you trust least? Tell us about the reports leadership answers for. Then we make sure they are built on a trusted data foundation.',
  },
  '/solutions/health': {
    heading: 'Build a health data foundation you can trust',
    text: `${healthPlan.cell('Closing panel', 'Text')} ${healthPlan.OWNER_ADDITIONS.closingFollowUp}`,
  },
  '/solutions/financial-services': {
    heading: 'Build a financial data foundation you can trust',
    text: `${fsPlan.cell('Closing panel', 'Text')} ${fsPlan.OWNER_ADDITIONS.closingFollowUp}`,
  },
  '/solutions/education': {
    heading: 'Build an education data foundation you can trust',
    text: `${eduPlan.cell('Closing panel', 'Text')} ${eduPlan.OWNER_ADDITIONS.closingFollowUp}`,
  },
  '/solutions/retail-distribution': {
    heading: 'Build a retail data foundation you can trust',
    text: `${retailPlan.cell('Closing panel', 'Text')} ${retailPlan.PROPOSED_FOLLOW_UP}`,
  },
}
const paths = new Set(pages.map((page) => page.path))

const renderPage = (page: Page) => render(<LandingPage page={page} />)

// The footer's "More sectors" line (#73): the two sector pages the
// homepage's Solutions list leaves out, by their headings, on every page.
// Public Sector is a homepage row since #95, so no footer links it.
const MORE_SECTORS = [
  ['Retail & Distribution Analytics', '/solutions/retail-distribution'],
  ['Development & Impact Data Systems', '/solutions/development-impact'],
]

function expectMoreSectors() {
  const footer = screen.getByRole('contentinfo')
  const line = within(footer).getByText('More sectors').parentElement!
  const links = within(line).getAllByRole('link')
  expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual(MORE_SECTORS)
  expect(links.map((link) => link.textContent)).toEqual(footerSolutions.map((solution) => solution.heading))
  for (const [, href] of MORE_SECTORS) expect(paths.has(href)).toBe(true)
  expect(within(footer).getByRole('navigation', { name: 'Footer' })).not.toContainElement(line)
  expect(within(within(footer).getByRole('navigation', { name: 'Footer' })).getAllByRole('link')).toHaveLength(5)
  expect(footer.textContent).not.toContain('Public Sector Data & Analytics')
  expect(footer.querySelector('a[href="/solutions/public-sector"]')).toBeNull()
}

const h2s = (main: HTMLElement) =>
  within(main).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

// Every link in main, as [name, href].
const mainLinks = () =>
  within(screen.getByRole('main'))
    .getAllByRole('link')
    .map((link) => [link.textContent, link.getAttribute('href')] as const)

describe.each(pages.map((page) => [page.path, page] as const))('%s', (_path, page) => {
  it('has one h1 and no skipped heading levels', () => {
    renderPage(page)
    const levels = screen.getAllByRole('heading').map((heading) => Number(heading.tagName[1]))
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    for (let i = 1; i < levels.length; i++) expect(levels[i]).toBeLessThanOrEqual(levels[i - 1] + 1)
  })

  it('has the header, main, contact call to action and footer, with the section links leading home', () => {
    renderPage(page)
    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('link', { name: 'Fafanua Technologies' })).toHaveAttribute('href', '/')
    expect(within(banner).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#capabilities')
    expect(within(banner).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', '#contact')
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(footer).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
    if (page.kind === 'solution' && page.copy.layout === 'sector') {
      // The page's own closing panel (#93, #94, #98, issue 100, issue 101) replaces the Contact
      // section: the button and the address, both opening an email.
      const expected = CLOSING[page.path]
      expect(expected, page.path).toBeDefined()
      const closing = screen.getByRole('region', { name: expected.heading })
      expect(closing).toHaveAttribute('id', 'contact')
      expect(within(closing).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
        `mailto:${email}`,
        `mailto:${email}`,
      ])
      // Its text, after the eyebrow: the plan's text and the owner's
      // follow-up (#93, #94), not the W9 line.
      const { text } = expected
      expect(closing.querySelector('.sector-closing__body')!.textContent).toBe(text)
      expect([...closing.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['Get started', text])
      expect(screen.queryByRole('region', { name: /Let’s build a data foundation/ })).toBeNull()
      return
    }
    const contact = screen.getByRole('region', { name: /Let’s build a data foundation/ })
    expect(within(contact).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      `mailto:${email}`,
      `mailto:${email}`,
      phoneHref,
    ])
    // The W9 supporting line (#74), the section's one paragraph.
    expect([...contact.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'Which number do you trust least? Tell us about the reports and figures your organisation relies on.',
    ])
  })

  it('links only to real pages, homepage sections, contact or email', () => {
    renderPage(page)
    // A page on the shared foundation (#93) also jumps to its own
    // #assessment section.
    const sector = page.kind === 'solution' && page.copy.layout === 'sector'
    for (const [name, href] of mainLinks()) {
      expect(
        paths.has(href!) || href === '/' || /^\/#[a-z-]+$/.test(href!) || href === '#contact' || (sector && href === '#assessment') || href!.startsWith('mailto:') || href!.startsWith('tel:'),
        `${name} → ${href}`,
      ).toBe(true)
      expect(name).not.toMatch(/^(learn more|read more|click here)$/i)
    }
  })

  it('has no axe violations', async () => {
    const { container } = renderPage(page)
    await expectNoAxeViolations(container)
  })

  it('links the footer\'s "More sectors" line to the two sectors the homepage leaves out, and not Public Sector', () => {
    renderPage(page)
    expectMoreSectors()
  })
})

describe('service pages', () => {
  it.each(servicePages.map((page) => [page.path, page] as const))(
    '%s has the SEO plan §17 sections in order',
    (_path, page) => {
      renderPage(page)
      const main = screen.getByRole('main')
      const expected = [
        'Problems this service solves',
        'What Fafanua delivers',
        'Typical engagements',
        'Business outcomes',
        'Where it fits in the Fafanua lifecycle',
        'Relevant sectors',
        'Related services',
      ]
      expect(h2s(main).filter((heading) => expected.includes(heading!))).toEqual(expected)
    },
  )

  it('shows the approved description and Typical engagements of each service', () => {
    for (const service of services) {
      const { unmount } = renderPage(pageFor(service.id))
      const main = screen.getByRole('main')
      expect(main).toHaveTextContent(service.description)
      const list = within(screen.getByRole('region', { name: 'Typical engagements' })).getByRole('list')
      expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(service.engagements)
      unmount()
    }
  })

  it('shows Managed Services’ description and capabilities on its page, staged as Operate', () => {
    renderPage(pageFor('managed-data-and-analytics'))
    expect(screen.getByRole('main')).toHaveTextContent(managedServices.description)
    expect(screen.getByText('Operate', { selector: '.section-eyebrow' })).toBeInTheDocument()
    const list = within(screen.getByRole('region', { name: 'Typical engagements' })).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(managedServices.capabilities.length)
  })

  it('links the lifecycle to every other service and marks the current one', () => {
    renderPage(pageFor('data-quality-and-reliability'))
    const lifecycle = within(screen.getByRole('region', { name: 'Where it fits in the Fafanua lifecycle' })).getByRole('list')
    const items = within(lifecycle).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    expect(within(lifecycle).getAllByRole('link')).toHaveLength(6)
    const current = items.find((item) => item.getAttribute('aria-current') === 'page')!
    expect(current).toHaveTextContent(`Trust${services[3].name}`)
    expect(within(current).queryByRole('link')).toBeNull()
  })

  it('shows a breadcrumb trail Home › Services › the service', () => {
    renderPage(pageFor('data-governance-and-metadata'))
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Home',
      'Services',
      services[4].name,
    ])
    expect(within(trail).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#capabilities')
  })

  // Public Sector's summary is section A's tag line since #95, so its
  // "Relevant sectors" line reads it joined with ", ".
  it('shows Public Sector\'s new summary on a service page\'s "Relevant sectors"', () => {
    renderPage(pageFor('data-strategy-and-platform-architecture'))
    const region = screen.getByRole('region', { name: 'Relevant sectors' })
    const link = within(region).getByRole('link', { name: 'Public Sector Data & Analytics' })
    expect(link).toHaveAttribute('href', '/solutions/public-sector')
    expect(link.nextElementSibling?.textContent).toBe('Service turnaround, Revenue and budget, Statutory reporting')
    expect(region).not.toHaveTextContent('Service delivery, Governance, Reporting, Integration')
  })

  it('explains Reverse ETL on the engineering page only', () => {
    renderPage(pageFor('data-engineering-and-integration'))
    expect(screen.getByRole('heading', { name: 'Operational data activation using Reverse ETL' })).toBeInTheDocument()
  })
})

describe('solution pages', () => {
  // The one sector still on the §18 sections, Development & Impact;
  // Public Sector, Health, Financial Services, Education and Retail &
  // Distribution are on the shared landing-page foundation (#93, #94, #98,
  // issue 100, issue 101), checked below.
  it.each(sectionPages.map((page) => [page.path, page] as const))(
    '%s has the SEO plan §18 sections in order',
    (_path, page) => {
      renderPage(page)
      expect(h2s(screen.getByRole('main'))).toEqual([
        'Sector context',
        'Common data problems',
        'How Fafanua helps',
        'Reporting and analytics use cases',
        'Data quality and governance',
        'Operational activation',
        'Other sectors',
        expect.stringMatching(/^Let’s build/),
      ])
    },
  )

  // The Health plan (#94) keeps one audience, healthcare providers.
  it('shows Health’s h1 and its one audience, healthcare providers, without the programmes', () => {
    renderPage(health)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Health data you can trace\.$/)
    const main = screen.getByRole('main')
    const audience = screen.getByRole('region', { name: 'Who we work with' })
    expect(within(audience).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Healthcare providers'])
    expect(main).not.toHaveTextContent('Public and global-health programmes')
    expect(main).not.toHaveTextContent('Health Data & Analytics Solutions')
  })

  // Each §18 page (Financial Services was the first until #98, Education
  // the last until issue 100, and Retail & Distribution the first until
  // issue 101, which moved them onto the foundation, with no Other sectors
  // section).
  it.each(sectionPages.map((page) => [page.path, page] as const))('%s links every other sector, and not itself', (_path, page) => {
    renderPage(page)
    const others = within(screen.getByRole('region', { name: 'Other sectors' })).getAllByRole('link')
    expect(others.map((link) => link.getAttribute('href'))).toEqual(
      solutionPages.filter((other) => other !== page).map((other) => other.path),
    )
    expect(others).toHaveLength(5)
    expect(solutions).toHaveLength(6)
  })
})

describe('not-found page', () => {
  it('says the page was not found and links home and to every page', () => {
    renderPage(notFound)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found')
    const hrefs = mainLinks().map(([, href]) => href)
    expect(hrefs).toContain('/')
    for (const page of pages) expect(hrefs).toContain(page.path)
  })

  it('links the footer\'s "More sectors" line too', () => {
    renderPage(notFound)
    expectMoreSectors()
  })
})

// The Public Sector page on the shared landing-page foundation (#93),
// against section 4 of _docs/fafanua-public-sector-landing-page-plan.md.
describe('Public Sector page', () => {
  const main = () => screen.getByRole('main')
  const headings = (level: number) =>
    within(main()).getAllByRole('heading', { level }).map((heading) => heading.textContent)

  // Every text node in main, trimmed, in DOM order.
  function texts(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent!.trim()
      if (text) out.push(text)
    }
    return out
  }

  const upperIfPlan = (text: string, plan: string) => (text.toUpperCase() === plan ? plan : text)

  it('has the plan\'s h2s and h3s, in order', () => {
    renderPage(publicSector)
    expect(headings(1)).toEqual([cell('Hero', 'Heading (`h1`)')])
    expect(headings(2)).toEqual([
      'The challenge',
      'Our approach',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'No big-bang projects',
      'What this means for AI',
      'Working within public rules',
      'After the assessment',
      'Build a public data foundation you can trust',
    ])
    expect(headings(3)).toEqual([
      'Public institutions',
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      // Fix list until the owner's decision on #99.
      'Prioritised roadmap',
      'Assess',
      'Foundation',
      'First use cases',
      'Extend',
      'Integrate and model',
      'Quality and governance',
      'Reporting and dashboards',
    ])
  })

  it('shows exactly plan section 4\'s text in main, in DOM order, with the figure description and the owner\'s five additions (#93)', () => {
    renderPage(publicSector)
    const plan = [
      ...cell('Hero', 'Breadcrumb').split(' › '),
      cell('Hero', 'Eyebrow'),
      cell('Hero', 'Heading (`h1`)'),
      cell('Hero', 'Lead'),
      buttonLabel(cell('Hero', 'Primary button')),
      '→',
      buttonLabel(cell('Hero', 'Secondary button')),
      figureDescription,
      cell('Trace diagram', 'Left column heading'),
      ...list(cell('Trace diagram', 'Sources, in order')),
      cell('Trace diagram', 'Middle box heading'),
      ...list(cell('Trace diagram', 'Middle steps')),
      cell('Trace diagram', 'Middle footnote'),
      cell('Trace diagram', 'Right column heading'),
      ...list(cell('Trace diagram', 'Figures and ratings')).flatMap((entry) => {
        const { name, rating } = marked(entry)
        return [name, rating!]
      }),
      cell('Trace diagram', 'Caption'),
      cell('Challenge and approach', 'Card 1 heading'),
      cell('Challenge and approach', 'Card 1 text'),
      cell('Challenge and approach', 'Card 2 heading'),
      cell('Challenge and approach', 'Card 2 text'),
      cell('Who we work with', 'Heading'),
      cell('Who we work with', 'Subheading'),
      cell('Who we work with', 'Card heading'),
      cell('Who we work with', 'Card text'),
      OWNER_ADDITIONS.audienceDetail,
      ...list(cell('Who we work with', 'Checklist')),
      cell('The Data Trust Assessment', 'Eyebrow'),
      cell('The Data Trust Assessment', 'Heading'),
      cell('The Data Trust Assessment', 'Text'),
      ...[1, 2, 3, 4].flatMap((n) => Object.values(named(cell('The Data Trust Assessment', `Deliverable ${n}`)))),
      cell('Delivered in stages', 'Eyebrow'),
      cell('Delivered in stages', 'Heading'),
      cell('Delivered in stages', 'Subheading'),
      ...[1, 2, 3, 4].flatMap((n) => {
        const { name, description, exit } = stage(cell('Delivered in stages', `Stage ${n}`))
        return [`Stage ${n}`, name, description, cell('Delivered in stages', 'Exit label'), exit]
      }),
      cell('AI and public rules', 'Card 1 heading'),
      cell('AI and public rules', 'Card 1 text'),
      ...list(cell('AI and public rules', 'Card 1 chips')).map((chip) => marked(chip).name),
      cell('AI and public rules', 'Card 2 heading'),
      ...list(cell('AI and public rules', 'Card 2 checklist')),
      cell('After the assessment', 'Heading'),
      cell('After the assessment', 'Subheading'),
      ...[1, 2, 3].flatMap((n) => [
        ...Object.values(named(cell('After the assessment', `Card ${n}`))),
        [OWNER_ADDITIONS.integrateDetail, OWNER_ADDITIONS.governanceDetail, OWNER_ADDITIONS.reportingDetail][n - 1],
      ]),
      cell('Closing panel', 'Eyebrow'),
      cell('Closing panel', 'Heading'),
      `${cell('Closing panel', 'Text')} ${OWNER_ADDITIONS.closingFollowUp}`,
      buttonLabel(cell('Closing panel', 'Primary button')),
      '→',
      buttonLabel(cell('Closing panel', 'Secondary link')),
    ]
    const shown = texts(main())
    // Labels the plan writes in capitals are stored in sentence case and
    // capitalised by CSS.
    expect(shown.map((text, index) => upperIfPlan(text, plan[index]))).toEqual(plan)
    expect(shown.filter((text, index) => text !== plan[index])).toEqual([
      'Public sector solutions',
      'Start with trust',
      'Delivered in stages',
      'Moves on when',
      'Moves on when',
      'Moves on when',
      'Moves on when',
      'Get started',
    ])
    // No digits but the stage numbers.
    expect(main().textContent!.replace(/Stage [1-4]/g, '')).not.toMatch(/\d/)
  })

  it('shows the protected "trusted data foundation" in the closing panel (owner, #93)', () => {
    renderPage(publicSector)
    const closing = screen.getByRole('region', { name: 'Build a public data foundation you can trust' })
    expect(closing).toHaveTextContent('trusted data foundation')
    expect(closing.querySelector('.sector-closing__body')).not.toHaveClass('visually-hidden')
  })

  it('has the breadcrumbs Home › Solutions › Public sector', () => {
    renderPage(publicSector)
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', 'Solutions', 'Public sector'])
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(trail).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'page')
  })

  it('links the hero buttons to the email and #assessment, the service cards to their pages and the closing panel to the email', () => {
    renderPage(publicSector)
    const hero = screen.getByRole('region', { name: 'Public data you can account for.' })
    expect(within(hero).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    const jump = within(hero).getByRole('link', { name: 'See how the assessment works' })
    expect(jump).toHaveAttribute('href', '#assessment')
    expect(jump).toHaveAttribute('data-focus-section', 'assessment')
    expect(mainLinks()).toEqual([
      ['Home', '/'],
      ['Solutions', '/#solutions'],
      ['Book a data trust assessment→', `mailto:${email}`],
      ['See how the assessment works', '#assessment'],
      ['Integrate and model', '/services/data-engineering-integration'],
      ['Quality and governance', '/services/data-quality-reliability'],
      ['Reporting and dashboards', '/services/business-intelligence-analytics'],
      ['Book a data trust assessment→', `mailto:${email}`],
      [email, `mailto:${email}`],
    ])
  })

  it('labels section#assessment by its h2', () => {
    renderPage(publicSector)
    const section = screen.getByRole('region', { name: 'The Data Trust Assessment: three weeks, fixed fee' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'assessment')
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.tagName).toBe('H2')
  })

  it('lists the four stages in order, each with its name, description, "Moves on when" label and condition', () => {
    renderPage(publicSector)
    const section = screen.getByRole('region', { name: 'No big-bang projects' })
    const ol = within(section).getByRole('list')
    expect(ol.tagName).toBe('OL')
    const items = within(ol).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    items.forEach((item, index) => {
      const expected = stage(cell('Delivered in stages', `Stage ${index + 1}`))
      expect(texts(item)).toEqual([`Stage ${index + 1}`, expected.name, expected.description, 'Moves on when', expected.exit])
      expect(within(item).getByRole('heading', { level: 3 })).toHaveTextContent(expected.name)
    })
    expect(section.querySelector('svg')).toBeNull()
  })

  it('draws the figure with its caption, description, five sources, five steps and three rated figures', () => {
    renderPage(publicSector)
    // Named by its figcaption (jsdom's name computation does not read it).
    const figure = screen.getByRole('figure')
    expect(figure.querySelector(':scope > figcaption')!.textContent).toBe(cell('Trace diagram', 'Caption'))
    expect(figure).toHaveAccessibleDescription(figureDescription)
    expect(document.getElementById(figure.getAttribute('aria-describedby')!)).toHaveClass('visually-hidden')
    const [sources, steps, figures] = within(figure).getAllByRole('list')
    expect(within(sources).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      list(cell('Trace diagram', 'Sources, in order')),
    )
    expect(steps.tagName).toBe('OL')
    expect(within(steps).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      list(cell('Trace diagram', 'Middle steps')),
    )
    expect(within(figures).getAllByRole('listitem').map((item) => texts(item))).toEqual(
      list(cell('Trace diagram', 'Figures and ratings')).map((entry) => {
        const { name, rating } = marked(entry)
        return [name, rating]
      }),
    )
    // The two sources that do not feed the figures are faded, with dashed
    // connectors; the other three solid.
    expect([...sources.querySelectorAll('li')].map((item) => item.querySelector('.trace__connector--dashed') !== null)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
    // Every connector, marker and icon is hidden and holds no text.
    for (const hidden of figure.querySelectorAll('.trace__connector, .rating-marker, svg')) {
      expect(hidden).toHaveAttribute('aria-hidden', 'true')
      expect(hidden.textContent).toBe('')
    }
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('has none of the removed sections or strings', () => {
    renderPage(publicSector)
    for (const name of [
      'Sector context',
      'Common data problems',
      'How Fafanua helps',
      'Reporting and analytics use cases',
      'Data quality and governance',
      'Operational activation',
      'Other sectors',
    ]) {
      expect(screen.queryByRole('heading', { name })).toBeNull()
    }
    const text = main().textContent!
    for (const removed of ['Public Sector Data & Analytics', 'Let’s build a data foundation', 'Which number do you trust least?', '+256', 'Reverse ETL', 'Fafanua Intelligence', 'AI-powered', 'DHIS']) {
      expect(text).not.toContain(removed)
    }
    expect(main().querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('puts main.sector-landing on the foundation pages (Public Sector, Health, Financial Services, Education and Retail & Distribution) only, and leaves out the Contact section there', () => {
    expect(foundationPages.map((page) => page.path)).toEqual([
      '/solutions/public-sector',
      '/solutions/health',
      '/solutions/financial-services',
      '/solutions/education',
      '/solutions/retail-distribution',
    ])
    expect(sectionPages.map((page) => page.path)).toEqual(['/solutions/development-impact'])
    expect(sectionPages).toEqual([developmentImpact])
    for (const page of [...pages, notFound]) {
      const { unmount } = renderPage(page)
      const onFoundation = foundationPages.includes(page)
      expect(main().classList.contains('sector-landing'), page.path).toBe(onFoundation)
      expect(main().querySelector('.contact') !== null, page.path).toBe(!onFoundation)
      unmount()
    }
  })

  it('marks the header\'s Solutions link as current on the foundation pages (Public Sector, Health, Financial Services, Education and Retail & Distribution) only', () => {
    for (const page of [...pages, notFound]) {
      const { unmount } = renderPage(page)
      const onFoundation = foundationPages.includes(page)
      const nav = within(screen.getByRole('banner')).getByRole('navigation', { name: 'Main' })
      const current = within(nav)
        .getAllByRole('link')
        .filter((link) => link.hasAttribute('aria-current'))
        .map((link) => [link.textContent, link.getAttribute('aria-current')])
      expect(current, page.path).toEqual(onFoundation ? [['Solutions', 'true']] : [])
      expect(document.getElementById('header-island')!.dataset.navCurrent, page.path).toBe(
        onFoundation ? 'solutions' : undefined,
      )
      unmount()
    }
  })

  it('has no img, lang, tabindex or contenteditable in main, and no axe violations', async () => {
    const { container } = renderPage(publicSector)
    expect(main().querySelectorAll('img, canvas, [lang], [tabindex], [contenteditable]')).toHaveLength(0)
    await expectNoAxeViolations(container)
  })
})

// The Health page on the shared landing-page foundation (#94), against
// section 4 of _docs/fafanua-health-landing-page-plan.md.
describe('Health page', () => {
  const { cell: hcell, list: hlist, marked: hmarked, named: hnamed, buttonLabel: hbutton } = healthPlan
  const added = healthPlan.OWNER_ADDITIONS
  const main = () => screen.getByRole('main')
  const headings = (level: number) =>
    within(main()).getAllByRole('heading', { level }).map((heading) => heading.textContent)

  // Every text node in main, trimmed, in DOM order.
  function texts(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent!.trim()
      if (text) out.push(text)
    }
    return out
  }

  const upperIfPlan = (text: string, plan: string) => (text.toUpperCase() === plan ? plan : text)
  // The Handled responsibly items each end with a full stop, so the plan's
  // list splits at ".; ".
  const handlingItems = () => hcell('AI and responsible handling', 'Card 2 checklist').split(/(?<=\.); /)

  it('has the plan\'s h2s and h3s, in order', () => {
    renderPage(health)
    expect(headings(1)).toEqual([hcell('Hero', 'Heading (`h1`)')])
    expect(headings(1)).toEqual(['Health data you can trace.'])
    expect(headings(2)).toEqual([
      'The challenge',
      'Our approach',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'What this means for AI',
      'Handled responsibly',
      'After the assessment',
      'Build a health data foundation you can trust',
    ])
    expect(headings(3)).toEqual([
      'Healthcare providers',
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      // Fix list until the owner's decision on #99.
      'Prioritised roadmap',
      'Integrate and model',
      'Quality and governance',
      'Reporting and dashboards',
    ])
  })

  it('shows exactly plan section 4\'s text in main, in DOM order, with the figure description and the owner\'s closing addition (#94)', () => {
    renderPage(health)
    const plan = [
      ...hcell('Hero', 'Breadcrumb').split(' › '),
      hcell('Hero', 'Eyebrow'),
      hcell('Hero', 'Heading (`h1`)'),
      hcell('Hero', 'Lead'),
      hbutton(hcell('Hero', 'Primary button')),
      '→',
      hbutton(hcell('Hero', 'Secondary button')),
      healthPlan.figureDescription,
      hcell('Trace diagram', 'Left column heading'),
      ...hlist(hcell('Trace diagram', 'Sources')),
      hcell('Trace diagram', 'Middle box heading'),
      ...hlist(hcell('Trace diagram', 'Middle steps')),
      hcell('Trace diagram', 'Middle footnote'),
      hcell('Trace diagram', 'Right column heading'),
      ...hlist(hcell('Trace diagram', 'Numbers and ratings')).flatMap((entry) => {
        const { name, rating } = hmarked(entry)
        return [name, rating!]
      }),
      hcell('Trace diagram', 'Caption'),
      hcell('Challenge and approach', 'Card 1 heading'),
      hcell('Challenge and approach', 'Card 1 text'),
      hcell('Challenge and approach', 'Card 2 heading'),
      hcell('Challenge and approach', 'Card 2 text'),
      hcell('Who we work with', 'Heading'),
      hcell('Who we work with', 'Subheading'),
      hcell('Who we work with', 'Card heading'),
      hcell('Who we work with', 'Card text 1'),
      hcell('Who we work with', 'Card text 2'),
      hcell('Who we work with', 'List label'),
      // Each item: its bold name, then a colon and its text.
      ...[1, 2, 3, 4].flatMap((n) => {
        const { name, text } = healthPlan.boldNamed(hcell('Who we work with', `List item ${n}`))
        return [name, `: ${text}`]
      }),
      hcell('The Data Trust Assessment', 'Eyebrow'),
      hcell('The Data Trust Assessment', 'Heading'),
      hcell('The Data Trust Assessment', 'Text'),
      ...[1, 2, 3, 4].flatMap((n) => Object.values(hnamed(hcell('The Data Trust Assessment', `Deliverable ${n}`)))),
      hcell('AI and responsible handling', 'Card 1 heading'),
      hcell('AI and responsible handling', 'Card 1 text'),
      ...hlist(hcell('AI and responsible handling', 'Card 1 chips')).map((chip) => hmarked(chip).name),
      hcell('AI and responsible handling', 'Card 2 heading'),
      ...handlingItems(),
      hcell('After the assessment', 'Heading'),
      hcell('After the assessment', 'Subheading'),
      ...[1, 2, 3].flatMap((n) => [
        hcell('After the assessment', `Card ${n} heading`),
        hcell('After the assessment', `Card ${n} lead`),
        hcell('After the assessment', `Card ${n} text`),
      ]),
      hcell('Closing panel', 'Eyebrow'),
      hcell('Closing panel', 'Heading'),
      `${hcell('Closing panel', 'Text')} ${added.closingFollowUp}`,
      hbutton(hcell('Closing panel', 'Primary button')),
      '→',
      hbutton(hcell('Closing panel', 'Secondary link')),
    ]
    const shown = texts(main())
    // Labels the plan writes in capitals are stored in sentence case and
    // capitalised by CSS.
    expect(shown.map((text, index) => upperIfPlan(text, plan[index]))).toEqual(plan)
    expect(shown.filter((text, index) => text !== plan[index])).toEqual(['Health solutions', 'Start with trust', 'Get started'])
    expect(main().textContent).not.toMatch(/\d/)
  })

  it('shows the protected "trusted data foundation" in the closing panel (owner, #94)', () => {
    renderPage(health)
    const closing = screen.getByRole('region', { name: 'Build a health data foundation you can trust' })
    expect(closing).toHaveTextContent('trusted data foundation')
    expect(closing.querySelector('.sector-closing__body')).not.toHaveClass('visually-hidden')
  })

  it('has the breadcrumbs Home › Solutions › Health', () => {
    renderPage(health)
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', 'Solutions', 'Health'])
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(trail).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'page')
    expect(trail.textContent).not.toContain('›')
  })

  it('shows the providers card\'s two paragraphs, then a ul named by its label, each item a strong name, a colon and its text', () => {
    renderPage(health)
    const card = screen.getByRole('region', { name: 'Who we work with' }).querySelector('.audience-card')!
    const t = 'Who we work with'
    expect([...card.querySelectorAll('.audience-card__text')].map((p) => p.textContent)).toEqual([
      hcell(t, 'Card text 1'),
      hcell(t, 'Card text 2'),
    ])
    const list = within(card as HTMLElement).getByRole('list', { name: hcell(t, 'List label') })
    expect(list.tagName).toBe('UL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    items.forEach((item, index) => {
      const { name, text } = healthPlan.boldNamed(hcell(t, `List item ${index + 1}`))
      expect(item.querySelector('strong')!.textContent).toBe(name)
      expect(item.textContent).toBe(`${name}: ${text}`)
      expect(within(item).queryByRole('heading')).toBeNull()
    })
    // The label is text, not a heading.
    expect(within(card as HTMLElement).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Healthcare providers'])
  })

  it('gives each service card its h3, then its bold lead line, then its text', () => {
    renderPage(health)
    const cards = within(screen.getByRole('region', { name: 'After the assessment' })).getAllByRole('listitem')
    expect(cards.map((card) => [...card.querySelectorAll('h3, p')].map((element) => [element.tagName, element.className, element.textContent]))).toEqual(
      [1, 2, 3].map((n) => [
        ['H3', 'sector-card-heading sector-card-heading--small', hcell('After the assessment', `Card ${n} heading`)],
        ['P', 'service-card-lp__lead', hcell('After the assessment', `Card ${n} lead`)],
        ['P', 'service-card-lp__text', hcell('After the assessment', `Card ${n} text`)],
      ]),
    )
  })

  it('links the hero buttons to the email and #assessment, the service cards to their pages and the closing panel to the email', () => {
    renderPage(health)
    const hero = screen.getByRole('region', { name: 'Health data you can trace.' })
    expect(within(hero).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    const jump = within(hero).getByRole('link', { name: 'See how the assessment works' })
    expect(jump).toHaveAttribute('href', '#assessment')
    expect(jump).toHaveAttribute('data-focus-section', 'assessment')
    const closing = screen.getByRole('region', { name: 'Build a health data foundation you can trust' })
    expect(within(closing).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    expect(within(closing).getByRole('link', { name: email })).toHaveAttribute('href', `mailto:${email}`)
    expect(mainLinks()).toEqual([
      ['Home', '/'],
      ['Solutions', '/#solutions'],
      ['Book a data trust assessment→', `mailto:${email}`],
      ['See how the assessment works', '#assessment'],
      ['Integrate and model', '/services/data-engineering-integration'],
      ['Quality and governance', '/services/data-quality-reliability'],
      ['Reporting and dashboards', '/services/business-intelligence-analytics'],
      ['Book a data trust assessment→', `mailto:${email}`],
      [email, `mailto:${email}`],
    ])
    for (const link of main().querySelectorAll('a[href^="mailto:"]')) expect(link).toHaveAttribute('href', 'mailto:info@fafanua.tech')
  })

  it('labels section#assessment by its h2', () => {
    renderPage(health)
    const section = screen.getByRole('region', { name: 'The Data Trust Assessment: three weeks, fixed fee' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'assessment')
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.tagName).toBe('H2')
  })

  it('has no Delivered in stages section', () => {
    renderPage(health)
    // The only ordered lists are the breadcrumbs and the trace's steps.
    const ols = [...main().querySelectorAll('ol')]
    expect(ols).toHaveLength(2)
    expect(ols[0].closest('nav')).toHaveAccessibleName('Breadcrumb')
    expect(ols[1].closest('figure')).not.toBeNull()
    expect(main().textContent).not.toMatch(/Delivered in stages|No big-bang projects|Moves on when|Stage/)
  })

  it('draws the figure with its caption, description, five sources, five steps and three rated numbers', () => {
    renderPage(health)
    // Named by its figcaption (jsdom's name computation does not read it).
    const figure = screen.getByRole('figure')
    expect(figure.querySelector(':scope > figcaption')!.textContent).toBe('Illustrative example. Sample data only.')
    expect(figure).toHaveAccessibleDescription(healthPlan.figureDescription)
    expect(document.getElementById(figure.getAttribute('aria-describedby')!)).toHaveClass('visually-hidden')
    const [sources, steps, figures] = within(figure).getAllByRole('list')
    expect(within(sources).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'EMR / HMIS',
      'Laboratory',
      'Billing & insurance',
      'Pharmacy dispensing',
      'Finance ledger',
    ])
    expect(steps.tagName).toBe('OL')
    expect(within(steps).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      hlist(hcell('Trace diagram', 'Middle steps')),
    )
    expect(within(figures).getAllByRole('listitem').map((item) => texts(item))).toEqual([
      ['Revenue by branch', 'Trusted with caveats'],
      ['Claims rejection rate', 'Trusted'],
      ['Pharmacy stock variance', 'Not yet trusted'],
    ])
    // EMR / HMIS and Laboratory do not feed the numbers: faded, with
    // dashed connectors; the other three solid.
    expect([...sources.querySelectorAll('li')].map((item) => item.querySelector('.trace__connector--dashed') !== null)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
    // Every connector, marker and icon is hidden and holds no text.
    for (const hidden of figure.querySelectorAll('.trace__connector, .rating-marker, svg')) {
      expect(hidden).toHaveAttribute('aria-hidden', 'true')
      expect(hidden.textContent).toBe('')
    }
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('has none of the removed sections or strings', () => {
    renderPage(health)
    for (const name of [
      'Sector context',
      'Common data problems',
      'How Fafanua helps',
      'Reporting and analytics use cases',
      'Data quality and governance',
      'Operational activation',
      'Other sectors',
      'Public and global-health programmes',
    ]) {
      expect(screen.queryByRole('heading', { name })).toBeNull()
    }
    expect(main().querySelector('#use-cases')).toBeNull()
    const text = main().textContent!
    for (const removed of [
      'Health Data & Analytics Solutions',
      'national health information systems',
      'Managed health data services',
      'Longitudinal patient and programme outcomes',
      'Returning follow-up lists to facility and outreach teams.',
      'For organisations running more than one branch, ward or service line.',
      'What we fix, once we know where trust breaks down.',
      'health information systems',
      'health data exchange',
      'health data quality framework',
      'Let’s build a data foundation',
      'Which number do you trust least?',
      '+256',
      'Reverse ETL',
      'Fafanua Intelligence',
      'AI-powered',
      'DHIS',
    ]) {
      expect(text).not.toContain(removed)
    }
    for (const theme of solutions.find((solution) => solution.id === 'health')!.themes) expect(text).not.toContain(theme)
    expect(text).not.toMatch(/complian|certified|guarantee|meets the requirements of|in line with the Act/i)
    expect(main().querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('has no img, lang, tabindex or contenteditable in main, and no axe violations', async () => {
    const { container } = renderPage(health)
    expect(main().querySelectorAll('img, canvas, [lang], [tabindex], [contenteditable]')).toHaveLength(0)
    await expectNoAxeViolations(container)
  })
})

// The Financial Services page on the shared landing-page foundation
// (#98), against section 4 of
// _docs/fafanua-financial-services-landing-page-plan.md.
describe('Financial Services page', () => {
  const { cell: fcell, list: flist, marked: fmarked, named: fnamed, buttonLabel: fbutton, comparison } = fsPlan
  const added = fsPlan.OWNER_ADDITIONS
  const main = () => screen.getByRole('main')
  const headings = (level: number) =>
    within(main()).getAllByRole('heading', { level }).map((heading) => heading.textContent)

  // Every text node in main, trimmed, in DOM order.
  function texts(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent!.trim()
      if (text) out.push(text)
    }
    return out
  }

  const upperIfPlan = (text: string, plan: string) => (text.toUpperCase() === plan ? plan : text)
  const handlingItems = () => fcell('AI and responsible handling', 'Card 2 checklist').split(/(?<=\.); /)
  const steps = () => [1, 2, 3, 4].map((n) => fnamed(fcell('Promise strip', `Step ${n}`)))
  const groupLabels = () => [fcell('Promise strip', 'Group 1 label'), fcell('Promise strip', 'Group 2 label')]
  const cards = () => [1, 2, 3].map((n) => comparison(fcell('Reconciliation (what we can implement)', `Card ${n}`)))

  it('has the plan\'s h2s and h3s, in order', () => {
    renderPage(financialServices)
    expect(headings(1)).toEqual([fcell('Hero', 'Heading (`h1`)')])
    expect(headings(1)).toEqual(['Financial figures you can reconcile.'])
    expect(headings(2)).toEqual([
      'Different systems. Different numbers.',
      'Start with the numbers that matter.',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'Know where your financial figures come from',
      'What this means for AI',
      'Handled responsibly',
      'After the assessment',
      'Build a financial data foundation you can trust',
    ])
    expect(headings(3)).toEqual([
      'Financial institutions',
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      'Prioritised roadmap',
      'Loan book',
      'Mobile money',
      'Board report',
      'Integrate and model',
      'Quality and governance',
      'Reporting and dashboards',
    ])
  })

  it('shows exactly plan section 4\'s text in main, in DOM order, with the figure description, the hidden group labels and comparison words, and the owner\'s A1 and A2 (#98)', () => {
    renderPage(financialServices)
    const [group1, group2] = groupLabels()
    const plan = [
      ...fcell('Hero', 'Breadcrumb').split(' › '),
      fcell('Hero', 'Eyebrow'),
      fcell('Hero', 'Heading (`h1`)'),
      fcell('Hero', 'Lead, paragraph 1'),
      fcell('Hero', 'Lead, paragraph 2'),
      fbutton(fcell('Hero', 'Primary button')),
      '→',
      fbutton(fcell('Hero', 'Secondary button')),
      fsPlan.figureDescription,
      fcell('Trace diagram', 'Left column heading'),
      ...flist(fcell('Trace diagram', 'Sources, in order')),
      fcell('Trace diagram', 'Middle box heading'),
      ...flist(fcell('Trace diagram', 'Middle steps')),
      fcell('Trace diagram', 'Middle footnote'),
      fcell('Trace diagram', 'Right column heading'),
      ...flist(fcell('Trace diagram', 'Figures and ratings')).flatMap((entry) => {
        const { name, rating } = fmarked(entry)
        return [name, rating!]
      }),
      fcell('Trace diagram', 'Caption'),
      ...[1, 2].flatMap((n) => [
        fcell('Challenge and approach', `Card ${n} label`),
        fcell('Challenge and approach', `Card ${n} heading`),
        fcell('Challenge and approach', `Card ${n} paragraph 1`),
        fcell('Challenge and approach', `Card ${n} paragraph 2`),
      ]),
      // Each step: its hidden group label, the visible label on a group's
      // first step, its number, name and description.
      ...steps().flatMap((step, index) => [
        index < 2 ? group1 : group2,
        ...(index % 2 === 0 ? [index < 2 ? group1 : group2] : []),
        String(index + 1),
        step.name,
        step.text,
      ]),
      fcell('Who we work with', 'Heading'),
      fcell('Who we work with', 'Subheading'),
      fcell('Who we work with', 'Card heading'),
      fcell('Who we work with', 'Card text'),
      added.audienceDetail,
      ...[1, 2, 3, 4].flatMap((n) => Object.values(fnamed(fcell('Who we work with', `Item ${n}`)))),
      fcell('The Data Trust Assessment', 'Eyebrow'),
      fcell('The Data Trust Assessment', 'Heading'),
      fcell('The Data Trust Assessment', 'Text'),
      fcell('The Data Trust Assessment', 'Deliverables label'),
      ...[1, 2, 3, 4].flatMap((n) => Object.values(fnamed(fcell('The Data Trust Assessment', `Deliverable ${n}`)))),
      fcell('Reconciliation (what we can implement)', 'Eyebrow'),
      fcell('Reconciliation (what we can implement)', 'Heading'),
      fcell('Reconciliation (what we can implement)', 'Text'),
      ...cards().flatMap((card) => [card.record, 'compared with', card.source, card.status]),
      fcell('Reconciliation (what we can implement)', 'Caption'),
      fcell('AI and responsible handling', 'Card 1 heading'),
      fcell('AI and responsible handling', 'Card 1 text'),
      ...flist(fcell('AI and responsible handling', 'Card 1 chips')).map((chip) => fmarked(chip).name),
      fcell('AI and responsible handling', 'Card 2 heading'),
      ...handlingItems(),
      fcell('After the assessment', 'Heading'),
      fcell('After the assessment', 'Subheading'),
      ...[1, 2, 3].flatMap((n) => fcell('After the assessment', `Card ${n}`).split(' / ')),
      fcell('Closing panel', 'Eyebrow'),
      fcell('Closing panel', 'Heading'),
      `${fcell('Closing panel', 'Text')} ${added.closingFollowUp}`,
      fbutton(fcell('Closing panel', 'Primary button')),
      '→',
      fbutton(fcell('Closing panel', 'Secondary link')),
    ]
    const shown = texts(main())
    // Labels the plan writes in capitals are stored in sentence case and
    // capitalised by CSS.
    expect(shown.map((text, index) => upperIfPlan(text, plan[index]))).toEqual(plan)
    expect(shown.filter((text, index) => text !== plan[index])).toEqual([
      'Financial services solutions',
      'The challenge',
      'Our approach',
      'The data trust assessment',
      'The data trust assessment',
      'The data trust assessment',
      'After the assessment',
      'After the assessment',
      'After the assessment',
      'Start with trust',
      'The assessment delivers',
      'After the assessment · What we can implement',
      'Get started',
    ])
    // Digits only in the step numbers and "3 exceptions".
    expect(main().textContent!.match(/\d+/g)).toEqual(['1', '2', '3', '4', '3'])
    expect(main().textContent).toContain('3 exceptions')
  })

  it('shows the protected "trusted data foundation" in the closing panel (owner, A1, #98)', () => {
    renderPage(financialServices)
    const closing = screen.getByRole('region', { name: 'Build a financial data foundation you can trust' })
    expect(closing).toHaveTextContent('trusted data foundation')
    expect(closing.querySelector('.sector-closing__body')).not.toHaveClass('visually-hidden')
  })

  it('has the breadcrumbs Home › Solutions › Financial services', () => {
    renderPage(financialServices)
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Home',
      'Solutions',
      'Financial services',
    ])
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(trail).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'page')
    expect(trail.textContent).not.toContain('›')
  })

  it('shows the two hero lead paragraphs, and the paired cards\' labels above their h2s with two paragraphs each', () => {
    renderPage(financialServices)
    const hero = screen.getByRole('region', { name: 'Financial figures you can reconcile.' })
    expect([...hero.querySelectorAll('.sector-hero__lead')].map((p) => [p.tagName, p.textContent])).toEqual([
      ['P', fcell('Hero', 'Lead, paragraph 1')],
      ['P', fcell('Hero', 'Lead, paragraph 2')],
    ])
    for (const n of [1, 2]) {
      const t = 'Challenge and approach'
      const heading = screen.getByRole('heading', { level: 2, name: fcell(t, `Card ${n} heading`) })
      const body = heading.parentElement!
      expect([...body.children].map((element) => [element.tagName, element.textContent])).toEqual([
        ['P', expect.stringMatching(new RegExp(`^${fcell(t, `Card ${n} label`)}$`, 'i'))],
        ['H2', fcell(t, `Card ${n} heading`)],
        ['P', fcell(t, `Card ${n} paragraph 1`)],
        ['P', fcell(t, `Card ${n} paragraph 2`)],
      ])
      expect(body.children[0]).toHaveClass('badge-card__label')
    }
  })

  it('shows the promise strip as one ol of four steps in order, each beginning with its hidden group label, the visible labels hidden (#98)', () => {
    renderPage(financialServices)
    const strip = main().querySelector('.promise')!
    const lists = within(strip as HTMLElement).getAllByRole('list')
    expect(lists).toHaveLength(1)
    const [ol] = lists
    expect(ol.tagName).toBe('OL')
    const items = within(ol).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    const [group1, group2] = groupLabels()
    items.forEach((item, index) => {
      const group = index < 2 ? group1 : group2
      const first = item.firstElementChild!
      expect(first).toHaveClass('visually-hidden')
      expect(first.textContent!.toUpperCase()).toBe(group)
      const { name, text } = steps()[index]
      expect(item.querySelector('.promise__number')!.textContent).toBe(String(index + 1))
      expect(item.querySelector('.promise__name')!.textContent).toBe(name)
      expect(item.querySelector('.promise__text')!.textContent).toBe(text)
      // The circles: teal tint for the assessment's steps, neutral after.
      expect(item.querySelector('.promise__number')).toHaveClass(index < 2 ? 'promise__number--accent' : 'promise__number--neutral')
    })
    // Visible labels on steps 1 and 3 only, hidden from assistive
    // technology, not headings.
    const visible = [...strip.querySelectorAll('.promise__label')]
    expect(visible.map((label) => [label.closest('li') === items[0] ? 1 : label.closest('li') === items[2] ? 3 : 0, label.textContent!.toUpperCase()])).toEqual([
      [1, group1],
      [3, group2],
    ])
    for (const label of visible) {
      expect(label).toHaveAttribute('aria-hidden', 'true')
      expect(label.tagName).toBe('SPAN')
    }
    expect(within(strip as HTMLElement).queryByRole('heading')).toBeNull()
    expect(strip.closest('section')).not.toHaveAttribute('aria-labelledby')
  })

  it('shows the stacked audience items: a strong name, then its text, with no colon', () => {
    renderPage(financialServices)
    const card = screen.getByRole('region', { name: 'Who we work with' }).querySelector('.audience-card')!
    const t = 'Who we work with'
    expect([...card.querySelectorAll('.audience-card__text')].map((p) => p.textContent)).toEqual([
      fcell(t, 'Card text'),
      added.audienceDetail,
    ])
    const list = card.querySelector('ul')!
    expect(list).not.toHaveAttribute('aria-labelledby')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    items.forEach((item, index) => {
      const { name, text } = fnamed(fcell(t, `Item ${index + 1}`))
      expect(item.querySelector('strong.checklist__name')!.textContent).toBe(name)
      expect(item.querySelector('.checklist__text')!.textContent).toBe(text)
      expect(item.textContent).toBe(`${name} ${text}`)
      expect(item.textContent).not.toContain(':')
    })
    expect(within(card as HTMLElement).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Financial institutions'])
  })

  it('labels section#assessment by its h2, and names its deliverables ul by the label', () => {
    renderPage(financialServices)
    const section = screen.getByRole('region', { name: 'The Data Trust Assessment: three weeks, fixed fee' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'assessment')
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.tagName).toBe('H2')
    const list = within(section).getByRole('list', { name: 'The assessment delivers' })
    expect(list.tagName).toBe('UL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    expect(document.getElementById(list.getAttribute('aria-labelledby')!)!.tagName).toBe('P')
    expect(section.textContent).not.toMatch(/reconcil|automated controls|Validated/i)
  })

  it('shows the reconciliation ul after the assessment: three cards, their statuses as text with decorative icons, and the caption associated (#98)', () => {
    renderPage(financialServices)
    const section = screen.getByRole('region', { name: 'Know where your financial figures come from' })
    expect(section.tagName).toBe('SECTION')
    expect(section.compareDocumentPosition(document.getElementById('assessment')!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(section.querySelector('.sector-eyebrow')!.textContent).toBe('After the assessment · What we can implement')
    const list = within(section).getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAccessibleDescription(fcell('Reconciliation (what we can implement)', 'Caption'))
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => [
      within(item).getByRole('heading', { level: 3 }).textContent,
      item.querySelector('.reconciliation__source')!.textContent,
      item.querySelector('.reconciliation__status')!.textContent,
    ])).toEqual(cards().map((card) => [card.record, `compared with ${card.source}`, card.status]))
    expect(items.map((item) => item.querySelector('.reconciliation__status svg')!.getAttribute('class'))).toEqual([
      'reconciliation__icon reconciliation__icon--check',
      'reconciliation__icon reconciliation__icon--alert',
      'reconciliation__icon reconciliation__icon--check',
    ])
    for (const item of items) {
      expect(item.querySelector('.reconciliation__source .visually-hidden')!.textContent).toBe('compared with')
      for (const svg of item.querySelectorAll('svg')) {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
        expect(svg.textContent).toBe('')
      }
    }
    expect(within(section).getAllByRole('heading').map((h) => h.tagName)).toEqual(['H2', 'H3', 'H3', 'H3'])
    expect(section.querySelectorAll('figure, svg:not(.reconciliation__icon)')).toHaveLength(0)
  })

  it('gives each service card its h3, then its teal lead line, then its text', () => {
    renderPage(financialServices)
    const cardItems = within(screen.getByRole('region', { name: 'After the assessment' })).getAllByRole('listitem')
    expect(cardItems.map((card) => [...card.querySelectorAll('h3, p')].map((element) => [element.tagName, element.className, element.textContent]))).toEqual(
      [1, 2, 3].map((n) => {
        const [name, lead, text] = fcell('After the assessment', `Card ${n}`).split(' / ')
        return [
          ['H3', 'sector-card-heading sector-card-heading--small', name],
          ['P', 'service-card-lp__lead service-card-lp__lead--accent', lead],
          ['P', 'service-card-lp__text', text],
        ]
      }),
    )
  })

  it('links the hero buttons to the email and #assessment, the service cards to their pages and the closing panel to the email', () => {
    renderPage(financialServices)
    const hero = screen.getByRole('region', { name: 'Financial figures you can reconcile.' })
    expect(within(hero).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    const jump = within(hero).getByRole('link', { name: 'See how the assessment works' })
    expect(jump).toHaveAttribute('href', '#assessment')
    expect(jump).toHaveAttribute('data-focus-section', 'assessment')
    const closing = screen.getByRole('region', { name: 'Build a financial data foundation you can trust' })
    expect(within(closing).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    expect(within(closing).getByRole('link', { name: email })).toHaveAttribute('href', `mailto:${email}`)
    expect(mainLinks()).toEqual([
      ['Home', '/'],
      ['Solutions', '/#solutions'],
      ['Book a data trust assessment→', `mailto:${email}`],
      ['See how the assessment works', '#assessment'],
      ['Integrate and model', '/services/data-engineering-integration'],
      ['Quality and governance', '/services/data-quality-reliability'],
      ['Reporting and dashboards', '/services/business-intelligence-analytics'],
      ['Book a data trust assessment→', `mailto:${email}`],
      [email, `mailto:${email}`],
    ])
    const mailtos = main().querySelectorAll('a[href^="mailto:"]')
    expect(mailtos).toHaveLength(3)
    for (const link of mailtos) expect(link).toHaveAttribute('href', 'mailto:info@fafanua.tech')
  })

  it('has no Delivered in stages section', () => {
    renderPage(financialServices)
    // The ordered lists: the breadcrumbs, the trace's steps and the
    // promise strip.
    const ols = [...main().querySelectorAll('ol')]
    expect(ols).toHaveLength(3)
    expect(ols[0].closest('nav')).toHaveAccessibleName('Breadcrumb')
    expect(ols[1].closest('figure')).not.toBeNull()
    expect(ols[2]).toHaveClass('promise__steps')
    expect(main().querySelector('ol.stages')).toBeNull()
    expect(main().textContent).not.toMatch(/Delivered in stages|No big-bang projects|Moves on when|Stage/)
  })

  it('draws the figure with its caption, description, five sources, five steps and three rated figures', () => {
    renderPage(financialServices)
    const figure = screen.getByRole('figure')
    expect(figure.querySelector(':scope > figcaption')!.textContent).toBe('Illustrative example. Sample data only.')
    expect(figure).toHaveAccessibleDescription(fsPlan.figureDescription)
    expect(document.getElementById(figure.getAttribute('aria-describedby')!)).toHaveClass('visually-hidden')
    const [sources, traceSteps, figures] = within(figure).getAllByRole('list')
    expect(within(sources).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'CRM',
      'Card & ATM switch',
      'Loan management',
      'Payments & mobile money',
      'General ledger',
    ])
    expect(traceSteps.tagName).toBe('OL')
    expect(within(traceSteps).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      flist(fcell('Trace diagram', 'Middle steps')),
    )
    expect(within(figures).getAllByRole('listitem').map((item) => texts(item))).toEqual([
      ['Portfolio at risk', 'Trusted with caveats'],
      ['Mobile money settlements', 'Trusted'],
      ['Loan book against ledger', 'Not yet trusted'],
    ])
    // CRM and Card & ATM switch do not feed the figures: faded, with
    // dashed connectors; the other three solid.
    expect([...sources.querySelectorAll('li')].map((item) => [
      item.classList.contains('trace__source--faded'),
      item.querySelector('.trace__connector--dashed') !== null,
    ])).toEqual([
      [true, true],
      [true, true],
      [false, false],
      [false, false],
      [false, false],
    ])
    for (const hidden of figure.querySelectorAll('.trace__connector, .rating-marker, svg')) {
      expect(hidden).toHaveAttribute('aria-hidden', 'true')
      expect(hidden.textContent).toBe('')
    }
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('has none of the removed sections or strings', () => {
    renderPage(financialServices)
    for (const name of [
      'Financial Services Data & Analytics',
      'Sector context',
      'Common data problems',
      'How Fafanua helps',
      'Reporting and analytics use cases',
      'Data quality and governance',
      'Operational activation',
      'Other sectors',
    ]) {
      expect(screen.queryByRole('heading', { name })).toBeNull()
    }
    expect(main().querySelector('#use-cases')).toBeNull()
    const text = main().textContent!
    for (const removed of [
      'Financial Services Data & Analytics',
      'For banks, SACCOs, microfinance institutions, fintechs',
      'Financial institutions run on many systems at once',
      'Payment and core-system integration',
      'Portfolio and customer data models',
      'Payment reconciliation controls',
      'Financial data governance',
      'Banking and portfolio dashboards',
      'Revenue leakage',
      'Let’s build a data foundation',
      'Which number do you trust least?',
      'Other sectors',
      '+256',
      'Reverse ETL',
      'Fafanua Intelligence',
      'AI-powered',
    ]) {
      expect(text).not.toContain(removed)
    }
    for (const theme of solutions.find((solution) => solution.id === 'financial-services')!.themes) {
      expect(text).not.toContain(theme)
    }
    expect(text).not.toMatch(/compliant|certified|certification|guarantee|meets the requirements of|regulatory compliance|in line with the/i)
    expect(text.match(/complian/gi)).toHaveLength(1)
    expect(text).not.toMatch(fsPlan.FORBIDDEN_TERMS)
    expect(main().querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('has no img, lang, tabindex or contenteditable in main, and no axe violations', async () => {
    const { container } = renderPage(financialServices)
    expect(main().querySelectorAll('img, canvas, [lang], [tabindex], [contenteditable]')).toHaveLength(0)
    await expectNoAxeViolations(container)
  })
})

// The Education page on the shared landing-page foundation (issue 100),
// against section 4 of _docs/fafanua-education-landing-page-plan.md, with
// the owner's A1, A2 and decisions (2026-10-26 and 2026-10-27), now
// recorded in the plan.
describe('Education page', () => {
  const { cell: ecell, list: elist, marked: emarked, named: enamed, buttonLabel: ebutton } = eduPlan
  const added = eduPlan.OWNER_ADDITIONS
  const main = () => screen.getByRole('main')
  const headings = (level: number) =>
    within(main()).getAllByRole('heading', { level }).map((heading) => heading.textContent)

  // Every text node in main, trimmed, in DOM order.
  function texts(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent!.trim()
      if (text) out.push(text)
    }
    return out
  }

  const upperIfPlan = (text: string, plan: string) => (text.toUpperCase() === plan ? plan : text)
  const t = 'One learner, one record'
  const steps = () => elist(ecell(t, 'Journey steps, in order')).map(enamed)
  const journeyList = () => screen.getByRole('region', { name: ecell(t, 'Heading') }).querySelector('ol')!

  it('has the plan\'s h2s and h3s, in order, with the two restored service cards', () => {
    renderPage(education)
    expect(headings(1)).toEqual([ecell('Hero', 'Heading (`h1`)')])
    expect(headings(1)).toEqual(['Every learner, counted the same way.'])
    expect(headings(2)).toEqual([
      'The challenge',
      'Our approach',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'One learner, one record',
      'What this means for AI',
      'Handled responsibly',
      'After the assessment',
      'Build an education data foundation you can trust',
    ])
    expect(headings(3)).toEqual([
      'Education institutions',
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      'Prioritised roadmap',
      'Integrate and model',
      'Quality and governance',
      'Reporting and dashboards',
      'Learner data warehouse',
      'Data governance and definitions',
    ])
  })

  it('shows exactly plan section 4\'s text in main, in DOM order, with the figure description, the hidden note, and the owner\'s A1, A2 and decisions (issue 100)', () => {
    renderPage(education)
    const plan = [
      ...ecell('Hero', 'Breadcrumb').split(' › '),
      ecell('Hero', 'Eyebrow'),
      ecell('Hero', 'Heading (`h1`)'),
      ecell('Hero', 'Lead'),
      ebutton(ecell('Hero', 'Primary button')),
      '→',
      ebutton(ecell('Hero', 'Secondary button')),
      eduPlan.figureDescription,
      ecell('Trace diagram', 'Left column heading'),
      ...elist(ecell('Trace diagram', 'Sources, in order')),
      ecell('Trace diagram', 'Middle box heading'),
      ...elist(ecell('Trace diagram', 'Middle steps')),
      ecell('Trace diagram', 'Middle footnote'),
      ecell('Trace diagram', 'Right column heading'),
      ...elist(ecell('Trace diagram', 'Figures and ratings')).flatMap((entry) => {
        const { name, rating } = emarked(entry)
        return [name, rating!]
      }),
      ecell('Trace diagram', 'Caption'),
      ...[1, 2].flatMap((n) => [ecell('Challenge and approach', `Card ${n} heading`), ecell('Challenge and approach', `Card ${n} text`)]),
      ecell('Who we work with', 'Heading'),
      ecell('Who we work with', 'Subheading'),
      ecell('Who we work with', 'Card heading'),
      ecell('Who we work with', 'Card text'),
      added.audienceDetail,
      ...elist(ecell('Who we work with', 'Checklist')),
      ecell('The Data Trust Assessment', 'Eyebrow'),
      ecell('The Data Trust Assessment', 'Heading'),
      ecell('The Data Trust Assessment', 'Text'),
      ...[1, 2, 3, 4].flatMap((n) => Object.values(enamed(ecell('The Data Trust Assessment', `Deliverable ${n}`)))),
      ecell(t, 'Eyebrow'),
      ecell(t, 'Heading'),
      `${ecell(t, 'Opening sentence')} ${ecell(t, 'Text')}`,
      ...steps().flatMap((step) =>
        step.name === 'Learn'
          ? [step.name, eduPlan.HIGHLIGHT_NOTE, step.text, ecell(t, 'Callout label'), ecell(t, 'Callout text'), ecell(t, 'Caption')]
          : [step.name, step.text],
      ),
      ecell('AI and responsible handling', 'Card 1 heading'),
      ecell('AI and responsible handling', 'Card 1 text'),
      ...elist(ecell('AI and responsible handling', 'Card 1 chips')).map((chip) => emarked(chip).name),
      ecell('AI and responsible handling', 'Card 2 heading'),
      ...eduPlan.handlingItems(ecell('AI and responsible handling', 'Card 2 checklist')),
      ecell('After the assessment', 'Heading'),
      ecell('After the assessment', 'Subheading'),
      ...[1, 2, 3, 4, 5].flatMap((n) => Object.values(enamed(ecell('After the assessment', `Card ${n}`)))),
      ecell('Closing panel', 'Eyebrow'),
      ecell('Closing panel', 'Heading'),
      `${ecell('Closing panel', 'Text')} ${added.closingFollowUp}`,
      ebutton(ecell('Closing panel', 'Primary button')),
      '→',
      ebutton(ecell('Closing panel', 'Secondary link')),
    ]
    const shown = texts(main())
    // Labels the plan writes in capitals are stored in sentence case and
    // capitalised by CSS.
    expect(shown.map((text, index) => upperIfPlan(text, plan[index]))).toEqual(plan)
    expect(shown.filter((text, index) => text !== plan[index])).toEqual([
      'Education solutions',
      'Start with trust',
      'What happens next',
      'Definition agreed',
      'Get started',
    ])
    // Digits only in the callout's "30".
    expect(main().textContent!.match(/\d+/g)).toEqual(['30'])
  })

  it('shows the protected "trusted data foundation" in the closing panel (owner, A1, issue 100)', () => {
    renderPage(education)
    const closing = screen.getByRole('region', { name: 'Build an education data foundation you can trust' })
    expect(closing).toHaveTextContent('trusted data foundation')
    expect(closing.querySelector('.sector-closing__body')).not.toHaveClass('visually-hidden')
  })

  it('has the breadcrumbs Home › Solutions › Education', () => {
    renderPage(education)
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', 'Solutions', 'Education'])
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(trail).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'page')
    expect(trail.textContent).not.toContain('›')
  })

  it('shows one hero lead, plain paired cards, and the audience card with its cap badge, A2 and four plain items', () => {
    renderPage(education)
    const hero = screen.getByRole('region', { name: 'Every learner, counted the same way.' })
    expect([...hero.querySelectorAll('.sector-hero__lead')].map((p) => p.textContent)).toEqual([ecell('Hero', 'Lead')])
    for (const n of [1, 2]) {
      const body = screen.getByRole('heading', { level: 2, name: ecell('Challenge and approach', `Card ${n} heading`) }).parentElement!
      expect([...body.children].map((element) => element.tagName)).toEqual(['H2', 'P'])
    }
    const card = screen.getByRole('region', { name: 'Who we work with' }).querySelector('.audience-card')!
    expect([...card.querySelectorAll('.audience-card__text')].map((p) => [p.tagName, p.textContent])).toEqual([
      ['P', ecell('Who we work with', 'Card text')],
      ['P', added.audienceDetail],
    ])
    // The cap badge: the same paths as the cap icon.
    const badge = card.querySelector(':scope > .icon-badge svg')!
    expect([...badge.querySelectorAll('path')].map((path) => path.getAttribute('d'))[0]).toBe('M12 5 2.75 9.5 12 14l9.25-4.5Z')
    const items = within(card.querySelector('ul')!).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(elist(ecell('Who we work with', 'Checklist')))
    expect(card.querySelectorAll('strong, .audience-card__label')).toHaveLength(0)
  })

  it('labels section#assessment by its h2, and keeps implementation work and the journey out of it', () => {
    renderPage(education)
    const section = screen.getByRole('region', { name: 'The Data Trust Assessment: three weeks, fixed fee' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'assessment')
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.tagName).toBe('H2')
    expect(within(within(section).getByRole('list')).getAllByRole('listitem')).toHaveLength(4)
    expect(section.textContent).not.toMatch(/connect|integrat|reconcil|pipeline|dashboard|build/i)
    expect(section.querySelector('.journey, .definition-callout')).toBeNull()
  })

  it('shows the journey as its own section after the assessment band: an ol of exactly five steps in plan order, no headings in it', () => {
    renderPage(education)
    const section = screen.getByRole('region', { name: ecell(t, 'Heading') })
    expect(section.tagName).toBe('SECTION')
    const assessment = document.getElementById('assessment')!
    expect(assessment.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(assessment.nextElementSibling).toBe(section)
    // The owner's eyebrow over the heading (2026-10-27): what follows the
    // three-week assessment.
    expect(section.querySelector('.sector-eyebrow')!.textContent).toBe('What happens next')
    expect(within(section).getByRole('heading', { level: 2 }).textContent).toBe('One learner, one record')
    expect(section.querySelector('.sector-eyebrow')!.nextElementSibling!.tagName).toBe('H2')
    const ol = journeyList()
    expect(ol).toHaveAttribute('role', 'list')
    const items = within(ol).getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(ol.children).toHaveLength(5)
    expect(items.map((item) => [item.querySelector('.journey__name')!.textContent, item.querySelector('.journey__system')!.textContent])).toEqual(
      steps().map((step) => [step.name, step.text]),
    )
    expect(within(ol).queryAllByRole('heading')).toHaveLength(0)
    expect(ol.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
    for (const item of items) {
      const dot = item.querySelector('.journey__dot')!
      expect(dot).toHaveAttribute('aria-hidden', 'true')
      expect(dot.textContent).toBe('')
    }
    expect(section.querySelectorAll('svg, img')).toHaveLength(0)
  })

  it('highlights only Learn: its class, the hidden "(definition shown below)" after its name, then its system, the callout and the caption inside it, described by the callout', () => {
    renderPage(education)
    const items = within(journeyList()).getAllByRole('listitem')
    expect(items.map((item) => item.classList.contains('journey__step--highlight'))).toEqual([false, false, true, false, false])
    const learn = items[2]
    const order = [...learn.querySelectorAll('.journey__name, .visually-hidden, .journey__system, .definition-callout, .journey__caption')]
    expect(order.map((element) => element.className)).toEqual([
      'journey__name',
      'visually-hidden',
      'journey__system',
      'definition-callout',
      'journey__caption',
    ])
    expect(order[1].textContent).toBe('(definition shown below)')
    const callout = learn.querySelector('.definition-callout')!
    expect(callout.id).toBeTruthy()
    expect(learn).toHaveAttribute('aria-describedby', callout.id)
    expect([...callout.children].map((element) => [element.tagName, element.textContent])).toEqual([
      ['P', 'Definition agreed'],
      ['P', ecell(t, 'Callout text')],
    ])
    expect(learn).toHaveAccessibleDescription(`Definition agreed ${ecell(t, 'Callout text')}`)
    expect(learn.querySelector('.journey__caption')!.tagName).toBe('P')
    expect(learn.querySelector('.journey__caption')!.textContent).toBe('Illustrative example. Sample definition only.')
    for (const item of [items[0], items[1], items[3], items[4]]) {
      expect(item).not.toHaveAttribute('aria-describedby')
      expect(item.querySelectorAll('.visually-hidden, .definition-callout, .journey__caption')).toHaveLength(0)
    }
    // Neither the callout nor the caption repeats.
    expect(main().querySelectorAll('.definition-callout')).toHaveLength(1)
    expect(main().textContent!.split(ecell(t, 'Callout text'))).toHaveLength(2)
    expect(main().textContent!.split('Sample definition only.')).toHaveLength(2)
  })

  it('gives each service card its h3 link, then its text, with no lead or detail', () => {
    renderPage(education)
    const cardItems = within(screen.getByRole('region', { name: 'After the assessment' })).getAllByRole('listitem')
    expect(cardItems.map((card) => [...card.querySelectorAll('h3, p')].map((element) => [element.tagName, element.className, element.textContent]))).toEqual(
      [1, 2, 3, 4, 5].map((n) => enamed(ecell('After the assessment', `Card ${n}`))).map(({ name, text }) => [
        ['H3', 'sector-card-heading sector-card-heading--small', name],
        ['P', 'service-card-lp__text', text],
      ]),
    )
  })

  it('links the hero buttons to the email and #assessment, the five service cards to their pages and the closing panel to the email', () => {
    renderPage(education)
    const hero = screen.getByRole('region', { name: 'Every learner, counted the same way.' })
    expect(within(hero).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    const jump = within(hero).getByRole('link', { name: 'See how the assessment works' })
    expect(jump).toHaveAttribute('href', '#assessment')
    expect(jump).toHaveAttribute('data-focus-section', 'assessment')
    const closing = screen.getByRole('region', { name: 'Build an education data foundation you can trust' })
    expect(within(closing).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    expect(within(closing).getByRole('link', { name: email })).toHaveAttribute('href', `mailto:${email}`)
    expect(mainLinks()).toEqual([
      ['Home', '/'],
      ['Solutions', '/#solutions'],
      ['Book a data trust assessment→', `mailto:${email}`],
      ['See how the assessment works', '#assessment'],
      ['Integrate and model', '/services/data-engineering-integration'],
      ['Quality and governance', '/services/data-quality-reliability'],
      ['Reporting and dashboards', '/services/business-intelligence-analytics'],
      ['Learner data warehouse', '/services/data-warehousing-analytics-modelling'],
      ['Data governance and definitions', '/services/data-governance-metadata'],
      ['Book a data trust assessment→', `mailto:${email}`],
      [email, `mailto:${email}`],
    ])
    const mailtos = main().querySelectorAll('a[href^="mailto:"]')
    expect(mailtos).toHaveLength(3)
    for (const link of mailtos) expect(link).toHaveAttribute('href', 'mailto:info@fafanua.tech')
  })

  it('has no Delivered in stages, promise strip or reconciliation section', () => {
    renderPage(education)
    // The ordered lists: the breadcrumbs, the trace's steps and the
    // journey.
    const ols = [...main().querySelectorAll('ol')]
    expect(ols).toHaveLength(3)
    expect(ols[0].closest('nav')).toHaveAccessibleName('Breadcrumb')
    expect(ols[1].closest('figure')).not.toBeNull()
    expect(ols[2]).toHaveClass('journey')
    expect(main().querySelectorAll('ol.stages, .promise, .reconciliation')).toHaveLength(0)
    expect(main().textContent).not.toMatch(/Delivered in stages|No big-bang projects|Moves on when|Stage/)
  })

  it('draws the figure with its caption, description, five sources (two faded), five steps and three rated figures', () => {
    renderPage(education)
    const figure = screen.getByRole('figure')
    expect(figure.querySelector(':scope > figcaption')!.textContent).toBe('Illustrative example. Sample data only.')
    expect(figure).toHaveAccessibleDescription(eduPlan.figureDescription)
    expect(document.getElementById(figure.getAttribute('aria-describedby')!)).toHaveClass('visually-hidden')
    const [sources, traceSteps, figures] = within(figure).getAllByRole('list')
    expect(within(sources).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Admissions',
      'Exams & grading',
      'Student information system',
      'Learning platform',
      'Fees & finance',
    ])
    expect(traceSteps.tagName).toBe('OL')
    expect(within(traceSteps).getAllByRole('listitem').map((item) => item.textContent)).toEqual(elist(ecell('Trace diagram', 'Middle steps')))
    expect(within(figures).getAllByRole('listitem').map((item) => texts(item))).toEqual([
      ['Active learners', 'Trusted with caveats'],
      ['Fee collection rate', 'Trusted'],
      ['Completion rate', 'Not yet trusted'],
    ])
    expect([...sources.querySelectorAll('li')].map((item) => [
      item.classList.contains('trace__source--faded'),
      item.querySelector('.trace__connector--dashed') !== null,
    ])).toEqual([
      [true, true],
      [true, true],
      [false, false],
      [false, false],
      [false, false],
    ])
    for (const hidden of figure.querySelectorAll('.trace__connector, .rating-marker, svg')) {
      expect(hidden).toHaveAttribute('aria-hidden', 'true')
      expect(hidden.textContent).toBe('')
    }
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('has none of the removed sections or strings, no compliance claim and no name', () => {
    renderPage(education)
    for (const name of [
      'Education Data & Analytics',
      'Sector context',
      'Common data problems',
      'How Fafanua helps',
      'Reporting and analytics use cases',
      'Data quality and governance',
      'Operational activation',
      'Other sectors',
    ]) {
      expect(screen.queryByRole('heading', { name })).toBeNull()
    }
    expect(main().querySelector('#use-cases')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Education dashboards' })).toBeNull()
    const text = main().textContent!
    for (const removed of [
      'Education Data & Analytics',
      'For universities, colleges, school networks',
      'Student-system integration',
      'Learner lifecycle data models',
      'Education data governance',
      'Let’s build a data foundation',
      'Which number do you trust least?',
      'Other sectors',
      'under 18',
      '+256',
      'Reverse ETL',
      'Fafanua Intelligence',
      'AI-powered',
    ]) {
      expect(text).not.toContain(removed)
    }
    for (const theme of solutions.find((solution) => solution.id === 'education')!.themes) {
      expect(text).not.toContain(theme)
    }
    // The plan's "Certification records" is the only "certification".
    expect(text.replace('Certification records', '')).not.toMatch(eduPlan.COMPLIANCE_TERMS)
    expect(text).not.toMatch(eduPlan.NAMING_TERMS)
    expect(main().querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('has no img, lang, tabindex or contenteditable in main, and no axe violations', async () => {
    const { container } = renderPage(education)
    expect(main().querySelectorAll('img, canvas, [lang], [tabindex], [contenteditable]')).toHaveLength(0)
    await expectNoAxeViolations(container)
  })
})

// The Retail & Distribution page on the shared landing-page foundation
// (issue 101), against section 4 of
// _docs/fafanua-retail-distribution-landing-page-plan.md, with the
// owner's decisions of 2026-10-27, recorded in the plan, and the owner's
// proposed closing follow-up.
describe('Retail & Distribution page', () => {
  const { cell: rcell, list: rlist, marked: rmarked, named: rnamed, buttonLabel: rbutton } = retailPlan
  const main = () => screen.getByRole('main')
  const headings = (level: number) =>
    within(main()).getAllByRole('heading', { level }).map((heading) => heading.textContent)

  // Every text node in main, trimmed, in DOM order.
  function texts(root: Element) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const out: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent!.trim()
      if (text) out.push(text)
    }
    return out
  }

  const upperIfPlan = (text: string, plan: string) => (text.toUpperCase() === plan ? plan : text)
  const t = 'One stock figure'
  const r = 'Readiness and responsible handling'
  const n = 'What happens next'
  const steps = () => rlist(rcell(t, 'Journey steps, in order')).map(rnamed)
  const journeyList = () => screen.getByRole('region', { name: rcell(t, 'Heading') }).querySelector('ol')!
  const closingName = 'Build a retail data foundation you can trust'

  it('has the plan\'s h2s and h3s, in order', () => {
    renderPage(retail)
    expect(headings(1)).toEqual([rcell('Hero', 'Heading (`h1`)')])
    expect(headings(1)).toEqual(['Sales, stock and margin you can trace.'])
    expect(headings(2)).toEqual([
      'The challenge',
      'Our approach',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'Follow every unit, from supplier to shelf',
      'Trusted data makes advanced analytics possible.',
      'Handled responsibly',
      'From findings to a stronger retail data foundation.',
      closingName,
    ])
    expect(headings(3)).toEqual([
      'Retailers and supermarket chains',
      'Wholesalers and distributors',
      'FMCG and consumer brands',
      'Lineage map',
      'Trust scorecard',
      'Shared definitions',
      'Prioritised roadmap',
      'Integrate & model',
      'Quality & governance',
      'Reporting & dashboards',
      'Retail data warehouse',
    ])
  })

  it('shows exactly plan section 4\'s text in main, in DOM order, with the figure description, the hidden note, the owner\'s fourth service card and the proposed follow-up (issue 101)', () => {
    renderPage(retail)
    const plan = [
      ...rcell('Hero', 'Breadcrumb').split(' › '),
      rcell('Hero', 'Eyebrow'),
      rcell('Hero', 'Heading (`h1`)'),
      rcell('Hero', 'Lead, paragraph 1'),
      rcell('Hero', 'Lead, paragraph 2'),
      rbutton(rcell('Hero', 'Primary button')),
      '→',
      rbutton(rcell('Hero', 'Secondary button')),
      retailPlan.figureDescription,
      rcell('Trace diagram', 'Left column heading'),
      ...rlist(rcell('Trace diagram', 'Sources, in order')),
      rcell('Trace diagram', 'Middle box heading'),
      ...rlist(rcell('Trace diagram', 'Middle steps')),
      rcell('Trace diagram', 'Middle footnote'),
      rcell('Trace diagram', 'Right column heading'),
      ...rlist(rcell('Trace diagram', 'Figures and ratings')).flatMap((entry) => {
        const { name, rating } = rmarked(entry)
        return [name, rating!]
      }),
      rcell('Trace diagram', 'Caption'),
      ...[1, 2].flatMap((i) => [rcell('Challenge and approach', `Card ${i} heading`), rcell('Challenge and approach', `Card ${i} text`)]),
      rcell('Who we work with', 'Heading'),
      rcell('Who we work with', 'Subheading'),
      ...[1, 2, 3].flatMap((i) => {
        const { heading, text, items } = retailPlan.segment(rcell('Who we work with', `Segment ${i}`))
        return [heading, text, ...items]
      }),
      rcell('The Data Trust Assessment', 'Eyebrow'),
      rcell('The Data Trust Assessment', 'Heading'),
      rcell('The Data Trust Assessment', 'Text'),
      ...[1, 2, 3, 4].flatMap((i) => Object.values(rnamed(rcell('The Data Trust Assessment', `Deliverable ${i}`)))),
      rcell(t, 'Eyebrow'),
      rcell(t, 'Heading'),
      rcell(t, 'Text'),
      ...steps().flatMap((step) =>
        step.name === 'On hand'
          ? [step.name, retailPlan.HIGHLIGHT_NOTE, step.text, rcell(t, 'Callout label'), rcell(t, 'Callout text'), rcell(t, 'Caption')]
          : [step.name, step.text],
      ),
      rcell(r, 'Card 1 eyebrow'),
      rcell(r, 'Card 1 heading'),
      rcell(r, 'Card 1 text'),
      rcell(r, 'Card 2 heading'),
      ...retailPlan.handlingItems(rcell(r, 'Card 2 checklist')),
      rcell(n, 'Eyebrow'),
      rcell(n, 'Heading'),
      rcell(n, 'Supporting line'),
      ...[1, 2, 3, 4].flatMap((i) => Object.values(rnamed(rcell(n, `Card ${i}`)))),
      rcell('Closing panel', 'Eyebrow'),
      rcell('Closing panel', 'Heading'),
      `${rcell('Closing panel', 'Text')} ${retailPlan.PROPOSED_FOLLOW_UP}`,
      rbutton(rcell('Closing panel', 'Primary button')),
      '→',
      rbutton(rcell('Closing panel', 'Secondary link')),
    ]
    const shown = texts(main())
    // Labels the plan writes in capitals are stored in sentence case and
    // capitalised by CSS.
    expect(shown.map((text, index) => upperIfPlan(text, plan[index]))).toEqual(plan)
    expect(shown.filter((text, index) => text !== plan[index])).toEqual([
      'Retail and distribution solutions',
      'Start with trust',
      'One stock figure',
      'Variance explained',
      'Ready for what comes next',
      'What happens next',
      'Get started',
    ])
    // Digits only in the callout's sample figures.
    expect(main().textContent!.match(/\d[\d,]*/g)).toEqual(['1,240', '1,182', '58'])
  })

  it('shows the protected "trusted data foundation" in the closing panel, through the owner\'s proposed follow-up (issue 101)', () => {
    renderPage(retail)
    const closing = screen.getByRole('region', { name: closingName })
    expect(closing).toHaveTextContent('trusted data foundation')
    expect(closing.querySelector('.sector-closing__body')).not.toHaveClass('visually-hidden')
    expect(main().textContent!.match(/trusted data foundation/g)).toHaveLength(1)
  })

  it('has the breadcrumbs Home › Solutions › Retail & distribution', () => {
    renderPage(retail)
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home', 'Solutions', 'Retail & distribution'])
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(trail).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'page')
    expect(trail.textContent).not.toContain('›')
  })

  it('shows two hero leads and plain paired cards', () => {
    renderPage(retail)
    const hero = screen.getByRole('region', { name: 'Sales, stock and margin you can trace.' })
    expect([...hero.querySelectorAll('.sector-hero__lead')].map((p) => p.textContent)).toEqual([
      rcell('Hero', 'Lead, paragraph 1'),
      rcell('Hero', 'Lead, paragraph 2'),
    ])
    for (const i of [1, 2]) {
      const body = screen.getByRole('heading', { level: 2, name: rcell('Challenge and approach', `Card ${i} heading`) }).parentElement!
      expect([...body.children].map((element) => element.tagName)).toEqual(['H2', 'P'])
    }
  })

  it('shows Who we work with as a ul of exactly three segment cards, each a badge, its h3, its description and a three-item checklist, with the card, truck and box badges', () => {
    renderPage(retail)
    const section = screen.getByRole('region', { name: 'Who we work with' })
    expect(section.tagName).toBe('SECTION')
    expect(section.querySelector('.audience-card')).toBeNull()
    expect(section.querySelector('.sector-subheading')!.textContent).toBe(rcell('Who we work with', 'Subheading'))
    const list = section.querySelector('ul.segment-cards') as HTMLElement
    expect(list).toHaveAttribute('role', 'list')
    expect(list.children).toHaveLength(3)
    const cards = [...list.children] as HTMLElement[]
    const plan = [1, 2, 3].map((i) => retailPlan.segment(rcell('Who we work with', `Segment ${i}`)))
    expect(cards.map((card) => card.tagName)).toEqual(['LI', 'LI', 'LI'])
    for (const [index, card] of cards.entries()) {
      expect([...card.children].map((element) => element.tagName)).toEqual(['SPAN', 'H3', 'P', 'UL'])
      expect(card.querySelector('h3')!.textContent).toBe(plan[index].heading)
      expect(card.querySelector('.segment-card__text')!.textContent).toBe(plan[index].text)
      const items = within(card.querySelector('ul') as HTMLElement).getAllByRole('listitem')
      expect(items).toHaveLength(3)
      expect(items.map((item) => item.textContent)).toEqual(plan[index].items)
      for (const tick of card.querySelectorAll('.checklist__tick')) expect(tick).toHaveAttribute('aria-hidden', 'true')
      expect(card.querySelector(':scope > .icon-badge')).toHaveAttribute('aria-hidden', 'true')
      expect(card.querySelector(':scope > .icon-badge')).toHaveClass('icon-badge--round')
    }
    // The badges' icons by their first paths: card, truck and box.
    const firstShape = (card: HTMLElement) => {
      const first = card.querySelector(':scope > .icon-badge svg')!.firstElementChild!
      return first.tagName.toLowerCase() === 'rect' ? 'rect' : first.getAttribute('d')
    }
    expect(cards.map(firstShape)).toEqual([
      'rect',
      'M5.25 17H3V6.25h10.5V17M13.5 9.5h3.75l3.25 3.5V17h-1.75M8.75 17h6.5',
      'M12 3.5 4.25 7.5v9L12 20.5l7.75-4v-9Z',
    ])
  })

  it('labels section#assessment by its h2, and keeps implementation work and the journey out of it', () => {
    renderPage(retail)
    const section = screen.getByRole('region', { name: 'The Data Trust Assessment: three weeks, fixed fee' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'assessment')
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.tagName).toBe('H2')
    expect(within(within(section).getByRole('list')).getAllByRole('listitem')).toHaveLength(4)
    expect(section.textContent).not.toMatch(/connect|integrat|reconcil|pipeline|dashboard|build/i)
    expect(section.querySelector('.journey, .definition-callout')).toBeNull()
  })

  it('shows the journey as its own section after the assessment band: an ol of exactly five steps in plan order, no headings in it, the callout aligned to the end', () => {
    renderPage(retail)
    const section = screen.getByRole('region', { name: rcell(t, 'Heading') })
    expect(section.tagName).toBe('SECTION')
    const assessment = document.getElementById('assessment')!
    expect(assessment.nextElementSibling).toBe(section)
    expect(section.querySelector('.sector-eyebrow')!.textContent).toBe('One stock figure')
    expect(section.querySelector('.sector-eyebrow')!.nextElementSibling!.tagName).toBe('H2')
    const ol = journeyList()
    expect(ol).toHaveAttribute('role', 'list')
    expect(ol).toHaveClass('journey journey--callout-end')
    const items = within(ol).getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(ol.children).toHaveLength(5)
    expect(items.map((item) => [item.querySelector('.journey__name')!.textContent, item.querySelector('.journey__system')!.textContent])).toEqual(
      steps().map((step) => [step.name, step.text]),
    )
    expect(items.map((item) => item.querySelector('.journey__name')!.textContent)).toEqual(['Ordered', 'Received', 'Transferred', 'Sold', 'On hand'])
    expect(ol.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
    for (const item of items) {
      const dot = item.querySelector('.journey__dot')!
      expect(dot).toHaveAttribute('aria-hidden', 'true')
      expect(dot.textContent).toBe('')
    }
    expect(section.querySelectorAll('svg, img')).toHaveLength(0)
  })

  it('highlights only On hand: its class, the hidden "(variance shown below)" after its name, then its system, the callout and the caption inside it, described by the callout', () => {
    renderPage(retail)
    const items = within(journeyList()).getAllByRole('listitem')
    expect(items.map((item) => item.classList.contains('journey__step--highlight'))).toEqual([false, false, false, false, true])
    const onHand = items[4]
    const order = [...onHand.querySelectorAll('.journey__name, .visually-hidden, .journey__system, .definition-callout, .journey__caption')]
    expect(order.map((element) => element.className)).toEqual([
      'journey__name',
      'visually-hidden',
      'journey__system',
      'definition-callout',
      'journey__caption',
    ])
    expect(order[1].textContent).toBe('(variance shown below)')
    const callout = onHand.querySelector('.definition-callout')!
    expect(callout.id).toBeTruthy()
    expect(onHand).toHaveAttribute('aria-describedby', callout.id)
    expect([...callout.children].map((element) => [element.tagName, element.textContent])).toEqual([
      ['P', 'Variance explained'],
      ['P', rcell(t, 'Callout text')],
    ])
    expect(onHand).toHaveAccessibleDescription(`Variance explained ${rcell(t, 'Callout text')}`)
    expect(onHand.querySelector('.journey__caption')!.tagName).toBe('P')
    expect(onHand.querySelector('.journey__caption')!.textContent).toBe('Illustrative example. Sample data only.')
    for (const item of items.slice(0, 4)) {
      expect(item).not.toHaveAttribute('aria-describedby')
      expect(item.querySelectorAll('.visually-hidden, .definition-callout, .journey__caption')).toHaveLength(0)
    }
    expect(main().querySelectorAll('.definition-callout')).toHaveLength(1)
    expect(main().textContent!.split(rcell(t, 'Callout text'))).toHaveLength(2)
  })

  it('shows the readiness eyebrow directly above its h2 and no chips, and the handling checklist', () => {
    renderPage(retail)
    const readiness = screen.getByRole('heading', { level: 2, name: rcell(r, 'Card 1 heading') }).parentElement!
    expect([...readiness.children].map((element) => [element.tagName, element.className, element.textContent])).toEqual([
      ['P', 'sector-eyebrow badge-card__label', 'Ready for what comes next'],
      ['H2', 'badge-card__heading', rcell(r, 'Card 1 heading')],
      ['P', 'badge-card__text', rcell(r, 'Card 1 text')],
    ])
    expect(main().querySelectorAll('.chips, .chip')).toHaveLength(0)
    const handling = screen.getByRole('heading', { level: 2, name: 'Handled responsibly' }).parentElement!
    expect(within(handling.querySelector('ul') as HTMLElement).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
      retailPlan.handlingItems(rcell(r, 'Card 2 checklist')),
    )
    // Badges above the content: the gauge and the shield.
    for (const card of [readiness, handling]) expect(card.parentElement).toHaveClass('badge-card badge-card--stacked')
  })

  it('shows What happens next with its eyebrow directly above its h2, the supporting line and four service cards, the fourth the owner\'s, with no detail', () => {
    renderPage(retail)
    const section = screen.getByRole('region', { name: rcell(n, 'Heading') })
    expect([...section.querySelector('.container')!.children].map((element) => [element.tagName, element.textContent])).toEqual([
      ['P', 'What happens next'],
      ['H2', rcell(n, 'Heading')],
      ['P', rcell(n, 'Supporting line')],
      ['UL', expect.any(String)],
    ])
    expect(section.querySelector('.sector-eyebrow')!.nextElementSibling!.tagName).toBe('H2')
    const cardItems = within(section).getAllByRole('listitem')
    expect(cardItems.map((card) => [...card.querySelectorAll('h3, p')].map((element) => [element.tagName, element.className, element.textContent]))).toEqual(
      [1, 2, 3, 4].map((i) => rnamed(rcell(n, `Card ${i}`))).map(({ name, text }) => [
        ['H3', 'sector-card-heading sector-card-heading--small', name],
        ['P', 'service-card-lp__text', text],
      ]),
    )
  })

  it('links the hero buttons to the email and #assessment, the four service cards to their pages and the closing panel\'s two links to the email', () => {
    renderPage(retail)
    const hero = screen.getByRole('region', { name: 'Sales, stock and margin you can trace.' })
    expect(within(hero).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    const jump = within(hero).getByRole('link', { name: 'See how the assessment works' })
    expect(jump).toHaveAttribute('href', '#assessment')
    expect(jump).toHaveAttribute('data-focus-section', 'assessment')
    const closing = screen.getByRole('region', { name: closingName })
    expect(closing).toHaveAttribute('id', 'contact')
    expect(within(closing).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', `mailto:${email}`)
    expect(within(closing).getByRole('link', { name: email })).toHaveAttribute('href', `mailto:${email}`)
    expect(mainLinks()).toEqual([
      ['Home', '/'],
      ['Solutions', '/#solutions'],
      ['Book a data trust assessment→', `mailto:${email}`],
      ['See how the assessment works', '#assessment'],
      ['Integrate & model', '/services/data-engineering-integration'],
      ['Quality & governance', '/services/data-quality-reliability'],
      ['Reporting & dashboards', '/services/business-intelligence-analytics'],
      ['Retail data warehouse', '/services/data-warehousing-analytics-modelling'],
      ['Book a data trust assessment→', `mailto:${email}`],
      [email, `mailto:${email}`],
    ])
    const mailtos = main().querySelectorAll('a[href^="mailto:"]')
    expect(mailtos).toHaveLength(3)
    for (const link of mailtos) expect(link).toHaveAttribute('href', 'mailto:info@fafanua.tech')
    expect(main().querySelector('a[href^="tel:"]')).toBeNull()
  })

  it('has no Delivered in stages, promise strip or reconciliation section', () => {
    renderPage(retail)
    const ols = [...main().querySelectorAll('ol')]
    expect(ols).toHaveLength(3)
    expect(ols[0].closest('nav')).toHaveAccessibleName('Breadcrumb')
    expect(ols[1].closest('figure')).not.toBeNull()
    expect(ols[2]).toHaveClass('journey')
    expect(main().querySelectorAll('ol.stages, .promise, .reconciliation')).toHaveLength(0)
    expect(main().textContent).not.toMatch(/Delivered in stages|No big-bang projects|Moves on when|Stage\b/)
  })

  it('draws the figure with its caption, description, five sources (two faded), five steps and three rated figures', () => {
    renderPage(retail)
    const figure = screen.getByRole('figure')
    expect(figure.querySelector(':scope > figcaption')!.textContent).toBe('Illustrative example. Sample data only.')
    expect(figure).toHaveAccessibleDescription(retailPlan.figureDescription)
    expect(document.getElementById(figure.getAttribute('aria-describedby')!)).toHaveClass('visually-hidden')
    const [sources, traceSteps, figures] = within(figure).getAllByRole('list')
    expect(within(sources).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Loyalty & CRM',
      'Distribution & delivery',
      'Point of sale',
      'Inventory & warehouse',
      'Finance ledger',
    ])
    expect(traceSteps.tagName).toBe('OL')
    expect(within(traceSteps).getAllByRole('listitem').map((item) => item.textContent)).toEqual(rlist(rcell('Trace diagram', 'Middle steps')))
    expect(within(figures).getAllByRole('listitem').map((item) => texts(item))).toEqual([
      ['Sales by outlet', 'Trusted'],
      ['Gross margin by product', 'Trusted with caveats'],
      ['Stock accuracy', 'Not yet trusted'],
    ])
    expect([...sources.querySelectorAll('li')].map((item) => [
      item.classList.contains('trace__source--faded'),
      item.querySelector('.trace__connector--dashed') !== null,
    ])).toEqual([
      [true, true],
      [true, true],
      [false, false],
      [false, false],
      [false, false],
    ])
    for (const hidden of figure.querySelectorAll('.trace__connector, .rating-marker, svg')) {
      expect(hidden).toHaveAttribute('aria-hidden', 'true')
      expect(hidden.textContent).toBe('')
    }
    expect(within(figure).queryByRole('heading')).toBeNull()
  })

  it('has none of the removed sections or strings, no compliance claim, no AI product and no name', () => {
    renderPage(retail)
    for (const name of [
      'Retail & Distribution Analytics',
      'Sector context',
      'Common data problems',
      'How Fafanua helps',
      'Reporting and analytics use cases',
      'Data quality and governance',
      'Operational activation',
      'Other sectors',
    ]) {
      expect(screen.queryByRole('heading', { name })).toBeNull()
    }
    expect(main().querySelector('#use-cases')).toBeNull()
    for (const name of ['Retail payment reconciliation', 'Point-of-sale, ERP and payment integration', 'Sales and inventory data models', 'Sales and branch-performance dashboards']) {
      expect(screen.queryByRole('link', { name })).toBeNull()
    }
    const text = main().textContent!
    for (const removed of [
      'Retail & Distribution Analytics',
      'For supermarkets, pharmacy chains',
      'pharmacy chains',
      'supermarkets',
      'Let’s build a data foundation',
      'Other sectors',
      'Retail payment reconciliation',
      '+256',
      'Reverse ETL',
      'Fafanua Intelligence',
      'AI-powered',
    ]) {
      expect(text).not.toContain(removed)
    }
    // The seven themes are gone: "Inventory analytics" survives only as
    // the start of the plan's segment item "Inventory analytics across
    // warehouses and depots", never as an item of its own.
    const themes = solutions.find((solution) => solution.id === 'retail-and-distribution')!.themes
    expect(themes).toHaveLength(7)
    for (const theme of themes) {
      expect(text.replace('Inventory analytics across warehouses and depots', ''), theme).not.toContain(theme)
      expect(within(main()).queryByText(theme), theme).toBeNull()
    }
    expect(text).not.toMatch(/\bAI\b/)
    for (const word of ['forecasting', 'replenishment', 'anomaly detection']) {
      expect(text.match(new RegExp(word, 'g')), word).toHaveLength(1)
    }
    expect(text).not.toMatch(retailPlan.COMPLIANCE_TERMS)
    expect(text).not.toMatch(retailPlan.NAMING_TERMS)
  })

  it('has no img, lang, tabindex or contenteditable in main, and no axe violations', async () => {
    const { container } = renderPage(retail)
    expect(main().querySelectorAll('img, canvas, [lang], [tabindex], [contenteditable]')).toHaveLength(0)
    await expectNoAxeViolations(container)
  })
})

function pageFor(key: string): Page {
  return servicePages.find((page) => page.kind === 'service' && page.service.key === key)!
}
