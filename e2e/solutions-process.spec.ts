import { expect, type Page } from '@playwright/test'
import { processStages } from '../src/data/process.ts'
import { servicesIntro } from '../src/data/services.ts'
import { homepageSolutions, solutionsIntro } from '../src/data/solutions.ts'
import { solutionPath } from '../src/paths.ts'
import { centreOf, openPage, test } from './fixtures.ts'

// The Solutions rows (#59, links since #89) and the How We Work timeline
// (#59) in conditions the width projects do not cover: their accessibility
// trees, colours, type, hover, motion, forced colours, and the timeline
// beside the Services
// lifecycle rail. Runs in the chromium project; the layout at each width,
// in both engines, is in responsive.spec.ts, and the keyboard in
// keyboard.spec.ts.

const solutionsRegion = (page: Page) => page.getByRole('region', { name: solutionsIntro.heading })
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
  test('reads as the eyebrow, the h2, the intro line and three rows, each a heading link and its tag line', async ({ page }) => {
    await openPage(page, 1440)

    const snapshot = await solutionsRegion(page).ariaSnapshot()
    expect(snapshot).toBe(
      [
        `- region "${solutionsIntro.heading}":`,
        '  - paragraph: 03 — Solutions',
        `  - heading "${solutionsIntro.heading}" [level=2]`,
        `  - paragraph: ${solutionsIntro.intro}`,
        '  - list:',
        ...homepageSolutions.flatMap((solution) => [
          '    - listitem:',
          `      - heading "${solution.title}" [level=3]:`,
          `        - link "${solution.title}":`,
          `          - /url: ${solutionPath(solution.id)}`,
          `      - paragraph: ${solution.summary.join(' · ')}`,
        ]),
      ].join('\n'),
    )
    // Below the eyebrow: no arrows, row numbers, theme text or "Lineage" (#89).
    expect(snapshot.split('\n').slice(2).join('\n')).not.toMatch(/→|\b0\d\b|Payment intelligence|Lineage|button/)
    // W7 (#73): Health, Financial Services and Education, in that order;
    // the other sectors are linked from the footer, not listed here.
    expect([...snapshot.matchAll(/link "(.+)"/g)].map((match) => match[1])).toEqual([
      'Health',
      'Financial Services',
      'Education',
    ])
    expect(snapshot).not.toMatch(/Retail|Development|Public Sector/)
  })

  test('paints graphite on paper at rest, with graphite 200 hairlines', async ({ page }) => {
    await openPage(page, 1440)
    const [paper, g900, g600, g200] = await Promise.all(
      ['--paper', '--graphite-900', '--graphite-600', '--graphite-200'].map((token) =>
        tokenColour(page, token),
      ),
    )
    const m = await solutionsRegion(page).evaluate((root) => {
      const style = (selector: string, pseudo?: string) =>
        getComputedStyle(root.querySelector(selector)!, pseudo)
      return {
        section: getComputedStyle(root).backgroundColor,
        eyebrow: style('.section-eyebrow').color,
        h2: style('h2').color,
        intro: style('.solutions__intro').color,
        names: [...root.querySelectorAll('.solution-row__link')].map((link) => getComputedStyle(link).color),
        tags: [...root.querySelectorAll('.solution-row__tags')].map((tags) => getComputedStyle(tags).color),
        arrows: [...root.querySelectorAll('.solution-row__arrow')].map((arrow) => getComputedStyle(arrow).color),
        tints: [...root.querySelectorAll('.solution-row')].map((row) => getComputedStyle(row, '::before').backgroundColor),
        firstHairline: style('.solutions__list').borderTopColor,
        hairlines: [...root.querySelectorAll('.solution-row')].map((row) => getComputedStyle(row).borderBottomColor),
        backgrounds: [...root.querySelectorAll('*')]
          .map((element) => getComputedStyle(element).backgroundColor)
          .filter((colour) => colour !== 'rgba(0, 0, 0, 0)'),
        shadows: [...root.querySelectorAll('*')].map((element) => getComputedStyle(element).boxShadow),
        radii: [...root.querySelectorAll('.solution-row')].map((row) => getComputedStyle(row).borderRadius),
      }
    })

    expect(m.section).toBe(paper)
    // Graphite 900 on paper (14.9:1) and graphite 600 on paper (6.0:1).
    expect([m.h2, ...m.names]).toEqual(Array(4).fill(g900))
    expect([m.eyebrow, m.intro, ...m.tags, ...m.arrows]).toEqual(Array(8).fill(g600))
    expect([m.firstHairline, ...m.hairlines]).toEqual(Array(4).fill(g200))
    // Nothing inside the section has a fill, shadow or radius at rest.
    expect(m.tints).toEqual(Array(3).fill('rgba(0, 0, 0, 0)'))
    expect(m.backgrounds).toEqual([])
    for (const shadow of m.shadows) expect(shadow).toBe('none')
    expect(m.radii).toEqual(Array(3).fill('0px'))
  })

  for (const how of ['hover', 'keyboard focus'] as const) {
    test(`${how} tints the row graphite 100, underlines the name 1px teal 800 and turns the arrow teal 800, moving nothing`, async ({ page }) => {
      await openPage(page, 1440)
      const [g100, teal800, g600, teal600] = await Promise.all(
        ['--graphite-100', '--teal-800', '--graphite-600', '--teal-600'].map((token) => tokenColour(page, token)),
      )
      const rows = solutionsRegion(page).locator('.solution-row')
      const state = (index: number) =>
        rows.nth(index).evaluate((row) => {
          const link = getComputedStyle(row.querySelector('.solution-row__link')!)
          // Relative to the row, since hovering may scroll the page.
          const origin = row.getBoundingClientRect()
          const box = (selector: string) => {
            const r = row.querySelector(selector)!.getBoundingClientRect()
            return [r.x - origin.x, r.y - origin.y, r.width, r.height]
          }
          return {
            tint: getComputedStyle(row, '::before').backgroundColor,
            underline: link.textDecorationLine,
            underlineColour: link.textDecorationColor,
            thickness: link.textDecorationThickness,
            arrow: getComputedStyle(row.querySelector('.solution-row__arrow')!).color,
            outline: [link.outlineStyle, link.outlineWidth, link.outlineColor, link.outlineOffset],
            boxes: [box('.solution-row__name'), box('.solution-row__tags'), box('.solution-row__arrow')],
            shadow: getComputedStyle(row).boxShadow,
          }
        })
      const before = await state(1)

      if (how === 'hover') {
        const { x, y } = await centreOf(rows.nth(1).locator('.solution-row__tags'))
        await page.mouse.move(x, y)
      }
      else {
        await solutionsRegion(page).getByRole('link', { name: homepageSolutions[0].title }).focus()
        await page.keyboard.press('Tab')
        await expect(solutionsRegion(page).getByRole('link', { name: homepageSolutions[1].title })).toBeFocused()
      }
      await expect.poll(async () => (await state(1)).tint).toBe(g100)
      await expect.poll(async () => (await state(1)).arrow).toBe(teal800)
      await expect.poll(async () => (await state(1)).underlineColour).toBe(teal800)
      const after = await state(1)

      expect(after.underline).toBe('underline')
      expect(after.thickness).toBe('1px')
      expect(after.boxes).toEqual(before.boxes)
      expect(after.shadow).toBe('none')
      if (how === 'keyboard focus') {
        expect(after.outline).toEqual(['solid', '2px', teal600, '2px'])
      } else {
        expect(after.outline[0]).toBe('none')
      }
      // The other rows stay at rest.
      for (const index of [0, 2]) {
        const other = await state(index)
        expect(other.tint).toBe('rgba(0, 0, 0, 0)')
        expect(other.arrow).toBe(g600)
      }
    })
  }

  test('a click on a row\'s tags opens its page', async ({ page }) => {
    await openPage(page, 1440)
    const row = solutionsRegion(page).locator('.solution-row').nth(0)

    const { x, y } = await centreOf(row.locator('.solution-row__tags'))
    await page.mouse.click(x, y)
    await expect(page).toHaveURL(new RegExp(`${solutionPath(homepageSolutions[0].id)}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(homepageSolutions[0].heading)
  })

  test('a mouse click on a row\'s name leaves no focus tint', async ({ page }) => {
    await openPage(page, 1440)
    const link = solutionsRegion(page).getByRole('link', { name: homepageSolutions[2].title })
    // Stop the navigation, so the clicked row stays on screen.
    await link.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault()))
    await link.click()
    await page.mouse.move(0, 0)

    await expect(link).toBeFocused()
    await expect
      .poll(() => link.evaluate((element) => getComputedStyle(element.closest('.solution-row')!, '::before').backgroundColor))
      .toBe('rgba(0, 0, 0, 0)')
    expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(false)
  })

  test('sets the h2, intro, names and tags type, and nothing above weight 500', async ({ page }) => {
    await openPage(page, 1440)
    const sizes = {
      section: await tokenPx(page, '--text-section'),
      bodyLg: await tokenPx(page, '--text-body-lg'),
      service: await tokenPx(page, '--text-service'),
      sm: await tokenPx(page, '--text-sm'),
    }
    const m = await solutionsRegion(page).evaluate((root) => {
      const pick = (selector: string) => {
        const s = getComputedStyle(root.querySelector(selector)!)
        return {
          size: parseFloat(s.fontSize),
          weight: s.fontWeight,
          lineHeight: parseFloat(s.lineHeight),
        }
      }
      return {
        h2: pick('h2'),
        intro: pick('.solutions__intro'),
        name: pick('.solution-row__name'),
        tags: pick('.solution-row__tags'),
        weights: [root, ...root.querySelectorAll('*')].map((element) =>
          Number(getComputedStyle(element).fontWeight),
        ),
      }
    })

    expect(m.h2.size).toBeCloseTo(sizes.section, 1)
    expect(m.h2.weight).toBe('300')
    expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
    expect(m.intro.size).toBeCloseTo(sizes.bodyLg, 1)
    expect(m.intro.weight).toBe('400')
    expect(m.name.size).toBeCloseTo(sizes.service, 1)
    expect(m.name.weight).toBe('300')
    expect(m.tags.size).toBeCloseTo(sizes.sm, 1)
    expect(m.tags.weight).toBe('400')
    expect(Math.max(...m.weights)).toBeLessThanOrEqual(500)
  })

  test('puts "Built for the sectors we know" on one line at 1440px', async ({ page }) => {
    await openPage(page, 1440)
    const lines = await solutionsRegion(page).locator('h2').evaluate((h2) => {
      const range = document.createRange()
      range.selectNodeContents(h2)
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
    })
    expect(lines).toBe(1)
  })

  test('keeps its hairlines and arrows drawn in forced-colours mode, and the underline on hover and focus only', async ({ page }) => {
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
          line(getComputedStyle(root.querySelector('.solutions__list')!), 'top'),
          ...[...root.querySelectorAll('.solution-row')].map((row) => line(getComputedStyle(row), 'bottom')),
        ],
        arrows: [...root.querySelectorAll('.solution-row__arrow')].map((arrow) => ({
          colour: getComputedStyle(arrow).color,
          text: arrow.textContent,
        })),
      }
    })

    expect(m.lines).toHaveLength(1 + 3)
    for (const line of m.lines) {
      expect(line.style).toBe('solid')
      expect(line.width).toBeGreaterThan(0)
      expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
      expect(line.colour).not.toBe(m.background)
    }
    for (const arrow of m.arrows) {
      expect(arrow.text).toBe('→')
      expect(arrow.colour).not.toBe(m.background)
    }

    const links = solutionsRegion(page).getByRole('link')
    const decoration = (index: number) =>
      links.nth(index).evaluate((element) => getComputedStyle(element).textDecorationLine)
    expect([await decoration(0), await decoration(1), await decoration(2)]).toEqual(['none', 'none', 'none'])
    const { x, y } = await centreOf(solutionsRegion(page).locator('.solution-row__tags').nth(0))
    await page.mouse.move(x, y)
    await expect.poll(() => decoration(0)).toBe('underline')
    await page.mouse.move(0, 0)
    await expect.poll(() => decoration(0)).toBe('none')
    await links.nth(0).focus()
    await page.keyboard.press('Tab')
    await expect(links.nth(1)).toBeFocused()
    await expect.poll(() => decoration(1)).toBe('underline')
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
  // and must not read as the Services lifecycle. The lifecycle rail left
  // with the open grid (#83), so there is no rail; the capabilities'
  // stages are now each cell's stage line. Both are saved at 1440px for
  // review; here the measurable differences are checked: a stage line is
  // --text-sm text with a teal number and no marker or description, the
  // timeline's names are --text-service with teal rings and a description
  // under each.
  test('does not look like the capability stage lines, and there is no lifecycle rail, at 1440px', async ({ page }, testInfo) => {
    await openPage(page, 1440)
    const region = page.getByRole('region', { name: servicesIntro.heading })
    await expect(region.locator('.lifecycle-rail, .lifecycle-rail-frame')).toHaveCount(0)
    const grid = region.getByRole('list').first()
    const timeline = processRegion(page).getByRole('list')

    const stageLook = await grid.evaluate((list) => {
      const line = list.querySelector('li > p')!
      return {
        label: parseFloat(getComputedStyle(line).fontSize),
        marker: getComputedStyle(line.querySelector('[aria-hidden="true"]')!).borderTopWidth,
        paragraphs: line.querySelectorAll('p').length,
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

    expect(timelineLook.name).toBeGreaterThan(stageLook.label * 1.5)
    // The stage number is plain text, with no ring or dot; the timeline's
    // node is a ring.
    expect(stageLook.marker).toBe('0px')
    expect(timelineLook.nodeBorder * 2).toBeLessThan(timelineLook.nodeWidth)
    expect(stageLook.paragraphs).toBe(0)
    // A description and an output (#63) per stage.
    expect(timelineLook.paragraphs).toBe(8)

    const dir = `${testInfo.project.outputDir}/screenshots`
    await grid.screenshot({ path: `${dir}/capability-grid-1440.png` })
    await processRegion(page).screenshot({ path: `${dir}/process-timeline-1440.png` })
  })
})
