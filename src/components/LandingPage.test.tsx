import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { email, phoneHref } from '../data/contact.ts'
import { managedServices, services } from '../data/services.ts'
import { solutions } from '../data/solutions.ts'
import { notFound, pages, type Page } from '../pages.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
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
const paths = new Set(pages.map((page) => page.path))

const renderPage = (page: Page) => render(<LandingPage page={page} />)

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
    expect(within(banner).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#services')
    expect(within(banner).getByRole('link', { name: 'Book a data trust assessment' })).toHaveAttribute('href', '#contact')
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions')
    expect(within(footer).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
    const contact = screen.getByRole('region', { name: /Let’s build a data foundation/ })
    expect(within(contact).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      `mailto:${email}`,
      `mailto:${email}`,
      phoneHref,
    ])
  })

  it('links only to real pages, homepage sections, contact or email', () => {
    renderPage(page)
    for (const [name, href] of mainLinks()) {
      expect(
        paths.has(href!) || href === '/' || /^\/#[a-z-]+$/.test(href!) || href === '#contact' || href!.startsWith('mailto:') || href!.startsWith('tel:'),
        `${name} → ${href}`,
      ).toBe(true)
      expect(name).not.toMatch(/^(learn more|read more|click here)$/i)
    }
  })

  it('has no axe violations', async () => {
    const { container } = renderPage(page)
    await expectNoAxeViolations(container)
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
    expect(within(trail).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#services')
  })

  it('explains Reverse ETL on the engineering page only', () => {
    renderPage(pageFor('data-engineering-and-integration'))
    expect(screen.getByRole('heading', { name: 'Operational data activation using Reverse ETL' })).toBeInTheDocument()
  })
})

describe('solution pages', () => {
  it.each(solutionPages.map((page) => [page.path, page] as const))(
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

  it('shows Health’s two audiences as h3s, providers and programmes', () => {
    renderPage(pages.find((page) => page.path === '/solutions/health')!)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Health Data & Analytics Solutions')
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Healthcare providers',
      'Public and global-health programmes',
    ])
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
})

function pageFor(key: string): Page {
  return servicePages.find((page) => page.kind === 'service' && page.service.key === key)!
}
