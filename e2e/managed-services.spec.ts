import { expect, type Page } from '@playwright/test'
import { managedServices } from '../src/data/services.ts'
import { openPage, test } from './fixtures.ts'

// The Managed Services section (#58), regrouped in #88, in conditions the
// width projects do not cover: its accessibility tree, the dark panel's colours and type,
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

test('reads as the eyebrow, the journey nav, the h2, the description and link, the four groups and the offers', async ({ page }) => {
  await openPage(page, 1440)

  const snapshot = await region(page).ariaSnapshot()
  const [first, second, current] = managedServices.journey
  expect(snapshot).toBe(
    [
      `- region "${managedServices.sectionHeading}":`,
      `  - paragraph: 02 — ${managedServices.sectionLabel}`,
      `  - navigation "${managedServices.journeyLabel}":`,
      '    - list:',
      '      - listitem:',
      `        - link "${first}":`,
      '          - /url: "#data-trust-assessment"',
      '      - listitem:',
      `        - link "${second}":`,
      '          - /url: "#capabilities"',
      `      - listitem: ${current}`,
      `  - heading "${managedServices.sectionHeading}" [level=2]`,
      `  - paragraph: ${managedServices.description}`,
      `  - link "${managedServices.heading}":`,
      '    - /url: /services/managed-data-analytics',
      ...managedServices.groups.flatMap((group) => [
        `  - heading "${group.heading}" [level=3]`,
        `  - list "${group.heading}":`,
        ...group.services.map((service) => `    - listitem: ${service}`),
      ]),
      `  - paragraph: ${managedServices.engagementLabel}`,
      `  - list "${managedServices.engagementLabel}":`,
      ...managedServices.offers.map((offer) => `    - listitem: ${offer}`),
    ].join('\n'),
  )
  expect(snapshot).not.toMatch(/[←-⇿·•]|button/)
  await expect(region(page).locator('[aria-current="step"]')).toHaveText(current)
})

// The journey's two links (#88) and the link to the Managed Data &
// Analytics page (#67) are the panel's three tab stops.
test('adds three tab stops, the two journey links and the service link, and no button, title or scroll container', async ({ page }) => {
  await openPage(page, 1440)
  const m = await region(page).evaluate((root) => ({
    focusable: [...root.querySelectorAll('a, button, input, [tabindex], [contenteditable]')].map(
      (element) => element.getAttribute('href'),
    ),
    titled: root.querySelectorAll('[title]').length,
    scrollers: [root, ...root.querySelectorAll('*')].filter((element) =>
      ['auto', 'scroll', 'hidden'].includes(getComputedStyle(element).overflowX),
    ).length,
    graphics: root.querySelectorAll('img, svg, canvas, picture').length,
  }))
  expect(m).toEqual({
    focusable: ['#data-trust-assessment', '#capabilities', '/services/managed-data-analytics'],
    titled: 0,
    scrollers: 0,
    graphics: 0,
  })
  await expect(region(page).getByRole('link', { name: managedServices.heading, exact: true })).toHaveAttribute(
    'href',
    '/services/managed-data-analytics',
  )
})

/** The colour, underline and decoration colour a link paints. */
const linkLook = (page: Page, selector: string) =>
  region(page).evaluate((root, sel) => {
    const style = getComputedStyle(root.querySelector(sel)!)
    return {
      colour: style.color,
      underline: style.textDecorationLine,
      decoration: style.textDecorationColor,
      thickness: style.textDecorationThickness,
    }
  }, selector)

