import { expect, type Page } from '@playwright/test'
import { services } from '../src/data/services.ts'
import { focusedName, focusStyle, openPage, pressTab, test } from './fixtures.ts'

// The automated part of the keyboard review: Tab order, focus rings,
// the skip link, focus after in-page links, the Menu toggle, the
// disclosures and focus from the mouse. Reduced motion keeps scrolling
// instant, so no test waits on an animation. Tab and Shift+Tab go
// through pressTab, which presses the key with Alt in WebKit, so the
// same stops are checked in both engines.
test.use({ reducedMotion: 'reduce' })

const disclosures = services.map((service) => `Typical work for ${service.title}`)
const nav = ['Services', 'How We Work', 'About', 'Contact']
const fromHero = [
  'Contact our team',
  'See our services',
  ...disclosures,
  'Email us',
  'info@fafanua.tech',
  ...nav,
  'info@fafanua.tech',
]

const SEQUENCE: Record<number, string[]> = {
  1440: ['Skip to content', 'Fafanua Technologies', ...nav, ...fromHero],
  360: ['Skip to content', 'Fafanua Technologies', 'Menu', ...fromHero],
}

// Polled rather than read once: under reduced motion every property still
// has a 0.01ms transition, so the first frame after focus can report the
// initial outline (3px, no offset) before the ring settles.
async function expectRing(page: Page, name: string) {
  await expect
    .poll(() => focusStyle(page), { message: `focus ring on "${name}"` })
    .toEqual({ focusVisible: true, outline: '2px solid', offset: '2px' })
}

/**
 * Presses Tab, or Shift+Tab when `shift` is set, and expects the named
 * element to take focus.
 */
async function tabTo(page: Page, name: string, { shift = false } = {}) {
  await pressTab(page, { shift })
  expect(await focusedName(page)).toBe(name)
}

test.describe('Tab order', () => {
  test('1440 has 21 stops', () => {
    expect(SEQUENCE[1440]).toHaveLength(21)
  })

  test('360 with the menu closed has 18 stops', () => {
    expect(SEQUENCE[360]).toHaveLength(18)
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
    test(`Enter moves focus to main, then Tab to Contact our team, at ${width}px`, async ({ page }) => {
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
      await tabTo(page, 'Contact our team')
    })
  }
})

test.describe('focus after in-page links', () => {
  const firstDisclosure = disclosures[0]

  const cases = [
    { from: 'header', link: 'Services', hash: '#services', next: firstDisclosure },
    { from: 'header', link: 'How We Work', hash: '#how-we-work', next: 'Email us' },
    { from: 'header', link: 'About', hash: '#about', next: 'Email us' },
    { from: 'header', link: 'Contact', hash: '#contact', next: 'Email us' },
    { from: 'main', link: 'See our services', hash: '#services', next: firstDisclosure },
    { from: 'main', link: 'Contact our team', hash: '#contact', next: 'Email us' },
    { from: 'footer', link: 'Services', hash: '#services', next: firstDisclosure },
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
    await tabTo(page, 'How We Work')

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('Tab goes through the four open menu links to Contact our team', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    for (const name of [...nav, 'Contact our team']) {
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
  test('a click on Contact our team or a disclosure shows no focus ring', async ({ page, browserName }) => {
    await openPage(page, 1440)
    const cta = page.getByRole('link', { name: 'Contact our team' })
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
    // straight after the click goes to "Typical work for Data Integration
    // and Engineering", the same stop as Chromium's Tab, so the keyboard
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
