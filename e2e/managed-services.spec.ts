import { expect, type Page } from '@playwright/test'
import { managedServices } from '../src/data/services.ts'
import { openPage, test } from './fixtures.ts'

// The Managed Services section (#58) in conditions the width projects do
// not cover: its accessibility tree, the dark panel's colours and type,
// the header over it, motion, forced colours and 32px browser text. Runs
// in the chromium project; the layout at each width, in both engines, is
// in responsive.spec.ts.

const region = (page: Page) =>
  page.getByRole('region', { name: managedServices.sectionHeading })
const panel = (page: Page) => region(page).locator('.surface-dark')

/** Resolves a token to the computed colour a page would paint with it. */
const tokenColour = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, token)

/** Resolves a length token to px. */
const tokenPx = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.width = `var(${name})`
    document.body.append(probe)
    const value = parseFloat(getComputedStyle(probe).width)
    probe.remove()
    return value
  }, token)

test('reads as the eyebrow, the h2, the approved group, the rail, the capabilities and the journey', async ({ page }) => {
  await openPage(page, 1440)

  const snapshot = await region(page).ariaSnapshot()
  expect(snapshot).toBe(
    [
      `- region "${managedServices.sectionHeading}":`,
      `  - paragraph: 02 — ${managedServices.sectionLabel}`,
      `  - heading "${managedServices.sectionHeading}" [level=2]`,
      `  - paragraph: ${managedServices.eyebrow}`,
      `  - heading "${managedServices.heading}" [level=3]`,
      `  - paragraph: ${managedServices.description}`,
      '  - list:',
      ...managedServices.rail.map((word) => `    - listitem: ${word}`),
      '  - list:',
      ...managedServices.capabilities.map((capability) => `    - listitem: ${capability}`),
      '  - list:',
      ...managedServices.journey.map((step) => `    - listitem: ${step}`),
    ].join('\n'),
  )
  expect(snapshot).not.toMatch(/[←-⇿·•]|link|button/)
})

test('adds no tab stop, link, button, title or scroll container', async ({ page }) => {
  await openPage(page, 1440)
  const m = await region(page).evaluate((root) => ({
    focusable: root.querySelectorAll('a, button, input, [tabindex], [contenteditable]').length,
    titled: root.querySelectorAll('[title]').length,
    scrollers: [root, ...root.querySelectorAll('*')].filter((element) =>
      ['auto', 'scroll', 'hidden'].includes(getComputedStyle(element).overflowX),
    ).length,
    graphics: root.querySelectorAll('img, svg, canvas, picture').length,
  }))
  expect(m).toEqual({ focusable: 0, titled: 0, scrollers: 0, graphics: 0 })
})

test('paints only the verified dark pairings inside the panel, on a paper section', async ({ page }) => {
  await openPage(page, 1440)
  const [paper, g900, g700, g400, g300, teal400] = await Promise.all(
    ['--paper', '--graphite-900', '--graphite-700', '--graphite-400', '--graphite-300', '--teal-400'].map(
      (token) => tokenColour(page, token),
    ),
  )
  const m = await region(page).evaluate((root) => {
    const style = (selector: string, pseudo?: string) =>
      getComputedStyle(root.querySelector(selector)!, pseudo)
    const panel = style('.surface-dark')
    return {
      section: getComputedStyle(root).backgroundColor,
      panel: {
        background: panel.backgroundColor,
        image: panel.backgroundImage,
        shadow: panel.boxShadow,
        border: panel.borderTopStyle,
        radius: panel.borderTopLeftRadius,
      },
      h2: style('h2').color,
      h3: style('h3').color,
      rail: style('.managed-services__rail').color,
      sectionEyebrow: style('.section-eyebrow').color,
      eyebrow: style('.managed-services__eyebrow').color,
      description: style('.managed-services__description').color,
      capability: style('.managed-services__capabilities li').color,
      divider: style('.managed-services__capabilities li').borderTopColor,
      step: style('.managed-services__step').color,
      arrow: style('.managed-services__step', '::after').borderRightColor,
      separator: style('.managed-services__rail-separator').borderTopColor,
    }
  })

  expect(m.section).toBe(paper)
  expect(m.panel).toEqual({
    background: g900,
    image: 'none',
    shadow: 'none',
    border: 'none',
    radius: `${await tokenPx(page, '--radius-lg')}px`,
  })
  // Headings and the rail: paper on graphite 900 (14.9:1).
  expect([m.h2, m.h3, m.rail]).toEqual([paper, paper, paper])
  // Body and capability text: graphite 300 on graphite 900 (8.9:1).
  expect([m.description, m.capability, m.step]).toEqual([g300, g300, g300])
  // Eyebrows and journey arrows: graphite 400 on graphite 900 (5.9:1).
  expect([m.sectionEyebrow, m.eyebrow, m.arrow]).toEqual([g400, g400, g400])
  // Capability dividers graphite 700; rail separators teal 400.
  expect(m.divider).toBe(g700)
  expect(m.separator).toBe(teal400)
})

