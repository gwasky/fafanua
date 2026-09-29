import { expect, type Page } from '@playwright/test'
import { openPage, pressTab, test } from './fixtures.ts'

// The Menu toggle takes the shared secondary button look (#26): its size,
// its default and hover colours, and the breakpoint at which the inline
// navigation replaces it. Colours are read from the tokens in the page,
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

for (const width of [360, 767]) {
  test.describe(`at ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await openPage(page, width)
      // Keep the pointer off the toggle until a test hovers it.
      await page.mouse.move(0, page.viewportSize()!.height - 1)
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

test('is hidden at 768px, where the inline navigation shows', async ({ page }) => {
  await openPage(page, 768)
  await expect(page.getByRole('button', { name: 'Menu', includeHidden: true })).toBeHidden()
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Services' }),
  ).toBeVisible()
})
