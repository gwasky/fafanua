import { expect, type Browser, type Page } from '@playwright/test'
import {
  expectLanded,
  focusedName,
  openPage,
  pressTab,
  scrollThrough,
  test,
  waitForLanding,
  waitForMotion,
} from './fixtures.ts'
import { disclosures, expectUnobscured, sectors } from './focus.ts'

// The motion layer (#61): the hero reveal, the hero grid's fade-in, the
// lifecycle rail's line and the one-time section reveals (useReveal.ts),
// and their safety rules. Runs in the chromium and webkit projects. Each
// test sets its own motion setting.

// Every main section after the positioning block, in page order.
const SECTIONS = [
  'services',
  'managed-services',
  'solutions',
  'how-we-work',
  'future-ready',
  'about',
  'contact',
] as const

type Change = { id: string; state: string | null }

/**
 * Records every change to an element's reveal state from the first
 * script on, and every CSS animation that starts and every opacity or
 * transform transition that runs, on window.__motion.
 */
async function recordMotion(page: Page) {
  await page.addInitScript(() => {
    const log = {
      changes: [] as { id: string; state: string | null }[],
      animations: [] as string[],
      transitions: [] as string[],
    }
    ;(window as unknown as { __motion: typeof log }).__motion = log
    const name = (target: EventTarget | null) =>
      target instanceof Element
        ? target.id || target.closest('[id]')?.id || target.className.toString()
        : ''
    new MutationObserver((records) => {
      for (const record of records) {
        const element = record.target as Element
        log.changes.push({
          id: element.id || element.className.toString(),
          state: element.getAttribute('data-reveal-state'),
        })
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-reveal-state'] })
    document.addEventListener(
      'animationstart',
      (event) => log.animations.push(`${name(event.target)} ${event.animationName}`),
      true,
    )
    document.addEventListener(
      'transitionrun',
      (event) => {
        if (['opacity', 'transform'].includes(event.propertyName)) {
          log.transitions.push(`${name(event.target)}${event.pseudoElement} ${event.propertyName}`)
        }
      },
      true,
    )
  })
}

const motionLog = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __motion: { changes: Change[]; animations: string[]; transitions: string[] }
        }
      ).__motion,
  )

/**
 * Each section's reveal state, whether it intersects the viewport, and
 * the opacity and transform of each of its children.
 */
const sectionStates = (page: Page) =>
  page.evaluate((ids) => {
    return ids.map((id) => {
      const section = document.getElementById(id)!
      const box = section.getBoundingClientRect()
      // Visible: below the header, which may have scrolled away, and above
      // the viewport's bottom edge.
      const header = Math.max(0, document.querySelector('header')!.getBoundingClientRect().bottom)
      return {
        id,
        state: section.getAttribute('data-reveal-state'),
        inView: box.bottom > header && box.top < window.innerHeight,
        children: [...section.children].map((child) => {
          const style = getComputedStyle(child)
          return { opacity: style.opacity, transform: style.transform }
        }),
      }
    })
  }, SECTIONS)

/** Expects a section's children at full opacity with no transform. */
function expectShown(section: Awaited<ReturnType<typeof sectionStates>>[number], when: string) {
  for (const child of section.children) {
    expect(child, `${section.id} ${when}`).toEqual({ opacity: '1', transform: 'none' })
  }
}

/** The lifecycle rail's state and its connectors' transforms. */
const rail = (page: Page) =>
  page.evaluate(() => {
    const frame = document.querySelector('.lifecycle-rail-frame')!
    const stages = [...frame.querySelectorAll('.lifecycle-rail__stage')]
    return {
      state: frame.getAttribute('data-reveal-state'),
      lines: stages.slice(0, -1).map((stage) => getComputedStyle(stage, '::after').transform),
      lineDurations: stages
        .slice(0, -1)
        .map((stage) => {
          const style = getComputedStyle(stage, '::after')
          return [style.transitionDuration, style.transitionDelay]
        }),
      labels: stages.map((stage) => {
        const label = stage.querySelector('.lifecycle-rail__label')!
        const marker = stage.querySelector('.lifecycle-rail__marker')!
        return [getComputedStyle(label).opacity, getComputedStyle(marker).opacity]
      }),
    }
  })

/** A token resolved to its computed time, as a transition-duration. */
const tokenTime = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.transitionDuration = `var(${name})`
    document.body.append(probe)
    const value = getComputedStyle(probe).transitionDuration
    probe.remove()
    return parseFloat(value)
  }, token)

