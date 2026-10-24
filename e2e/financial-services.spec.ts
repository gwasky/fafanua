import { expect, type Page } from '@playwright/test'
import { openPath, test, waitForScrollSettle } from './fixtures.ts'

// The Financial Services landing page on the shared landing-page
// foundation (#98, _docs/fafanua-financial-services-landing-page-plan.md),
// in Chromium and WebKit, as health.spec.ts checks Health: the
// #assessment jump, the closing panel at #contact, the three mailto:
// links, no Delivered in stages section, the promise strip's order,
// grouping and layout, the reconciliation cards' statuses and layout,
// the layouts at each width, the diagram's connectors, the weights and
// the colours. Forced colours are checked in
// financial-services-forced.spec.ts (Chromium only, as Playwright
// emulates them only there).

const PATH = '/solutions/financial-services'
const MAILTO = 'mailto:info@fafanua.tech'

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
  page.getByRole('region', { name: 'Financial figures you can reconcile.' }).getByRole('link', {
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
    const closing = page.getByRole('region', { name: 'Build a financial data foundation you can trust' })
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

  test('shows "trusted data foundation" in the closing panel (owner, A1, #98)', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const line = page.locator('#contact').getByText(/build a trusted data foundation for reliable reporting and better decisions\./)
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

  test('the hydrated header island names Solutions as current', async ({ page }) => {
    await openPath(page, PATH, 1440)
    await expect(page.locator('#header-island')).toHaveAttribute('data-nav-current', 'solutions')
    await expect(page.getByRole('banner').locator('[aria-current]')).toHaveCount(1)
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
      promiseCard: one('.promise'),
      promiseBodies: all('.promise__body'),
      promiseLabels: all('.promise__label'),
      checklist: all('.audience-card__list li'),
      deliverables: all('.deliverable'),
      reconciliation: all('.reconciliation__card'),
      reconciliationCaption: one('.reconciliation__caption'),
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
/** How many distinct rows the boxes form (by their top edges). */
const rows = (boxes: { top: number }[]) => new Set(boxes.map((b) => Math.round(b.top))).size
/** Whether every box in a row has the same width, within 1px. */
const equalWidths = (boxes: { width: number }[]) =>
  Math.max(...boxes.map((b) => b.width)) - Math.min(...boxes.map((b) => b.width)) <= 1

test.describe('layout', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [1440, 1024]) {
    test(`hero, cards, promise strip, reconciliation cards and closing panel as the image at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      const m = await layout(page)
      // Hero: two equal columns, top-aligned, about --space-8 apart.
      expect(Math.abs(m.heroText.width - m.heroDiagram.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(m.heroText.top - m.heroDiagram.top)).toBeLessThanOrEqual(1)
      expect(m.heroDiagram.left - m.heroText.right).toBeCloseTo(32, 0)
      expect(m.h1Lines).toBe(2)
      if (width === 1440) expect(new Set(m.heroButtons.map((b) => Math.round(b.top))).size).toBe(1)
      expect(m.stages).toEqual([])
      expect(columns(m.traceBoxes)).toBe(3)
      for (const pair of m.paired) {
        expect(columns(pair)).toBe(2)
        expect(equalWidths(pair)).toBe(true)
      }
      // The promise strip: one row of four equal steps, the two labels
      // above them, each spanning two steps, meeting at the 2/3 divider.
      expect(m.promiseBodies).toHaveLength(4)
      expect(rows(m.promiseBodies)).toBe(1)
      expect(columns(m.promiseBodies)).toBe(4)
      expect(equalWidths(m.promiseBodies)).toBe(true)
      expect(m.promiseLabels).toHaveLength(2)
      expect(rows(m.promiseLabels)).toBe(1)
      const [first, second] = m.promiseLabels
      expect(first.bottom).toBeLessThanOrEqual(m.promiseBodies[0].top + 1)
      expect(Math.abs(first.left - m.promiseBodies[0].left)).toBeLessThanOrEqual(1)
      expect(Math.abs(first.right - m.promiseBodies[1].right)).toBeLessThanOrEqual(1)
      expect(Math.abs(second.left - m.promiseBodies[2].left)).toBeLessThanOrEqual(1)
      expect(Math.abs(second.right - m.promiseBodies[3].right)).toBeLessThanOrEqual(1)
      expect(Math.abs(first.right - second.left)).toBeLessThanOrEqual(1)
      expect(Math.abs(first.height - second.height)).toBeLessThanOrEqual(1)
      // The audience card's four items in two columns, two rows.
      expect(columns(m.checklist)).toBe(2)
      expect(rows(m.checklist)).toBe(2)
      expect(columns(m.deliverables)).toBe(4)
      expect(equalWidths(m.deliverables)).toBe(true)
      // The reconciliation cards: three equal columns, the caption below
      // the row, start-aligned.
      expect(columns(m.reconciliation)).toBe(3)
      expect(rows(m.reconciliation)).toBe(1)
      expect(equalWidths(m.reconciliation)).toBe(true)
      expect(m.reconciliationCaption.top).toBeGreaterThanOrEqual(Math.max(...m.reconciliation.map((b) => b.bottom)))
      expect(Math.abs(m.reconciliationCaption.left - m.reconciliation[0].left)).toBeLessThanOrEqual(1)
      expect(columns(m.services)).toBe(3)
      expect(equalWidths(m.services)).toBe(true)
      expect(m.actions[1].top).toBeGreaterThan(m.actions[0].bottom - 1)
      expect(Math.abs(m.actions[0].width - m.actions[1].width)).toBeLessThanOrEqual(1)
      expect(m.actions[0].left).toBeGreaterThan(m.panelText.right)
      expect(m.panel.left).toBeGreaterThan(0)
      expect(m.panel.right).toBeLessThan(m.viewport)
      expect(m.footer.top - m.panel.bottom).toBeGreaterThanOrEqual(48)
    })
  }

  test('hero stacks, the promise strip is two by two, the reconciliation cards stack and grids halve at 768px', async ({ page }) => {
    await openPath(page, PATH, 768)
    const m = await layout(page)
    expect(m.heroDiagram.top).toBeGreaterThan(m.heroText.bottom)
    expect(columns(m.traceBoxes)).toBe(3)
    for (const pair of m.paired) expect(columns(pair)).toBe(1)
    // Two by two: steps 1 and 2 in a row under the first label, 3 and 4
    // in the next under the second; each label spans its two steps.
    const [b1, b2, b3, b4] = m.promiseBodies
    expect(columns(m.promiseBodies)).toBe(2)
    expect(rows(m.promiseBodies)).toBe(2)
    expect(Math.abs(b1.top - b2.top)).toBeLessThanOrEqual(1)
    expect(Math.abs(b3.top - b4.top)).toBeLessThanOrEqual(1)
    expect(b3.top).toBeGreaterThan(b1.bottom - 1)
    const [first, second] = m.promiseLabels
    expect(first.bottom).toBeLessThanOrEqual(b1.top + 1)
    expect(second.top).toBeGreaterThanOrEqual(b2.bottom - 1)
    expect(second.bottom).toBeLessThanOrEqual(b3.top + 1)
    for (const [label, start, end] of [[first, b1, b2], [second, b3, b4]] as const) {
      expect(Math.abs(label.left - start.left)).toBeLessThanOrEqual(1)
      expect(Math.abs(label.right - end.right)).toBeLessThanOrEqual(1)
    }
    expect(columns(m.deliverables)).toBe(2)
    expect(rows(m.deliverables)).toBe(2)
    expect(columns(m.reconciliation)).toBe(1)
    expect(rows(m.reconciliation)).toBe(3)
    expect(m.reconciliationCaption.top).toBeGreaterThanOrEqual(m.reconciliation[2].bottom)
    expect(columns(m.services)).toBe(1)
    expect(columns(m.checklist)).toBe(2)
    expect(Math.abs(m.actions[0].top - m.actions[1].top)).toBeLessThanOrEqual(1)
    expect(m.actions[1].left).toBeGreaterThan(m.actions[0].right)
  })

  test('everything is one column, the promise strip one step per row with its labels above steps 1 and 3, at 390px', async ({ page }) => {
    await openPath(page, PATH, 390)
    const m = await layout(page)
    expect(m.heroDiagram.top).toBeGreaterThan(m.heroText.bottom)
    expect(columns(m.traceBoxes)).toBe(1)
    expect(m.traceBoxes[1].top).toBeGreaterThan(m.traceBoxes[0].bottom)
    expect(m.traceBoxes[2].top).toBeGreaterThan(m.traceBoxes[1].bottom)
    for (const grid of [...m.paired.flat(), ...m.deliverables, ...m.services, ...m.reconciliation]) {
      expect(grid.left).toBeCloseTo(m.paired[0][0].left, -1)
    }
    const [b1, b2, b3, b4] = m.promiseBodies
    expect(columns(m.promiseBodies)).toBe(1)
    expect(rows(m.promiseBodies)).toBe(4)
    const [first, second] = m.promiseLabels
    expect(first.bottom).toBeLessThanOrEqual(b1.top + 1)
    expect(second.top).toBeGreaterThanOrEqual(b2.bottom - 1)
    expect(second.bottom).toBeLessThanOrEqual(b3.top + 1)
    expect(b4.top).toBeGreaterThanOrEqual(b3.bottom - 1)
    for (const label of m.promiseLabels) expect(Math.abs(label.width - m.promiseCard.width)).toBeLessThanOrEqual(2)
    expect(columns(m.deliverables)).toBe(1)
    expect(columns(m.reconciliation)).toBe(1)
    expect(rows(m.reconciliation)).toBe(3)
    expect(columns(m.services)).toBe(1)
    expect(columns(m.checklist)).toBe(1)
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
              label: row.textContent,
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
      expect(m.sources.map((line) => [line.label, line.style])).toEqual([
        ['CRM', 'dashed'],
        ['Card & ATM switch', 'dashed'],
        ['Loan management', 'solid'],
        ['Payments & mobile money', 'solid'],
        ['General ledger', 'solid'],
      ])
      expect(m.figures.map((line) => line.style)).toEqual(['solid', 'solid', 'solid'])
      for (const line of [...m.sources, ...m.figures]) {
        expect(line.width).toBeGreaterThan(0)
        expect(Math.abs(line.centre - line.rowCentre), JSON.stringify(line)).toBeLessThanOrEqual(4)
        expect(line.hidden).toBe('true')
      }
      for (const line of m.sources) expect(Math.abs(line.end - m.middle.left)).toBeLessThanOrEqual(2)
      for (const line of m.figures) expect(Math.abs(line.start - m.middle.right)).toBeLessThanOrEqual(2)
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

test.describe('the promise strip and the reconciliation cards', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the promise strip lists four steps in order, steps 1–2 under the assessment and 3–4 after it, with two circle styles', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const steps = page.locator('.promise ol[role="list"] > li')
    await expect(steps).toHaveCount(4)
    await expect(steps.locator('.promise__name')).toHaveText([
      'Understand the numbers',
      'Establish trust',
      'Connect the systems',
      'Improve reporting and decisions',
    ])
    await expect(steps.locator('.promise__number')).toHaveText(['1', '2', '3', '4'])
    // Each step's accessible text begins with its group label, read once.
    const hidden = await steps.evaluateAll((items) =>
      items.map((item) => [item.firstElementChild!.className, item.firstElementChild!.textContent]),
    )
    expect(hidden).toEqual([
      ['visually-hidden', 'The data trust assessment'],
      ['visually-hidden', 'The data trust assessment'],
      ['visually-hidden', 'After the assessment'],
      ['visually-hidden', 'After the assessment'],
    ])
    const labels = page.locator('.promise__label')
    await expect(labels).toHaveText(['The data trust assessment', 'After the assessment'], { ignoreCase: true })
    for (const label of await labels.all()) await expect(label).toHaveAttribute('aria-hidden', 'true')
    await expect(labels.first()).toHaveCSS('text-transform', 'uppercase')
    await expect(page.locator('.promise').getByRole('heading')).toHaveCount(0)
    const circles = await page.locator('.promise__number').evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).backgroundColor),
    )
    expect(circles[0]).toBe(circles[1])
    expect(circles[2]).toBe(circles[3])
    expect(circles[0]).not.toBe(circles[2])
  })

  test('the reconciliation section comes after the assessment, and shows its three statuses as text with their icons', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const section = page.getByRole('region', { name: 'Know where your financial figures come from' })
    await expect(section.locator('.sector-eyebrow')).toHaveText('After the assessment · What we can implement', { ignoreCase: true })
    const after = await section.evaluate((element) =>
      Boolean(document.getElementById('assessment')!.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
    )
    expect(after).toBe(true)
    const cards = section.getByRole('listitem')
    await expect(cards).toHaveCount(3)
    await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['Loan book', 'Mobile money', 'Board report'])
    await expect(cards.locator('.reconciliation__source')).toHaveText([
      'compared with General ledger',
      'compared with Settlement records',
      'compared with Source systems',
    ])
    const statuses = cards.locator('.reconciliation__status')
    await expect(statuses).toHaveText(['Reconciled', '3 exceptions', 'Validated'])
    for (const status of await statuses.all()) {
      await expect(status.locator('span')).toBeVisible()
      await expect(status.locator('svg')).toBeVisible()
      await expect(status.locator('svg')).toHaveAttribute('aria-hidden', 'true')
    }
    // The hidden comparison words take no space.
    for (const words of await section.locator('.reconciliation__source .visually-hidden').all()) {
      const box = (await words.boundingBox())!
      expect(box.width).toBeLessThanOrEqual(1)
    }
    await expect(section.locator('.reconciliation__caption')).toHaveText('Illustrative example. Not live customer data.')
    await expect(section.getByRole('list')).toHaveAttribute('aria-describedby', 'reconciliation-caption')
  })
})

test.describe('no Delivered in stages section', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the page has no stages, no "Stage" label and no "Moves on when"', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const main = page.getByRole('main')
    await expect(main.locator('.stages, .stage, ol.stages')).toHaveCount(0)
    await expect(main.getByText(/Delivered in stages|Moves on when|Stage \d/)).toHaveCount(0)
    await expect(main.getByRole('heading', { level: 2 })).toHaveText([
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
  })
})

test.describe('weights', () => {
  test.use({ reducedMotion: 'reduce' })

  test('700 for the h1 and section headings, 600 for card headings, labels, step names, record names, statuses, leads and buttons, 400 for body text', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const m = await page.evaluate(() => {
      const weight = (element: Element) => Number(getComputedStyle(element).fontWeight)
      const weights = (selectors: string) =>
        [...document.querySelectorAll(selectors.split(', ').map((selector) => `main ${selector}`).join(', '))].map(weight)
      return {
        bold: weights('h1, .sector-heading'),
        semibold: weights(
          'h3, .badge-card__heading, .badge-card__label, .sector-eyebrow, .trace__heading, .trace__figure-name, .button, .checklist__name, .service-card-lp__lead, .promise__label, .promise__name, .deliverables__label, .reconciliation__status',
        ),
        // The page's own: two labels, four names and three leads; two
        // group labels and four step names; the deliverables label; three
        // record names and three statuses.
        newBold: weights(
          '.badge-card__label, .checklist__name, .service-card-lp__lead, .promise__label, .promise__name, .deliverables__label, .reconciliation__card h3, .reconciliation__status',
        ).length,
        body: weights(
          '.sector-hero__lead, .badge-card__text, .checklist__item, .checklist__text, .deliverable__text, .trace__step, .trace__source, .trace__rating, .chip, .sector-closing__body, .breadcrumbs__item, .promise__text, .reconciliation__source, .reconciliation__caption, .sector-subheading',
        ),
        mainMax: Math.max(...[...document.querySelectorAll('main, main *')].map(weight)),
        frameMax: Math.max(...[...document.querySelectorAll('header, header *, footer, footer *')].map(weight)),
      }
    })
    // The h1 and the five section headings over a section (no stages).
    expect(m.bold.length).toBe(6)
    expect(new Set(m.bold)).toEqual(new Set([700]))
    expect(new Set(m.semibold)).toEqual(new Set([600]))
    expect(m.newBold).toBe(22)
    expect(new Set(m.body)).toEqual(new Set([400]))
    expect(m.mainMax).toBeLessThanOrEqual(700)
    expect(m.frameMax).toBeLessThanOrEqual(500)
  })
})

test.describe('colours', () => {
  test.use({ reducedMotion: 'reduce' })

  test('every element in the colour table takes its token, amber only on the four amber elements and no error colour', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const m = await page.evaluate(() => {
      const probes: HTMLElement[] = []
      const token = (name: string) => {
        const probe = document.createElement('span')
        probe.style.setProperty('color', `var(${name})`)
        document.body.append(probe)
        probes.push(probe)
        return getComputedStyle(probe).color
      }
      const style = (selector: string) => getComputedStyle(document.querySelector(selector)!)
      const styles = (selector: string, property: 'color' | 'backgroundColor' | 'borderTopColor' | 'borderLeftColor') =>
        [...document.querySelectorAll(selector)].map((element) => getComputedStyle(element)[property])
      const tokens = Object.fromEntries(
        [
          '--teal-tint-hero', '--teal-tint-soft', '--amber-tint', '--teal-100', '--teal-400', '--teal-600', '--teal-700',
          '--teal-800', '--graphite-900', '--graphite-700', '--graphite-600', '--graphite-500', '--graphite-400', '--graphite-200',
          '--graphite-100', '--white', '--paper', '--state-warning', '--state-warning-text', '--state-error', '--state-error-text',
        ].map((name) => [name, token(name)]),
      )
      const c = {
        heroBg: style('.sector-hero').backgroundColor,
        h1: style('.sector-hero__heading').color,
        leads: styles('.sector-hero__lead', 'color'),
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
        dots: styles('.trace .rating-marker', 'borderTopColor'),
        challengeBadge: [style('.icon-badge--amber').backgroundColor, style('.icon-badge--amber').color],
        approachBadge: [style('.badge-card--inline:nth-child(2) .icon-badge').backgroundColor, style('.badge-card--inline:nth-child(2) .icon-badge').color],
        cardLabels: styles('.badge-card__label', 'color'),
        cardTexts: styles('.badge-card--inline .badge-card__text', 'color'),
        promiseCard: [style('.promise').backgroundColor, style('.promise').borderTopColor],
        promiseLabels: [
          [style('.promise__label--accent').backgroundColor, style('.promise__label--accent').color],
          [style('.promise__label--neutral').backgroundColor, style('.promise__label--neutral').color],
        ],
        circles: styles('.promise__number', 'backgroundColor'),
        numbers: styles('.promise__number', 'color'),
        stepNames: styles('.promise__name', 'color'),
        stepTexts: styles('.promise__text', 'color'),
        stepDividers: styles('.promise__step + .promise__step .promise__body', 'borderLeftColor'),
        audienceBg: style('.audience-card').backgroundColor,
        audienceBorder: style('.audience-card').borderTopColor,
        audienceTexts: styles('.audience-card__text, .checklist__text', 'color'),
        itemNames: styles('.checklist__name', 'color'),
        tick: [style('.checklist__tick').backgroundColor, style('.checklist__tick').color],
        bandBg: style('.sector-band').backgroundColor,
        bandEyebrow: style('.sector-band .sector-eyebrow').color,
        deliverablesLabel: style('.deliverables__label').color,
        deliverableBg: style('.deliverable').backgroundColor,
        reconciliationEyebrow: style('[aria-labelledby="reconciliation-heading"] .sector-eyebrow').color,
        reconciliationCards: [style('.reconciliation__card').backgroundColor, style('.reconciliation__card').borderTopColor],
        records: styles('.reconciliation__card h3', 'color'),
        sources: styles('.reconciliation__source', 'color'),
        swaps: styles('.reconciliation__source svg', 'color'),
        statuses: styles('.reconciliation__status', 'color'),
        statusIcons: styles('.reconciliation__status svg', 'color'),
        caption: style('.reconciliation__caption').color,
        serviceTexts: styles('.service-card-lp__text', 'color'),
        serviceLeads: styles('.service-card-lp__lead', 'color'),
        chips: styles('.chip .rating-marker', 'borderTopColor'),
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
          .map((element) => element.closest('.icon-badge--amber, .rating-marker--amber, .reconciliation__icon--alert'))
          .map((root) =>
            root
              ? root.getAttribute('class')!.split(' ').at(-1) +
                (root.closest('.trace') ? ' trace' : root.closest('.chips') ? ' chip' : root.closest('.reconciliation') ? ' status' : ' card')
              : 'OTHER',
          ),
      )
      const redCount = inMain.filter((element) => colours(element).some((colour) => red.includes(colour))).length
      for (const probe of probes) probe.remove()
      return { tokens, c, amberRoots: [...amberRoots].sort(), redCount }
    })
    const t = m.tokens
    const times = <T,>(n: number, value: T) => Array.from({ length: n }, () => value)
    expect(m.c).toEqual({
      heroBg: t['--teal-tint-hero'],
      h1: t['--graphite-900'],
      leads: times(2, t['--graphite-600']),
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
      cardLabels: times(2, t['--teal-800']),
      cardTexts: times(4, t['--graphite-600']),
      promiseCard: [t['--white'], t['--graphite-200']],
      promiseLabels: [
        [t['--teal-tint-soft'], t['--teal-800']],
        [t['--paper'], t['--graphite-600']],
      ],
      circles: [t['--teal-100'], t['--teal-100'], t['--graphite-100'], t['--graphite-100']],
      numbers: times(4, t['--graphite-600']),
      stepNames: times(4, t['--graphite-900']),
      stepTexts: times(4, t['--graphite-600']),
      stepDividers: times(3, t['--graphite-200']),
      audienceBg: t['--teal-tint-soft'],
      audienceBorder: t['--graphite-200'],
      audienceTexts: times(6, t['--graphite-600']),
      itemNames: times(4, t['--graphite-900']),
      tick: [t['--teal-700'], t['--white']],
      bandBg: t['--white'],
      bandEyebrow: t['--teal-800'],
      deliverablesLabel: t['--graphite-600'],
      deliverableBg: t['--paper'],
      reconciliationEyebrow: t['--teal-800'],
      reconciliationCards: [t['--white'], t['--graphite-200']],
      records: times(3, t['--graphite-900']),
      sources: times(3, t['--graphite-600']),
      swaps: times(3, t['--teal-600']),
      statuses: times(3, t['--graphite-900']),
      statusIcons: [t['--teal-600'], t['--state-warning-text'], t['--teal-600']],
      caption: t['--graphite-600'],
      serviceTexts: times(3, t['--graphite-600']),
      serviceLeads: times(3, t['--teal-800']),
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
    expect(m.amberRoots).toEqual([
      'icon-badge--amber card',
      'rating-marker--amber chip',
      'rating-marker--amber trace',
      'reconciliation__icon--alert status',
    ])
    expect(m.redCount).toBe(0)
  })
})
