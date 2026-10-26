import { expect, type Page } from '@playwright/test'
import { openPath, test, waitForScrollSettle } from './fixtures.ts'

// The Education landing page on the shared landing-page foundation (#100,
// _docs/fafanua-education-landing-page-plan.md), in Chromium and WebKit,
// as financial-services.spec.ts checks Financial Services: the
// #assessment jump, the closing panel at #contact, the three mailto:
// links, no Delivered in stages, promise strip or reconciliation section,
// the learner journey's order, highlight, hairlines, callout and caption
// at each width and with 200% text, the layouts at each width, the
// diagram's connectors, the weights and the colours. Forced colours are
// checked in education-forced.spec.ts (Chromium only, as Playwright
// emulates them only there).

const PATH = '/solutions/education'
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
  page.getByRole('region', { name: 'Every learner, counted the same way.' }).getByRole('link', {
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
    const closing = page.getByRole('region', { name: 'Build an education data foundation you can trust' })
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

  test('shows "trusted data foundation" in the closing panel (owner, A1, #100)', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const line = page.locator('#contact').getByText(/build a trusted data foundation for reliable reporting, clearer learner journeys and better decisions\./)
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
/** How many distinct rows the boxes form (by their top edges). */
const rows = (boxes: { top: number }[]) => new Set(boxes.map((b) => Math.round(b.top))).size
/** Whether every box in a row has the same width, within 1px. */
const equalWidths = (boxes: { width: number }[]) =>
  Math.max(...boxes.map((b) => b.width)) - Math.min(...boxes.map((b) => b.width)) <= 1

test.describe('layout', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [1440, 1024]) {
    test(`hero, cards and closing panel as the image at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      const m = await layout(page)
      // Hero: two equal columns, top-aligned, about --space-8 apart.
      expect(Math.abs(m.heroText.width - m.heroDiagram.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(m.heroText.top - m.heroDiagram.top)).toBeLessThanOrEqual(1)
      expect(m.heroDiagram.left - m.heroText.right).toBeCloseTo(32, 0)
      // At most three lines, as in the image; the buttons share a row at
      // 1440 and may wrap at 1024.
      expect(m.h1Lines).toBeLessThanOrEqual(3)
      if (width === 1440) expect(new Set(m.heroButtons.map((b) => Math.round(b.top))).size).toBe(1)
      expect(m.stages).toEqual([])
      expect(columns(m.traceBoxes)).toBe(3)
      for (const pair of m.paired) {
        expect(columns(pair)).toBe(2)
        expect(equalWidths(pair)).toBe(true)
      }
      // The audience card's four items in two columns, two rows.
      expect(columns(m.checklist)).toBe(2)
      expect(rows(m.checklist)).toBe(2)
      expect(columns(m.deliverables)).toBe(4)
      expect(equalWidths(m.deliverables)).toBe(true)
      // Five service cards, three across: three and two.
      expect(m.services).toHaveLength(5)
      expect(columns(m.services)).toBe(3)
      expect(rows(m.services)).toBe(2)
      expect(equalWidths(m.services)).toBe(true)
      expect(m.actions[1].top).toBeGreaterThan(m.actions[0].bottom - 1)
      expect(Math.abs(m.actions[0].width - m.actions[1].width)).toBeLessThanOrEqual(1)
      expect(m.actions[0].left).toBeGreaterThan(m.panelText.right)
      expect(m.panel.left).toBeGreaterThan(0)
      expect(m.panel.right).toBeLessThan(m.viewport)
      expect(m.footer.top - m.panel.bottom).toBeGreaterThanOrEqual(48)
    })
  }

  test('hero stacks, the cards stack and grids halve at 768px', async ({ page }) => {
    await openPath(page, PATH, 768)
    const m = await layout(page)
    expect(m.heroDiagram.top).toBeGreaterThan(m.heroText.bottom)
    expect(columns(m.traceBoxes)).toBe(3)
    for (const pair of m.paired) expect(columns(pair)).toBe(1)
    expect(columns(m.deliverables)).toBe(2)
    expect(rows(m.deliverables)).toBe(2)
    expect(columns(m.services)).toBe(1)
    expect(columns(m.checklist)).toBe(2)
    expect(Math.abs(m.actions[0].top - m.actions[1].top)).toBeLessThanOrEqual(1)
    expect(m.actions[1].left).toBeGreaterThan(m.actions[0].right)
  })

  test('everything is one column at 390px', async ({ page }) => {
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
        ['Admissions', 'dashed'],
        ['Exams & grading', 'dashed'],
        ['Student information system', 'solid'],
        ['Learning platform', 'solid'],
        ['Fees & finance', 'solid'],
      ])
      expect(m.figures.map((line) => line.style)).toEqual(['solid', 'solid', 'solid'])
      // Each connector at its row's centre, the wrapped "Student
      // information system" row included.
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

// The learner journey's geometry: each step's point (dot, name and
// system), the dots, the names and systems, the callout, the caption, the
// ol, and the hairlines, read from their computed styles: the ol's
// ::before (and ::after, the second line from 48em to 64em) runs along
// its grid row through the dots; below 48em each step's ::before runs
// down from its dot to the next.
async function journey(page: Page) {
  return page.evaluate(() => {
    const box = (element: Element) => {
      const r = element.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const ol = document.querySelector('ol.journey')!
    const items = [...ol.children]
    const dots = items.map((item) => item.querySelector('.journey__dot')!)
    const names = items.map((item) => item.querySelector('.journey__name')!)
    const line = (pseudo: '::before' | '::after') => {
      const s = getComputedStyle(ol, pseudo)
      return {
        // Below 48em the ol's pseudo-elements have no content, so are not
        // generated.
        display: s.content === 'none' ? 'none' : s.display,
        width: parseFloat(s.borderTopWidth),
        style: s.borderTopStyle,
        colour: s.borderTopColor,
        gridRow: s.gridRowStart,
        alignSelf: s.alignSelf,
        start: parseFloat(s.marginLeft),
        end: parseFloat(s.marginRight),
      }
    }
    return {
      ol: box(ol),
      points: items.map((item) => box(item.querySelector('.journey__point')!)),
      dots: dots.map((dot) => ({ ...box(dot), border: getComputedStyle(dot).borderTopWidth, hidden: dot.getAttribute('aria-hidden') })),
      names: names.map(box),
      nameMargins: names.map((name) => parseFloat(getComputedStyle(name).marginTop)),
      systems: items.map((item) => box(item.querySelector('.journey__system')!)),
      callout: box(document.querySelector('.definition-callout')!),
      caption: box(document.querySelector('.journey__caption')!),
      before: line('::before'),
      after: line('::after'),
      vertical: items.map((item) => {
        const s = getComputedStyle(item, '::before')
        const r = item.getBoundingClientRect()
        return {
          display: s.display,
          content: s.content,
          x: r.left + parseFloat(s.left),
          top: r.top + parseFloat(s.top),
          bottom: r.bottom - parseFloat(s.bottom),
          width: parseFloat(s.borderLeftWidth),
          colour: s.borderLeftColor,
        }
      }),
    }
  })
}

const centreY = (b: { top: number; height: number }) => b.top + b.height / 2
const centreX = (b: { left: number; width: number }) => b.left + b.width / 2

/** No two boxes overlap (a 0.5px tolerance for rounding). */
function expectNoOverlap(boxes: { left: number; right: number; top: number; bottom: number }[], note: string) {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const [a, b] = [boxes[i], boxes[j]]
      const overlap = a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5
      expect(overlap, `${note}: ${i} and ${j}: ${JSON.stringify([a, b])}`).toBe(false)
    }
  }
}

test.describe('the learner journey', () => {
  test.use({ reducedMotion: 'reduce' })

  test('lists five steps in order, Learn\'s dot filled and the other four hollow, described by the callout', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const section = page.getByRole('region', { name: 'Follow every learner, end to end' })
    await expect(section.locator('.sector-eyebrow')).toHaveText('What happens next · One learner, one record', { ignoreCase: true })
    await expect(section.locator('.sector-eyebrow')).toHaveCSS('text-transform', 'uppercase')
    const steps = section.locator('ol.journey[role="list"] > li')
    await expect(steps).toHaveCount(5)
    await expect(steps.locator('.journey__name')).toHaveText(['Apply', 'Enrol', 'Learn', 'Assess', 'Complete'])
    await expect(steps.locator('.journey__system')).toHaveText([
      'Admissions',
      'Student information system',
      'Learning platform',
      'Exams and grading',
      'Certification records',
    ])
    const m = await journey(page)
    // Learn's dot is filled by its border (half its size), the others
    // are 2px rings.
    expect(m.dots.map((dot) => dot.border)).toEqual(['2px', '2px', '6px', '2px', '2px'])
    for (const dot of m.dots) {
      expect(dot.width).toBeCloseTo(12, 0)
      expect(dot.height).toBeCloseTo(12, 0)
      expect(dot.hidden).toBe('true')
    }
    const learn = steps.nth(2)
    await expect(learn).toHaveAttribute('aria-describedby', 'journey-callout')
    await expect(learn.locator('.visually-hidden')).toHaveText('(definition shown below)')
    const note = (await learn.locator('.visually-hidden').boundingBox())!
    expect(note.width).toBeLessThanOrEqual(1)
    await expect(page.locator('#journey-callout .definition-callout__label')).toHaveText('Definition agreed', { ignoreCase: true })
    await expect(page.locator('#journey-callout .definition-callout__label')).toHaveCSS('text-transform', 'uppercase')
    await expect(learn.locator('.journey__caption')).toHaveText('Illustrative example. Sample definition only.')
    // After the assessment band, outside it.
    const after = await section.evaluate((element) => document.getElementById('assessment')!.nextElementSibling === element)
    expect(after).toBe(true)
    await expect(page.locator('#assessment .journey, #assessment .definition-callout')).toHaveCount(0)
  })

  for (const width of [1440, 1024]) {
    test(`one row of five equal columns on one hairline, the callout from Learn to the row's end, the caption below at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      const m = await journey(page)
      expect(rows(m.points)).toBe(1)
      expect(columns(m.points)).toBe(5)
      expect(equalWidths(m.points)).toBe(true)
      // Each dot at its column's start, the name and system under it,
      // start-aligned.
      m.points.forEach((point, index) => {
        expect(Math.abs(m.dots[index].left - point.left)).toBeLessThanOrEqual(1)
        expect(m.names[index].top).toBeGreaterThanOrEqual(m.dots[index].bottom)
        expect(Math.abs(m.names[index].left - point.left)).toBeLessThanOrEqual(1)
        expect(Math.abs(m.systems[index].left - point.left)).toBeLessThanOrEqual(1)
      })
      // One hairline, in the dots' row: from the first dot's centre to
      // the row's end, its centre within 1px of every dot's.
      expect(m.before).toMatchObject({ display: 'block', width: 1, style: 'solid', gridRow: '1', alignSelf: 'center', end: 0 })
      expect(m.after.display).toBe('none')
      expect(Math.abs(m.ol.left + m.before.start - centreX(m.dots[0]))).toBeLessThanOrEqual(1)
      const rowBottom = m.names[0].top - m.nameMargins[0]
      const lineCentre = (m.ol.top + rowBottom) / 2
      for (const dot of m.dots) expect(Math.abs(centreY(dot) - lineCentre), JSON.stringify({ dot, lineCentre })).toBeLessThanOrEqual(1)
      // The callout: from Learn's column to no further than the row's
      // end, at least --space-5 below the tallest step; then the caption,
      // from the row's start.
      expect(Math.abs(m.callout.left - m.points[2].left)).toBeLessThanOrEqual(1)
      expect(m.callout.right).toBeLessThanOrEqual(m.ol.right + 0.5)
      expect(m.callout.top - Math.max(...m.systems.map((b) => b.bottom))).toBeGreaterThanOrEqual(20 - 0.5)
      expect(m.caption.top).toBeGreaterThanOrEqual(m.callout.bottom)
      expect(Math.abs(m.caption.left - m.ol.left)).toBeLessThanOrEqual(1)
      expect(m.vertical.every((line) => line.display === 'none' || line.content === 'none')).toBe(true)
    })
  }

  test('three steps and two, each line on its own hairline, the callout across both at 768px', async ({ page }) => {
    await openPath(page, PATH, 768)
    const m = await journey(page)
    const [a, b, c, d, e] = m.points
    expect(rows([a, b, c])).toBe(1)
    expect(rows([d, e])).toBe(1)
    expect(d.top).toBeGreaterThan(Math.max(a.bottom, b.bottom, c.bottom))
    expect(columns([a, b, c])).toBe(3)
    expect(equalWidths([a, b, c, d, e])).toBe(true)
    expect(Math.abs(d.left - a.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(e.left - b.left)).toBeLessThanOrEqual(1)
    // Two hairlines, in rows 1 and 5, each through its own line's dots.
    expect(m.before).toMatchObject({ display: 'block', width: 1, style: 'solid', gridRow: '1', alignSelf: 'center' })
    expect(m.after).toMatchObject({ display: 'block', width: 1, style: 'solid', gridRow: '5', alignSelf: 'center' })
    const first = (m.ol.top + m.names[0].top - m.nameMargins[0]) / 2
    const second = (d.top + m.names[3].top - m.nameMargins[3]) / 2
    for (const dot of m.dots.slice(0, 3)) expect(Math.abs(centreY(dot) - first)).toBeLessThanOrEqual(1)
    for (const dot of m.dots.slice(3)) expect(Math.abs(centreY(dot) - second)).toBeLessThanOrEqual(1)
    expect(Math.abs(m.ol.left + m.before.start - centreX(m.dots[0]))).toBeLessThanOrEqual(1)
    expect(Math.abs(m.ol.left + m.after.start - centreX(m.dots[3]))).toBeLessThanOrEqual(1)
    // The callout full width under both lines, then the caption.
    expect(Math.abs(m.callout.left - m.ol.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(m.callout.right - m.ol.right)).toBeLessThanOrEqual(1)
    expect(m.callout.top).toBeGreaterThanOrEqual(Math.max(m.systems[3].bottom, m.systems[4].bottom))
    expect(m.caption.top).toBeGreaterThanOrEqual(m.callout.bottom)
  })

  test('one step per row on a vertical hairline, the callout and caption between Learn and Assess at 390px', async ({ page }) => {
    await openPath(page, PATH, 390)
    const m = await journey(page)
    expect(columns(m.points)).toBe(1)
    for (let i = 1; i < 5; i++) expect(m.points[i].top).toBeGreaterThanOrEqual(m.points[i - 1].bottom)
    // The dot on the start side, the name and system to its end side.
    m.points.forEach((point, index) => {
      expect(Math.abs(m.dots[index].left - point.left)).toBeLessThanOrEqual(1)
      expect(m.names[index].left).toBeGreaterThanOrEqual(m.dots[index].right)
      expect(Math.abs(m.systems[index].left - m.names[index].left)).toBeLessThanOrEqual(1)
    })
    // The vertical hairline, from each dot's centre to the next, through
    // every dot's centre; none after the last.
    expect(m.before.display).toBe('none')
    for (let i = 0; i < 4; i++) {
      const line = m.vertical[i]
      expect(line.width).toBe(1)
      expect(Math.abs(line.x - centreX(m.dots[i])), JSON.stringify(line)).toBeLessThanOrEqual(1)
      expect(Math.abs(line.top - centreY(m.dots[i])), JSON.stringify(line)).toBeLessThanOrEqual(1)
      expect(Math.abs(line.bottom - centreY(m.dots[i + 1])), JSON.stringify(line)).toBeLessThanOrEqual(1)
    }
    expect(m.vertical[4].content === 'none' || m.vertical[4].display === 'none').toBe(true)
    // The callout directly under Learn's system, start-aligned with the
    // steps' text, then the caption, both above Assess.
    expect(m.callout.top).toBeGreaterThanOrEqual(m.systems[2].bottom)
    expect(Math.abs(m.callout.left - m.names[2].left)).toBeLessThanOrEqual(1)
    expect(m.caption.top).toBeGreaterThanOrEqual(m.callout.bottom)
    expect(m.caption.bottom).toBeLessThanOrEqual(m.points[3].top)
  })

  for (const text of ['100%', '200%'] as const) for (const width of [1440, 1024, 768, 390, 320]) {
    test(`nothing in the journey overlaps or overflows with ${text} text at ${width}px`, async ({ page }) => {
      await openPath(page, PATH, width)
      if (text === '200%') {
        await page.addStyleTag({ content: 'html { font-size: 200%; }' })
        await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('32px')
      }
      const m = await journey(page)
      expectNoOverlap([...m.names, ...m.systems, ...m.dots, m.callout, m.caption], `${text} ${width}`)
      for (const b of [...m.points, ...m.names, ...m.systems, m.callout, m.caption]) {
        expect(b.left).toBeGreaterThanOrEqual(m.ol.left - 0.5)
        expect(b.right, JSON.stringify(b)).toBeLessThanOrEqual(m.ol.right + 0.5)
      }
      expect(m.caption.bottom).toBeLessThanOrEqual(m.ol.bottom + 0.5)
    })
  }
})

test.describe('no Delivered in stages, promise strip or reconciliation section', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the page has none of them, and its h2s are the plan\'s', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const main = page.getByRole('main')
    await expect(main.locator('.stages, .stage, ol.stages, .promise, .reconciliation')).toHaveCount(0)
    await expect(main.getByText(/Delivered in stages|Moves on when|Stage \d/)).toHaveCount(0)
    await expect(main.getByRole('heading', { level: 2 })).toHaveText([
      'The challenge',
      'Our approach',
      'Who we work with',
      'The Data Trust Assessment: three weeks, fixed fee',
      'Follow every learner, end to end',
      'What this means for AI',
      'Handled responsibly',
      'After the assessment',
      'Build an education data foundation you can trust',
    ])
  })
})