test.describe('hero reveal and grid fade, no-preference', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })

  test('the copy and CTA row rise, the h1 never fades, and the grid fades in', async ({ page }) => {
    await page.goto('/')
    // The h1 is painted at full opacity from the first frame.
    const first = await page.evaluate(() => {
      const style = (selector: string) => {
        const s = getComputedStyle(document.querySelector(selector)!)
        return {
          name: s.animationName,
          duration: parseFloat(s.animationDuration),
          delay: parseFloat(s.animationDelay),
          opacity: s.opacity,
        }
      }
      return {
        h1: style('.hero__heading'),
        lead: style('.hero__lead'),
        actions: style('.hero__actions'),
        grid: style('.hero > .technical-grid'),
        futureGrid: style('.future-ready > .technical-grid'),
      }
    })
    expect(first.h1).toEqual({ name: 'none', duration: 0, delay: 0, opacity: '1' })
    expect(first.lead.name).toBe('hero-reveal')
    expect(first.actions.name).toBe('hero-reveal')
    expect(first.grid.name).toBe('hero-grid-fade')
    expect(first.futureGrid.name).toBe('none')
    const slow = await tokenTime(page, '--duration-slow')
    const fast = await tokenTime(page, '--duration-fast')
    expect(first.lead.duration).toBeLessThanOrEqual(slow)
    expect(first.actions.duration).toBeLessThanOrEqual(slow)
    expect(first.grid.duration).toBe(slow)
    expect(first.lead.delay).toBe(0)
    expect(first.actions.delay).toBeLessThanOrEqual(fast)

    // The start of each reveal: opacity 0 and at most --space-4 (16px)
    // lower; the grid starts at opacity 0.
    const start = await page.evaluate(() =>
      ['.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
        const element = document.querySelector(selector)!
        const [animation] = element.getAnimations()
        animation.pause()
        animation.currentTime = 0
        const style = getComputedStyle(element)
        const result = { opacity: style.opacity, transform: style.transform }
        animation.finish()
        return result
      }),
    )
    expect(start).toEqual([
      { opacity: '0', transform: 'matrix(1, 0, 0, 1, 0, 16)' },
      { opacity: '0', transform: 'matrix(1, 0, 0, 1, 0, 16)' },
      { opacity: '0', transform: 'none' },
    ])

    await waitForMotion(page)
    const end = await page.evaluate(() =>
      ['.hero__heading', '.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
        const style = getComputedStyle(document.querySelector(selector)!)
        return { opacity: style.opacity, transform: style.transform }
      }),
    )
    for (const style of end) expect(style).toEqual({ opacity: '1', transform: 'none' })
  })

  test('runs once: not again on scrolling or on hash navigation', async ({ page }) => {
    await recordMotion(page)
    await page.goto('/')
    await waitForMotion(page)
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About', exact: true }).click()
    await expectLanded(page, '#about')
    await page.getByRole('link', { name: 'Fafanua Technologies' }).first().click()
    await expectLanded(page, '#top')
    await scrollThrough(page)
    const log = await motionLog(page)
    expect(log.animations.map((entry) => entry.split(' ').at(-1)).sort()).toEqual([
      'hero-grid-fade',
      'hero-reveal',
      'hero-reveal',
    ])
  })
})

test.describe('reduced motion: everything in its final state from the first paint', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [360, 1440]) {
    test(`no reveal, fade, line draw, card or arrow movement at ${width}px`, async ({ page }) => {
      await recordMotion(page)
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      const hero = await page.evaluate(() =>
        ['.hero__heading', '.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
          const style = getComputedStyle(document.querySelector(selector)!)
          return { name: style.animationName, opacity: style.opacity, transform: style.transform }
        }),
      )
      for (const style of hero) expect(style).toEqual({ name: 'none', opacity: '1', transform: 'none' })
      for (const section of await sectionStates(page)) {
        expect(section.state).toBeNull()
        expectShown(section, 'on load')
      }
      const line = await rail(page)
      expect(line.state).toBeNull()
      for (const transform of line.lines) expect(transform).toBe('none')

      await scrollThrough(page)
      // A card under the pointer does not move (hover only on a pointer
      // that can hover; this one can).
      const card = page.locator('.services__list > li').nth(1)
      await card.hover()
      expect(await card.locator('.service-card').evaluate((element) => getComputedStyle(element).transform)).toBe(
        'none',
      )
      // Nor does the header's call-to-action arrow, where it shows.
      if (width >= 1024) {
        await page.getByRole('banner').getByRole('link', { name: 'Discuss a project' }).hover()
        expect(
          await page.locator('header .button__arrow').evaluate((element) => getComputedStyle(element).translate),
        ).toBe('none')
      }

      const log = await motionLog(page)
      expect(log.changes, 'reveal states set').toEqual([])
      expect(log.animations, 'animations started').toEqual([])
      expect(log.transitions, 'opacity or transform transitions').toEqual([])
    })
  }
})

