import { expect, type Page } from '@playwright/test'
import { focusedName, focusStyle, openPage, pressTab, test, waitForFonts } from './fixtures.ts'
import { disclosures, nav, SEQUENCE as FOCUS_ORDER, tabTo, walkFocus } from './focus.ts'

// The automated part of the keyboard review: Tab order, focus rings,
// the skip link, focus after in-page links, the Menu toggle, the
// disclosures and focus from the mouse. Reduced motion keeps scrolling
// instant, so no test waits on an animation. Tab and Shift+Tab go
// through pressTab, which presses the key with Alt in WebKit, so the
// same stops are checked in both engines.
test.use({ reducedMotion: 'reduce' })

const SEQUENCE: Record<number, string[]> = {
  1440: FOCUS_ORDER.inline,
  360: FOCUS_ORDER.menu,
}

// Polled rather than read once: under reduced motion every property still
// has a 0.01ms transition, so the first frame after focus can report the
// initial outline (3px, no offset) before the ring settles.
async function expectRing(page: Page, name: string) {
  await expect
    .poll(() => focusStyle(page), { message: `focus ring on "${name}"` })
    .toEqual({ focusVisible: true, outline: '2px solid', offset: '2px' })
}

test.describe('Tab order', () => {
  test('1440 has 23 stops', () => {
    expect(SEQUENCE[1440]).toHaveLength(23)
  })

  test('360 with the menu closed has 19 stops', () => {
    expect(SEQUENCE[360]).toHaveLength(19)
  })

  for (const width of [1440, 360]) {
    test(`Tab walks every stop with a visible ring, then leaves the page, at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      for (const name of SEQUENCE[width]) {
        await tabTo(page, name)
        await expectRing(page, name)
      }

      await pressTab(page)
      expect(['body', 'Skip to content']).toContain(await focusedName(page))
    })

    test(`Shift+Tab walks the same stops in reverse at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      const sequence = SEQUENCE[width]
      for (const name of sequence) await tabTo(page, name)

      for (const name of [...sequence].reverse().slice(1)) {
        await tabTo(page, name, { shift: true })
        await expectRing(page, name)
      }
    })
  }

  test('every stop is at least partly in the viewport at 360px', async ({ page }) => {
    await openPage(page, 360)
    for (const name of SEQUENCE[360]) {
      await tabTo(page, name)
      await expect(page.locator(':focus')).toBeInViewport()
    }
  })
})

test.describe('skip link', () => {
  for (const width of [360, 1440]) {
    test(`Enter moves focus to main, then Tab to Discuss your data needs, at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      await tabTo(page, 'Skip to content')
      await page.keyboard.press('Enter')

      const main = await page.evaluate(() => {
        const element = document.activeElement
        return {
          id: element?.id,
          tag: element?.tagName,
          outline: element ? getComputedStyle(element).outlineStyle : '',
        }
      })
      expect(main).toEqual({ id: 'main', tag: 'MAIN', outline: 'none' })
      await tabTo(page, 'Discuss your data needs')
    })
  }
})

test.describe('focus after in-page links', () => {
  const firstDisclosure = disclosures[0]

  const cases = [
    { from: 'header', link: 'Services', hash: '#services', next: firstDisclosure },
    { from: 'header', link: 'Solutions', hash: '#solutions', next: 'Email us' },
    { from: 'header', link: 'How We Work', hash: '#how-we-work', next: 'Email us' },
    { from: 'header', link: 'About', hash: '#about', next: 'Email us' },
    { from: 'header', link: 'Discuss a project', hash: '#contact', next: 'Email us' },
    { from: 'main', link: 'Explore our capabilities', hash: '#services', next: firstDisclosure },
    { from: 'main', link: 'Discuss your data needs', hash: '#contact', next: 'Email us' },
    { from: 'footer', link: 'Services', hash: '#services', next: firstDisclosure },
    { from: 'footer', link: 'Solutions', hash: '#solutions', next: 'Email us' },
  ] as const

  for (const { from, link, hash, next } of cases) {
    test(`${from} "${link}" then Tab goes to "${next}" at 1440px`, async ({ page }) => {
      await openPage(page, 1440)
      const landmark = { header: 'banner', main: 'main', footer: 'contentinfo' } as const
      await page
        .getByRole(landmark[from])
        .getByRole('link', { name: link, exact: true })
        .focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`${hash}$`))

      await tabTo(page, next)
    })
  }

  test('menu "Services" closes the menu, then Tab goes to the first disclosure at 360px', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await tabTo(page, 'Services')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#services$/)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await tabTo(page, firstDisclosure)
  })

  test('menu "Solutions" closes the menu, then Tab goes to "Email us" at 360px', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await tabTo(page, 'Services')
    await tabTo(page, 'Solutions')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#solutions$/)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await tabTo(page, 'Email us')
  })
})

test.describe('Menu toggle at 360px', () => {
  test('Enter opens and Space closes it, with focus staying on Menu', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()

    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Space')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('Escape from a menu link closes it and returns focus to Menu', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await tabTo(page, 'Services')
    await tabTo(page, 'Solutions')

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('Tab goes through the four open menu links and the call to action to Discuss your data needs', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    for (const name of [...nav, 'Discuss your data needs']) {
      await tabTo(page, name)
      await expectRing(page, name)
    }
  })
})

test.describe('disclosures', () => {
  for (const width of [360, 1440]) {
    test(`Enter and Space toggle each of the six at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      for (const name of disclosures) {
        const button = page.getByRole('button', { name, exact: true })
        const panelId = await button.getAttribute('aria-controls')
        const panel = page.locator(`[id="${panelId}"]`)
        await button.focus()

        await page.keyboard.press('Enter')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        await expect(panel).not.toHaveAttribute('hidden')
        await expect(button).toBeFocused()

        await page.keyboard.press('Space')
        await expect(button).toHaveAttribute('aria-expanded', 'false')
        await expect(panel).toHaveAttribute('hidden')
        await expect(button).toBeFocused()
      }
    })
  }
})