test('uses teal 400 only on the rail separators, and no text is teal', async ({ page }) => {
  await openPage(page, 1440)
  const teals = await Promise.all(
    ['--teal-300', '--teal-400', '--teal-500', '--teal-600', '--teal-700', '--teal-800'].map((token) =>
      tokenColour(page, token),
    ),
  )
  const found = await region(page).evaluate((root, tealColours) => {
    const hits: string[] = []
    for (const element of [root, ...root.querySelectorAll('*')]) {
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo)
        if (pseudo && style.content === 'none') continue
        const painted = [
          style.color,
          style.backgroundColor,
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor,
        ]
        // A border paints only when it has a style and a width.
        const usesBorder = style.borderTopStyle !== 'none' || style.borderRightStyle !== 'none' ||
          style.borderBottomStyle !== 'none' || style.borderLeftStyle !== 'none'
        const checked = usesBorder ? painted : painted.slice(0, 2)
        if (checked.some((colour) => tealColours.includes(colour))) {
          hits.push(`${element.className}${pseudo ?? ''}`)
        }
      }
    }
    return hits
  }, teals)

  expect(found).toEqual([
    'managed-services__rail-separator',
    'managed-services__rail-separator',
    'managed-services__rail-separator',
  ])
})

test('sets the h2, h3, description and rail type, and nothing above weight 500', async ({ page }) => {
  await openPage(page, 1440)
  const sizes = {
    section: await tokenPx(page, '--text-section'),
    service: await tokenPx(page, '--text-service'),
    bodyLg: await tokenPx(page, '--text-body-lg'),
    xl: await tokenPx(page, '--text-xl'),
  }
  const m = await region(page).evaluate((root) => {
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const pick = (selector: string) => {
      const s = style(selector)
      return { size: parseFloat(s.fontSize), weight: s.fontWeight, lineHeight: parseFloat(s.lineHeight) }
    }
    return {
      h2: pick('h2'),
      h3: pick('h3'),
      description: pick('.managed-services__description'),
      rail: pick('.managed-services__rail-item'),
      weights: [root, ...root.querySelectorAll('*')].map((element) =>
        Number(getComputedStyle(element).fontWeight),
      ),
    }
  })

  expect(m.h2.size).toBeCloseTo(sizes.section, 1)
  expect(m.h2.weight).toBe('300')
  expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
  expect(m.h3.size).toBeCloseTo(sizes.service, 1)
  expect(m.description.size).toBeCloseTo(sizes.bodyLg, 1)
  expect(m.rail.size).toBeCloseTo(sizes.xl, 1)
  expect(['300', '400']).toContain(m.rail.weight)
  expect(Math.max(...m.weights)).toBeLessThanOrEqual(500)
})

