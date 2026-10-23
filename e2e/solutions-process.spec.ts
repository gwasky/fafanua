import { expect, type Page } from '@playwright/test'
import { processIntro, processStages } from '../src/data/process.ts'
import { managedServices, servicesIntro } from '../src/data/services.ts'
import { homepageSolutions, solutionsIntro } from '../src/data/solutions.ts'
import { solutionPath } from '../src/paths.ts'
import { centreOf, openPage, solutionH1, test } from './fixtures.ts'

// The Solutions rows (#59, links since #89) and How We Work (#59, laid
// out by section B of the homepage sections refinement plan in #90) in
// conditions the width projects do not cover: their accessibility trees,
// colours, type, hover, touch, motion, forced colours, and the timeline
// beside the Services lifecycle rail. Runs in the chromium project; the layout at each width,
// in both engines, is in responsive.spec.ts, and the keyboard in
// keyboard.spec.ts.

const solutionsRegion = (page: Page) => page.getByRole('region', { name: solutionsIntro.heading })
const processRegion = (page: Page) => page.getByRole('region', { name: processIntro.heading })

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
  test('reads as the eyebrow, the h2, the intro line and four rows, each a heading link and its tag line', async ({ page }) => {
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
    // W7 (#73) as section A amends it (#95): Health, Public Sector,
    // Financial Services and Education, in that order; the other two
    // sectors are linked from the footer, not listed here.
    expect([...snapshot.matchAll(/link "(.+)"/g)].map((match) => match[1])).toEqual([
      'Health',
      'Public Sector',
      'Financial Services',
      'Education',
    ])
    expect(snapshot).toContain('paragraph: Service turnaround · Revenue and budget · Statutory reporting')
    expect(snapshot).not.toMatch(/Retail|Development|Public Sector Data/)
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
    expect([m.h2, ...m.names]).toEqual(Array(5).fill(g900))
    expect([m.eyebrow, m.intro, ...m.tags, ...m.arrows]).toEqual(Array(10).fill(g600))
    expect([m.firstHairline, ...m.hairlines]).toEqual(Array(5).fill(g200))
    // Nothing inside the section has a fill, shadow or radius at rest.
    expect(m.tints).toEqual(Array(4).fill('rgba(0, 0, 0, 0)'))
    expect(m.backgrounds).toEqual([])
    for (const shadow of m.shadows) expect(shadow).toBe('none')
    expect(m.radii).toEqual(Array(4).fill('0px'))
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
      // The other rows stay at rest. Row 1 is Public Sector (#95).
      expect(homepageSolutions[1].id).toBe('public-sector')
      for (const index of [0, 2, 3]) {
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
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(solutionH1(homepageSolutions[0].id))
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
  test('reads as the eyebrow, the h2 and the four steps, with no numbers', async ({ page }) => {
    await openPage(page, 1440)
    const [assessment, implementation, managed] = managedServices.journey

    const snapshot = await processRegion(page).ariaSnapshot()
    // The stage labels, the tag and the output labels are shown in
    // capitals by CSS; the accessibility tree reports what it reports, and
    // the DOM keeps the stored case (below).
    const shown = await processRegion(page).evaluate((root) =>
      [...root.querySelectorAll('.process__phase, .process__tag, .process__output-label')].map(
        (element) => getComputedStyle(element).textTransform,
      ),
    )
    expect(new Set(shown)).toEqual(new Set(['uppercase']))
    const label = (text: string) =>
      snapshot.includes(`paragraph: ${text.toUpperCase()}`) ? text.toUpperCase() : text
    const labels = [label(assessment), label(implementation), null, label(managed)]
    // The snapshot quotes a string that holds ": ", as YAML does.
    const yamlText = (text: string) => (text.includes(': ') ? JSON.stringify(text) : text)
    expect(snapshot).toBe(
      [
        `- region "${processIntro.heading}":`,
        '  - paragraph: 04 — How We Work',
        `  - heading "${processIntro.heading}" [level=2]`,
        '  - list:',
        ...processStages.flatMap((stage, index) => [
          '    - listitem:',
          ...(labels[index] ? [`      - paragraph: ${labels[index]}`] : []),
          ...(index === 0 ? [`      - paragraph: ${label(processIntro.startTag)}`] : []),
          `      - heading "${stage.name}" [level=3]`,
          `      - paragraph: ${yamlText(stage.description)}`,
          `      - paragraph: ${label(processIntro.outputLabel)}`,
          `      - paragraph: ${stage.output}`,
        ]),
      ].join('\n'),
    )
    // The DOM text is in the stored case.
    const stored = await processRegion(page).evaluate((root) =>
      [...root.querySelectorAll('.process__phase, .process__tag, .process__output-label')].map(
        (element) => element.textContent,
      ),
    )
    expect(stored).toEqual([
      assessment,
      'Start here',
      'You get',
      implementation,
      'You get',
      'You get',
      managed,
      'You get',
    ])
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

  test('paints only verified pairings at rest: step 01 a graphite 900 card, the band, the dots and the three segments', async ({ page }) => {
    await openPage(page, 1440)
    const names = [
      '--graphite-100', '--graphite-900', '--graphite-700', '--graphite-600', '--graphite-500',
      '--graphite-400', '--graphite-200', '--teal-100', '--teal-400', '--teal-600', '--teal-800', '--paper',
    ]
    const [g100, g900, g700, g600, g500, g400, g200, teal100, teal400, teal600, teal800, paper] = await Promise.all(
      names.map((token) => tokenColour(page, token)),
    )
    const transparent = 'rgba(0, 0, 0, 0)'
    const services = await Promise.all(
      ['--service-build', '--service-govern', '--service-trust', '--service-insights', '--service-intelligence'].map(
        (token) => tokenColour(page, token),
      ),
    )
    const m = await processRegion(page).evaluate((root) => {
      const texts = [...root.querySelectorAll('p, h2, h3, span:not(.process__track)')].map(
        (element) => getComputedStyle(element).color,
      )
      const painted = [root, ...root.querySelectorAll('*')].flatMap((element) =>
        [null, '::before', '::after'].flatMap((pseudo) => {
          const s = getComputedStyle(element, pseudo)
          if (pseudo && s.content === 'none') return []
          return [s.color, s.backgroundColor, s.borderTopColor, s.borderLeftColor]
        }),
      )
      const steps = [...root.querySelectorAll('.process__stage')].map((item) => {
        const style = (selector: string) => getComputedStyle(item.querySelector(selector)!)
        const track = style('.process__track')
        const segment = getComputedStyle(item.querySelector('.process__track')!, '::after')
        return {
          card: style('.process__card').backgroundColor,
          number: style('.process__number').color,
          name: style('.process__name').color,
          description: style('.process__description').color,
          label: style('.process__output-label').color,
          output: style('.process__output-text').color,
          hairline: style('.process__output').borderTopColor,
          dot: { colour: track.borderTopColor, width: parseFloat(track.borderTopWidth), fill: track.backgroundColor, size: parseFloat(track.width) },
          segment: { colour: segment.borderTopColor, width: parseFloat(segment.borderTopWidth), style: segment.borderTopStyle },
        }
      })
      const tag = getComputedStyle(root.querySelector('.process__tag')!)
      return {
        section: getComputedStyle(root).backgroundColor,
        eyebrow: getComputedStyle(root.querySelector('.section-eyebrow')!).color,
        heading: getComputedStyle(root.querySelector('h2')!).color,
        phases: [...root.querySelectorAll('.process__phase')].map((p) => getComputedStyle(p).color),
        tag: { color: tag.color, background: tag.backgroundColor },
        steps,
        texts: [...new Set(texts)],
        painted: [...new Set(painted)],
      }
    })

    expect(m.section).toBe(g100)
    expect(m.eyebrow).toBe(g600)
    expect(m.heading).toBe(g900)
    // ASSESSMENT teal 800 (6.9:1), the others graphite 600 (5.7:1).
    expect(m.phases).toEqual([teal800, g600, g600])
    // Teal 800 on teal 100 (6.9:1), the rating chip's.
    expect(m.tag).toEqual({ color: teal800, background: teal100 })
    // Step 01, the highlighted card: teal 400 numeral (7.5:1), paper name
    // and output (14.9:1), graphite 400 description and label (6.0:1) on
    // graphite 900, with a graphite 700 hairline.
    expect(m.steps[0]).toMatchObject({
      card: g900, number: teal400, name: paper, description: g400, label: g400, output: paper, hairline: g700,
    })
    // Steps 02 to 04 on graphite 100: graphite 600 numerals, descriptions
    // and labels (5.7:1), graphite 900 names and outputs (14.1:1), graphite
    // 200 hairlines.
    for (const step of m.steps.slice(1)) {
      expect(step).toMatchObject({
        card: transparent, number: g600, name: g900, description: g600, label: g600, output: g900, hairline: g200,
      })
    }
    // Dot 01 filled teal 600 (by its border), 02 and 03 graphite 600
    // rings, 04 a graphite 500 ring, the hollow ones filled graphite 100.
    expect(m.steps[0].dot.colour).toBe(teal600)
    expect(m.steps[0].dot.width * 2).toBeCloseTo(m.steps[0].dot.size, 1)
    expect(m.steps.map((step) => step.dot.colour)).toEqual([teal600, g600, g600, g500])
    for (const step of m.steps.slice(1)) {
      expect(step.dot.width * 2).toBeLessThan(step.dot.size)
      expect(step.dot.fill).toBe(g100)
    }
    // The segments: teal 600 3px solid, graphite 600 2px solid (twice),
    // graphite 500 2px dashed.
    expect(m.steps.map((step) => step.segment)).toEqual([
      { colour: teal600, width: 3, style: 'solid' },
      { colour: g600, width: 2, style: 'solid' },
      { colour: g600, width: 2, style: 'solid' },
      { colour: g500, width: 2, style: 'dashed' },
    ])
    expect(m.texts.sort()).toEqual([g900, g600, teal800, paper, g400, teal400].sort())
    for (const colour of services) expect(m.painted).not.toContain(colour)
  })

  test('sets the h2, names, numerals, descriptions, outputs and labels type, and nothing above weight 500', async ({ page }) => {
    await openPage(page, 1440)
    const sizes = {
      section: await tokenPx(page, '--text-section'),
      service: await tokenPx(page, '--text-service'),
      fourXl: await tokenPx(page, '--text-4xl'),
      base: await tokenPx(page, '--text-base'),
      sm: await tokenPx(page, '--text-sm'),
    }
    const m = await processRegion(page).evaluate((root) => {
      const pick = (element: Element) => {
        const s = getComputedStyle(element)
        return { size: parseFloat(s.fontSize), weight: s.fontWeight, lineHeight: parseFloat(s.lineHeight), transform: s.textTransform }
      }
      const h2 = root.querySelector('h2')!
      return {
        h2: pick(h2),
        h2Lines: Math.round(h2.getBoundingClientRect().height / parseFloat(getComputedStyle(h2).lineHeight)),
        names: [...root.querySelectorAll('h3')].map(pick),
        numbers: [...root.querySelectorAll('.process__number')].map(pick),
        descriptions: [...root.querySelectorAll('.process__description')].map(pick),
        outputs: [...root.querySelectorAll('.process__output-text')].map(pick),
        labels: [...root.querySelectorAll('.process__phase, .process__output-label, .process__tag')].map(pick),
        weights: [root, ...root.querySelectorAll('*')].map((element) =>
          Number(getComputedStyle(element).fontWeight),
        ),
      }
    })

    expect(m.h2.size).toBeCloseTo(sizes.section, 1)
    expect(m.h2.weight).toBe('300')
    expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
    expect(m.h2Lines, 'the h2 on one line').toBe(1)
    for (const name of m.names) expect(name).toMatchObject({ weight: '300' })
    for (const name of m.names) expect(name.size).toBeCloseTo(sizes.service, 1)
    for (const number of m.numbers) {
      expect(number.size).toBeCloseTo(sizes.fourXl, 1)
      expect(number.weight).toBe('300')
    }
    for (const description of m.descriptions) {
      expect(description.size).toBeCloseTo(sizes.base, 1)
      expect(description.weight).toBe('400')
    }
    // The output is --text-sm at weight 400, smaller than the description.
    for (const output of m.outputs) {
      expect(output.size).toBeCloseTo(sizes.sm, 1)
      expect(output.weight).toBe('400')
      expect(output.size).toBeLessThan(sizes.base)
    }
    expect(m.labels).toHaveLength(8)
    for (const label of m.labels) expect(label).toMatchObject({ weight: '500', transform: 'uppercase' })
    expect(Math.max(...m.weights)).toBeLessThanOrEqual(500)
  })

  // The only motion is the highlight's colour change (#90): no animation,
  // and under no-preference each part eases its colours over
  // --duration-card-hover with --ease-standard. Under reduce, none.
  for (const motion of ['no-preference', 'reduce'] as const) {
    test(`its only motion is the highlight's colour change, with ${motion} motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion })
      await openPage(page, 1440)
      const duration = await page.evaluate(() => {
        const probe = document.createElement('div')
        probe.style.transitionDuration = 'var(--duration-card-hover)'
        probe.style.transitionTimingFunction = 'var(--ease-standard)'
        document.body.append(probe)
        const s = getComputedStyle(probe)
        const value = { duration: s.transitionDuration, easing: s.transitionTimingFunction }
        probe.remove()
        return value
      })
      const m = await processRegion(page).evaluate((root) => {
        const listed = '.process__card, .process__number, .process__name, .process__description, .process__output, .process__output-label, .process__output-text, .process__track'
        const all = [root, ...root.querySelectorAll('*')]
        return {
          animated: all.flatMap((element) =>
            [null, '::before', '::after']
              .map((pseudo) => getComputedStyle(element, pseudo))
              .filter((style) => style.animationName !== 'none')
              .map(() => element.className),
          ),
          others: all
            .filter((element) => !element.matches(listed))
            .flatMap((element) =>
              [null, '::before', '::after']
                .map((pseudo) => getComputedStyle(element, pseudo))
                // Under reduce, the global override's 0.01ms applies to
                // everything; anything longer is a transition of its own.
                .filter((style) => parseFloat(style.transitionDuration) > 0.001 && style.transitionProperty !== 'none')
                .map(() => element.className),
            ),
          listed: [...root.querySelectorAll(listed)].map((element) => {
            const s = getComputedStyle(element)
            return { property: s.transitionProperty, duration: s.transitionDuration, easing: s.transitionTimingFunction }
          }),
        }
      })
      expect(m.animated).toEqual([])
      expect(m.others).toEqual([])
      expect(m.listed.length).toBeGreaterThan(20)
      for (const item of m.listed) {
        if (motion === 'no-preference') {
          expect(item).toEqual({ property: 'background-color, color, border-color', duration: duration.duration, easing: duration.easing })
        } else {
          expect(item.property).toBe('none')
        }
      }

      // The highlight still moves.
      const steps = processRegion(page).getByRole('listitem')
      await steps.nth(2).getByRole('heading').hover()
      await expect(steps.nth(2)).toHaveAttribute('data-highlighted', '')
      await expect(steps.nth(0)).not.toHaveAttribute('data-highlighted')
    })
  }

  // Hover-only states are checked with a mouse here and in both engines in
  // responsive.spec.ts; under touch emulation the resting state stays (#90).
  for (const isMobile of [false, true]) {
    test.describe(`with touch${isMobile ? ' on a mobile device' : ' on a hover-capable screen'}`, () => {
      test.use({ hasTouch: true, isMobile })

      test('a tap on any step leaves step 01 highlighted at 1440px', async ({ page }) => {
        await openPage(page, 1440)
        const steps = processRegion(page).getByRole('listitem')
        for (const index of [2, 1, 3, 0]) {
          await steps.nth(index).getByRole('heading').tap()
          await expect(processRegion(page).locator('[data-highlighted]')).toHaveCount(1)
          await expect(steps.nth(0)).toHaveAttribute('data-highlighted', '')
          await expect(steps.nth(0).locator('.process__card')).toHaveClass(/surface-dark/)
        }
      })
    })
  }

  test('the resting state stays when the keyboard tabs past the section', async ({ page }) => {
    await openPage(page, 1440)
    // The list, not the section, whose reveal (#61) may run on the way.
    const list = processRegion(page).getByRole('list')
    const before = await list.evaluate((root) => root.outerHTML)
    for (let i = 0; i < 40; i++) await page.keyboard.press('Tab')
    expect(await list.evaluate((root) => root.outerHTML)).toBe(before)
    await expect(processRegion(page).getByRole('listitem').nth(0)).toHaveAttribute('data-highlighted', '')
  })

  for (const width of [360, 1440]) {
    test(`keeps its dots, segments and the highlighted card drawn in forced-colours mode at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      const m = await processRegion(page).evaluate((root, horizontal) => {
        const side = horizontal ? 'top' : 'left'
        const drawn = (style: CSSStyleDeclaration, edge: string) => ({
          style: style.getPropertyValue(`border-${edge}-style`),
          width: parseFloat(style.getPropertyValue(`border-${edge}-width`)),
          colour: style.getPropertyValue(`border-${edge}-color`),
        })
        const tracks = [...root.querySelectorAll('.process__track')]
        const card = getComputedStyle(root.querySelector('.process__card.surface-dark')!)
        return {
          background: getComputedStyle(root).backgroundColor,
          dots: tracks.map((track) => drawn(getComputedStyle(track), 'top')),
          filled: tracks.map((track) => {
            const s = getComputedStyle(track)
            return parseFloat(s.borderTopWidth) * 2 >= parseFloat(s.width) - 0.5
          }),
          segments: tracks.map((track) => drawn(getComputedStyle(track, '::after'), side)),
          card: { outline: card.outlineStyle, width: parseFloat(card.outlineWidth), colour: card.outlineColor, background: card.backgroundColor },
        }
      }, width >= 1024)

      expect(m.dots).toHaveLength(4)
      expect(m.segments).toHaveLength(4)
      for (const line of [...m.dots, ...m.segments]) {
        expect(line.width).toBeGreaterThan(0)
        expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
        expect(line.colour).not.toBe(m.background)
      }
      for (const dot of m.dots) expect(dot.style).toBe('solid')
      expect(m.segments.map((segment) => segment.style)).toEqual(['solid', 'solid', 'solid', 'dashed'])
      // Dot 01, highlighted, is filled by its border.
      expect(m.filled).toEqual([true, false, false, false])
      expect(m.card.outline).not.toBe('none')
      expect(m.card.width).toBeGreaterThan(0)
      expect(m.card.colour).not.toBe(m.card.background)
    })
  }

  // Plan V2 §13: the timeline answers how Fafanua delivers an engagement
  // and must not read as the Services lifecycle. The lifecycle rail left
  // with the open grid (#83), so there is no rail; the capabilities'
  // stages are now each cell's stage line. Both are saved at 1440px for
  // review; here the measurable differences are checked: a stage line is
  // --text-sm text with a teal number and no marker or description; the
  // timeline's names are --text-service with dots on a track and a stage
  // band (#90), and a description under each, still with no service-line
  // colours.
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
      const dots = [...list.querySelectorAll('.process__track')].map((track) => {
        const s = getComputedStyle(track)
        return { border: parseFloat(s.borderTopWidth), width: parseFloat(s.width), radius: s.borderTopLeftRadius }
      })
      return {
        name: parseFloat(getComputedStyle(list.querySelector('h3')!).fontSize),
        dots,
        paragraphs: list.querySelectorAll('p').length,
      }
    })

    expect(timelineLook.name).toBeGreaterThan(stageLook.label * 1.5)
    // The stage number is plain text, with no ring or dot; the timeline's
    // nodes are dots (filled) or rings.
    expect(stageLook.marker).toBe('0px')
    expect(timelineLook.dots).toHaveLength(4)
    for (const dot of timelineLook.dots) {
      expect(dot.border).toBeGreaterThan(0)
      expect(parseFloat(dot.radius)).toBeGreaterThanOrEqual(dot.width / 2)
    }
    expect(stageLook.paragraphs).toBe(0)
    // Three stage labels, the tag, and a description, label and output
    // per step (#63, #90).
    expect(timelineLook.paragraphs).toBe(16)

    const dir = `${testInfo.project.outputDir}/screenshots`
    await grid.screenshot({ path: `${dir}/capability-grid-1440.png` })
    await processRegion(page).screenshot({ path: `${dir}/process-timeline-1440.png` })
    const steps = processRegion(page).getByRole('listitem')
    await steps.nth(2).getByRole('heading').hover()
    await expect(steps.nth(2)).toHaveAttribute('data-highlighted', '')
    await processRegion(page).screenshot({ path: `${dir}/process-hover-build-1440.png` })
  })
})
