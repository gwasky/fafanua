import { expect } from '@playwright/test'
import { openPage, pressTab, test } from './fixtures.ts'

// The overlay contract with a header that does not stick. Runs in the
// chromium and webkit projects.
test.describe('a header that does not stick stays above an overlay section', () => {
  // #55 marks the dark hero with data-header-overlay and gives it a
  // technical grid, which makes it positioned. The header is pulled under
  // it, so when the header does not stick (a short viewport, or the 25%
  // rule) it must still paint above it. Injected here in the browser only.
  const cases = [
    { name: 'short viewport, 640 x 400', width: 640, height: 400, text: '100%' },
    { name: '25% rule, 320 x 800 with 200% text', width: 320, height: 800, text: '200%' },
  ]

  for (const { name, width, height, text } of cases) {
    test(`logo, Menu and its focus ring are on top: ${name}`, async ({ page }) => {
      await openPage(page, width, height)
      if (text !== '100%') {
        await page.addStyleTag({ content: `html { font-size: ${text}; }` })
      }
      await expect
        .poll(() => page.getByRole('banner').evaluate((element) => getComputedStyle(element).position))
        .toBe('relative')
      await page.evaluate(() => {
        const section = document.createElement('section')
        section.setAttribute('data-header-overlay', '')
        section.className = 'surface-dark'
        section.innerHTML =
          '<div class="technical-grid" aria-hidden="true"></div><div class="container"><p>Overlay</p></div>'
        document.querySelector('main')!.prepend(section)
      })
      // Pulled up under the header: its top is the page's top.
      expect(
        await page.evaluate(
          () => document.querySelector('[data-header-overlay]')!.getBoundingClientRect().top,
        ),
      ).toBe(0)
      expect(
        await page.evaluate(
          () => getComputedStyle(document.querySelector('[data-header-overlay]')!).position,
        ),
      ).toBe('relative')

      // The topmost element at a point is inside the header.
      const onTop = (x: number, y: number) =>
        page.evaluate(
          ([px, py]) => {
            const hit = document.elementFromPoint(px, py)
            return hit !== null && document.querySelector('header')!.contains(hit)
          },
          [x, y],
        )
      const centre = async (name: string, role: 'link' | 'button') => {
        const box = await page.getByRole('banner').getByRole(role, { name }).boundingBox()
        if (!box) throw new Error(`${name} has no box`)
        return box
      }
      const logo = await centre('Fafanua Technologies', 'link')
      const menu = await centre('Menu', 'button')
      expect(await onTop(logo.x + logo.width / 2, logo.y + logo.height / 2), 'logo').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y + menu.height / 2), 'Menu').toBe(true)

      // The focus ring: 2px wide, 2px outside the toggle, so 3px outside
      // its edge is on the ring.
      await page.getByRole('link', { name: 'Fafanua Technologies' }).focus()
      await pressTab(page)
      const toggle = page.getByRole('button', { name: 'Menu' })
      await expect(toggle).toBeFocused()
      expect(await toggle.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      const ring = await toggle.evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineOffset}`
      })
      expect(ring).toBe('2px solid 2px')
      const midY = menu.y + menu.height / 2
      expect(await onTop(menu.x - 3, midY), 'ring, left').toBe(true)
      expect(await onTop(menu.x + menu.width + 3, midY), 'ring, right').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y - 3), 'ring, top').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y + menu.height + 3), 'ring, bottom').toBe(true)
    })
  }
})