test.describe('in view on load: final state, no animation (no-preference)', () => {
  /** Opens a path in a new 1440 x 900 context with the recorder. */
  async function coldLoad(browser: Browser, baseURL: string | undefined, path: string) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'no-preference',
    })
    const page = await context.newPage()
    await recordMotion(page)
    await page.goto(path)
    return { context, page }
  }

  for (const id of SECTIONS) {
    test(`/#${id}: the target and everything in view never hide or animate`, async ({ browser, baseURL }) => {
      const { context, page } = await coldLoad(browser, baseURL, `/#${id}`)
      await waitForLanding(page, `#${id}`)
      await expectLanded(page, `#${id}`)
      const states = await sectionStates(page)
      const log = await motionLog(page)
      for (const section of states.filter((state) => state.inView)) {
        expect(section.state, section.id).toBeNull()
        expectShown(section, 'after landing')
        expect(
          log.changes.filter((change) => change.id === section.id),
          `${section.id} state changes`,
        ).toEqual([])
      }
      expect(states.find((state) => state.id === id)?.inView).toBe(true)
      for (const section of states.filter((state) => state.inView)) {
        expect(
          log.transitions.filter((entry) => entry.startsWith(`${section.id} `)),
          `${section.id} transitions`,
        ).toEqual([])
      }
      await context.close()
    })
  }

  // The browser restores the scroll position after the observer first
  // reports, so a reload or a history traversal hides nothing at all.
  test('a reload scrolled to the middle of the page shows everything as it is', async ({
    browser,
    baseURL,
    browserName,
  }) => {
    const { context, page } = await coldLoad(browser, baseURL, '/')
    await waitForMotion(page)
    await page.evaluate(() =>
      window.scrollTo({
        top: (document.documentElement.scrollHeight - window.innerHeight) / 2,
        behavior: 'instant',
      }),
    )
    await page.reload()
    // Playwright's WebKit restores no scroll position on a reload (it
    // stayed at 0 for 5s), so there it is a reload at the top.
    if (browserName === 'chromium') {
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(900)
    }
    await waitForLanding(page, '#main')
    const states = await sectionStates(page)
    const log = await motionLog(page)
    for (const section of states) {
      expect(section.state, section.id).toBeNull()
      expectShown(section, 'after the reload')
    }
    expect(log.changes).toEqual([])
    expect(log.transitions).toEqual([])
    await context.close()
  })
})

