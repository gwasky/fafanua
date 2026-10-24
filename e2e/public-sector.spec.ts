import { expect, type Page } from '@playwright/test'
import { openPath, test, waitForScrollSettle } from './fixtures.ts'

// The Public Sector landing page on the shared landing-page foundation
// (#93, _docs/fafanua-public-sector-landing-page-plan.md), in Chromium
// and WebKit: the #assessment jump, the closing panel at #contact, the
// three mailto: links, the layouts at each width, the weights and the
// colours. Forced colours are checked in public-sector-forced.spec.ts
// (Chromium only, as Playwright emulates them only there).

const PATH = '/solutions/public-sector'
const MAILTO = 'mailto:info@fafanua.tech'
const STAGES = ['Assess', 'Foundation', 'First use cases', 'Extend']

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

/** The top of #id and the sticky header's bottom edge, in the viewport. */
const landing = (page: Page, id: string) =>
  page.evaluate((target) => ({
    top: document.getElementById(target)!.getBoundingClientRect().top,
    header: document.querySelector('header')!.getBoundingClientRect().bottom,
  }), id)

/** Records scrollY every frame from now on; scrollSamples reads it. */
async function sampleScroll(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __samples: number[] }
    w.__samples = []
    const tick = () => {
      w.__samples.push(window.scrollY)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}
const scrollSamples = (page: Page) =>
  page.evaluate(() => (window as unknown as { __samples: number[] }).__samples)

const secondary = (page: Page) =>
  page.getByRole('region', { name: 'Public data you can account for.' }).getByRole('link', {
    name: 'See how the assessment works',
    exact: true,
  })

test.describe('the #assessment jump', () => {
  for (const motion of ['no-preference', 'reduce'] as const) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      for (const width of [1440, 390]) {
        test(`a click lands #assessment at the header's bottom and focuses its h2 at ${width}px, ${motion}`, async ({ page }) => {
          await openPath(page, PATH, width)
          await secondary(page).scrollIntoViewIfNeeded()
          await waitForScrollSettle(page)
          const from = await scrollY(page)
          await sampleScroll(page)

          await secondary(page).click()
          await expect.poll(() => scrollY(page)).not.toBe(from)
          await waitForScrollSettle(page)
          await expect(page).toHaveURL(new RegExp(`${PATH}#assessment$`))
          await expect(page.locator('#assessment-heading')).toBeFocused()
          expect(await page.evaluate(() => document.activeElement?.id)).toBe('assessment-heading')
          const m = await landing(page, 'assessment')
          expect(Math.abs(m.top - m.header), JSON.stringify(m)).toBeLessThanOrEqual(2)

          // Smooth passes through positions between the two; reduced
          // motion jumps.
          const to = await scrollY(page)
          const between = (await scrollSamples(page)).filter((y) => y > from && y < to)
          if (motion === 'no-preference') expect(between.length).toBeGreaterThan(1)
          else expect(between).toEqual([])
          expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
            motion === 'reduce' ? 'auto' : 'smooth',
          )
        })
      }
    })
  }

  test.describe('with the keyboard', () => {
    test.use({ reducedMotion: 'reduce' })

    test('Enter on the focused link lands #assessment and focuses its h2 at 1440px', async ({ page }) => {
      await openPath(page, PATH, 1440)
      await secondary(page).focus()
      await waitForScrollSettle(page)
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`${PATH}#assessment$`))
      await waitForScrollSettle(page)
      await expect(page.locator('#assessment-heading')).toBeFocused()
      const m = await landing(page, 'assessment')
      expect(Math.abs(m.top - m.header), JSON.stringify(m)).toBeLessThanOrEqual(2)
      // The heading's temporary tabindex goes when it loses focus.
      await page.locator('body').click({ position: { x: 1, y: 1 } })
      await expect(page.locator('#assessment-heading')).not.toHaveAttribute('tabindex')
    })
  })
})

