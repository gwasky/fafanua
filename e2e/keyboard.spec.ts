import { expect, type Page } from '@playwright/test'
import { assessmentHeading } from '../src/data/assessment.ts'
import { futureReadyLinkText } from '../src/data/futureReady.ts'
import { managedServices, services, servicesIntro } from '../src/data/services.ts'
import { homepageSolutions } from '../src/data/solutions.ts'
import { solutionPath } from '../src/paths.ts'
import { focusedName, focusStyle, openPage, pressTab, test, waitForFonts } from './fixtures.ts'
import { cards, expectUnobscured, moreSectors, nav, sectors, SEQUENCE as FOCUS_ORDER, tabTo, walkFocus } from './focus.ts'

// The automated part of the keyboard review: Tab order, focus rings,
// the skip link, focus after in-page links, the Menu toggle, the
// capability titles, the Solutions rows and focus from the mouse. Reduced motion keeps scrolling
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
  // 28 and 24 after #59; the two phone links (owner decision on #60) add
  // one stop each; #67 adds the six card title links, the Managed
  // Services heading link and the Health row; #68 removes the hero's
  // secondary button, so the hero has one stop; #71 adds the Data Trust
  // Assessment's button after it; #73 leaves three Solutions rows and
  // adds the footer's three "More sectors" links, so the count holds;
  // #83 removes the six disclosures and restores the hero's text link;
  // #88 adds the Managed Services journey's two links; #89 makes the three
  // Solutions row buttons links, and the open panels' links, stops only
  // while open, are gone, so the count holds; #91 adds the future-ready
  // section's link.
  test('1440 has 36 stops', () => {
    expect(SEQUENCE[1440]).toHaveLength(36)
  })

  test('360 with the menu closed has 32 stops', () => {
    expect(SEQUENCE[360]).toHaveLength(32)
  })

  // #83: hero button, the hero link, the assessment's button, then the six
  // capability titles in lifecycle order.
  test('goes hero button, hero link, assessment button, then the six titles', () => {
    for (const width of [1440, 360]) {
      const at = SEQUENCE[width].indexOf('Explore our capabilities')
      expect(SEQUENCE[width].slice(at - 1, at + 8)).toEqual([
        'Book a data trust assessment',
        'Explore our capabilities',
        'Book a data trust assessment',
        ...services.map((service) => service.name),
      ])
      expect(SEQUENCE[width].filter((name) => name === 'Explore our capabilities')).toHaveLength(1)
      expect(SEQUENCE[width].join('\n')).not.toContain('Typical engagements')
    }
  })

  // #73: three Solutions rows, in W7's order, and the page ends with the
  // footer's "More sectors" links.
  test('has the three homepage sectors and ends with the footer\'s "More sectors" links', () => {
    expect(sectors).toEqual(['Health', 'Financial Services', 'Education'])
    expect(moreSectors).toEqual([
      'Retail & Distribution Analytics',
      'Development & Impact Data Systems',
      'Public Sector Data & Analytics',
    ])
    for (const width of [1440, 360]) {
      expect(SEQUENCE[width].slice(-3)).toEqual(moreSectors)
    }
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
    test(`Enter moves focus to main, then Tab to Book a data trust assessment, at ${width}px`, async ({ page }) => {
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
      await tabTo(page, 'Book a data trust assessment')
    })
  }
})

