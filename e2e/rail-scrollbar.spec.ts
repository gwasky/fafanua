import { expect, type Page } from '@playwright/test'
import { openPage, test } from './fixtures.ts'
import { servicesIntro } from '../src/data/services.ts'
import { expectFlow, flowShapeAt, measureFlow } from './systemFlow.ts'

// The capability grid (#83; before it, the lifecycle rail, #56 QA) beside
// an always-visible scrollbar, as on Windows. Playwright's Chromium
// hides scrollbars by default, so this launches it without --hide-scrollbars and gives the page a 17px
// classic scrollbar, which takes 17px from the layout width. The grid
// must keep its two columns wherever the (min-width: 48em) layout
// applies, with nothing overflowing. The system diagram's layers (#57, #66)
// must likewise keep their 48em and 64em layouts, whose container
// queries have room beside the scrollbar. Runs in the chromium
// project only; WebKit has no equivalent switch.

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

// The lifecycle rail left with the open grid (#83): beside the scrollbar
// the capability grid keeps its two-column 48em layout with nothing
// overflowing, and there is no rail.
for (const width of [768, 785]) {
  test(`with a visible ${SCROLLBAR}px scrollbar the capability grid is two columns in the 48em layout, with no rail, at ${width}px`, async ({ page }) => {
    await openWithScrollbar(page, width)
    const section = page.getByRole('region', { name: servicesIntro.heading })

    const m = await section.evaluate((root) => {
      const grid = root.querySelector('ol')!
      const box = grid.getBoundingClientRect()
      return {
        scrollbar: window.innerWidth - document.documentElement.clientWidth,
        media48: matchMedia('(min-width: 48em)').matches,
        rail: root.querySelectorAll('.lifecycle-rail, .lifecycle-rail-frame').length,
        cells: grid.children.length,
        cellColumns: new Set(
          [...grid.children].map((item) => Math.round(item.getBoundingClientRect().left)),
        ).size,
        overflowing: [...grid.querySelectorAll('*')]
          .filter(
            (element) =>
              element.scrollWidth > element.clientWidth + 1 ||
              element.getBoundingClientRect().right > box.right + 1,
          )
          .map((element) => element.textContent?.slice(0, 30)),
        gridOverflow: grid.scrollWidth - grid.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    const detail = JSON.stringify(m)

    // The scrollbar is real and takes layout width.
    expect(m.scrollbar, detail).toBe(SCROLLBAR)
    // The 48em layout: the media query matches and the cells are in two
    // columns.
    expect(m.media48, detail).toBe(true)
    expect(m.rail, detail).toBe(0)
    expect(m.cells, detail).toBe(6)
    expect(m.cellColumns, detail).toBe(2)
    expect(m.overflowing, detail).toEqual([])
    expect(m.gridOverflow, detail).toBeLessThanOrEqual(0)
    expect(m.pageOverflow, detail).toBeLessThanOrEqual(0)
  })
}

for (const width of [768, 785, 1024]) {
  test(`with a visible ${SCROLLBAR}px scrollbar the system diagram keeps its ${flowShapeAt(width)}-column layout at ${width}px`, async ({ page }) => {
    await openWithScrollbar(page, width)
    expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBe(SCROLLBAR)
    const m = await measureFlow(page)
    // The page must fit beside the scrollbar.
    expectFlow({ ...m, innerWidth: m.innerWidth - SCROLLBAR }, `${width}px with a scrollbar`, { shape: flowShapeAt(width) })
  })
}