test.describe('weights', () => {
  test.use({ reducedMotion: 'reduce' })

  test('700 for the h1 and section headings, 600 for card headings, step names, the callout label, eyebrows and buttons, 400 for body text', async ({ page }) => {
    await openPath(page, PATH, 1440)
    const m = await page.evaluate(() => {
      const weight = (element: Element) => Number(getComputedStyle(element).fontWeight)
      const weights = (selectors: string) =>
        [...document.querySelectorAll(selectors.split(', ').map((selector) => `main ${selector}`).join(', '))].map(weight)
      return {
        bold: weights('h1, .sector-heading'),
        semibold: weights(
          'h3, .badge-card__heading, .sector-eyebrow, .trace__heading, .trace__figure-name, .button, .journey__name, .definition-callout__label',
        ),
        // The page's own: five step names and the callout label.
        newBold: weights('.journey__name, .definition-callout__label').length,
        body: weights(
          '.sector-hero__lead, .badge-card__text, .checklist__item, .deliverable__text, .trace__step, .trace__source, .trace__rating, .chip, .sector-closing__body, .breadcrumbs__item, .sector-subheading, .journey__system, .definition-callout__text, .journey__caption, .service-card-lp__text',
        ),
        mainMax: Math.max(...[...document.querySelectorAll('main, main *')].map(weight)),
        frameMax: Math.max(...[...document.querySelectorAll('header, header *, footer, footer *')].map(weight)),
      }
    })
    // The h1 and the five section headings over a section.
    expect(m.bold.length).toBe(6)
    expect(new Set(m.bold)).toEqual(new Set([700]))
    expect(new Set(m.semibold)).toEqual(new Set([600]))
    expect(m.newBold).toBe(6)
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
          '--white', '--paper', '--state-warning', '--state-warning-text', '--state-error', '--state-error-text',
        ].map((name) => [name, token(name)]),
      )
      const journeySection = document.querySelector('[aria-labelledby="journey-heading"]')!
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
        cardTexts: styles('.badge-card--inline .badge-card__text', 'color'),
        audienceBg: style('.audience-card').backgroundColor,
        audienceBorder: style('.audience-card').borderTopColor,
        audienceBadge: [style('.audience-card .icon-badge').backgroundColor, style('.audience-card .icon-badge').color],
        audienceHeading: style('.audience-card h3').color,
        audienceTexts: styles('.audience-card__text', 'color'),
        tick: [style('.checklist__tick').backgroundColor, style('.checklist__tick').color],
        bandBg: style('.sector-band').backgroundColor,
        bandEyebrow: style('.sector-band .sector-eyebrow').color,
        deliverableBg: style('.deliverable').backgroundColor,
        journeyBg: getComputedStyle(journeySection).backgroundColor,
        journeyEyebrow: getComputedStyle(journeySection.querySelector('.sector-eyebrow')!).color,
        journeyHeading: getComputedStyle(journeySection.querySelector('h2')!).color,
        journeyText: getComputedStyle(journeySection.querySelector('.sector-subheading')!).color,
        stepNames: styles('.journey__name', 'color'),
        stepSystems: styles('.journey__system', 'color'),
        stepDots: styles('.journey__dot', 'borderTopColor'),
        stepFills: styles('.journey__dot', 'backgroundColor'),
        learnRing: style('.journey__step--highlight .journey__dot').boxShadow,
        hairline: getComputedStyle(document.querySelector('ol.journey')!, '::before').borderTopColor,
        callout: [
          style('.definition-callout').backgroundColor,
          style('.definition-callout').borderLeftColor,
          style('.definition-callout').borderLeftWidth,
          style('.definition-callout').borderTopColor,
          style('.definition-callout').borderTopWidth,
          style('.definition-callout').borderTopLeftRadius,
        ],
        calloutLabel: style('.definition-callout__label').color,
        calloutText: style('.definition-callout__text').color,
        journeyCaption: style('.journey__caption').color,
        serviceTexts: styles('.service-card-lp__text', 'color'),
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
          .map((element) => element.closest('.icon-badge--amber, .rating-marker--amber'))
          .map((root) =>
            root
              ? root.getAttribute('class')!.split(' ').at(-1) + (root.closest('.trace') ? ' trace' : root.closest('.chips') ? ' chip' : ' card')
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
      leads: [t['--graphite-600']],
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
      cardTexts: times(2, t['--graphite-600']),
      audienceBg: t['--teal-tint-soft'],
      audienceBorder: t['--graphite-200'],
      audienceBadge: [t['--teal-100'], t['--teal-600']],
      audienceHeading: t['--graphite-900'],
      audienceTexts: times(2, t['--graphite-600']),
      tick: [t['--teal-700'], t['--white']],
      bandBg: t['--white'],
      bandEyebrow: t['--teal-800'],
      deliverableBg: t['--paper'],
      journeyBg: 'rgba(0, 0, 0, 0)',
      journeyEyebrow: t['--teal-800'],
      journeyHeading: t['--graphite-900'],
      journeyText: t['--graphite-600'],
      stepNames: times(5, t['--graphite-900']),
      stepSystems: times(5, t['--graphite-600']),
      stepDots: times(5, t['--teal-600']),
      stepFills: times(5, t['--white']),
      learnRing: `${t['--teal-100']} 0px 0px 0px 4px`,
      hairline: t['--graphite-200'],
      callout: [t['--white'], t['--teal-600'], '3px', t['--graphite-200'], '1px', '8px'],
      calloutLabel: t['--teal-800'],
      calloutText: t['--graphite-900'],
      journeyCaption: t['--graphite-600'],
      serviceTexts: times(5, t['--graphite-600']),
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
    // The journey sits on the body's paper.
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(t['--paper'])
    expect(m.amberRoots).toEqual(['icon-badge--amber card', 'rating-marker--amber chip', 'rating-marker--amber trace'])
    expect(m.redCount).toBe(0)
  })
})
