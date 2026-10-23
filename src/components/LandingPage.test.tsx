import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { email, phoneHref } from '../data/contact.ts'
import { managedServices, services } from '../data/services.ts'
import { footerSolutions, solutions } from '../data/solutions.ts'
import { notFound, pages, type Page } from '../pages.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import * as healthPlan from '../test/healthPlan.ts'
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
// The pages on the shared landing-page foundation (#93, #94).
const foundationPages: readonly Page[] = [publicSector, health]

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
}
const paths = new Set(pages.map((page) => page.path))

const renderPage = (page: Page) => render(<LandingPage page={page} />)

// The footer's "More sectors" line (#73): the three sector pages the
// homepage's Solutions list leaves out, by their headings, on every page.
const MORE_SECTORS = [
  ['Retail & Distribution Analytics', '/solutions/retail-distribution'],
  ['Development & Impact Data Systems', '/solutions/development-impact'],
  ['Public Sector Data & Analytics', '/solutions/public-sector'],
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
      // The page's own closing panel (#93, #94) replaces the Contact
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

  it('links the footer\'s "More sectors" line to the three sectors the homepage leaves out', () => {
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

  it('explains Reverse ETL on the engineering page only', () => {
    renderPage(pageFor('data-engineering-and-integration'))
    expect(screen.getByRole('heading', { name: 'Operational data activation using Reverse ETL' })).toBeInTheDocument()
  })
})

describe('solution pages', () => {
  // The four sectors still on the §18 sections; Public Sector and Health
  // are on the shared landing-page foundation (#93, #94), checked below.
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

  it('links every other sector, and not itself', () => {
    const page = solutionPages[0]
    renderPage(page)
    const others = within(screen.getByRole('region', { name: 'Other sectors' })).getAllByRole('link')
    expect(others.map((link) => link.getAttribute('href'))).toEqual(
      solutionPages.slice(1).map((other) => other.path),
    )
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
      'Fix list',
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

  it('puts main.sector-landing on the foundation pages (Public Sector and Health) only, and leaves out the Contact section there', () => {
    expect(foundationPages.map((page) => page.path)).toEqual(['/solutions/public-sector', '/solutions/health'])
    for (const page of [...pages, notFound]) {
      const { unmount } = renderPage(page)
      const onFoundation = foundationPages.includes(page)
      expect(main().classList.contains('sector-landing'), page.path).toBe(onFoundation)
      expect(main().querySelector('.contact') !== null, page.path).toBe(!onFoundation)
      unmount()
    }
  })

  it('marks the header\'s Solutions link as current on the foundation pages (Public Sector and Health) only', () => {
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
      'Fix list',
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
      // Each item: its bold name, then the em dash and its text.
      ...[1, 2, 3, 4].flatMap((n) => {
        const { name, text } = healthPlan.boldNamed(hcell('Who we work with', `List item ${n}`))
        return [name, `— ${text}`]
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

  it('shows the providers card\'s two paragraphs, then a ul named by its label, each item a strong name, an em dash and its text', () => {
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
      expect(item.textContent).toBe(`${name} — ${text}`)
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

function pageFor(key: string): Page {
  return servicePages.find((page) => page.kind === 'service' && page.service.key === key)!
}