test.describe('focus after in-page links', () => {
  // The first capability title link (#67), the first stop in the
  // capabilities section since the open grid (#83).
  const firstTitle = services[0].name
  // The first Solutions row's link (#59, a link since #89).
  const firstSector = sectors[0]

  const cases = [
    { from: 'header', link: 'Services', hash: '#capabilities', next: firstTitle },
    { from: 'header', link: 'Solutions', hash: '#solutions', next: firstSector },
    // How We Work has no stop, so next is the future-ready link (#91).
    { from: 'header', link: 'How We Work', hash: '#how-we-work', next: futureReadyLinkText },
    { from: 'header', link: 'About', hash: '#about', next: 'Book a data trust assessment' },
    { from: 'header', link: 'Book a data trust assessment', hash: '#contact', next: 'Book a data trust assessment' },
    { from: 'hero', link: 'Book a data trust assessment', hash: '#contact', next: 'Book a data trust assessment' },
    { from: 'hero', link: 'Explore our capabilities', hash: '#capabilities', next: firstTitle },
    { from: 'assessment', link: 'Book a data trust assessment', hash: '#contact', next: 'Book a data trust assessment' },
    { from: 'footer', link: 'Services', hash: '#capabilities', next: firstTitle },
    { from: 'footer', link: 'Solutions', hash: '#solutions', next: firstSector },
  ] as const

  for (const { from, link, hash, next } of cases) {
    test(`${from} "${link}" then Tab goes to "${next}" at 1440px`, async ({ page }) => {
      await openPage(page, 1440)
      // The hero's and the Data Trust Assessment's calls to action are
      // found inside their sections, as the header's and the closing call
      // to action share their name (#60, #68, #71).
      const scope =
        from === 'header'
          ? page.getByRole('banner')
          : from === 'footer'
            ? page.getByRole('contentinfo')
            : from === 'assessment'
              ? page.getByRole('region', { name: assessmentHeading })
              : page.getByRole('region', { name: 'Trusted Data. Better Decisions.' })
      await scope.getByRole('link', { name: link, exact: true }).focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`${hash}$`))

      await tabTo(page, next)
    })
  }

  // The Managed Services journey's first two steps (#88) also move focus
  // to the target section's h2, so the next Tab goes to that section's
  // first stop.
  const journeyCases = [
    { link: managedServices.journey[0], hash: '#data-trust-assessment', heading: assessmentHeading, next: 'Book a data trust assessment' },
    { link: managedServices.journey[1], hash: '#capabilities', heading: servicesIntro.heading, next: firstTitle },
  ] as const

  for (const { link, hash, heading, next } of journeyCases) {
    test(`managed services "${link}" focuses the section's h2, then Tab goes to "${next}" at 1440px`, async ({ page }) => {
      await openPage(page, 1440)
      const journey = page.getByRole('navigation', { name: managedServices.journeyLabel })
      await journey.getByRole('link', { name: link, exact: true }).focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(new RegExp(`${hash}$`))

      const target = page.locator(hash).getByRole('heading', { level: 2, name: heading, exact: true })
      await expect(target).toBeFocused()
      await expect(target).toHaveAttribute('tabindex', '-1')
      await expectUnobscured(page, heading)

      await tabTo(page, next)
      // Once the heading has lost focus, it keeps no tabindex.
      await expect(target).not.toHaveAttribute('tabindex')
    })
  }

  test('menu "Services" closes the menu, then Tab goes to the first capability title at 360px', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await tabTo(page, 'Services')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#capabilities$/)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await tabTo(page, firstTitle)
  })

  test('menu "Solutions" closes the menu, then Tab goes to the first Solutions row at 360px', async ({ page }) => {
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

    await tabTo(page, firstSector)
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

  test('Tab goes through the four open menu links and the call to action to Book a data trust assessment', async ({ page }) => {
    await openPage(page, 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    for (const name of [...nav, 'Book a data trust assessment']) {
      await tabTo(page, name)
      await expectRing(page, name)
    }
  })
})

// The capability titles (#83): each cell's one stop, the title link,
// with a ring; the section has no disclosures to toggle.
test.describe('capability titles', () => {
  for (const width of [360, 1440]) {
    test(`Tab reaches each of the six titles in order with a ring at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      const section = page.locator('#capabilities')
      await expect(section.getByRole('button')).toHaveCount(0)
      await expect(section.locator('[aria-expanded]')).toHaveCount(0)
      await page
        .getByRole('region', { name: assessmentHeading })
        .getByRole('link', { name: 'Book a data trust assessment' })
        .focus()
      for (const name of cards) {
        await tabTo(page, name)
        await expectRing(page, name)
        await expectUnobscured(page, name)
      }
      // Then the Managed Services journey's two links (#88) and its
      // service link.
      await tabTo(page, managedServices.journey[0])
      await tabTo(page, managedServices.journey[1])
      await tabTo(page, managedServices.heading)
    })
  }
})

// The Solutions rows (#59; links since #89): one link each, in an h3,
// named by the sector. Tab reaches the three in order, each with the ring
// clear of the header, Shift+Tab goes back up through them, and Enter on
// a focused row opens its page.
test.describe('Solutions rows', () => {
  for (const width of [360, 1440]) {
    test(`Tab reaches the three row links in order with a ring, and Shift+Tab goes back, at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      const section = page.locator('#solutions')
      await expect(section.getByRole('button')).toHaveCount(0)
      await expect(section.locator('[aria-expanded]')).toHaveCount(0)
      await expect(section.getByRole('link')).toHaveCount(3)
      // The Managed Services service link (#67, out of its heading since
      // #88), the stop before the rows.
      await page.getByRole('link', { name: managedServices.heading, exact: true }).focus()

      for (const name of sectors) {
        await tabTo(page, name)
        await expectRing(page, name)
        await expectUnobscured(page, name)
      }
      // The rows add no other stop: next is the future-ready link (#91).
      await tabTo(page, futureReadyLinkText)
      for (const name of [...sectors].reverse()) {
        await tabTo(page, name, { shift: true })
        await expectRing(page, name)
        await expectUnobscured(page, name)
      }
      await tabTo(page, managedServices.heading, { shift: true })
    })
  }

  test('Enter on a focused row opens its page at 1440px', async ({ page }) => {
    await openPage(page, 1440)
    await page.getByRole('link', { name: managedServices.heading, exact: true }).focus()
    await tabTo(page, sectors[0])
    await tabTo(page, sectors[1])
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(new RegExp(`${solutionPath(homepageSolutions[1].id)}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(homepageSolutions[1].heading)
  })
})

test.describe('mouse focus', () => {
  // The disclosure this clicked left with the open grid (#83), and the
  // Solutions rows' with #89: a click on a row now opens its page.
  test('a click on Book a data trust assessment shows no focus ring, and a click on a Solutions row opens its page', async ({ page }) => {
    await openPage(page, 1440)
    const cta = page
      .getByRole('region', { name: 'Trusted Data. Better Decisions.' })
      .getByRole('link', { name: 'Book a data trust assessment' })
    await cta.click()
    await expect(page).toHaveURL(/#contact$/)
    expect(await cta.evaluate((element) => element.matches(':focus-visible'))).toBe(false)

    await page.locator('#solutions').getByRole('link', { name: sectors[0], exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${solutionPath(homepageSolutions[0].id)}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(homepageSolutions[0].heading)
  })
})

// WCAG 2.4.11 Focus Not Obscured: the sticky header never covers the
// focused element. Each Tab or Shift+Tab may scroll the page; once it has
// settled, every focused element outside the header is wholly below the
// header and inside the viewport.
//
// With motion allowed (#61), sections below the first screen start
// hidden, and focus entering one shows it at once, so the walk also
// checks that no stop is scrolled to where a reveal then moves it.
test.describe('focus is never under the sticky header', () => {
  const cases = [
    { width: 1440, text: '100%', motion: 'reduce' },
    { width: 360, text: '100%', motion: 'reduce' },
    { width: 320, text: '200%', motion: 'reduce' },
    { width: 1440, text: '100%', motion: 'no-preference' },
    { width: 360, text: '100%', motion: 'no-preference' },
  ] as const

  for (const { width, text, motion } of cases) {
    const title = `Tab and Shift+Tab through every stop at ${width}px with ${text} text`
    test(motion === 'reduce' ? title : `${title}, ${motion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion })
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
