import { expect, type Page } from '@playwright/test'
import { processStages } from '../src/data/process.ts'
import { servicesIntro } from '../src/data/services.ts'
import { solutions } from '../src/data/solutions.ts'
import { openPage, test } from './fixtures.ts'

// The Solutions rows and the How We Work timeline (#59) in conditions the
// width projects do not cover: their accessibility trees, colours, type,
// hover, motion, forced colours, and the timeline beside the Services
// lifecycle rail. Runs in the chromium project; the layout at each width,
// in both engines, is in responsive.spec.ts, and the keyboard in
// keyboard.spec.ts.

const solutionsRegion = (page: Page) => page.getByRole('region', { name: 'Solutions' })
const processRegion = (page: Page) => page.getByRole('region', { name: 'How We Work' })

/** Resolves a token to the computed colour a page would paint with it. */
const tokenColour = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, token)

/** Resolves a length token to px. */
const tokenPx = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.width = `var(${name})`
    document.body.append(probe)
    const value = parseFloat(getComputedStyle(probe).width)
    probe.remove()
    return value
  }, token)

test.describe('Solutions', () => {
  test('reads as the eyebrow, the h2 and five rows, each a heading button and its summary', async ({ page }) => {
    await openPage(page, 1440)

    const snapshot = await solutionsRegion(page).ariaSnapshot()
    expect(snapshot).toBe(
      [
        '- region "Solutions":',
        '  - paragraph: 03 — Solutions',
        '  - heading "Solutions" [level=2]',
        '  - list:',
        ...solutions.flatMap((solution) => [
          '    - listitem:',
          `      - heading "${solution.title}" [level=3]:`,
          `        - button "${solution.title}"`,
          '      - list:',
          ...solution.summary.map((item) => `        - listitem: ${item}`),
        ]),
      ].join('\n'),
    )
    // Below the eyebrow: no separator characters, row numbers or theme
    // text while collapsed.
    expect(snapshot.split('\n').slice(2).join('\n')).not.toMatch(/[·•]|\b0\d\b|Payment intelligence/)
  })

  test('paints graphite on paper only, with graphite 200 hairlines', async ({ page }) => {
    await openPage(page, 1440)
    const [paper, g900, g600, g200] = await Promise.all(
      ['--paper', '--graphite-900', '--graphite-600', '--graphite-200'].map((token) =>
        tokenColour(page, token),
      ),
    )
    await solutionsRegion(page).getByRole('button').first().locator('.solution-row__title').click()
    const m = await solutionsRegion(page).evaluate((root) => {
      const style = (selector: string, pseudo?: string) =>
        getComputedStyle(root.querySelector(selector)!, pseudo)
      return {
        section: getComputedStyle(root).backgroundColor,
        eyebrow: style('.section-eyebrow').color,
        h2: style('h2').color,
        title: style('.solution-row__title').color,
        number: style('.solution-row__number').color,
        chevron: style('.solution-row__chevron').color,
        summary: style('.solution-row__summary li').color,
        separator: style('.solution-row__summary li', '::after').borderTopColor,
        theme: style('.solution-row__themes li').color,
        hairline: style('.solution-row').borderTopColor,
        lastHairline: style('.solutions__list').borderBottomColor,
        backgrounds: [...root.querySelectorAll('*')]
          .map((element) => getComputedStyle(element).backgroundColor)
          .filter((colour) => colour !== 'rgba(0, 0, 0, 0)'),
      }
    })

    expect(m.section).toBe(paper)
    // Graphite 900 on paper (14.9:1) and graphite 600 on paper (6.0:1).
    expect([m.h2, m.title, m.theme]).toEqual([g900, g900, g900])
    expect([m.eyebrow, m.number, m.chevron, m.summary, m.separator]).toEqual([g600, g600, g600, g600, g600])
    expect([m.hairline, m.lastHairline]).toEqual([g200, g200])
    // Nothing inside the section has a fill of its own.
    expect(m.backgrounds).toEqual([])
  })

  test('sets the h2, titles, numbers, summaries and themes type, and nothing above weight 500', async ({ page }) => {
    await openPage(page, 1440)
    await solutionsRegion(page).getByRole('button').first().locator('.solution-row__title').click()
    const sizes = {
      section: await tokenPx(page, '--text-section'),
      service: await tokenPx(page, '--text-service'),
      sm: await tokenPx(page, '--text-sm'),
      base: await tokenPx(page, '--text-base'),
    }
    const m = await solutionsRegion(page).evaluate((root) => {
      const pick = (selector: string) => {
        const s = getComputedStyle(root.querySelector(selector)!)
        return {
          size: parseFloat(s.fontSize),
          weight: s.fontWeight,
          lineHeight: parseFloat(s.lineHeight),
          numeric: s.fontVariantNumeric,
        }
      }
      return {
        h2: pick('h2'),
        title: pick('.solution-row__title'),
        number: pick('.solution-row__number'),
        summary: pick('.solution-row__summary li'),
        theme: pick('.solution-row__themes li'),
        weights: [root, ...root.querySelectorAll('*')].map((element) =>
          Number(getComputedStyle(element).fontWeight),
        ),
      }
    })

    expect(m.h2.size).toBeCloseTo(sizes.section, 1)
    expect(m.h2.weight).toBe('300')
    expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
    expect(m.title.size).toBeCloseTo(sizes.service, 1)
    expect(m.title.weight).toBe('300')
    expect(m.number.size).toBeCloseTo(sizes.sm, 1)
    expect(m.number.numeric).toBe('tabular-nums')
    expect(m.summary.size).toBeCloseTo(sizes.sm, 1)
    expect([sizes.sm, sizes.base]).toContain(m.theme.size)
    expect(Math.max(...m.weights)).toBeLessThanOrEqual(500)
  })

  test('hover underlines the title and opens nothing; a click on the summary toggles nothing', async ({ page }) => {
    await openPage(page, 1440)
    const button = solutionsRegion(page).getByRole('button').nth(2)
    const decoration = () =>
      button.evaluate((element) => getComputedStyle(element.querySelector('.solution-row__title')!).textDecorationLine)

    expect(await decoration()).toBe('none')
    await button.locator('.solution-row__number').hover()
    await expect.poll(decoration).toBe('underline')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    // The summary sits over the middle of the button from 1024px.
    const summary = button.locator('xpath=../following-sibling::ul[1]')
    await summary.hover()
    await expect.poll(decoration).toBe('none')
    await summary.click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    for (const other of await solutionsRegion(page).getByRole('button').all()) {
      await expect(other).toHaveAttribute('aria-expanded', 'false')
    }
  })

  test('keeps its hairlines, separators and chevrons drawn in forced-colours mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openPage(page, 1440)
    const m = await solutionsRegion(page).evaluate((root) => {
      const background = getComputedStyle(root).backgroundColor
      const line = (style: CSSStyleDeclaration, side: 'top' | 'bottom') => ({
        style: style.getPropertyValue(`border-${side}-style`),
        width: parseFloat(style.getPropertyValue(`border-${side}-width`)),
        colour: style.getPropertyValue(`border-${side}-color`),
      })
      return {
        background,
        lines: [
          ...[...root.querySelectorAll('.solution-row')].map((row) => line(getComputedStyle(row), 'top')),
          line(getComputedStyle(root.querySelector('.solutions__list')!), 'bottom'),
          ...[...root.querySelectorAll('.solution-row__summary li:not(:last-child)')].map((item) =>
            line(getComputedStyle(item, '::after'), 'top'),
          ),
        ],
        chevrons: [...root.querySelectorAll('.solution-row__chevron path')].map(
          (path) => getComputedStyle(path).stroke,
        ),
      }
    })

    expect(m.lines).toHaveLength(5 + 1 + 15)
    for (const line of m.lines) {
      expect(line.style).toBe('solid')
      expect(line.width).toBeGreaterThan(0)
      expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
      expect(line.colour).not.toBe(m.background)
    }
    for (const stroke of m.chevrons) expect(stroke).not.toBe(m.background)
  })
})

