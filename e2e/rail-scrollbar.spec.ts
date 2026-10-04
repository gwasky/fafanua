import { expect, type Page } from '@playwright/test'
import { openPage, test } from './fixtures.ts'
import { servicesIntro } from '../src/data/services.ts'

// The lifecycle rail beside an always-visible scrollbar, as on Windows
// (#56 QA). Playwright's Chromium hides scrollbars by default, so this
// launches it without --hide-scrollbars and gives the page a 17px
// classic scrollbar, which takes 17px from the layout width. The rail's
// container query must still let it be one joined row wherever the
// (min-width: 48em) layout applies: with a 44rem threshold its 687px box
// was vertical from 768 to 784px. Runs in the chromium project only;
// WebKit has no equivalent switch.

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

const SCROLLBAR = 17

async function openWithScrollbar(page: Page, width: number) {
  await openPage(page, width)
  await page.addStyleTag({
    content: `::-webkit-scrollbar { width: ${SCROLLBAR}px; } ::-webkit-scrollbar-thumb { background: gray; }`,
  })
  // Two frames, so the scrollbar and any container-query restyle have
  // taken effect before measuring.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )
}

for (const width of [768, 785]) {
  test(`with a visible ${SCROLLBAR}px scrollbar the rail is one joined row in the 48em layout at ${width}px`, async ({ page }) => {
    await openWithScrollbar(page, width)
    const section = page.getByRole('region', { name: servicesIntro.heading })

    const m = await section.evaluate((root) => {
      const [rail, grid] = [...root.querySelectorAll('ol, ul')]
      const probe = document.createElement('div')
      probe.style.borderTop = 'var(--border-width) solid var(--color-border)'
      probe.style.width = 'var(--space-2)'
      document.body.append(probe)
      const want = {
        border: `${getComputedStyle(probe).borderTopWidth} solid ${getComputedStyle(probe).borderTopColor}`,
        min: parseFloat(getComputedStyle(probe).width),
      }
      probe.remove()
      const items = [...rail.children]
      const markers = items.map((item) => item.firstElementChild!.getBoundingClientRect())
      const segments = items.slice(0, -1).map((item, i) => {
        const after = getComputedStyle(item, '::after')
        const label = item.lastElementChild!.getBoundingClientRect()
        const start =
          label.right + parseFloat(getComputedStyle(item).columnGap) + parseFloat(after.marginLeft)
        return {
          border: `${after.borderTopWidth} ${after.borderTopStyle} ${after.borderTopColor}`,
          length: parseFloat(after.width),
          endGap: markers[i + 1].left - (start + parseFloat(after.width)),
        }
      })
      const box = rail.getBoundingClientRect()
      return {
        want,
        scrollbar: window.innerWidth - document.documentElement.clientWidth,
        media48: matchMedia('(min-width: 48em)').matches,
        railBox: rail.parentElement!.getBoundingClientRect().width,
        cardColumns: new Set(
          [...grid.children].map((item) => Math.round(item.getBoundingClientRect().left)),
        ).size,
        rows: new Set(markers.map((marker) => Math.round(marker.top))).size,
        columns: new Set(markers.map((marker) => Math.round(marker.left))).size,
        segments,
        lastRight: items.at(-1)!.getBoundingClientRect().right,
        right: box.right,
        overflow: rail.scrollWidth - rail.clientWidth,
      }
    })
    const detail = JSON.stringify(m)

    // The scrollbar is real and takes layout width.
    expect(m.scrollbar, detail).toBe(SCROLLBAR)
    // The 48em layout: the media query matches and the cards are in two
    // columns.
    expect(m.media48, detail).toBe(true)
    expect(m.cardColumns, detail).toBe(2)
    // One row of six, ending at Decide at the rail's right edge.
    expect(m.rows, detail).toBe(1)
    expect(m.columns, detail).toBe(6)
    expect(Math.abs(m.lastRight - m.right), detail).toBeLessThanOrEqual(1)
    expect(m.overflow, detail).toBeLessThanOrEqual(0)
    // Every pair joined by a graphite 200 rule at least 8px long that runs
    // to within 8px of the next marker.
    for (const [i, segment] of m.segments.entries()) {
      const context = `stage ${i + 1} to ${i + 2}: ${JSON.stringify(segment)}`
      expect.soft(segment.border, context).toBe(m.want.border)
      expect.soft(segment.length, context).toBeGreaterThanOrEqual(m.want.min - 0.5)
      expect.soft(segment.endGap, context).toBeGreaterThanOrEqual(-1)
      expect.soft(segment.endGap, context).toBeLessThanOrEqual(m.want.min + 1)
    }
  })
}