test.describe('links', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the header\'s call to action lands on the closing panel', async ({ page }) => {
    await openPath(page, PATH, 1440)
    await page.getByRole('banner').getByRole('link', { name: 'Book a data trust assessment' }).click()
    await expect(page).toHaveURL(new RegExp(`${PATH}#contact$`))
    await waitForScrollSettle(page)
    const closing = page.getByRole('region', { name: 'Build a public data foundation you can trust' })
    await expect(closing).toHaveAttribute('id', 'contact')
    await expect(closing).toBeInViewport()
  })

  test('the hero button, the closing button and the address open an email', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const main = page.getByRole('main')
    const mailto = await main.locator('a[href^="mailto:"]').evaluateAll((links) =>
      links.map((link) => [link.textContent, link.getAttribute('href')]),
    )
    expect(mailto).toEqual([
      ['Book a data trust assessment→', MAILTO],
      ['Book a data trust assessment→', MAILTO],
      ['info@fafanua.tech', MAILTO],
    ])
    await expect(main.getByRole('link', { name: 'Book a data trust assessment', exact: true })).toHaveCount(2)
  })

  test('shows "trusted data foundation" in the closing panel (owner, #93)', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const line = page.locator('#contact').getByText(/built on a trusted data foundation\./)
    await expect(line).toBeVisible()
  })

  test('the header marks Solutions as current, and the hydrated header keeps it', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const solutions = page.getByRole('banner').getByRole('link', { name: 'Solutions', exact: true })
    await expect(solutions).toHaveAttribute('aria-current', 'true')
    const style = await solutions.evaluate((link) => {
      const s = getComputedStyle(link)
      return { line: s.textDecorationLine, thickness: s.textDecorationThickness }
    })
    expect(style).toEqual({ line: 'underline', thickness: '2px' })
  })

  // Health and Financial Services are on the foundation too (#94, #98)
  // and mark Solutions; a §18 page marks nothing.
  test('the header marks no link on another landing page', async ({ page }) => {
    await openPath(page, '/solutions/education', 1440)
    await expect(page.getByRole('banner').locator('[aria-current]')).toHaveCount(0)
  })

  test('the menu shows Solutions as current below 64em', async ({ page }) => {
    await openPath(page, PATH, 768)
    await page.getByRole('button', { name: 'Menu' }).click()
    const solutions = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Solutions', exact: true })
    await expect(solutions).toBeVisible()
    await expect(solutions).toHaveAttribute('aria-current', 'true')
  })
})

// The boxes of the page's parts, in CSS pixels.
async function layout(page: Page) {
  return page.evaluate(() => {
    const box = (element: Element) => {
      const r = element.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const one = (selector: string) => box(document.querySelector(selector)!)
    const all = (selector: string) => [...document.querySelectorAll(selector)].map(box)
    const h1 = document.querySelector('.sector-hero__heading')!
    return {
      heroText: one('.sector-hero__text'),
      heroDiagram: one('.sector-hero__diagram'),
      h1Lines: Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)),
      heroButtons: all('.sector-hero__actions .button'),
      traceBoxes: all('.trace__box'),
      paired: [...document.querySelectorAll('.paired-cards')].map((grid) => [...grid.children].map(box)),
      checklist: all('.audience-card__list li'),
      deliverables: all('.deliverable'),
      stages: all('.stage'),
      services: all('.service-card-lp'),
      panel: one('.sector-closing__panel'),
      panelText: one('.sector-closing__text'),
      actions: all('.sector-closing__actions a'),
      footer: one('footer'),
      viewport: window.innerWidth,
    }
  })
}

/** How many distinct columns the boxes form (by their left edges). */
const columns = (boxes: { left: number }[]) => new Set(boxes.map((b) => Math.round(b.left))).size
/** Whether every box in a row has the same width, within 1px. */
const equalWidths = (boxes: { width: number }[]) =>
  Math.max(...boxes.map((b) => b.width)) - Math.min(...boxes.map((b) => b.width)) <= 1

