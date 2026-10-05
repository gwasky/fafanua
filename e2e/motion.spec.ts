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

  test('the brand promise, copy and CTA row rise, the h1 never fades, and the grid fades in', async ({ page }) => {
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
        promise: style('.hero__promise'),
        lead: style('.hero__lead'),
        actions: style('.hero__actions'),
        grid: style('.hero > .technical-grid'),
        futureGrid: style('.future-ready > .technical-grid'),
      }
    })
    expect(first.h1).toEqual({ name: 'none', duration: 0, delay: 0, opacity: '1' })
    expect(first.promise.name).toBe('hero-reveal')
    expect(first.lead.name).toBe('hero-reveal')
    expect(first.actions.name).toBe('hero-reveal')
    expect(first.grid.name).toBe('hero-grid-fade')
    expect(first.futureGrid.name).toBe('none')
    const slow = await tokenTime(page, '--duration-slow')
    const fast = await tokenTime(page, '--duration-fast')
    expect(first.promise.duration).toBeLessThanOrEqual(slow)
    expect(first.lead.duration).toBeLessThanOrEqual(slow)
    expect(first.actions.duration).toBeLessThanOrEqual(slow)
    expect(first.grid.duration).toBe(slow)
    expect(first.promise.delay).toBe(0)
    expect(first.lead.delay).toBe(0)
    expect(first.actions.delay).toBeLessThanOrEqual(fast)

    // The start of each reveal: opacity 0 and at most --space-4 (16px)
    // lower; the grid starts at opacity 0.
    const start = await page.evaluate(() =>
      ['.hero__promise', '.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
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
      { opacity: '0', transform: 'matrix(1, 0, 0, 1, 0, 16)' },
      { opacity: '0', transform: 'none' },
    ])

    await waitForMotion(page)
    const end = await page.evaluate(() =>
      ['.hero__heading', '.hero__promise', '.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
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
        ['.hero__heading', '.hero__promise', '.hero__lead', '.hero__actions', '.hero > .technical-grid'].map((selector) => {
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

  // The stage labels and markers are fully shown and at rest for the
  // whole of the draw: from the frame the rail switches to "in" until
  // every connector is drawn, each label's and marker's opacity, times
  // every ancestor's, is 1 and no ancestor is transformed (owner decision
  // on #61). The draw waits for the Services section's own reveal to end.
  for (const width of [360, 1440]) {
    for (const how of ['header link', 'scroll into view', 'wheel'] as const) {
      test(`the rail labels and markers are fully shown throughout the draw, ${how}, at ${width}px`, async ({
        page,
      }) => {
        await openPage(page, width)
        expect((await rail(page)).state).toBe('hidden')
        // Sample from the state change on, every frame, until the line is
        // drawn.
        await page.evaluate(() => {
          const frame = document.querySelector('.lifecycle-rail-frame')!
          const stages = [...frame.querySelectorAll('.lifecycle-rail__stage')]
          const items = stages.flatMap((stage) => [
            stage.querySelector('.lifecycle-rail__label')!,
            stage.querySelector('.lifecycle-rail__marker')!,
          ])
          const samples: { opacity: number; transformed: number; undrawn: number }[] = []
          ;(window as unknown as { __rail: typeof samples }).__rail = samples
          const sample = () => {
            let opacity = 1
            let transformed = 0
            for (const item of items) {
              let own = 1
              for (let element: Element | null = item; element; element = element.parentElement) {
                const style = getComputedStyle(element)
                own *= Number(style.opacity)
                if (style.transform !== 'none') transformed++
              }
              opacity = Math.min(opacity, own)
            }
            const undrawn = stages
              .slice(0, -1)
              .filter((stage) => getComputedStyle(stage, '::after').transform !== 'none').length
            samples.push({ opacity, transformed, undrawn })
            return undrawn
          }
          const tick = () => {
            if (sample() > 0) requestAnimationFrame(tick)
          }
          new MutationObserver((_records, observer) => {
            if (frame.getAttribute('data-reveal-state') !== 'in') return
            observer.disconnect()
            tick()
          }).observe(frame, { attributes: true, attributeFilter: ['data-reveal-state'] })
        })

        if (how === 'header link') {
          const toggle = page.getByRole('button', { name: 'Menu' })
          if (await toggle.isVisible()) await toggle.click()
          await page.getByRole('banner').getByRole('link', { name: 'Services', exact: true }).click()
        } else if (how === 'scroll into view') {
          await page.locator('.lifecycle-rail').scrollIntoViewIfNeeded()
        } else {
          // 150px a step, as a mouse wheel scrolls, until the line starts.
          await page.mouse.move(width / 2, 400)
          for (let step = 0; step < 60 && (await rail(page)).state !== 'in'; step++) {
            await page.mouse.wheel(0, 150)
            await page.evaluate(
              () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
            )
          }
        }

        await expect
          .poll(() => page.evaluate(() => (window as unknown as { __rail: unknown[] }).__rail.length))
          .toBeGreaterThan(0)
        await waitForMotion(page)
        const samples = await page.evaluate(
          () => (window as unknown as { __rail: { opacity: number; transformed: number; undrawn: number }[] }).__rail,
        )
        // The first sample is the frame the draw starts in, with the line
        // still undrawn; the last, the line drawn.
        expect(samples[0].undrawn, JSON.stringify(samples)).toBeGreaterThan(0)
        expect(samples.at(-1)!.undrawn, JSON.stringify(samples)).toBe(0)
        for (const { opacity, transformed } of samples) {
          expect({ opacity, transformed }, JSON.stringify(samples)).toEqual({ opacity: 1, transformed: 0 })
        }
      })
    }
  }

  test('print shows every section, with nothing scrolled into view', async ({ page }) => {
    await openPage(page, 1440)
    expect((await sectionStates(page)).filter((section) => section.state === 'hidden')).not.toHaveLength(0)
    await page.emulateMedia({ media: 'print' })
    for (const section of await sectionStates(page)) expectShown(section, 'in print')
    for (const transform of (await rail(page)).lines) expect(transform).toBe('none')
  })
})

// A hash typed into the address bar (or set by script) for an element
// inside a section that is still hidden lands it clear of the header:
// useReveal.ts shows that section in its final state and scrolls to the
// target again, so it is not left --reveal-shift under the header (#61).
test.describe('a typed hash to an element inside a hidden section (no-preference)', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const width of [360, 1440]) {
    for (const hash of ['#solutions-heading', '#about-heading']) {
      test(`${hash} lands below the header, at ${width}px`, async ({ page }) => {
        await openPage(page, width)
        const section = hash === '#about-heading' ? 'about' : 'solutions'
        expect(await page.evaluate((id) => document.getElementById(id)!.getAttribute('data-reveal-state'), section)).toBe(
          'hidden',
        )
        await page.evaluate((value) => {
          location.hash = value
        }, hash)
        await waitForLanding(page, hash)
        await waitForMotion(page)
        await expectLanded(page, hash)
        const shown = (await sectionStates(page)).find((state) => state.id === section)!
        expectShown(shown, 'after the hash change')
      })
    }
  }
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

// The motion from earlier phases, checked for consistency in both
// engines (#61); a11y.spec.ts and hero.spec.ts check each in Chromium.
test.describe('earlier motion, consistent (no-preference)', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('every CTA arrow nudges --cta-arrow-shift over --duration-cta-arrow on hover', async ({ page }) => {
    await openPage(page, 1440)
    const arrows = page.locator('.button:has(.button__arrow)')
    // The header's, the hero's and the closing call to action's.
    await expect(arrows).toHaveCount(3)
    const duration = await tokenTime(page, '--duration-cta-arrow')
    for (const button of await arrows.all()) {
      const arrow = button.locator('.button__arrow')
      expect(parseFloat(await arrow.evaluate((element) => getComputedStyle(element).transitionDuration))).toBe(
        duration,
      )
      await button.scrollIntoViewIfNeeded()
      await waitForMotion(page)
      await button.hover()
      await expect.poll(() => arrow.evaluate((element) => getComputedStyle(element).translate)).toBe('4px')
      await page.mouse.move(0, 0)
    }
  })

  test('the header switches over --duration-header with no blur, at the top and scrolled', async ({ page }) => {
    await openPage(page, 1440)
    const header = page.getByRole('banner')
    const look = () =>
      header.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          backdrop: style.backdropFilter || 'none',
          webkitBackdrop: (style as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none',
          property: style.transitionProperty,
          duration: parseFloat(style.transitionDuration),
        }
      })
    const expected = {
      backdrop: 'none',
      webkitBackdrop: 'none',
      property: 'background-color, border-color',
      duration: await tokenTime(page, '--duration-header'),
    }
    await expect(header).toHaveClass(/\bon-dark\b/)
    expect(await look()).toEqual(expected)
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
    await expect(header).not.toHaveClass(/\bon-dark\b/)
    expect(await look()).toEqual(expected)
  })
})
