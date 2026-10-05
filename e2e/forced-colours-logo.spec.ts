import { expect, type Locator, type Page } from '@playwright/test'
import { openPage, test } from './fixtures.ts'

// The reversed logo under forced colours (#60). A light forced theme paints
// the footer and the hero behind the transparent header white, where the
// reversed logo's paper wordmark would vanish, so both take the positive
// logo there through a <picture> source. A dark forced theme and the normal
// colours keep the reversed logo. Each case is checked as painted: the
// logo's screenshot is decoded and the wordmark, right of the F symbol, has
// to stand out from the background the surface paints. Runs in the
// chromium project only, as Playwright emulates forced colours only there.

const POSITIVE = '/fafanua-logo.svg'
const REVERSED = '/fafanua-logo-reversed.svg'

// The F symbol takes the left of the 5046-unit-wide logo; the wordmark
// starts after it. Sampling from a quarter of the way in skips the symbol.
const WORDMARK_START = 0.25

type Theme = 'light' | 'dark'
type Target = 'header' | 'footer'

/** The logo and the element whose background is painted behind it. */
async function show(page: Page, target: Target) {
  if (target === 'header') {
    // At the top the header is transparent over the hero.
    await expect(page.getByRole('banner')).toHaveClass(/\bon-dark\b/)
    return {
      logo: page.getByRole('banner').getByRole('img', { name: 'Fafanua Technologies' }),
      surface: page.locator('[data-header-overlay]'),
    }
  }
  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer).toBeInViewport()
  return { logo: footer.getByRole('img', { name: 'Fafanua Technologies' }), surface: footer }
}

/**
 * The share of the wordmark region's pixels, as painted, with at least
 * 3:1 contrast against the surface's background, and the best contrast
 * found there.
 */
async function wordmarkContrast(page: Page, logo: Locator, surface: Locator) {
  const background = await surface.evaluate((element) => getComputedStyle(element).backgroundColor)
  const png = (await logo.screenshot()).toString('base64')
  return page.evaluate(
    async ({ png, background, start }) => {
      const channels = (colour: string) => colour.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number)
      const luminance = ([r, g, b]: number[]) => {
        const linear = (c: number) => {
          const s = c / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
      }
      const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

      const image = new Image()
      image.src = `data:image/png;base64,${png}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const x0 = Math.floor(canvas.width * start)
      const { data } = context.getImageData(x0, 0, canvas.width - x0, canvas.height)

      const surface = luminance(channels(background))
      let strong = 0
      let best = 1
      for (let i = 0; i < data.length; i += 4) {
        const ratio = contrast(luminance([data[i], data[i + 1], data[i + 2]]), surface)
        if (ratio >= 3) strong += 1
        best = Math.max(best, ratio)
      }
      return { background, share: strong / (data.length / 4), best }
    },
    { png, background, start: WORDMARK_START },
  )
}

/** The logo's chosen file and its box. */
function logoState(logo: Locator) {
  return logo.evaluate((img: HTMLImageElement) => {
    const box = img.getBoundingClientRect()
    return { file: new URL(img.currentSrc).pathname, width: box.width, height: box.height }
  })
}

for (const width of [360, 1440]) {
  for (const target of ['header', 'footer'] as const) {
    // The box with normal colours, which forced colours must not change.
    const normalBox = async (page: Page) => {
      await openPage(page, width)
      const { logo } = await show(page, target)
      await expect(logo).toBeVisible()
      const { width: w, height: h, file } = await logoState(logo)
      expect(file).toBe(REVERSED)
      return { width: w, height: h }
    }

    for (const theme of ['light', 'dark'] as const satisfies readonly Theme[]) {
      test(`${target} logo wordmark visible, forced colours, ${theme} theme, at ${width}px`, async ({
        page,
      }, testInfo) => {
        const box = await normalBox(page)

        await page.emulateMedia({ forcedColors: 'active', colorScheme: theme })
        await openPage(page, width)
        const { logo, surface } = await show(page, target)
        await expect(logo).toBeVisible()

        // Light: the positive logo, graphite on the forced white. Dark: the
        // reversed one, paper on the forced black, as before.
        await expect
          .poll(async () => (await logoState(logo)).file)
          .toBe(theme === 'light' ? POSITIVE : REVERSED)
        const state = await logoState(logo)
        // Same alt and same box, so swapping the file shifts nothing.
        await expect(logo).toHaveAttribute('alt', 'Fafanua Technologies')
        expect({ width: state.width, height: state.height }).toEqual(box)

        const painted = await wordmarkContrast(page, logo, surface)
        expect(painted.background).toBe(theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)')
        // The letters, not just the anti-aliased edges, stand out: well
        // above 3:1, over a real share of the region.
        expect(painted.best).toBeGreaterThanOrEqual(4.5)
        expect(painted.share).toBeGreaterThan(0.1)

        await logo.screenshot({
          path: `${testInfo.project.outputDir}/screenshots/${target}-logo-forced-${theme}-${width}.png`,
        })
      })
    }

    test(`${target} logo unchanged with normal colours at ${width}px`, async ({ page }) => {
      await normalBox(page)
      const { logo, surface } = await show(page, target)
      const painted = await wordmarkContrast(page, logo, surface)
      expect(painted.best).toBeGreaterThanOrEqual(4.5)
      expect(painted.share).toBeGreaterThan(0.1)
    })
  }
}