test.describe('layout', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [1440, 1024]) {
    test(`hero, cards, stages and closing panel as the image at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      const m = await layout(page)
      // Hero: two equal columns, top-aligned, about --space-8 apart.
      expect(Math.abs(m.heroText.width - m.heroDiagram.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(m.heroText.top - m.heroDiagram.top)).toBeLessThanOrEqual(1)
      expect(m.heroDiagram.left - m.heroText.right).toBeCloseTo(32, 0)
      expect(m.h1Lines).toBe(2)
      if (width === 1440) expect(new Set(m.heroButtons.map((b) => Math.round(b.top))).size).toBe(1)
      // The diagram's three columns side by side.
      expect(columns(m.traceBoxes)).toBe(3)
      // Paired cards two equal columns; deliverables four; services three;
      // the checklist two.
      for (const pair of m.paired) {
        expect(columns(pair)).toBe(2)
        expect(equalWidths(pair)).toBe(true)
      }
      expect(columns(m.deliverables)).toBe(4)
      expect(equalWidths(m.deliverables)).toBe(true)
      expect(columns(m.services)).toBe(3)
      expect(equalWidths(m.services)).toBe(true)
      expect(columns(m.checklist)).toBe(2)
      // Closing panel: text on the start side, the actions stacked on the
      // end side at equal width; inset on paper, with paper before the
      // footer.
      expect(m.actions[1].top).toBeGreaterThan(m.actions[0].bottom - 1)
      expect(Math.abs(m.actions[0].width - m.actions[1].width)).toBeLessThanOrEqual(1)
      expect(m.actions[0].left).toBeGreaterThan(m.panelText.right)
      expect(m.panel.left).toBeGreaterThan(0)
      expect(m.panel.right).toBeLessThan(m.viewport)
      expect(m.footer.top - m.panel.bottom).toBeGreaterThanOrEqual(48)
    })
  }

  test('hero stacks, the diagram keeps three columns, cards stack and grids halve at 768px', async ({ page }) => {
    await openPath(page, PATH, 768)
    const m = await layout(page)
    expect(m.heroDiagram.top).toBeGreaterThan(m.heroText.bottom)
    expect(columns(m.traceBoxes)).toBe(3)
    for (const pair of m.paired) expect(columns(pair)).toBe(1)
    expect(columns(m.deliverables)).toBe(2)
    expect(new Set(m.deliverables.map((b) => Math.round(b.top))).size).toBe(2)
    expect(columns(m.services)).toBe(1)
    expect(columns(m.checklist)).toBe(2)
    // The two actions side by side at natural width.
    expect(Math.abs(m.actions[0].top - m.actions[1].top)).toBeLessThanOrEqual(1)
    expect(m.actions[1].left).toBeGreaterThan(m.actions[0].right)
  })

  test('everything is one column, the diagram stacked in DOM order, at 390px', async ({ page }) => {
    await openPath(page, PATH, 390)
    const m = await layout(page)
    expect(m.heroDiagram.top).toBeGreaterThan(m.heroText.bottom)
    expect(columns(m.traceBoxes)).toBe(1)
    expect(m.traceBoxes[1].top).toBeGreaterThan(m.traceBoxes[0].bottom)
    expect(m.traceBoxes[2].top).toBeGreaterThan(m.traceBoxes[1].bottom)
    for (const grid of [...m.paired.flat(), ...m.deliverables, ...m.services]) {
      expect(grid.left).toBeCloseTo(m.paired[0][0].left, -1)
    }
    expect(columns(m.deliverables)).toBe(1)
    expect(columns(m.services)).toBe(1)
    expect(columns(m.checklist)).toBe(1)
    // The closing actions stacked at full width.
    expect(m.actions[1].top).toBeGreaterThan(m.actions[0].bottom - 1)
    expect(Math.abs(m.actions[0].width - m.panelText.width)).toBeLessThanOrEqual(1)
    expect(m.footer.top - m.panel.bottom).toBeGreaterThanOrEqual(48)
  })
})

test.describe('the trace diagram\'s connectors', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [1440, 1024]) {
    test(`three solid and two dashed source connectors, and three to the figures, at their rows' centres at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      const m = await page.evaluate(() => {
        const middle = document.querySelector('.trace__middle')!.getBoundingClientRect()
        const read = (selector: string) =>
          [...document.querySelectorAll(selector)].map((row) => {
            const line = row.querySelector('.trace__connector')!
            const r = line.getBoundingClientRect()
            const s = getComputedStyle(line)
            const rowBox = row.getBoundingClientRect()
            return {
              style: s.borderTopStyle,
              colour: s.borderTopColor,
              width: parseFloat(s.borderTopWidth),
              centre: r.top + r.height / 2,
              rowCentre: rowBox.top + rowBox.height / 2,
              start: r.left,
              end: r.right,
              hidden: line.getAttribute('aria-hidden'),
            }
          })
        return { sources: read('.trace__source'), figures: read('.trace__figure'), middle: { left: middle.left, right: middle.right } }
      })
      expect(m.sources.map((line) => line.style)).toEqual(['dashed', 'dashed', 'solid', 'solid', 'solid'])
      expect(m.figures.map((line) => line.style)).toEqual(['solid', 'solid', 'solid'])
      for (const line of [...m.sources, ...m.figures]) {
        expect(line.width).toBeGreaterThan(0)
        expect(Math.abs(line.centre - line.rowCentre), JSON.stringify(line)).toBeLessThanOrEqual(4)
        expect(line.hidden).toBe('true')
      }
      // Each reaches the middle box.
      for (const line of m.sources) expect(Math.abs(line.end - m.middle.left)).toBeLessThanOrEqual(2)
      for (const line of m.figures) expect(Math.abs(line.start - m.middle.right)).toBeLessThanOrEqual(2)
      // Solid teal; dashed graphite 500.
      expect(new Set(m.sources.slice(2).map((line) => line.colour)).size).toBe(1)
      expect(m.sources[0].colour).not.toBe(m.sources[2].colour)
    })
  }

  test('below 48em the columns are joined by short downward lines, with no horizontal connector', async ({ page }) => {
    await openPath(page, PATH, 390)
    const m = await page.evaluate(() => ({
      connectors: [...document.querySelectorAll('.trace__connector')].map((line) => getComputedStyle(line).display),
      down: ['.trace__middle', '.trace__figures'].map((selector) => {
        const s = getComputedStyle(document.querySelector(selector)!, '::before')
        return { width: s.borderLeftWidth, style: s.borderLeftStyle, height: parseFloat(s.height) }
      }),
    }))
    expect(new Set(m.connectors)).toEqual(new Set(['none']))
    for (const line of m.down) {
      expect(line.width).toBe('2px')
      expect(line.style).toBe('solid')
      expect(line.height).toBeGreaterThan(0)
    }
  })
})

