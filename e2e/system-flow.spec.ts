import { expect } from '@playwright/test'
import { systemFlow } from '../src/data/systemFlow.ts'
import { openPage, test } from './fixtures.ts'
import { expectFlow, flowList, measureFlow } from './systemFlow.ts'

// The system and data-flow diagram (#57; the banded stack and return loop
// from #63) in conditions the width projects do not cover: its
// accessibility tree, its one SVG, forced colours and 32px browser text (the always-visible scrollbar is in rail-scrollbar.spec.ts). Runs in the chromium project; the
// layout at each width, in both engines, is in responsive.spec.ts.

test('reads as the heading, then a list of six layers, the last ending with the return label, with no arrow or separator text', async ({ page }) => {
  await openPage(page, 1440)
  const diagram = flowList(page).locator('..')

  const snapshot = await diagram.ariaSnapshot()
  expect(snapshot).toBe(
    [
      `- heading "${systemFlow.heading}" [level=3]`,
      `- list "${systemFlow.heading}":`,
      ...systemFlow.layers.flatMap((layer, index) => [
        '  - listitem:',
        ...(layer.label ? [`    - paragraph: ${layer.label}`] : []),
        `    - paragraph: ${layer.name}`,
        ...(layer.terms
          ? ['    - list:', ...layer.terms.map((term) => `      - listitem: ${term}`)]
          : []),
        ...(index === systemFlow.layers.length - 1
          ? [`    - paragraph: ${systemFlow.returnLabel}`]
          : []),
      ]),
    ].join('\n'),
  )
  expect(snapshot).not.toMatch(/[←-⇿·•]/)
})

test('adds no tab stop, link, button, title or scroll container, and no graphic but the loop', async ({ page }) => {
  await openPage(page, 1440)
  const m = await flowList(page)
    .locator('..')
    .evaluate((root) => ({
      focusable: root.querySelectorAll('a, button, input, [tabindex], [contenteditable]').length,
      titled: root.querySelectorAll('[title]').length,
      scrollers: [root, ...root.querySelectorAll('*')].filter((element) =>
        ['auto', 'scroll', 'hidden'].includes(getComputedStyle(element).overflowX),
      ).length,
      graphics: root.querySelectorAll('img, canvas, picture, video, object, iframe').length,
      // The one SVG the design system allows here (#63).
      svgs: [...root.querySelectorAll('svg')].map((svg) => `${svg.getAttribute('class')} ${svg.getAttribute('aria-hidden')}`),
    }))
  expect(m).toEqual({
    focusable: 0,
    titled: 0,
    scrollers: 0,
    graphics: 0,
    svgs: ['system-flow__loop true'],
  })
})

test('has no motion of its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openPage(page, 1440)
  const animated = await flowList(page)
    .locator('..')
    .evaluate((root) =>
      [root, ...root.querySelectorAll('*')].flatMap((element) =>
        [null, '::before', '::after']
          .map((pseudo) => getComputedStyle(element, pseudo))
          .filter((style) => style.animationName !== 'none' || parseFloat(style.transitionDuration) > 0)
          .map(() => element.className),
      ),
    )
  expect(animated).toEqual([])
})

// The loop (owner decision on #63) is stroked in currentColor, so forced
// colours paint it in the forced text colour; the chevrons and markers
// are borders, which forced colours keep.
test('keeps its loop, chevrons, markers and borders drawn in forced-colours mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await openPage(page, 1440)
  const m = await measureFlow(page)
  expectFlow(m, 'forced colours', { row: true })
  const forced = await flowList(page).evaluate((list) => {
    const probe = document.createElement('p')
    list.append(probe)
    const text = getComputedStyle(probe).color
    probe.remove()
    return { text, canvas: getComputedStyle(document.body).backgroundColor }
  })
  expect(m.loop.stroke).toBe(forced.text)
  expect(m.loop.stroke).not.toBe(forced.canvas)
  const colours = await flowList(page).evaluate((list) =>
    [...list.querySelectorAll('.system-flow__marker')].map(
      (marker) => `${getComputedStyle(marker).borderTopStyle} ${getComputedStyle(marker).borderTopWidth}`,
    ),
  )
  expect(colours).toHaveLength(7)
  for (const colour of colours) expect(colour).toBe('solid 6px')
  for (const layer of m.layers.slice(0, -1)) {
    expect(layer.chevron!.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(layer.chevron!.color).not.toBe(forced.canvas)
  }
})

test.describe('32px browser text', () => {
  // Set through CDP (Page.setFontSizes), Chromium only. 48em is 1536px
  // here, so the diagram is stacked below it.
  test.beforeEach(async ({ page }) => {
    const session = await page.context().newCDPSession(page)
    await session.send('Page.enable')
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
  })

  test('stacked and readable, with no overflow, at 1024 x 800', async ({ page }) => {
    await openPage(page, 1024)
    const m = await measureFlow(page)
    expectFlow(m, '1024px, 32px browser text', { row: false })
    // Still the 32px text size: the labels are 26px.
    const label = await flowList(page)
      .locator('.system-flow__label')
      .first()
      .evaluate((element) => getComputedStyle(element).fontSize)
    expect(label).toBe('26px')
  })

  for (const width of [768, 1440, 1535, 1536, 1600]) {
    test(`one shape for every layer at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      expectFlow(await measureFlow(page), `${width}px, 32px browser text`, width < 1536 ? { row: false } : {})
    })
  }
})