test.describe('How We Work', () => {
  test('reads as the eyebrow, the h2 and the four stages, with no numbers', async ({ page }) => {
    await openPage(page, 1440)

    const snapshot = await processRegion(page).ariaSnapshot()
    expect(snapshot).toBe(
      [
        '- region "How We Work":',
        '  - paragraph: 04 — How We Work',
        '  - heading "How We Work" [level=2]',
        '  - list:',
        ...processStages.flatMap((stage) => [
          '    - listitem:',
          `      - heading "${stage.name}" [level=3]`,
          `      - paragraph: ${stage.description}`,
          `      - paragraph: ${stage.output}`,
        ]),
      ].join('\n'),
    )
  })

  test('adds no tab stop, link, button, title, graphic or scroll container', async ({ page }) => {
    await openPage(page, 1440)
    const m = await processRegion(page).evaluate((root) => ({
      focusable: root.querySelectorAll('a, button, input, [tabindex], [contenteditable]').length,
      titled: root.querySelectorAll('[title]').length,
      scrollers: [root, ...root.querySelectorAll('*')].filter((element) =>
        ['auto', 'scroll', 'hidden'].includes(getComputedStyle(element).overflowX),
      ).length,
      graphics: root.querySelectorAll('img, svg, canvas, picture').length,
    }))
    expect(m).toEqual({ focusable: 0, titled: 0, scrollers: 0, graphics: 0 })
  })

  test('paints only the verified graphite 100 pairings, a graphite 200 line and teal 600 nodes', async ({ page }) => {
    await openPage(page, 1440)
    const [g100, g900, g600, g200, teal600, teal800] = await Promise.all(
      ['--graphite-100', '--graphite-900', '--graphite-600', '--graphite-200', '--teal-600', '--teal-800'].map(
        (token) => tokenColour(page, token),
      ),
    )
    const services = await Promise.all(
      ['--service-build', '--service-govern', '--service-trust', '--service-insights', '--service-intelligence'].map(
        (token) => tokenColour(page, token),
      ),
    )
    const m = await processRegion(page).evaluate((root) => {
      const style = (selector: string, pseudo?: string) =>
        getComputedStyle(root.querySelector(selector)!, pseudo)
      const texts = [...root.querySelectorAll('p, h2, h3, span')].map((element) => getComputedStyle(element).color)
      const painted = [root, ...root.querySelectorAll('*')].flatMap((element) =>
        [null, '::before', '::after'].flatMap((pseudo) => {
          const s = getComputedStyle(element, pseudo)
          if (pseudo && s.content === 'none') return []
          return [s.color, s.backgroundColor, s.borderTopColor, s.borderLeftColor]
        }),
      )
      return {
        section: getComputedStyle(root).backgroundColor,
        eyebrow: style('.section-eyebrow').color,
        number: style('.process__number').color,
        name: style('.process__name').color,
        description: style('.process__description').color,
        output: style('.process__output').color,
        node: style('.process__stage', '::before').borderTopColor,
        nodeFill: style('.process__stage', '::before').backgroundColor,
        line: style('.process__stage', '::after').borderTopColor,
        texts: [...new Set(texts)],
        painted: [...new Set(painted)],
      }
    })

    expect(m.section).toBe(g100)
    // Graphite 900 (14.1:1), graphite 600 (5.7:1) and teal 800 (6.9:1) on
    // graphite 100, and no other text colour.
    expect([m.name, m.description]).toEqual([g900, g900])
    expect(m.eyebrow).toBe(g600)
    // Each stage's output (#63) is graphite 600 on graphite 100 (5.7:1).
    expect(m.output).toBe(g600)
    expect(m.number).toBe(teal800)
    expect(m.texts.sort()).toEqual([g900, g600, teal800].sort())
    // The graphics: a teal 600 ring filled with the section's background,
    // on a graphite 200 line.
    expect(m.node).toBe(teal600)
    expect(m.nodeFill).toBe(g100)
    expect(m.line).toBe(g200)
    for (const colour of services) expect(m.painted).not.toContain(colour)
  })

  test('sets the h2, stage names and numbers type, and nothing above weight 500', async ({ page }) => {
    await openPage(page, 1440)
    const sizes = {
      section: await tokenPx(page, '--text-section'),
      service: await tokenPx(page, '--text-service'),
      sm: await tokenPx(page, '--text-sm'),
    }
    const m = await processRegion(page).evaluate((root) => {
      const pick = (selector: string) => {
        const s = getComputedStyle(root.querySelector(selector)!)
        return { size: parseFloat(s.fontSize), weight: s.fontWeight, lineHeight: parseFloat(s.lineHeight) }
      }
      return {
        h2: pick('h2'),
        name: pick('h3'),
        number: pick('.process__number'),
        description: pick('.process__description'),
        output: pick('.process__output'),
        weights: [root, ...root.querySelectorAll('*')].map((element) =>
          Number(getComputedStyle(element).fontWeight),
        ),
      }
    })

    expect(m.h2.size).toBeCloseTo(sizes.section, 1)
    expect(m.h2.weight).toBe('300')
    expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
    expect(m.name.size).toBeCloseTo(sizes.service, 1)
    expect(m.name.weight).toBe('300')
    expect(m.number.size).toBeCloseTo(sizes.sm, 1)
    // The output (#63) is --text-sm, smaller than the description.
    expect(m.output.size).toBeCloseTo(sizes.sm, 1)
    expect(m.output.size).toBeLessThan(m.description.size)
    expect(Math.max(...m.weights)).toBeLessThanOrEqual(500)
  })

  test('has no motion of its own', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)
    const animated = await processRegion(page).evaluate((root) =>
      [root, ...root.querySelectorAll('*')].flatMap((element) =>
        [null, '::before', '::after']
          .map((pseudo) => getComputedStyle(element, pseudo))
          .filter((style) => style.animationName !== 'none' || parseFloat(style.transitionDuration) > 0)
          .map(() => element.className),
      ),
    )
    expect(animated).toEqual([])
  })

  for (const width of [360, 1440]) {
    test(`keeps its line and nodes drawn in forced-colours mode at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      const m = await processRegion(page).evaluate((root, horizontal) => {
        const side = horizontal ? 'top' : 'left'
        const drawn = (style: CSSStyleDeclaration, edge: string) => ({
          style: style.getPropertyValue(`border-${edge}-style`),
          width: parseFloat(style.getPropertyValue(`border-${edge}-width`)),
          colour: style.getPropertyValue(`border-${edge}-color`),
        })
        const stages = [...root.querySelectorAll('.process__stage')]
        return {
          background: getComputedStyle(root).backgroundColor,
          nodes: stages.map((stage) => drawn(getComputedStyle(stage, '::before'), 'top')),
          lines: stages.slice(0, -1).map((stage) => drawn(getComputedStyle(stage, '::after'), side)),
        }
      }, width >= 1024)

      expect(m.nodes).toHaveLength(4)
      expect(m.lines).toHaveLength(3)
      for (const line of [...m.nodes, ...m.lines]) {
        expect(line.style).toBe('solid')
        expect(line.width).toBeGreaterThan(0)
        expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
        expect(line.colour).not.toBe(m.background)
      }
    })
  }

  // Plan V2 §13: the timeline answers how Fafanua delivers an engagement
  // and must not read as the Services lifecycle rail. Both are saved at
  // 1440px for review; here the measurable differences are checked: the
  // rail's labels are --text-sm with filled service-colour markers and no
  // descriptions, the timeline's names are --text-service with teal rings
  // and a description under each.
  test('does not look like the Services lifecycle rail, at 1440px', async ({ page }, testInfo) => {
    await openPage(page, 1440)
    const rail = page.getByRole('region', { name: servicesIntro.heading }).getByRole('list').first()
    const timeline = processRegion(page).getByRole('list')

    const railLook = await rail.evaluate((list) => {
      const item = list.querySelector('li')!
      const marker = getComputedStyle(item.querySelector('[aria-hidden="true"]')!)
      return {
        label: parseFloat(getComputedStyle(item).fontSize),
        markerBorder: parseFloat(marker.borderTopWidth),
        markerWidth: parseFloat(marker.width),
        paragraphs: list.querySelectorAll('p').length,
      }
    })
    const timelineLook = await timeline.evaluate((list) => {
      const node = getComputedStyle(list.querySelector('li')!, '::before')
      return {
        name: parseFloat(getComputedStyle(list.querySelector('h3')!).fontSize),
        nodeBorder: parseFloat(node.borderTopWidth),
        nodeWidth: parseFloat(node.width),
        paragraphs: list.querySelectorAll('p').length,
      }
    })

    expect(timelineLook.name).toBeGreaterThan(railLook.label * 1.5)
    // The rail's marker is a filled dot (its border fills it); the
    // timeline's node is a ring.
    expect(railLook.markerBorder * 2).toBeGreaterThanOrEqual(railLook.markerWidth)
    expect(timelineLook.nodeBorder * 2).toBeLessThan(timelineLook.nodeWidth)
    expect(railLook.paragraphs).toBe(0)
    // A description and an output (#63) per stage.
    expect(timelineLook.paragraphs).toBe(8)

    const dir = `${testInfo.project.outputDir}/screenshots`
    await rail.screenshot({ path: `${dir}/lifecycle-rail-1440.png` })
    await processRegion(page).screenshot({ path: `${dir}/process-timeline-1440.png` })
  })
})