test('paints only the verified dark pairings inside the panel, on a paper section', async ({ page }) => {
  await openPage(page, 1440)
  const [paper, g900, g700, g400, teal400] = await Promise.all(
    ['--paper', '--graphite-900', '--graphite-700', '--graphite-400', '--teal-400'].map(
      (token) => tokenColour(page, token),
    ),
  )
  const m = await region(page).evaluate((root) => {
    const style = (selector: string, pseudo?: string) =>
      getComputedStyle(root.querySelector(selector)!, pseudo)
    const all = (selector: string, pseudo?: string) =>
      [...root.querySelectorAll(selector)].map((element) => getComputedStyle(element, pseudo))
    const panel = style('.surface-dark')
    const current = style('[aria-current="step"]')
    return {
      section: getComputedStyle(root).backgroundColor,
      panel: {
        background: panel.backgroundColor,
        image: panel.backgroundImage,
        shadow: panel.boxShadow,
        border: panel.borderTopStyle,
        radius: panel.borderTopLeftRadius,
      },
      sectionEyebrow: style('.section-eyebrow').color,
      journeyLinks: all('.managed-services__journey a').map((s) => s.color),
      journeyArrows: all('.managed-services__journey [aria-hidden="true"]').map((s) => s.color),
      current: {
        colour: current.color,
        border: `${current.borderBottomWidth} ${current.borderBottomStyle}`,
        borderColour: current.borderBottomColor,
      },
      h2: style('h2').color,
      description: style('.managed-services__description').color,
      link: style('.managed-services__link').color,
      linkArrow: style('.managed-services__link [aria-hidden="true"]').color,
      verbs: all('h3').map((s) => s.color),
      items: all('.managed-services__group li').map((s) => s.color),
      label: style('.managed-services__engage-label').color,
      offers: all('.managed-services__offers li').map((s) => s.color),
      dot: style('.managed-services__offers li + li', '::before').borderTopColor,
      hairlines: [
        style('.managed-services__groups').borderTopColor,
        ...all('.managed-services__group li + li').map((s) => s.borderTopColor),
        ...all('.managed-services__group + .managed-services__group').map((s) => s.borderLeftColor),
        style('.managed-services__engage').borderTopColor,
      ],
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
  // Paper on graphite 900 (14.9:1): the h2, the current step, the service
  // link, the services and the offers.
  expect([m.h2, m.current.colour, m.link]).toEqual([paper, paper, paper])
  expect(m.items).toEqual(Array(11).fill(paper))
  expect(m.offers).toEqual([paper, paper])
  // Graphite 400 on graphite 900 (5.9:1): the eyebrow, the journey links
  // and arrows, the description, the engagement label and the dot.
  expect([m.sectionEyebrow, m.description, m.label, m.dot]).toEqual([g400, g400, g400, g400])
  expect(m.journeyLinks).toEqual([g400, g400])
  expect(m.journeyArrows).toEqual([g400, g400])
  // Teal 400 on graphite 900 (7.5:1): the verbs, the link's arrow and the
  // current step's 2px underline.
  expect(m.verbs).toEqual(Array(4).fill(teal400))
  expect(m.linkArrow).toBe(teal400)
  expect(m.current.border).toBe('2px solid')
  expect(m.current.borderColour).toBe(teal400)
  // Graphite 700 hairlines.
  expect(m.hairlines.length).toBeGreaterThan(5)
  for (const hairline of m.hairlines) expect(hairline).toBe(g700)

  // At rest the links have no underline.
  const step = '.managed-services__journey li:first-child a'
  expect(await linkLook(page, step)).toMatchObject({ colour: g400, underline: 'none' })
  expect(await linkLook(page, '.managed-services__link')).toMatchObject({ colour: paper, underline: 'none' })

  // Hover: paper text with a 1px paper underline.
  await region(page).locator(step).hover()
  expect(await linkLook(page, step)).toEqual({ colour: paper, underline: 'underline', decoration: paper, thickness: '1px' })
  await region(page).locator('.managed-services__link').hover()
  expect(await linkLook(page, '.managed-services__link')).toEqual({ colour: paper, underline: 'underline', decoration: paper, thickness: '1px' })
  await page.mouse.move(0, 0)

  // Keyboard focus: the same, with the teal 400 ring.
  await region(page).locator(step).focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  expect(await linkLook(page, step)).toEqual({ colour: paper, underline: 'underline', decoration: paper, thickness: '1px' })
  expect(
    await region(page).locator(step).evaluate((element) => getComputedStyle(element).outlineColor),
  ).toBe(teal400)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.className)).toBe('managed-services__link')
  expect(await linkLook(page, '.managed-services__link')).toEqual({ colour: paper, underline: 'underline', decoration: paper, thickness: '1px' })
  expect(
    await region(page).locator('.managed-services__link').evaluate((element) => getComputedStyle(element).outlineColor),
  ).toBe(teal400)
})

test('uses teal 400 only on the verbs, the link arrow and the current step\'s underline', async ({ page }) => {
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
          hits.push(`${element.tagName.toLowerCase()}.${element.className}${pseudo ?? ''}`)
        }
      }
    }
    return hits
  }, teals)

  expect(found).toEqual([
    'span.managed-services__step-current',
    'span.managed-services__arrow',
    'h3.managed-services__verb',
    'h3.managed-services__verb',
    'h3.managed-services__verb',
    'h3.managed-services__verb',
  ])
  // The current step's text is paper; only its border is teal.
  const current = await region(page).locator('[aria-current="step"]').evaluate((element) => {
    const style = getComputedStyle(element)
    return { colour: style.color, border: style.borderBottomColor }
  })
  expect(teals).not.toContain(current.colour)
  expect(teals).toContain(current.border)
})

