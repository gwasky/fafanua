import { expect, type Page } from '@playwright/test'
import { expectLanded, openPage, pressTab, test, waitForScrollSettle } from './fixtures.ts'

// The Menu toggle takes the shared secondary button look (#26): its size,
// its default and hover colours, and the breakpoint at which the inline
// navigation replaces it (1024px since #54). Also the open menu inside the
// sticky header: it drops over the page, scrolls within itself when it is
// taller than the viewport, and leaves the page where it was. Colours are read from the tokens in the page,
// so no value is repeated here.

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu' })

/** A colour token resolved to the computed rgb() form. */
function token(page: Page, name: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, name)
}

/** The toggle's border, fill and text colours. */
function colours(page: Page) {
  return menuButton(page).evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      border: [
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor,
      ],
      background: style.backgroundColor,
      text: style.color,
    }
  })
}

async function expected(page: Page, border: string, background: string) {
  const borderColour = await token(page, border)
  return {
    border: [borderColour, borderColour, borderColour, borderColour],
    background: background === 'transparent' ? 'rgba(0, 0, 0, 0)' : await token(page, background),
    text: await token(page, '--color-button-secondary-text'),
  }
}

for (const width of [360, 1023]) {
  test.describe(`at ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await openPage(page, width)
      // Keep the pointer off the toggle until a test hovers it.
      await page.mouse.move(0, page.viewportSize()!.height - 1)
      // The webkit project does not reduce motion, and WebKit can still be
      // running the toggle's colour transition from its first style when
      // the page has loaded (measured: a background of
      // rgba(192, 192, 192, 0.004)). Wait for every transition on it to end.
      await menuButton(page).evaluate((element) =>
        Promise.all(element.getAnimations().map((animation) => animation.finished)),
      )
    })

    test('is at least 44 x 44px', async ({ page }) => {
      await expect(menuButton(page)).toBeVisible()
      const box = await menuButton(page).boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    })

    test('has the secondary default colours', async ({ page }) => {
      const want = await expected(page, '--color-button-secondary-border', 'transparent')
      expect(await colours(page)).toEqual(want)
    })

    test('takes the secondary hover colours', async ({ page }) => {
      const want = await expected(
        page,
        '--color-button-secondary-border-hover',
        '--color-button-secondary-bg-hover',
      )
      await menuButton(page).hover()
      // Polled: the colours change over the .button transition.
      await expect.poll(() => colours(page)).toEqual(want)
    })

    test('keeps the focus ring and hover colours when focused and open', async ({ page }) => {
      const want = await expected(
        page,
        '--color-button-secondary-border-hover',
        '--color-button-secondary-bg-hover',
      )
      await page.getByRole('link', { name: 'Fafanua Technologies' }).focus()
      await pressTab(page)
      await page.keyboard.press('Enter')
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true')
      await menuButton(page).hover()

      await expect.poll(() => colours(page)).toEqual(want)
      const outline = await menuButton(page).evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor} ${style.outlineOffset}`
      })
      expect(outline).toBe(`2px solid ${await token(page, '--color-focus')} 2px`)
    })
  })
}

test('is hidden at 1024px, where the inline navigation shows', async ({ page }) => {
  await openPage(page, 1024)
  await expect(page.getByRole('button', { name: 'Menu', includeHidden: true })).toBeHidden()
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Services' }),
  ).toBeVisible()
})

test.describe('open menu in the sticky header at 360 x 640', () => {
  const WIDTH = 360
  const HEIGHT = 640

  /** The open list's box and scroll sizes, and the page's scroll position. */
  const listState = (page: Page) =>
    page.locator('#main-nav-list').evaluate((list) => {
      const { top, bottom } = list.getBoundingClientRect()
      return {
        top,
        bottom,
        scrollHeight: list.scrollHeight,
        clientHeight: list.clientHeight,
        overflowY: getComputedStyle(list).overflowY,
        headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
        pageY: window.scrollY,
      }
    })

  const NAMES = ['Services', 'Solutions', 'How We Work', 'About', 'Discuss a project']

  for (const text of ['100%', '200%']) {
    test(`every item can be reached, and Escape closes it, with ${text} text`, async ({ page }) => {
      await openPage(page, WIDTH, HEIGHT)
      if (text !== '100%') {
        await page.addStyleTag({ content: `html { font-size: ${text}; }` })
        await expect
          .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
          .toBe('32px')
      }
      // Part way down the page, so a jump of the page behind would show.
      await page.evaluate(() => document.getElementById('how-we-work')?.scrollIntoView())
      await waitForScrollSettle(page)
      const pageY = await page.evaluate(() => window.scrollY)
      expect(pageY).toBeGreaterThan(0)

      const toggle = menuButton(page)
      await toggle.focus()
      await page.keyboard.press('Enter')
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await waitForScrollSettle(page)

      const open = await listState(page)
      const detail = JSON.stringify(open)
      // Directly below the header, and never past the viewport's bottom.
      expect(Math.abs(open.top - open.headerBottom), detail).toBeLessThanOrEqual(1)
      expect(open.bottom, detail).toBeLessThanOrEqual(HEIGHT + 1)
      expect(open.overflowY, detail).toBe('auto')
      expect(open.pageY, detail).toBe(pageY)
      if (text === '200%') {
        // Taller than the viewport, so it scrolls inside itself.
        expect(open.scrollHeight, detail).toBeGreaterThan(open.clientHeight)
      }

      for (const name of NAMES) {
        await pressTab(page)
        const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true })
        await expect(link).toBeFocused()
        await waitForScrollSettle(page)
        await expect(link, `"${name}" wholly in view`).toBeInViewport({ ratio: 1 })
        expect(await page.evaluate(() => window.scrollY), `page behind, at "${name}"`).toBe(pageY)
      }

      await page.keyboard.press('Escape')
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(toggle).toBeFocused()
      expect(await page.evaluate(() => window.scrollY)).toBe(pageY)
    })
  }

  test('a tap on the last item, after scrolling the list, lands on #contact', async ({ page }) => {
    await openPage(page, WIDTH, HEIGHT)
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await menuButton(page).click()
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true')

    const list = page.locator('#main-nav-list')
    await list.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: 'instant' }))
    const cta = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Discuss a project' })
    await expect(cta).toBeInViewport({ ratio: 1 })
    await cta.click()

    await expect(page).toHaveURL(/#contact$/)
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false')
    await expectLanded(page, '#contact')
  })
})
