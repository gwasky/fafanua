import AxeBuilder from '@axe-core/playwright'
import { expect } from '@playwright/test'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'
import { openPath, test } from './fixtures.ts'

// The Financial Services landing page (#98) with forced colours emulated,
// in Chromium only (Playwright emulates forced colours only there): axe
// passes, and every marker, connector, tick circle, badge and promise
// step circle is still drawn, by its border, and the reconciliation
// icons by their strokes, as health-forced.spec.ts checks Health. As in a11y.spec.ts's forced-colours runs
// (owner decision on #58), axe runs every rule but color-contrast:
// Chromium's emulation leaves the authored -webkit-text-fill-color, which
// axe pairs with the forced background, so the painted text colours are
// checked directly instead.

for (const width of [1440, 390]) {
  test(`forced colours: axe passes and the markers and connectors stay drawn at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
    await openPath(page, '/solutions/financial-services', width)
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
            visible: s.display !== 'none',
          }
        })
      const before = (selector: string) =>
        [...document.querySelectorAll(selector)].map((element) => {
          const s = getComputedStyle(element, '::before')
          return { width: parseFloat(s.borderLeftWidth), style: s.borderLeftStyle, display: s.display }
        })
      return {
        markers: drawn('.rating-marker'),
        connectors: drawn('.trace__connector').filter((line) => line.visible),
        down: before('.trace__middle, .trace__figures').filter((line) => line.display !== 'none'),
        ticks: drawn('.checklist__tick'),
        badges: drawn('.icon-badge'),
        boxes: drawn('.audience-card, .trace__middle, .badge-card, .deliverable, .promise, .reconciliation__card'),
        circles: drawn('.promise__number'),
        icons: [...document.querySelectorAll('.reconciliation svg')].map((svg) => {
          const s = getComputedStyle(svg)
          const box = svg.getBoundingClientRect()
          return { stroke: s.stroke, width: box.width, background: getComputedStyle(svg.closest('.reconciliation__card')!).backgroundColor }
        }),
        stages: document.querySelectorAll('.stage').length,
        forced: matchMedia('(forced-colors: active)').matches,
      }
    })
    expect(m.forced).toBe(true)
    // No stages on Financial Services, so no stage rules to draw.
    expect(m.stages).toBe(0)
    expect(m.circles).toHaveLength(4)
    // Six reconciliation icons, each stroked in a colour of its own, not
    // the card's.
    expect(m.icons).toHaveLength(6)
    for (const icon of m.icons) {
      expect(icon.width).toBeGreaterThan(0)
      expect(icon.stroke, JSON.stringify(icon)).not.toBe('none')
      expect(icon.stroke, JSON.stringify(icon)).not.toBe(icon.background)
    }
    for (const group of ['markers', 'ticks', 'badges', 'boxes', 'circles'] as const) {
      expect(m[group].length, group).toBeGreaterThan(0)
      for (const item of m[group]) {
        expect(item.width, group).toBeGreaterThan(0)
        expect(item.style, group).not.toBe('none')
      }
    }
    // Wide: the horizontal connectors; narrow: the downward lines.
    const lines = width === 1440 ? m.connectors : m.down
    expect(lines.length).toBe(width === 1440 ? 8 : 2)
    for (const line of lines) {
      expect(line.width).toBeGreaterThan(0)
      expect(line.style).not.toBe('none')
    }
  })
}