test.describe('mouse focus', () => {
  test('a click on Discuss your data needs or a disclosure shows no focus ring', async ({ page, browserName }) => {
    await openPage(page, 1440)
    const cta = page.getByRole('link', { name: 'Discuss your data needs' })
    await cta.click()
    await expect(page).toHaveURL(/#contact$/)
    expect(await cta.evaluate((element) => element.matches(':focus-visible'))).toBe(false)

    const disclosure = page.getByRole('button', { name: disclosures[0] })
    await disclosure.click()
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true')

    // Measured for #46 at 1440: in Chromium the clicked disclosure takes
    // focus, without :focus-visible. In WebKit, as in Safari, a click does
    // not focus a button: focus goes to <main> (tabIndex -1), which does
    // not match :focus-visible and has outline-style none. A visitor sees
    // no difference, as no ring shows in either engine, and Option+Tab
    // straight after the click goes to the second card's "Typical
    // engagements" button, the same stop as Chromium's Tab, so the keyboard
    // continues from the clicked card.
    let focused = disclosure
    if (browserName === 'webkit') {
      focused = page.getByRole('main')
      await expect(disclosure).not.toBeFocused()
    }
    await expect(focused).toBeFocused()
    expect(await focused.evaluate((element) => element.matches(':focus-visible'))).toBe(false)
  })
})

// WCAG 2.4.11 Focus Not Obscured: the sticky header never covers the
// focused element. Each Tab or Shift+Tab may scroll the page; once it has
// settled, every focused element outside the header is wholly below the
// header and inside the viewport.
test.describe('focus is never under the sticky header', () => {
  const cases = [
    { width: 1440, text: '100%' },
    { width: 360, text: '100%' },
    { width: 320, text: '200%' },
  ] as const

  for (const { width, text } of cases) {
    test(`Tab and Shift+Tab through every stop at ${width}px with ${text} text`, async ({ page }) => {
      await openPage(page, width)
      if (text !== '100%') {
        await page.addStyleTag({ content: `html { font-size: ${text}; }` })
        await expect
          .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
          .toBe('32px')
        await waitForFonts(page)
      }
      // 320 shows the Menu toggle, as 360 does.
      const sequence = SEQUENCE[width === 1440 ? 1440 : 360]
      // With 200% text at 320px the header wraps to 257px, more than a
      // quarter of the 800px viewport, so it is static and scrolls away;
      // at the default size it sticks.
      // Polled: the header's ResizeObserver switches it once the larger
      // text has been laid out.
      await expect
        .poll(() => page.getByRole('banner').evaluate((element) => getComputedStyle(element).position))
        .toBe(text === '200%' ? 'relative' : 'sticky')

      await walkFocus(page, sequence)
    })
  }
})
