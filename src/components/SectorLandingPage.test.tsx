import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { solutionPages, type SectorLandingPage as Copy } from '../data/solutionPages.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import PageLayout from './PageLayout.tsx'
import SectorLandingPage from './SectorLandingPage.tsx'

// The shared landing-page foundation's components (#93) hold no copy:
// rendered with another sector's data (a fixture, neither Public Sector,
// Health, Financial Services, Education nor Retail & Distribution), they
// show that data and none of those pages' (#94, #98, issue 100, issue 101).

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
  it('shows only the fixture\'s copy, with no Public Sector, Health, Financial Services or Education string', () => {
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
      publicSector.audience.card!.heading,
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
    const health = solutionPages.health as Copy
    for (const text of [
      health.hero.heading,
      health.diagram.sourcesHeading,
      health.challenge.text,
      health.audience.card!.heading,
      health.assessment.text,
      health.handling.heading,
      health.closing.heading,
    ]) {
      expect(main.textContent, text).not.toContain(text)
    }
    const financialServices = solutionPages['financial-services'] as Copy
    for (const text of [
      financialServices.hero.heading,
      financialServices.hero.leadDetail!,
      financialServices.diagram.sourcesHeading,
      financialServices.challenge.label!,
      financialServices.challenge.heading,
      financialServices.promise!.groups[0].label,
      financialServices.promise!.groups[1].steps[0].name,
      financialServices.audience.card!.heading,
      financialServices.assessment.deliverablesLabel!,
      financialServices.reconciliation!.heading,
      financialServices.reconciliation!.cards[0].record,
      financialServices.reconciliation!.cards[1].status,
      financialServices.reconciliation!.caption,
      financialServices.reconciliation!.comparedLabel,
      financialServices.handling.heading,
      financialServices.services.items[0].lead!,
      financialServices.closing.heading,
    ]) {
      expect(main.textContent, text).not.toContain(text)
    }
    const education = solutionPages.education as Copy
    const journey = education.journey!
    for (const text of [
      education.hero.heading,
      education.diagram.sourcesHeading,
      education.diagram.sources[2].label,
      education.audience.card!.heading,
      education.audience.card!.detail!,
      journey.eyebrow,
      journey.intro!,
      journey.heading,
      journey.steps[0].name,
      journey.steps[3].system,
      journey.callout.label,
      journey.callout.text,
      journey.caption,
      journey.highlightNote,
      education.handling.heading,
      education.handling.items[1],
      education.services.items[3].name,
      education.closing.heading,
      education.closing.followUp!,
    ]) {
      expect(main.textContent, text).not.toContain(text)
    }
    expect(main.querySelectorAll('.journey, .definition-callout')).toHaveLength(0)
  })

  it('shows no Retail & Distribution string either (issue 101)', () => {
    renderFixture()
    const main = screen.getByRole('main')
    const retail = solutionPages['retail-and-distribution'] as Copy
    const journey = retail.journey!
    const segment = retail.audience.segments![1]
    for (const text of [
      retail.hero.heading,
      retail.hero.leadDetail!,
      retail.diagram.sourcesHeading,
      retail.diagram.sources[1].label,
      segment.heading,
      segment.items[2],
      journey.heading,
      journey.steps[4].name,
      journey.steps[3].system,
      journey.callout.label,
      journey.callout.text,
      journey.highlightNote,
      retail.ai.label!,
      retail.services.eyebrow!,
      retail.closing.heading,
    ]) {
      expect(main.textContent, text).not.toContain(text)
    }
    expect(main.querySelectorAll('.segment-cards, .segment-card, .journey--callout-end')).toHaveLength(0)
  })

  it('renders the learner journey from the data when given, right after the assessment band, with the callout and caption in the highlighted step (issue 100)', () => {
    renderFixture({
      ...FIXTURE,
      journey: {
        eyebrow: 'Fixture journey eyebrow',
        heading: 'Fixture journey',
        text: 'Journey text.',
        steps: [
          { name: 'Step one', system: 'System one' },
          { name: 'Step two', system: 'System two' },
        ],
        highlight: 0,
        highlightNote: '(note)',
        callout: { label: 'Callout label', text: 'Callout text.' },
        caption: 'Journey caption.',
      },
      reconciliation: {
        eyebrow: 'E',
        heading: 'Fixture reconciliation',
        text: 'T.',
        comparedLabel: 'versus',
        cards: [{ record: 'R', source: 'S', status: 'Ok', statusIcon: 'check' }],
        caption: 'C.',
      },
    })
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Fixture challenge',
      'Fixture approach',
      'Fixture audience',
      'Fixture assessment',
      'Fixture journey',
      'Fixture reconciliation',
      'Fixture AI',
      'Fixture handling',
      'Fixture services',
      'Fixture closing',
    ])
    const section = screen.getByRole('region', { name: 'Fixture journey' })
    // No intro unless the data has one.
    expect(section.querySelector('.sector-eyebrow')!.textContent).toBe('Fixture journey eyebrow')
    expect(section.querySelector('.sector-subheading')!.textContent).toBe('Journey text.')
    const ol = within(section).getByRole('list')
    expect(ol.tagName).toBe('OL')
    const [first, second] = within(ol).getAllByRole('listitem')
    expect(first).toHaveClass('journey__step--highlight')
    expect(second).not.toHaveClass('journey__step--highlight')
    expect(first).toHaveAccessibleDescription('Callout label Callout text.')
    expect(first.querySelector('.visually-hidden')!.textContent).toBe('(note)')
    expect(first.querySelector('.definition-callout')).toHaveTextContent('Callout labelCallout text.')
    expect(first.querySelector('.journey__caption')!.textContent).toBe('Journey caption.')
    expect(second.querySelectorAll('.definition-callout, .journey__caption, .visually-hidden')).toHaveLength(0)
    expect(second).not.toHaveAttribute('aria-describedby')
    expect(within(section).queryAllByRole('heading')).toHaveLength(1)
    cleanup()
    renderFixture({
      ...FIXTURE,
      journey: {
        eyebrow: 'Fixture journey eyebrow',
        heading: 'Fixture journey',
        intro: 'Journey intro.',
        text: 'Journey text.',
        steps: [{ name: 'Step one', system: 'System one' }],
        highlight: 0,
        highlightNote: '(note)',
        callout: { label: 'L', text: 'T.' },
        caption: 'C.',
      },
    })
    const withIntro = screen.getByRole('region', { name: 'Fixture journey' })
    expect(withIntro.querySelector('.sector-eyebrow')!.textContent).toBe('Fixture journey eyebrow')
    expect(withIntro.querySelector('.sector-subheading')!.textContent).toBe('Journey intro. Journey text.')
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

  it('names the checklist by its label, draws named items as a bold name and a colon, and leads service cards, only when the data asks (#94)', () => {
    renderFixture()
    expect(screen.getByRole('main').querySelectorAll('.audience-card__label, .service-card-lp__lead, strong')).toHaveLength(0)
    expect(screen.getByRole('main').querySelector('.checklist')).not.toHaveAttribute('aria-labelledby')
    cleanup()
    renderFixture({
      ...FIXTURE,
      audience: {
        ...FIXTURE.audience,
        segments: undefined,
        card: { ...FIXTURE.audience.card!, itemsLabel: 'Fixture label', items: [{ name: 'Name A', text: 'Text A.' }, 'Item B'] },
      },
      services: { ...FIXTURE.services, items: [{ ...FIXTURE.services.items[0], lead: 'Lead A.' }] },
    })
    const list = screen.getByRole('list', { name: 'Fixture label' })
    const [named, plain] = within(list).getAllByRole('listitem')
    expect(named.querySelector('strong')).toHaveTextContent('Name A')
    expect(named).toHaveTextContent('Name A: Text A.')
    expect(plain.querySelector('strong')).toBeNull()
    expect(plain).toHaveTextContent('Item B')
    expect(screen.getByText('Lead A.')).toHaveClass('service-card-lp__lead')
  })

  it('renders the second lead, the paired-card labels and details, stacked items, the deliverables label, accent leads, the promise strip and the reconciliation cards only when the data asks (#98)', () => {
    renderFixture()
    const main = screen.getByRole('main')
    expect(main.querySelectorAll('.sector-hero__lead')).toHaveLength(1)
    expect(main.querySelector('.sector-hero__lead--first')).toBeNull()
    expect(
      main.querySelectorAll(
        '.badge-card__label, .checklist__stacked, .deliverables__label, .sector-subheading--tight, .service-card-lp__lead--accent, .promise, .reconciliation',
      ),
    ).toHaveLength(0)
    expect(main.querySelector('.deliverables')).not.toHaveAttribute('aria-labelledby')
    expect([...main.querySelectorAll('.badge-card--inline .badge-card__text')].map((p) => p.textContent)).toEqual([
      'Challenge text.',
      'Approach text.',
    ])
    cleanup()
    renderFixture({
      ...FIXTURE,
      hero: { ...FIXTURE.hero, leadDetail: 'Fixture lead two.' },
      challenge: { ...FIXTURE.challenge, label: 'Label A', detail: 'Challenge detail.' },
      promise: {
        groups: [
          { label: 'Group A', steps: [{ name: 'Step one', text: 'One' }, { name: 'Step two', text: 'Two' }] },
          { label: 'Group B', steps: [{ name: 'Step three', text: 'Three' }, { name: 'Step four', text: 'Four' }] },
        ],
      },
      audience: {
        ...FIXTURE.audience,
        segments: undefined,
        card: { ...FIXTURE.audience.card!, itemsLayout: 'stacked', items: [{ name: 'Name A', text: 'Text A.' }] },
      },
      assessment: { ...FIXTURE.assessment, deliverablesLabel: 'Fixture delivers' },
      reconciliation: {
        eyebrow: 'Fixture after',
        heading: 'Fixture reconciliation',
        text: 'Reconciliation text.',
        comparedLabel: 'versus',
        cards: [
          { record: 'Record A', source: 'Source X', status: 'Status ok', statusIcon: 'check' },
          { record: 'Record B', source: 'Source Y', status: 'Status off', statusIcon: 'alert' },
        ],
        caption: 'Fixture recon caption.',
      },
      services: { ...FIXTURE.services, leadTone: 'accent', items: [{ ...FIXTURE.services.items[0], lead: 'Lead A.' }] },
    })
    const leads = [...screen.getByRole('main').querySelectorAll('.sector-hero__lead')]
    expect(leads.map((p) => [p.className, p.textContent])).toEqual([
      ['sector-hero__lead sector-hero__lead--first', 'Fixture lead.'],
      ['sector-hero__lead', 'Fixture lead two.'],
    ])
    const challenge = screen.getByRole('heading', { level: 2, name: 'Fixture challenge' }).parentElement!
    expect([...challenge.children].map((element) => [element.tagName, element.textContent])).toEqual([
      ['P', 'Label A'],
      ['H2', 'Fixture challenge'],
      ['P', 'Challenge text.'],
      ['P', 'Challenge detail.'],
    ])
    // The approach card, given neither, is unchanged.
    expect([...screen.getByRole('heading', { level: 2, name: 'Fixture approach' }).parentElement!.children].map((e) => e.tagName)).toEqual([
      'H2',
      'P',
    ])
    const steps = within(screen.getByRole('main').querySelector('ol.promise__steps') as HTMLElement).getAllByRole('listitem')
    expect(steps.map((step) => step.textContent)).toEqual([
      'Group A Group A 1 Step one One',
      'Group A  2 Step two Two',
      'Group B Group B 3 Step three Three',
      'Group B  4 Step four Four',
    ])
    expect(screen.getByText('Name A').closest('li')).toHaveTextContent('Name A Text A.')
    expect(screen.getByText('Name A').closest('li')!.textContent).not.toContain(':')
    expect(screen.getByRole('list', { name: 'Fixture delivers' }).tagName).toBe('UL')
    const recon = screen.getByRole('region', { name: 'Fixture reconciliation' })
    expect(within(recon).getByRole('list')).toHaveAccessibleDescription('Fixture recon caption.')
    expect(within(recon).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Record Aversus Source XStatus ok',
      'Record Bversus Source YStatus off',
    ])
    // After the assessment band, before the AI card.
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Fixture challenge',
      'Fixture approach',
      'Fixture audience',
      'Fixture assessment',
      'Fixture reconciliation',
      'Fixture AI',
      'Fixture handling',
      'Fixture services',
      'Fixture closing',
    ])
    expect(screen.getByText('Lead A.')).toHaveClass('service-card-lp__lead service-card-lp__lead--accent')
  })

  it('renders segment cards instead of the single card only when the data has them (issue 101)', () => {
    renderFixture()
    const single = screen.getByRole('region', { name: 'Fixture audience' })
    expect(single.querySelectorAll('.audience-card')).toHaveLength(1)
    expect(single.querySelectorAll('.segment-cards, .segment-card')).toHaveLength(0)
    cleanup()
    renderFixture({
      ...FIXTURE,
      audience: {
        heading: 'Fixture audience',
        subheading: 'Audience subheading.',
        segments: [
          { heading: 'Segment A', text: 'Segment A text.', icon: 'card', items: ['A one', 'A two'] },
          { heading: 'Segment B', text: 'Segment B text.', icon: 'truck', items: ['B one'] },
        ],
      },
    })
    const section = screen.getByRole('region', { name: 'Fixture audience' })
    expect(section.querySelectorAll('.audience-card')).toHaveLength(0)
    expect([...section.querySelector('.container')!.children].map((element) => [element.tagName, element.className])).toEqual([
      ['H2', 'sector-heading'],
      ['P', 'sector-subheading'],
      ['UL', 'segment-cards'],
    ])
    const list = section.querySelector('ul.segment-cards') as HTMLElement
    expect(list).toHaveAttribute('role', 'list')
    const cards = within(list).getAllByRole('listitem').filter((item) => item.parentElement === list)
    expect(cards).toHaveLength(2)
    expect(cards.map((card) => [...card.children].map((element) => element.tagName))).toEqual([
      ['SPAN', 'H3', 'P', 'UL'],
      ['SPAN', 'H3', 'P', 'UL'],
    ])
    expect(cards.map((card) => card.querySelector('h3')!.textContent)).toEqual(['Segment A', 'Segment B'])
    expect(cards.map((card) => card.querySelector('.segment-card__text')!.textContent)).toEqual([
      'Segment A text.',
      'Segment B text.',
    ])
    expect(cards.map((card) => within(card.querySelector('ul') as HTMLElement).getAllByRole('listitem').map((item) => item.textContent))).toEqual([
      ['A one', 'A two'],
      ['B one'],
    ])
    for (const card of cards) {
      expect(card.querySelector('.icon-badge')).toHaveClass('icon-badge icon-badge--round icon-badge--teal')
      expect(card.querySelector('.icon-badge')).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('gives the readiness card a label only when given, and draws no chips list when it has no chips (issue 101)', () => {
    renderFixture()
    const card = () => screen.getByRole('heading', { level: 2, name: 'Fixture AI' }).parentElement!
    expect([...card().children].map((element) => element.tagName)).toEqual(['H2', 'P', 'UL'])
    expect(card().querySelectorAll('.chips')).toHaveLength(1)
    cleanup()
    renderFixture({ ...FIXTURE, ai: { heading: 'Fixture AI', text: 'AI text.', icon: 'gauge', label: 'Fixture ready' } })
    expect([...card().children].map((element) => [element.tagName, element.className, element.textContent])).toEqual([
      ['P', 'sector-eyebrow badge-card__label', 'Fixture ready'],
      ['H2', 'badge-card__heading', 'Fixture AI'],
      ['P', 'badge-card__text', 'AI text.'],
    ])
    expect(screen.getByRole('main').querySelectorAll('.chips, .chip')).toHaveLength(0)
  })

  it('puts an eyebrow above the services heading only when given (issue 101)', () => {
    renderFixture()
    const children = () =>
      [...screen.getByRole('region', { name: 'Fixture services' }).querySelector('.container')!.children].map((element) => [
        element.tagName,
        element.className,
      ])
    expect(children()).toEqual([
      ['H2', 'sector-heading'],
      ['P', 'sector-subheading'],
      ['UL', 'service-cards'],
    ])
    cleanup()
    renderFixture({ ...FIXTURE, services: { ...FIXTURE.services, eyebrow: 'Fixture next' } })
    expect(children()).toEqual([
      ['P', 'sector-eyebrow'],
      ['H2', 'sector-heading'],
      ['P', 'sector-subheading'],
      ['UL', 'service-cards'],
    ])
    expect(screen.getByText('Fixture next')).toHaveClass('sector-eyebrow')
  })

  it('changes only the journey\'s placement class when the callout is aligned to the end (issue 101)', () => {
    const journey: NonNullable<Copy['journey']> = {
      eyebrow: 'Fixture journey eyebrow',
      heading: 'Fixture journey',
      text: 'Journey text.',
      steps: [
        { name: 'Step one', system: 'System one' },
        { name: 'Step two', system: 'System two' },
      ],
      highlight: 1,
      highlightNote: '(note)',
      callout: { label: 'Callout label', text: 'Callout text.' },
      caption: 'Journey caption.',
    }
    const html = (copy: Copy) => {
      const { container } = renderFixture(copy)
      const section = container.querySelector('section[aria-labelledby="journey-heading"]')!.outerHTML
      cleanup()
      return section
    }
    const start = html({ ...FIXTURE, journey })
    const end = html({ ...FIXTURE, journey: { ...journey, calloutAlign: 'end' } })
    expect(start).toContain('<ol class="journey" role="list">')
    expect(end).toContain('<ol class="journey journey--callout-end" role="list">')
    expect(end.replace(' journey--callout-end', '')).toBe(start)
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
    expect(main.querySelectorAll('.reconciliation__icon--alert')).toHaveLength(0)
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
