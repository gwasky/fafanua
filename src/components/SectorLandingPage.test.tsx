import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { solutionPages, type SectorLandingPage as Copy } from '../data/solutionPages.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import PageLayout from './PageLayout.tsx'
import SectorLandingPage from './SectorLandingPage.tsx'

// The shared landing-page foundation's components (#93) hold no copy:
// rendered with another sector's data (a fixture, as the Health page will
// be in #94), they show that data and none of the Public Sector page's.

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

const FIXTURE: Copy = {
  layout: 'sector',
  title: 'Fixture title | Fafanua',
  description: 'Fixture description.',
  breadcrumb: 'Fixture sector',
  hero: { eyebrow: 'Fixture eyebrow', heading: 'Fixture heading.', lead: 'Fixture lead.', secondaryLabel: 'Fixture jump' },
  diagram: {
    sourcesHeading: 'Fixture systems',
    sources: [
      { label: 'Source A', icon: 'book', feeds: false },
      { label: 'Source B', icon: 'card', feeds: true },
    ],
    traceHeading: 'Fixture trace',
    steps: ['Step A', 'Step B'],
    traceFootnote: 'Fixture footnote',
    figuresHeading: 'Fixture figures',
    figures: [{ name: 'Figure A', rating: 'Rating A', marker: 'amber' }],
    caption: 'Fixture caption.',
    description: 'Fixture description of the figure.',
  },
  challenge: { heading: 'Fixture challenge', text: 'Challenge text.', icon: 'alert' },
  approach: { heading: 'Fixture approach', text: 'Approach text.', icon: 'check' },
  audience: {
    heading: 'Fixture audience',
    subheading: 'Audience subheading.',
    card: { heading: 'Fixture providers', text: 'Card text.', icon: 'book', items: ['Item A', 'Item B'] },
  },
  assessment: {
    eyebrow: 'Fixture assessment eyebrow',
    heading: 'Fixture assessment',
    text: 'Band text.',
    deliverables: [{ name: 'Deliverable A', text: 'Deliverable text', icon: 'map' }],
  },
  ai: { heading: 'Fixture AI', text: 'AI text.', icon: 'gauge', chips: [{ label: 'Chip A', marker: 'teal' }] },
  handling: { heading: 'Fixture handling', icon: 'shield', items: ['Rule A.'] },
  services: {
    heading: 'Fixture services',
    subheading: 'Services subheading.',
    items: [{ name: 'Service A', text: 'Service text.', icon: 'link', service: 'data-governance-and-metadata' }],
  },
  closing: { eyebrow: 'Fixture closing eyebrow', heading: 'Fixture closing', text: 'Closing text.' },
}

const renderFixture = (copy: Copy = FIXTURE) =>
  render(
    <PageLayout sector current="solutions">
      <SectorLandingPage page={copy} />
    </PageLayout>,
  )

describe('SectorLandingPage with another sector\'s data', () => {
  it('shows only the fixture\'s copy, with no Public Sector string', () => {
    renderFixture()
    const main = screen.getByRole('main')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fixture heading.')
    for (const text of ['Fixture lead.', 'Source A', 'Step B', 'Rating A', 'Item B', 'Deliverable text', 'Chip A', 'Rule A.', 'Service text.', 'Closing text.']) {
      expect(main).toHaveTextContent(text)
    }
    const publicSector = solutionPages['public-sector'] as Copy
    for (const text of [
      publicSector.hero.heading,
      publicSector.diagram.sourcesHeading,
      publicSector.challenge.text,
      publicSector.audience.card.heading,
      publicSector.assessment.heading,
      publicSector.stages!.heading,
      publicSector.handling.heading,
      publicSector.services.heading,
      publicSector.closing.heading,
      'Stage',
      'Moves on when',
    ]) {
      expect(main.textContent, text).not.toContain(text)
    }
  })

  it('leaves Delivered in stages out when the page has none', () => {
    renderFixture()
    expect(screen.getByRole('main').querySelector('ol.stages')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Fixture challenge',
      'Fixture approach',
      'Fixture audience',
      'Fixture assessment',
      'Fixture AI',
      'Fixture handling',
      'Fixture services',
      'Fixture closing',
    ])
  })

  it('renders stages from the data when given, numbered by their label', () => {
    renderFixture({
      ...FIXTURE,
      stages: {
        eyebrow: 'E',
        heading: 'Fixture stages',
        subheading: 'S.',
        stageLabel: 'Phase',
        exitLabel: 'Exit when',
        items: [{ name: 'One', description: 'First.', exit: 'Done' }],
      },
    })
    const item = within(screen.getByRole('region', { name: 'Fixture stages' })).getByRole('listitem')
    expect(item).toHaveTextContent('Phase 1OneFirst.Exit whenDone')
  })

  it('takes the service card link, the jump target and the closing id from its own wiring', () => {
    renderFixture()
    expect(screen.getByRole('link', { name: 'Service A' })).toHaveAttribute('href', '/services/data-governance-metadata')
    expect(screen.getByRole('link', { name: 'Fixture jump' })).toHaveAttribute('href', '#assessment')
    expect(screen.getByRole('region', { name: 'Fixture closing' })).toHaveAttribute('id', 'contact')
    expect(screen.getByRole('region', { name: 'Fixture assessment' })).toHaveAttribute('id', 'assessment')
  })

  it('marks the amber badge and marker only where the data asks', () => {
    renderFixture()
    const main = screen.getByRole('main')
    expect([...main.querySelectorAll('.icon-badge--amber')]).toHaveLength(1)
    expect([...main.querySelectorAll('.rating-marker')].map((marker) => marker.className)).toEqual([
      'rating-marker rating-marker--amber',
      'rating-marker rating-marker--teal',
    ])
  })

  it('has no axe violations', async () => {
    const { container } = renderFixture()
    await expectNoAxeViolations(container)
  })
})