test('sets the h2 at 300, the verbs at 500, everything else at 400, and nothing above weight 500', async ({ page }) => {
  await openPage(page, 1440)
  const sizes = {
    section: await tokenPx(page, '--text-section'),
    bodyLg: await tokenPx(page, '--text-body-lg'),
    base: await tokenPx(page, '--text-base'),
    sm: await tokenPx(page, '--text-sm'),
  }
  const m = await region(page).evaluate((root) => {
    const pick = (element: Element) => {
      const s = getComputedStyle(element)
      return { size: parseFloat(s.fontSize), weight: s.fontWeight, lineHeight: parseFloat(s.lineHeight) }
    }
    const one = (selector: string) => pick(root.querySelector(selector)!)
    const textOf = (selector: string) => [...root.querySelectorAll(selector)].map(pick)
    return {
      h2: one('h2'),
      verbs: textOf('h3'),
      description: one('.managed-services__description'),
      journey: textOf('.managed-services__journey a, [aria-current="step"]'),
      link: one('.managed-services__link'),
      items: textOf('.managed-services__group li, .managed-services__offers li'),
      label: one('.managed-services__engage-label'),
      eyebrowWeight: getComputedStyle(root.querySelector('.section-eyebrow')!).fontWeight,
      // Every element holding text of its own, but the eyebrow, the h2
      // and the verbs.
      others: [...root.querySelectorAll('*')]
        .filter((element) =>
          [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim() !== ''),
        )
        .filter((element) => !element.matches('.section-eyebrow, .section-eyebrow *, h2, h3'))
        .map((element) => getComputedStyle(element).fontWeight),
      weights: [root, ...root.querySelectorAll('*')].map((element) =>
        Number(getComputedStyle(element).fontWeight),
      ),
    }
  })

  expect(m.h2.size).toBeCloseTo(sizes.section, 1)
  expect(m.h2.weight).toBe('300')
  expect(m.h2.lineHeight).toBeCloseTo(sizes.section * 1.05, 0)
  expect(m.verbs).toHaveLength(4)
  for (const verb of m.verbs) {
    expect(verb.size).toBeCloseTo(sizes.sm, 1)
    expect(verb.weight).toBe('500')
  }
  expect(m.eyebrowWeight).toBe('500')
  expect(m.description.size).toBeCloseTo(sizes.bodyLg, 1)
  expect(m.link.size).toBeCloseTo(sizes.base, 1)
  for (const step of m.journey) expect(step.size).toBeCloseTo(sizes.base, 1)
  for (const item of m.items) expect(item.size).toBeCloseTo(sizes.base, 1)
  expect(m.label.size).toBeCloseTo(sizes.sm, 1)
  expect(m.others.length).toBeGreaterThan(15)
  expect(new Set(m.others)).toEqual(new Set(['400']))
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

test('keeps its hairlines, the current step\'s border, the offer dot and the arrows drawn in forced-colours mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await openPage(page, 1440)
  const m = await region(page).evaluate((root) => {
    const drawn = (style: CSSStyleDeclaration, side: 'Top' | 'Bottom' | 'Left') => ({
      style: style.getPropertyValue(`border-${side.toLowerCase()}-style`),
      width: parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)),
      colour: style.getPropertyValue(`border-${side.toLowerCase()}-color`),
    })
    const get = (selector: string, pseudo?: string) =>
      getComputedStyle(root.querySelector(selector)!, pseudo)
    return {
      hairlines: [
        drawn(get('.managed-services__groups'), 'Top'),
        ...[...root.querySelectorAll('.managed-services__group li + li')].map((item) =>
          drawn(getComputedStyle(item), 'Top'),
        ),
        ...[...root.querySelectorAll('.managed-services__group + .managed-services__group')].map((group) =>
          drawn(getComputedStyle(group), 'Left'),
        ),
        drawn(get('.managed-services__engage'), 'Top'),
      ],
      current: drawn(get('[aria-current="step"]'), 'Bottom'),
      dot: {
        ...drawn(get('.managed-services__offers li + li', '::before'), 'Top'),
        box: parseFloat(get('.managed-services__offers li + li', '::before').borderTopWidth) * 2,
      },
      arrows: [...root.querySelectorAll('[aria-hidden="true"]')].map((arrow) => ({
        text: arrow.textContent,
        width: arrow.getBoundingClientRect().width,
        colour: getComputedStyle(arrow).color,
      })),
      links: [...root.querySelectorAll('.managed-services__journey a')].map(
        (link) => getComputedStyle(link).color,
      ),
      text: get('.managed-services__description').color,
      background: get('.surface-dark').backgroundColor,
    }
  })

  // The grid's top, 7 between items, 3 between columns, the engagement line.
  expect(m.hairlines).toHaveLength(12)
  for (const line of [...m.hairlines, m.current, m.dot]) {
    expect(line.style).toBe('solid')
    expect(line.width).toBeGreaterThan(0)
    expect(line.colour).not.toBe('rgba(0, 0, 0, 0)')
    expect(line.colour).not.toBe(m.background)
  }
  expect(m.current.width).toBe(2)
  expect(m.dot.box).toBeGreaterThan(0)
  expect(m.arrows).toHaveLength(3)
  for (const arrow of m.arrows) {
    expect(arrow.text).toBe('→')
    expect(arrow.width).toBeGreaterThan(0)
    expect(arrow.colour).not.toBe(m.background)
  }
  // The journey links take the system link colour.
  for (const colour of m.links) {
    expect(colour).not.toBe(m.background)
    expect(colour).not.toBe(m.text)
  }
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

  test('stacked intro, the groups two by two or one per row, with no overflow, at 1024 x 800', async ({ page }) => {
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
        description: box('.managed-services__description'),
        columns: new Set(
          [...root.querySelectorAll('.managed-services__group')].map((group) =>
            Math.round(group.getBoundingClientRect().left),
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
    expect(m.description.top, 'stacked').toBeGreaterThanOrEqual(m.h2.bottom - 1)
    expect(m.columns).toBeLessThanOrEqual(2)
    expect(m.overflowing).toEqual([])
    expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth)
  })
})