test.describe('Delivered in stages', () => {
  test.use({ reducedMotion: 'reduce' })

  const expected = {
    1440: { columns: 4, rows: 1 },
    1024: { columns: 4, rows: 1 },
    768: { columns: 2, rows: 2 },
    390: { columns: 1, rows: 4 },
  } as const

  for (const [width, grid] of Object.entries(expected)) {
    test(`the four stages in order, ${grid.columns} per row, under 3px rules at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, Number(width))
      const section = page.getByRole('region', { name: 'No big-bang projects' })
      await expect(section.getByRole('listitem').getByRole('heading', { level: 3 })).toHaveText(STAGES)
      await expect(section.locator('.stage__number')).toHaveText(['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'])
      await expect(section.locator('.stage__exit-label').first()).toHaveCSS('text-transform', 'uppercase')
      const stages = await section.locator('.stage').evaluateAll((items) =>
        items.map((item) => {
          const r = item.getBoundingClientRect()
          const s = getComputedStyle(item)
          return {
            left: r.left,
            top: r.top,
            width: r.width,
            rule: s.borderTopWidth,
            ruleStyle: s.borderTopStyle,
            hairline: s.borderLeftWidth,
          }
        }),
      )
      expect(columns(stages)).toBe(grid.columns)
      expect(new Set(stages.map((stage) => Math.round(stage.top))).size).toBe(grid.rows)
      expect(equalWidths(stages)).toBe(true)
      for (const stage of stages) {
        expect(stage.rule).toBe('3px')
        expect(stage.ruleStyle).toBe('solid')
      }
      // Hairlines between the stages in a row, none before a row's first.
      const hairlines = stages.map((stage) => stage.hairline)
      if (grid.columns === 4) expect(hairlines).toEqual(['0px', '1px', '1px', '1px'])
      if (grid.columns === 2) expect(hairlines).toEqual(['0px', '1px', '0px', '1px'])
      if (grid.columns === 1) expect(hairlines).toEqual(['0px', '0px', '0px', '0px'])
      // Tops level within a row.
      if (grid.rows === 1) {
        expect(Math.max(...stages.map((s) => s.top)) - Math.min(...stages.map((s) => s.top))).toBeLessThanOrEqual(1)
      }
      // The rules of a row meet: no gap between side-by-side stages.
      if (grid.columns > 1) expect(stages[1].left - (stages[0].left + stages[0].width)).toBeLessThanOrEqual(1)
    })
  }
})

test.describe('weights', () => {
  test.use({ reducedMotion: 'reduce' })

  test('700 for the h1 and section headings, 600 for card headings, labels and buttons, 400 for body text', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const m = await page.evaluate(() => {
      const weight = (element: Element) => Number(getComputedStyle(element).fontWeight)
      const weights = (selectors: string) =>
        [...document.querySelectorAll(selectors.split(', ').map((selector) => `main ${selector}`).join(', '))].map(weight)
      return {
        bold: weights('h1, .sector-heading'),
        semibold: weights(
          'h3, .badge-card__heading, .sector-eyebrow, .stage__number, .stage__exit-label, .trace__heading, .trace__figure-name, .button',
        ),
        body: weights(
          '.sector-hero__lead, .badge-card__text, .checklist__item, .deliverable__text, .stage__description, .stage__exit-condition, .trace__step, .trace__source, .trace__rating, .chip, .sector-closing__body, .breadcrumbs__item',
        ),
        mainMax: Math.max(...[...document.querySelectorAll('main, main *')].map(weight)),
        frameMax: Math.max(...[...document.querySelectorAll('header, header *, footer, footer *')].map(weight)),
      }
    })
    // The h1 and the five section headings over a section.
    expect(m.bold.length).toBe(6)
    expect(new Set(m.bold)).toEqual(new Set([700]))
    expect(new Set(m.semibold)).toEqual(new Set([600]))
    expect(new Set(m.body)).toEqual(new Set([400]))
    expect(m.mainMax).toBeLessThanOrEqual(700)
    expect(m.frameMax).toBeLessThanOrEqual(500)
  })
})

test.describe('colours', () => {
  test.use({ reducedMotion: 'reduce' })

  test('every element in the colour table takes its token, amber only on the three amber elements and no error colour', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const m = await page.evaluate(() => {
      // A token's computed colour, as the browser serialises it, read
      // from a probe of its own.
      const probes: HTMLElement[] = []
      const token = (name: string) => {
        const probe = document.createElement('span')
        probe.style.setProperty('color', `var(${name})`)
        document.body.append(probe)
        probes.push(probe)
        return getComputedStyle(probe).color
      }
      const style = (selector: string) => getComputedStyle(document.querySelector(selector)!)
      const tokens = Object.fromEntries(
        [
          '--teal-tint-hero', '--teal-tint-soft', '--amber-tint', '--teal-100', '--teal-400', '--teal-600', '--teal-700',
          '--teal-800', '--graphite-900', '--graphite-700', '--graphite-600', '--graphite-500', '--graphite-400', '--graphite-200',
          '--white', '--paper', '--state-warning', '--state-warning-text', '--state-error', '--state-error-text',
        ].map((name) => [name, token(name)]),
      )
      const c = {
        heroBg: style('.sector-hero').backgroundColor,
        h1: style('.sector-hero__heading').color,
        lead: style('.sector-hero__lead').color,
        heroEyebrow: style('.sector-hero .sector-eyebrow').color,
        crumbLink: style('.breadcrumbs__item a').color,
        crumbCurrent: style('.breadcrumbs__item[aria-current]').color,
        primary: [style('.sector-hero__actions .button').backgroundColor, style('.sector-hero__actions .button').color],
        secondary: [
          style('.sector-hero__actions .button--secondary').color,
          style('.sector-hero__actions .button--secondary').borderTopColor,
          style('.sector-hero__actions .button--secondary').backgroundColor,
        ],
        diagramBg: style('.trace').backgroundColor,
        activeSource: [style('.trace__source:not(.trace__source--faded)').color, style('.trace__source:not(.trace__source--faded) svg').color],
        fadedSource: [style('.trace__source--faded').color, style('.trace__source--faded svg').color],
        solid: style('.trace__source:not(.trace__source--faded) .trace__connector').borderTopColor,
        dashed: style('.trace__connector--dashed').borderTopColor,
        middleBg: style('.trace__middle').backgroundColor,
        traced: style('.trace__heading--middle').color,
        footnote: style('.trace__footnote').color,
        pill: [style('.trace__step').color, style('.trace__step').backgroundColor],
        figureName: style('.trace__figure-name').color,
        rating: style('.trace__rating').color,
        dots: [...document.querySelectorAll('.trace .rating-marker')].map((dot) => getComputedStyle(dot).borderTopColor),
        challengeBadge: [style('.icon-badge--amber').backgroundColor, style('.icon-badge--amber').color],
        approachBadge: [style('.badge-card--inline:nth-child(2) .icon-badge').backgroundColor, style('.badge-card--inline:nth-child(2) .icon-badge').color],
        audienceBg: style('.audience-card').backgroundColor,
        audienceBorder: style('.audience-card').borderTopColor,
        tick: [style('.checklist__tick').backgroundColor, style('.checklist__tick').color],
        bandBg: style('.sector-band').backgroundColor,
        bandEyebrow: style('.sector-band .sector-eyebrow').color,
        deliverableBg: style('.deliverable').backgroundColor,
        stageNumber: style('.stage__number').color,
        stageRule: style('.stage').borderTopColor,
        exit: [style('.stage__exit').backgroundColor, style('.stage__exit-label').color, style('.stage__exit-condition').color],
        stageDescription: style('.stage__description').color,
        chips: [...document.querySelectorAll('.chip .rating-marker')].map((dot) => getComputedStyle(dot).borderTopColor),
        serviceLink: style('.service-card-lp h3 a').color,
        panel: style('.sector-closing__panel').backgroundColor,
        closingEyebrow: style('.sector-closing .sector-eyebrow').color,
        closingHeading: style('.sector-closing__heading').color,
        closingText: style('.sector-closing__body').color,
        closingButton: [style('.sector-closing__actions .button').backgroundColor, style('.sector-closing__actions .button').color],
        address: [style('.sector-closing__actions .button--secondary').color, style('.sector-closing__actions .button--secondary').borderTopColor],
        nav: [style('.site-nav__link[aria-current]').color, style('.site-nav__link[aria-current]').textDecorationColor],
      }
      // Every element whose text, fill or border is amber or red.
      const amber = [tokens['--state-warning'], tokens['--state-warning-text'], tokens['--amber-tint']]
      const red = [tokens['--state-error'], tokens['--state-error-text']]
      const colours = (element: Element) => {
        const s = getComputedStyle(element)
        return [s.color, s.backgroundColor, s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor]
      }
      const inMain = [...document.querySelectorAll('main *')]
      const amberRoots = new Set(
        inMain
          .filter((element) => colours(element).some((colour) => amber.includes(colour)))
          .map((element) => element.closest('.icon-badge--amber, .rating-marker--amber'))
          .map((root) => (root ? root.className.split(' ').at(-1) + (root.closest('.trace') ? ' trace' : root.closest('.chips') ? ' chip' : ' card') : 'OTHER')),
      )
      const redCount = inMain.filter((element) => colours(element).some((colour) => red.includes(colour))).length
      for (const probe of probes) probe.remove()
      return { tokens, c, amberRoots: [...amberRoots].sort(), redCount }
    })
    const t = m.tokens
    expect(m.c).toEqual({
      heroBg: t['--teal-tint-hero'],
      h1: t['--graphite-900'],
      lead: t['--graphite-600'],
      heroEyebrow: t['--teal-800'],
      crumbLink: t['--teal-700'],
      crumbCurrent: t['--graphite-600'],
      primary: [t['--teal-700'], t['--white']],
      secondary: [t['--teal-700'], t['--teal-700'], t['--white']],
      diagramBg: t['--white'],
      activeSource: [t['--graphite-900'], t['--teal-600']],
      fadedSource: [t['--graphite-600'], t['--graphite-600']],
      solid: t['--teal-600'],
      dashed: t['--graphite-500'],
      middleBg: t['--teal-100'],
      traced: t['--teal-800'],
      footnote: t['--graphite-600'],
      pill: [t['--graphite-900'], t['--white']],
      figureName: t['--graphite-900'],
      rating: t['--graphite-600'],
      dots: [t['--state-warning-text'], t['--teal-600'], t['--graphite-600']],
      challengeBadge: [t['--amber-tint'], t['--state-warning-text']],
      approachBadge: [t['--teal-100'], t['--teal-600']],
      audienceBg: t['--teal-tint-soft'],
      audienceBorder: t['--graphite-200'],
      tick: [t['--teal-700'], t['--white']],
      bandBg: t['--white'],
      bandEyebrow: t['--teal-800'],
      deliverableBg: t['--paper'],
      stageNumber: t['--teal-800'],
      stageRule: t['--teal-600'],
      exit: [t['--teal-tint-soft'], t['--teal-800'], t['--graphite-900']],
      stageDescription: t['--graphite-600'],
      chips: [t['--teal-600'], t['--state-warning-text'], t['--graphite-600']],
      serviceLink: t['--graphite-900'],
      panel: t['--graphite-900'],
      closingEyebrow: t['--teal-400'],
      closingHeading: t['--paper'],
      closingText: t['--graphite-400'],
      closingButton: [t['--teal-400'], t['--graphite-900']],
      address: [t['--paper'], t['--graphite-700']],
      nav: [t['--teal-800'], t['--teal-600']],
    })
    expect(m.amberRoots).toEqual(['icon-badge--amber card', 'rating-marker--amber chip', 'rating-marker--amber trace'])
    expect(m.redCount).toBe(0)
  })
})