test.describe('the header over the panel', () => {
  for (const width of [360, 1440]) {
    test(`stays solid with the panel under it at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      const header = page.getByRole('banner')
      // Scroll the panel's top edge to the middle of the header, at once.
      await panel(page).evaluate((element) => {
        const header = document.querySelector('header')!.getBoundingClientRect()
        window.scrollTo({
          top: window.scrollY + element.getBoundingClientRect().top - header.height / 2,
          behavior: 'instant',
        })
      })
      const overlap = await panel(page).evaluate((element) => {
        const header = document.querySelector('header')!.getBoundingClientRect()
        const box = element.getBoundingClientRect()
        return box.top < header.bottom && box.bottom > header.top
      })
      expect(overlap, 'the panel is under the header').toBe(true)
      await expect(header).not.toHaveClass(/\bon-dark\b/)
      expect(await panel(page).getAttribute('data-header-overlay')).toBeNull()
      // Once the header's solid transition has run.
      const paper = await tokenColour(page, '--paper')
      await expect
        .poll(() => header.evaluate((element) => getComputedStyle(element).backgroundColor))
        .toBe(paper)
    })
  }
})

test('has no motion of its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openPage(page, 1440)
  const animated = await region(page).evaluate((root) =>
    [root, ...root.querySelectorAll('*')].flatMap((element) =>
      [null, '::before', '::after']
        .map((pseudo) => getComputedStyle(element, pseudo))
        .filter((style) => style.animationName !== 'none' || parseFloat(style.transitionDuration) > 0)
        .map(() => element.className),
    ),
  )
  expect(animated).toEqual([])
})

test('keeps its dividers, separators and arrows drawn in forced-colours mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await openPage(page, 1440)
  const m = await region(page).evaluate((root) => {
    const drawn = (style: CSSStyleDeclaration, side: 'Top' | 'Right') => ({
      style: style.getPropertyValue(`border-${side.toLowerCase()}-style`),
      width: parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)),
      colour: style.getPropertyValue(`border-${side.toLowerCase()}-color`),
    })
    return {
      dividers: [...root.querySelectorAll('.managed-services__capabilities li')].map((item) =>
        drawn(getComputedStyle(item), 'Top'),
      ),
      separators: [...root.querySelectorAll('.managed-services__rail-separator')].map((item) => ({
        ...drawn(getComputedStyle(item), 'Top'),
        box: item.getBoundingClientRect().width,
      })),
      arrows: [...root.querySelectorAll('.managed-services__step:not(:last-child)')].map((item) =>
        drawn(getComputedStyle(item, '::after'), 'Right'),
      ),
      text: getComputedStyle(root.querySelector('.managed-services__description')!).color,
      background: getComputedStyle(root.querySelector('.surface-dark')!).backgroundColor,
    }
  })

  expect(m.dividers).toHaveLength(13)
  expect(m.separators).toHaveLength(3)
  expect(m.arrows).toHaveLength(2)
  for (const line of [...m.dividers, ...m.separators, ...m.arrows]) {
    expect(line.style).toBe('solid')
    expect(line.width).toBeGreaterThan(0)
    expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
    expect(line.colour).not.toBe(m.background)
  }
  for (const separator of m.separators) expect(separator.box).toBeGreaterThan(0)
  expect(m.text).not.toBe(m.background)
})

test.describe('32px browser text', () => {
  // Set through CDP (Page.setFontSizes), Chromium only. 48em is 1536px
  // and 64em 2048px here, so the panel is stacked at 1024px.
  test.beforeEach(async ({ page }) => {
    const session = await page.context().newCDPSession(page)
    await session.send('Page.enable')
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
  })

  test('stacked, one or two capability columns, with no overflow, at 1024 x 800', async ({ page }) => {
    await openPage(page, 1024)
    const m = await panel(page).evaluate((root) => {
      const box = (selector: string) => root.querySelector(selector)!.getBoundingClientRect()
      const style = getComputedStyle(root)
      const { left, right } = root.getBoundingClientRect()
      const inner = {
        left: left + parseFloat(style.paddingLeft) - 1,
        right: right - parseFloat(style.paddingRight) + 1,
      }
      return {
        h2: box('h2'),
        approved: box('.managed-services__eyebrow'),
        columns: new Set(
          [...root.querySelectorAll('.managed-services__capabilities li')].map((item) =>
            Math.round(item.getBoundingClientRect().left),
          ),
        ).size,
        overflowing: [...root.querySelectorAll('*')]
          .filter((element) => {
            const rect = element.getBoundingClientRect()
            return (
              element.scrollWidth > element.clientWidth + 1 ||
              (rect.width > 0 && (rect.left < inner.left || rect.right > inner.right))
            )
          })
          .map((element) => element.textContent?.slice(0, 40)),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        eyebrowSize: getComputedStyle(root.querySelector('.section-eyebrow')!).fontSize,
      }
    })

    // Still the 32px text size: the eyebrow is 26px.
    expect(m.eyebrowSize).toBe('26px')
    expect(m.approved.top, 'stacked').toBeGreaterThanOrEqual(m.h2.bottom - 1)
    expect(m.columns).toBeLessThanOrEqual(2)
    expect(m.overflowing).toEqual([])
    expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth)
  })
})