test.describe('section reveals and the rail line, no-preference', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('the sections below the first screen hide, then reveal once each; none hides again', async ({ page }) => {
    await recordMotion(page)
    await openPage(page, 1440)
    const before = await sectionStates(page)
    for (const section of before) {
      expect(section.state, section.id).toBe(section.inView ? null : 'hidden')
    }
    const hidden = before.filter((section) => section.state === 'hidden')
    expect(hidden.map((section) => section.id)).toEqual([...SECTIONS])
    // Hidden: opacity 0, --space-4 lower; a technical grid only fades.
    const futureReady = before.find((section) => section.id === 'future-ready')!
    expect(futureReady.children).toEqual([
      { opacity: '0', transform: 'none' },
      { opacity: '0', transform: 'matrix(1, 0, 0, 1, 0, 16)' },
    ])
    // The section itself, the anchor target, never moves.
    const sectionTransforms = await page.evaluate(
      (ids) => ids.map((id) => getComputedStyle(document.getElementById(id)!).transform),
      SECTIONS,
    )
    expect(new Set(sectionTransforms)).toEqual(new Set(['none']))

    await scrollThrough(page)
    for (const section of await sectionStates(page)) {
      expect(section.state, section.id).toBe('in')
      expectShown(section, 'after scrolling down')
    }
    // The reveal is over --duration-reveal, opacity and transform only.
    const transition = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('#about > .container')!)
      return [style.transitionProperty, style.transitionDuration]
    })
    expect(transition).toEqual(['opacity, transform', `${(await tokenTime(page, '--duration-reveal'))}s`])

    // Back to the top and down again: nothing hides or replays.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await scrollThrough(page)
    for (const section of await sectionStates(page)) expectShown(section, 'after scrolling back')
    const log = await motionLog(page)
    for (const id of SECTIONS) {
      expect(log.changes.filter((change) => change.id === id).map((change) => change.state), id).toEqual([
        'hidden',
        'in',
      ])
    }

    await page.screenshot({ path: test.info().outputPath('scrolled-through-1440.png'), fullPage: true })
  })

  for (const width of [360, 1440]) {
    test(`the rail line draws from the first stage to the last once it is half in view, at ${width}px`, async ({
      page,
    }) => {
      await openPage(page, width)
      const hidden = await rail(page)
      expect(hidden.state).toBe('hidden')
      // Undrawn: scaled to nothing along its length (scaleX in the row at
      // 1440, scaleY in the vertical list at 360).
      for (const transform of hidden.lines) {
        expect(transform).toBe(width === 1440 ? 'matrix(0, 0, 0, 1, 0, 0)' : 'matrix(1, 0, 0, 0, 0, 0)')
      }

      await page.locator('.lifecycle-rail').scrollIntoViewIfNeeded()
      await expect.poll(async () => (await rail(page)).state).toBe('in')
      const drawing = await rail(page)
      // Five steps, each a fifth of --duration-rail-draw, one after the
      // other: the whole line takes --duration-rail-draw (2 x slow).
      const total = await tokenTime(page, '--duration-rail-draw')
      expect(total).toBe(2 * (await tokenTime(page, '--duration-slow')))
      drawing.lineDurations.forEach(([duration, delay], index) => {
        expect(parseFloat(duration)).toBeCloseTo(total / 5, 5)
        expect(parseFloat(delay)).toBeCloseTo((total / 5) * index, 5)
      })
      // The labels and markers never fade.
      for (const [label, marker] of drawing.labels) expect([label, marker]).toEqual(['1', '1'])

      await waitForMotion(page)
      const drawn = await rail(page)
      for (const transform of drawn.lines) expect(transform).toBe('none')
    })
  }

  test('print shows every section, with nothing scrolled into view', async ({ page }) => {
    await openPage(page, 1440)
    expect((await sectionStates(page)).filter((section) => section.state === 'hidden')).not.toHaveLength(0)
    await page.emulateMedia({ media: 'print' })
    for (const section of await sectionStates(page)) expectShown(section, 'in print')
    for (const transform of (await rail(page)).lines) expect(transform).toBe('none')
  })
})

test.describe('focus never lands on hidden content (no-preference)', () => {
  test.use({ reducedMotion: 'no-preference' })

  /** The Solutions section's reveal state and its content's look. */
  const solutions = (page: Page) =>
    page.evaluate(() => {
      const section = document.getElementById('solutions')!
      const style = getComputedStyle(section.querySelector(':scope > .container')!)
      return { state: section.getAttribute('data-reveal-state'), opacity: style.opacity, transform: style.transform }
    })

  for (const width of [360, 1440]) {
    test(`Tab from the last disclosure into hidden Solutions shows it at once, at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      await page.getByRole('button', { name: disclosures.at(-1) }).focus()
      await waitForMotion(page)
      expect((await solutions(page)).state).toBe('hidden')

      await pressTab(page)
      // Read straight away, with no wait: shown in full, not moving.
      expect(await solutions(page)).toEqual({ state: null, opacity: '1', transform: 'none' })
      expect(await focusedName(page)).toBe(sectors[0])
      await expectUnobscured(page, sectors[0])
    })

    test(`Shift+Tab from a #contact landing into hidden Solutions shows it at once, at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/#contact')
      await waitForLanding(page, '#contact')
      expect((await solutions(page)).state).toBe('hidden')

      await pressTab(page, { shift: true })
      expect(await solutions(page)).toEqual({ state: null, opacity: '1', transform: 'none' })
      expect(await focusedName(page)).toBe(sectors.at(-1))
      await expectUnobscured(page, sectors.at(-1)!)
    })
  }
})
