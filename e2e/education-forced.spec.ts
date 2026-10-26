import AxeBuilder from '@axe-core/playwright'
import { expect } from '@playwright/test'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'
import { openPath, test } from './fixtures.ts'

// The Education landing page (#100) with forced colours emulated, in
// Chromium only (Playwright emulates forced colours only there): axe
// passes, and every marker, connector, tick circle and badge is still
// drawn, by its border, and so are the learner journey's dots (Learn's
// still filled, the others hollow), its hairlines and the callout's
// border and rule, as financial-services-forced.spec.ts checks Financial
// Services. As in a11y.spec.ts's forced-colours runs (owner decision on
// #58), axe runs every rule but color-contrast: Chromium's emulation
// leaves the authored -webkit-text-fill-color, which axe pairs with the
// forced background, so the painted text colours are checked directly
// instead.

for (const width of [1440, 390]) {
  test(`forced colours: axe passes and the markers, connectors and journey stay drawn at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
    await openPath(page, '/solutions/education', width)
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).disableRules(['color-contrast']).analyze()
    expect(results.violations, `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`).toEqual([])
    const painted = await page.evaluate(() =>
      [...document.querySelectorAll('main p, main h1, main h2, main h3, main li, main a')].map((element) => {
        let node: Element | null = element
        let background = 'rgba(0, 0, 0, 0)'
        while (node && background === 'rgba(0, 0, 0, 0)') {
          background = getComputedStyle(node).backgroundColor
          node = node.parentElement
        }
        return { text: element.textContent?.slice(0, 30), colour: getComputedStyle(element).color, background }
      }),
    )
    expect(painted.length).toBeGreaterThan(50)
    for (const item of painted) expect(item.colour, JSON.stringify(item)).not.toBe(item.background)

    const m = await page.evaluate(() => {
      const drawn = (selector: string, side = 'Top') =>
        [...document.querySelectorAll(selector)].map((element) => {
          const s = getComputedStyle(element) as unknown as Record<string, string>
          return {
            width: parseFloat(s[`border${side}Width`]),
            style: s[`border${side}Style`],
            colour: s[`border${side}Color`],
            visible: s.display !== 'none',
          }
        })
      const before = (selector: string) =>
        [...document.querySelectorAll(selector)].map((element) => {
          const s = getComputedStyle(element, '::before')
          return { width: parseFloat(s.borderLeftWidth), style: s.borderLeftStyle, display: s.display }
        })
      const pseudo = (element: Element, which: '::before' | '::after', side: 'Top' | 'Left') => {
        const s = getComputedStyle(element, which) as unknown as Record<string, string>
        return { width: parseFloat(s[`border${side}Width`]), style: s[`border${side}Style`], display: s.display, content: s.content }
      }
      const ol = document.querySelector('ol.journey')!
      const dots = [...document.querySelectorAll('.journey__dot')].map((dot) => {
        const s = getComputedStyle(dot)
        return { border: parseFloat(s.borderTopWidth), style: s.borderTopStyle, colour: s.borderTopColor, fill: s.backgroundColor, size: dot.getBoundingClientRect().width }
      })
      return {
        markers: drawn('.rating-marker'),
        connectors: drawn('.trace__connector').filter((line) => line.visible),
        down: before('.trace__middle, .trace__figures').filter((line) => line.display !== 'none'),
        ticks: drawn('.checklist__tick'),
        badges: drawn('.icon-badge'),
        boxes: drawn('.audience-card, .trace__middle, .badge-card, .deliverable, .definition-callout'),
        rule: drawn('.definition-callout', 'Left'),
        dots,
        wideLine: pseudo(ol, '::before', 'Top'),
        narrowLines: [...ol.children].slice(0, 4).map((item) => pseudo(item, '::before', 'Left')),
        icons: [...document.querySelectorAll('main svg')].map((svg) => getComputedStyle(svg).stroke),
        canvas: getComputedStyle(document.body).backgroundColor,
        stages: document.querySelectorAll('.stage').length,
        forced: matchMedia('(forced-colors: active)').matches,
      }
    })
    expect(m.forced).toBe(true)
    expect(m.stages).toBe(0)
    for (const group of ['markers', 'ticks', 'badges', 'boxes'] as const) {
      expect(m[group].length, group).toBeGreaterThan(0)
      for (const item of m[group]) {
        expect(item.width, group).toBeGreaterThan(0)
        expect(item.style, group).not.toBe('none')
      }
    }
    // The callout's 3px rule on the start side.
    expect(m.rule).toHaveLength(1)
    expect(m.rule[0].width).toBe(3)
    // The dots: Learn's filled by its border, the others rings on the
    // canvas, each border in a colour other than the canvas.
    expect(m.dots.map((dot) => dot.border * 2 >= dot.size - 0.5)).toEqual([false, false, true, false, false])
    for (const dot of m.dots) {
      expect(dot.style).toBe('solid')
      expect(dot.colour).not.toBe(m.canvas)
    }
    for (const dot of [m.dots[0], m.dots[1], m.dots[3], m.dots[4]]) expect(dot.fill).not.toBe(dot.colour)
    // The hairline: horizontal on wide screens, from dot to dot below 48em.
    if (width === 1440) {
      expect(m.wideLine).toMatchObject({ width: 1, style: 'solid', display: 'block' })
    } else {
      for (const line of m.narrowLines) expect(line).toMatchObject({ width: 1, style: 'solid', display: 'block' })
    }
    // Every icon still stroked.
    for (const stroke of m.icons) expect(stroke).not.toBe('none')
    // Wide: the horizontal connectors; narrow: the downward lines.
    const lines = width === 1440 ? m.connectors : m.down
    expect(lines.length).toBe(width === 1440 ? 8 : 2)
    for (const line of lines) {
      expect(line.width).toBeGreaterThan(0)
      expect(line.style).not.toBe('none')
    }
  })
}
