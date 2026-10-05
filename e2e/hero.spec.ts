import { expect, type Page } from '@playwright/test'
import { openPage, pressTab, test, waitForFonts, waitForScrollSettle } from './fixtures.ts'

// The dark technical hero (#55) on the production preview, in Chromium
// at the viewports the issue names: its height, its padding below the
// header, the type, the wrapping of the headline and supporting copy, the
// calls to action, the grid under the transparent header, and motion.
// The per-width layout checks, in Chromium and WebKit, are in
// responsive.spec.ts, and the header over the hero in
// header-overlay.spec.ts.

const HEADING = 'Trusted Data. Better Decisions.'
const PROMISE = 'Build a data foundation you can trust.'
const hero = (page: Page) => page.getByRole('region', { name: HEADING })
const primary = (page: Page) => hero(page).getByRole('link', { name: 'Discuss your data needs' })
const secondary = (page: Page) => hero(page).getByRole('link', { name: 'Explore our capabilities' })

/** Opens the page, with the root font size set when `text` is not 100%. */
async function openAt(page: Page, width: number, height: number, text = '100%') {
  await openPage(page, width, height)
  if (text !== '100%') {
    await page.addStyleTag({ content: `html { font-size: ${text}; }` })
    await waitForFonts(page)
  }
  await waitForScrollSettle(page)
}

/** Boxes of the hero, its h1, its calls to action and the header. */
function boxes(page: Page) {
  return page.evaluate(() => {
    const box = (element: Element) => {
      const { top, bottom, left, right, height, width } = element.getBoundingClientRect()
      return { top, bottom, left, right, height, width }
    }
    const section = document.querySelector('main > [data-header-overlay]')!
    const links = [...section.querySelectorAll('a')]
    return {
      hero: box(section),
      heading: box(section.querySelector('h1')!),
      primary: box(links[0]),
      secondary: box(links[1]),
      header: box(document.querySelector('header')!),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scrollY: window.scrollY,
      style: (({ minBlockSize, height, overflow, overflowX, overflowY, paddingBottom }) => ({
        minBlockSize,
        height,
        overflow,
        overflowX,
        overflowY,
        paddingBottom,
      }))(getComputedStyle(section)),
      headerPosition: getComputedStyle(document.querySelector('header')!).position,
      fits: section.scrollHeight <= section.clientHeight && section.scrollWidth <= section.clientWidth,
    }
  })
}

test.describe('hero height', () => {
  // From 64em: between 80% and 90% of the viewport (85svh), measured from
  // the page's top at scroll 0, where the hero's top is.
  for (const [width, height] of [
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    test(`80-90% of the viewport at ${width} x ${height}`, async ({ page }) => {
      await openAt(page, width, height)
      const m = await boxes(page)
      const detail = JSON.stringify(m)

      expect(m.scrollY, detail).toBe(0)
      expect(m.hero.top, detail).toBe(0)
      expect(m.hero.height / height, detail).toBeGreaterThanOrEqual(0.8)
      expect(m.hero.height / height, detail).toBeLessThanOrEqual(0.9)
      // 85svh as a minimum (a fixed height would not grow to fit its
      // content, checked at 1024 x 600 below), and nothing is hidden.
      expect(Math.abs(parseFloat(m.style.minBlockSize) - 0.85 * height), detail).toBeLessThanOrEqual(1)
      expect(m.style.overflowX, detail).toBe('visible')
      expect(m.style.overflowY, detail).toBe('visible')
      // The content is centred in the space below the header.
      const above = m.heading.top - m.header.bottom
      const below = m.hero.bottom - m.primary.bottom
      expect(Math.abs(above - below), detail).toBeLessThanOrEqual(2)
    })
  }

  // Below 64em the hero has no viewport-height minimum: its height is its
  // content and padding, and the calls to action are on the first screen.
  for (const { width, height, visible } of [
    { width: 360, height: 640, visible: ['primary'] },
    { width: 360, height: 800, visible: ['primary', 'secondary'] },
    { width: 768, height: 1024, visible: ['primary', 'secondary'] },
  ] as const) {
    test(`natural height, with ${visible.join(' and ')} visible at scroll 0, at ${width} x ${height}`, async ({
      page,
    }) => {
      await openAt(page, width, height)
      const m = await boxes(page)
      const detail = JSON.stringify(m)

      expect(m.style.minBlockSize, detail).toBe('0px')
      expect(m.hero.top, detail).toBe(0)
      for (const name of visible) {
        expect(m[name].top, `${name} ${detail}`).toBeGreaterThanOrEqual(m.header.bottom)
        expect(m[name].bottom, `${name} ${detail}`).toBeLessThanOrEqual(height)
      }
      await expect(primary(page)).toBeInViewport({ ratio: 1 })
    })
  }

  // Where 85svh is shorter than the content, the hero grows to fit it.
  for (const [width, height] of [
    [1024, 600],
    [640, 400],
  ]) {
    test(`grows to fit its content at ${width} x ${height}`, async ({ page }) => {
      await openAt(page, width, height)
      const m = await boxes(page)
      const detail = JSON.stringify(m)

      expect(m.fits, detail).toBe(true)
      expect(m.heading.top, detail).toBeGreaterThanOrEqual(m.header.bottom)
      expect(m.secondary.bottom, detail).toBeLessThanOrEqual(m.hero.bottom - parseFloat(m.style.paddingBottom) + 1)
    })
  }
})

test.describe('the h1 starts below the header at scroll 0', () => {
  for (const { width, height, text, position } of [
    { width: 1440, height: 900, text: '100%', position: 'sticky' },
    { width: 1024, height: 768, text: '100%', position: 'sticky' },
    { width: 768, height: 1024, text: '100%', position: 'sticky' },
    { width: 360, height: 800, text: '100%', position: 'sticky' },
    { width: 360, height: 640, text: '100%', position: 'sticky' },
    { width: 640, height: 400, text: '100%', position: 'relative' },
    { width: 1280, height: 400, text: '100%', position: 'relative' },
    { width: 320, height: 800, text: '200%', position: 'relative' },
  ]) {
    test(`${width} x ${height} with ${text} text`, async ({ page }) => {
      await openAt(page, width, height, text)
      await expect
        .poll(() => page.getByRole('banner').evaluate((element) => getComputedStyle(element).position))
        .toBe(position)
      const m = await boxes(page)
      const detail = JSON.stringify(m)

      expect(m.hero.top, detail).toBe(0)
      expect(m.heading.top, detail).toBeGreaterThanOrEqual(m.header.bottom)
      expect(m.fits, detail).toBe(true)
    })
  }
})

// Protected positioning (owner decision on #61, AGENTS.md): the core
// brand promise is rendered, exactly, directly after the h1 and before
// the supporting copy, and is visible once the hero has revealed.
test.describe('brand promise', () => {
  for (const width of [360, 1440]) {
    test(`directly after the h1, exactly and visible, at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await openAt(page, width, 800)
      const promise = hero(page).getByText(PROMISE, { exact: true })
      await expect(promise).toBeVisible()
      await expect(promise).toBeInViewport({ ratio: 1 })
      const order = await hero(page).evaluate((section) => {
        const h1 = section.querySelector('h1')!
        const next = h1.nextElementSibling!
        return {
          next: [next.tagName, next.textContent],
          after: next.nextElementSibling?.className,
          headings: section.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          opacity: getComputedStyle(next).opacity,
        }
      })
      expect(order).toEqual({
        next: ['P', PROMISE],
        after: 'hero__lead',
        headings: 1,
        opacity: '1',
      })
    })
  }
})

test.describe('type', () => {
  // The computed styles of the h1 and the supporting copy, with the same
  // properties of a probe set from the tokens inside the hero. The
  // supporting copy is body size below 64em (owner decision on #63) and
  // --text-body-lg from 64em.
  const typeStyles = (page: Page, leadSize: string) =>
    page.evaluate((leadSize) => {
      const section = document.querySelector('main > [data-header-overlay] .container')!
      const read = (element: Element) => {
        const s = getComputedStyle(element)
        return {
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          maxWidth: s.maxWidth,
          color: s.color,
        }
      }
      const probe = (css: string) => {
        const element = document.createElement('div')
        element.style.cssText = `position: absolute; ${css}`
        section.append(element)
        const value = read(element)
        element.remove()
        return value
      }
      return {
        heading: read(section.querySelector('h1')!),
        promise: read(section.querySelector('.hero__promise')!),
        lead: read(section.querySelector('.hero__lead')!),
        headingTokens: probe(
          'font-size: var(--text-hero); font-weight: var(--weight-light); line-height: var(--leading-display); max-width: var(--measure-display); color: var(--color-heading)',
        ),
        promiseTokens: probe(
          'font-size: var(--text-3xl); font-weight: var(--weight-light); line-height: var(--leading-snug); max-width: var(--measure); color: var(--color-heading)',
        ),
        leadTokens: probe(
          `font-size: var(${leadSize}); font-weight: var(--weight-regular); line-height: var(--leading-normal); max-width: var(--measure); color: var(--color-text)`,
        ),
        paper: probe('color: var(--paper)').color,
        graphite300: probe('color: var(--graphite-300)').color,
      }
    }, leadSize)

  for (const [width, size] of [
    [360, 44],
    [1024, 79],
    [1440, 96],
  ]) {
    test(`h1 about ${size}px at ${width}px, in the display tokens`, async ({ page }) => {
      await openAt(page, width, 800)
      const t = await typeStyles(page, width < 1024 ? '--text-base' : '--text-body-lg')

      expect(t.heading).toEqual(t.headingTokens)
      expect(t.promise).toEqual(t.promiseTokens)
      expect(t.lead).toEqual(t.leadTokens)
      // The brand promise is smaller than the h1 and larger than the
      // supporting copy, light, and in the heading's paper.
      expect(parseFloat(t.promise.fontSize)).toBeLessThan(parseFloat(t.heading.fontSize))
      expect(parseFloat(t.promise.fontSize)).toBeGreaterThan(parseFloat(t.lead.fontSize))
      expect(t.promise.fontWeight).toBe('300')
      expect(t.promise.color).toBe(t.paper)
      expect(Math.abs(parseFloat(t.heading.fontSize) - size)).toBeLessThanOrEqual(1)
      expect(t.heading.fontWeight).toBe('300')
      // Paper heading and graphite 300 copy, from .surface-dark.
      expect(t.heading.color).toBe(t.paper)
      expect(t.lead.color).toBe(t.graphite300)
    })
  }

  test('nothing in the hero is heavier than 500, and the buttons are 500', async ({ page }) => {
    await openAt(page, 1440, 900)
    const weights = await hero(page).evaluate((section) =>
      [section, ...section.querySelectorAll('*')].map((element) => ({
        tag: element.tagName,
        weight: Number(getComputedStyle(element).fontWeight),
      })),
    )
    expect(weights.filter(({ weight }) => weight > 500)).toEqual([])
    for (const link of [primary(page), secondary(page)]) {
      expect(await link.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('500')
    }
  })
})

test.describe('wrapping', () => {
  // Whether any word of the h1, the brand promise or the supporting copy
  // is split across lines, and how many lines each headline sentence
  // takes.
  const wrapping = (page: Page) =>
    page.evaluate(() => {
      const section = document.querySelector('main > [data-header-overlay]')!
      const broken: string[] = []
      for (const element of [section.querySelector('h1')!, ...section.querySelectorAll('p')]) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent ?? ''
          for (const match of text.matchAll(/\S+/g)) {
            const range = document.createRange()
            range.setStart(node, match.index)
            range.setEnd(node, match.index + match[0].length)
            const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))
            if (tops.size > 1) broken.push(match[0])
          }
        }
      }
      const lines = [...section.querySelectorAll('h1 > span')].map((span) => {
        const range = document.createRange()
        range.selectNodeContents(span)
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
      })
      const starts = [...section.querySelectorAll('h1 > span')].map((span) =>
        Math.round(span.getBoundingClientRect().left),
      )
      return {
        broken,
        lines,
        starts,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }
    })

  for (const width of [320, 360]) {
    test(`no word is broken, and each sentence starts a line, at ${width}px`, async ({ page }) => {
      await openAt(page, width, 800)
      const w = await wrapping(page)

      expect(w.broken).toEqual([])
      expect(w.starts[0]).toBe(w.starts[1])
      expect(w.lines.length).toBe(2)
      for (const count of w.lines) expect(count).toBeLessThanOrEqual(2)
    })
  }

  for (const width of [768, 1024, 1440]) {
    test(`each sentence fits on one line at ${width}px`, async ({ page }) => {
      await openAt(page, width, 900)
      const w = await wrapping(page)

      expect(w.lines).toEqual([1, 1])
      expect(w.broken).toEqual([])
    })
  }

  test('nothing overflows or is clipped at 320px with 200% text', async ({ page }) => {
    await openAt(page, 320, 800, '200%')
    const w = await wrapping(page)
    const m = await boxes(page)

    expect(w.scrollWidth).toBeLessThanOrEqual(w.innerWidth)
    expect(m.fits).toBe(true)
    expect(m.heading.top).toBeGreaterThanOrEqual(m.header.bottom)
  })
})

test.describe('calls to action', () => {
  for (const width of [320, 360, 768, 1024, 1440]) {
    test(`at least 44 x 44px, primary first, at ${width}px`, async ({ page }) => {
      await openAt(page, width, 800)
      const m = await boxes(page)

      for (const name of ['primary', 'secondary'] as const) {
        expect(m[name].width, name).toBeGreaterThanOrEqual(44)
        expect(m[name].height, name).toBeGreaterThanOrEqual(44)
      }
      // Side by side when they fit, the primary on the left; wrapped, it
      // is above.
      if (Math.abs(m.primary.top - m.secondary.top) < 1) {
        expect(m.primary.right).toBeLessThan(m.secondary.left)
      } else {
        expect(m.primary.bottom).toBeLessThanOrEqual(m.secondary.top)
      }
      expect(
        await primary(page).evaluate(
          (element, other) => !!(element.compareDocumentPosition(other!) & Node.DOCUMENT_POSITION_FOLLOWING),
          await secondary(page).elementHandle(),
        ),
      ).toBe(true)
    })
  }

  test('side by side at 1440px, wrapped at 360px', async ({ page }) => {
    await openAt(page, 1440, 900)
    let m = await boxes(page)
    expect(Math.abs(m.primary.top - m.secondary.top)).toBeLessThan(1)

    await openAt(page, 360, 800)
    m = await boxes(page)
    expect(m.secondary.top).toBeGreaterThan(m.primary.bottom)
  })

  // Teal only on the primary button (its fill) and the focus ring: no
  // text, border or fill in the hero is teal except the primary's fill.
  test('teal appears only on the primary button and the focus ring', async ({ page }) => {
    await openAt(page, 1440, 900)
    const found = await hero(page).evaluate((section) => {
      const resolve = (css: string) => {
        const probe = document.createElement('div')
        probe.style.color = css
        section.append(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      const teal = new Set(['--teal-50', '--teal-100', '--teal-200', '--teal-300', '--teal-400', '--teal-500', '--teal-600', '--teal-700', '--teal-800', '--teal-900'].map((name) => resolve(`var(${name})`)))
      const primaryLink = section.querySelector('a')
      const hits: string[] = []
      for (const element of [section, ...section.querySelectorAll('*')]) {
        const s = getComputedStyle(element)
        const label = `${element.tagName}.${element.className}`
        if (teal.has(s.color) && !element.closest('a')) hits.push(`${label} color`)
        if (teal.has(s.backgroundColor) && element !== primaryLink) hits.push(`${label} background`)
        for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
          if (teal.has(s[`border${side}Color`]) && s[`border${side}Style`] !== 'none' && element !== primaryLink) {
            hits.push(`${label} border`)
          }
        }
      }
      return {
        hits,
        primaryBackground: teal.has(getComputedStyle(primaryLink!).backgroundColor),
      }
    })

    expect(found.hits).toEqual([])
    expect(found.primaryBackground).toBe(true)
  })

  test('keyboard focus shows the teal 400 ring', async ({ page }) => {
    await openAt(page, 1440, 900)
    const tealRing = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.color = 'var(--teal-400)'
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    })

    await page.getByRole('banner').getByRole('link', { name: 'Discuss a project' }).focus()
    await pressTab(page)
    await expect(primary(page)).toBeFocused()
    const ring = await primary(page).evaluate((element) => {
      const s = getComputedStyle(element)
      return { visible: element.matches(':focus-visible'), outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}` }
    })
    expect(ring).toEqual({ visible: true, outline: `2px solid ${tealRing}` })
  })

  test('a mouse click on a hero call to action shows no focus ring', async ({ page }) => {
    await openAt(page, 1440, 900)
    await page.evaluate(() => {
      // Keep the page where it is, so the focus state can be read.
      for (const link of document.querySelectorAll('main > [data-header-overlay] a')) {
        link.addEventListener('click', (event) => event.preventDefault())
      }
    })
    for (const link of [primary(page), secondary(page)]) {
      await link.click()
      await expect(link).toBeFocused()
      expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(false)
      expect(await link.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')
    }
  })
})

test.describe('motion', () => {
  const arrowTranslate = (page: Page) =>
    primary(page).evaluate((element) => getComputedStyle(element.querySelector('.button__arrow')!).translate)

  test('no-preference: the primary arrow moves --cta-arrow-shift on hover and focus', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openAt(page, 1440, 900)
    const shift = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.width = 'var(--cta-arrow-shift)'
      document.body.append(probe)
      const value = getComputedStyle(probe).width
      probe.remove()
      return value
    })
    expect(await arrowTranslate(page)).toBe('none')

    await primary(page).hover()
    await expect.poll(() => arrowTranslate(page)).toBe(shift)
    await page.mouse.move(0, 899)
    await expect.poll(() => arrowTranslate(page)).toBe('none')

    await page.getByRole('banner').getByRole('link', { name: 'Discuss a project' }).focus()
    await pressTab(page)
    await expect(primary(page)).toBeFocused()
    await expect.poll(() => arrowTranslate(page)).toBe(shift)
  })

  test('reduce: the arrow stays still, and the hero has no animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openAt(page, 1440, 900)

    await primary(page).hover()
    expect(await arrowTranslate(page)).toBe('none')
    await page.mouse.move(0, 899)
    await page.getByRole('banner').getByRole('link', { name: 'Discuss a project' }).focus()
    await pressTab(page)
    await expect(primary(page)).toBeFocused()
    expect(await arrowTranslate(page)).toBe('none')

    // The buttons' own near-zero colour transitions (components.css) are
    // CSSTransitions; the hero adds no keyframe animation of its own.
    const motion = await hero(page).evaluate((section) => ({
      animations: section
        .getAnimations({ subtree: true })
        .filter((animation) => !(animation instanceof CSSTransition)).length,
      names: [section, ...section.querySelectorAll('*')]
        .map((element) => getComputedStyle(element).animationName)
        .filter((name) => name !== 'none'),
    }))
    expect(motion).toEqual({ animations: 0, names: [] })
  })
})

test.describe('technical grid', () => {
  test('exactly two on the page: the hero and the future-ready section', async ({ page }) => {
    await openAt(page, 1440, 900)
    const parents = await page.evaluate(() =>
      [...document.querySelectorAll('.technical-grid')].map((grid) => ({
        hero: grid.parentElement!.matches('main > [data-header-overlay]'),
        id: grid.parentElement!.id,
        first: grid.parentElement!.firstElementChild === grid,
        transform: getComputedStyle(grid).transform,
      })),
    )
    expect(parents).toEqual([
      { hero: true, id: '', first: true, transform: 'none' },
      { hero: false, id: 'future-ready', first: true, transform: 'none' },
    ])
  })

  // Row 1 of the screenshot at scroll 0, under the transparent header,
  // holds only graphite 900 and the grid line's colour, with a line
  // every --grid-size: the grid reaches the page's top with no seam or
  // paper gap, and its lines are even (no moiré).
  for (const width of [360, 1440]) {
    for (const scale of [1, 2]) {
      test(`row 1 is graphite 900 and even grid lines at ${width}px, device pixel ratio ${scale}`, async ({
        browser,
      }, testInfo) => {
        const context = await browser.newContext({
          viewport: { width, height: 800 },
          deviceScaleFactor: scale,
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        await page.goto(testInfo.project.use.baseURL ?? '/')
        await waitForFonts(page)
        await waitForScrollSettle(page)
        const { background, pitch } = await page.evaluate(() => {
          const probe = document.createElement('div')
          probe.style.cssText = 'position: absolute; color: var(--graphite-900); width: var(--grid-size)'
          document.body.append(probe)
          const s = getComputedStyle(probe)
          const value = { background: s.color, pitch: parseFloat(s.width) }
          probe.remove()
          return value
        })
        const shot = await page.screenshot({ clip: { x: 0, y: 0, width, height: 2 } })
        await page.screenshot({
          path: `${testInfo.project.outputDir}/screenshots/hero-${width}@${scale}.png`,
        })

        // Decode the PNG in a blank page.
        const decoder = await context.newPage()
        const row = await decoder.evaluate(
          async ({ data, y }) => {
            const image = new Image()
            image.src = `data:image/png;base64,${data}`
            await image.decode()
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            const context = canvas.getContext('2d')!
            context.drawImage(image, 0, 0)
            const pixels = context.getImageData(0, y, image.width, 1).data
            const out: string[] = []
            for (let i = 0; i < pixels.length; i += 4) {
              out.push(`rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`)
            }
            return out
          },
          { data: shot.toString('base64'), y: scale },
        )
        await context.close()

        const colours = [...new Set(row)]
        const other = colours.filter((colour) => colour !== background)
        expect(colours, JSON.stringify(colours)).toContain(background)
        // One line colour, and only on the columns where a line falls.
        expect(other.length, JSON.stringify(colours)).toBe(1)
        const lineColumns = row.flatMap((colour, x) => (colour === background ? [] : [x]))
        const expected: number[] = []
        for (let x = 0; x < width * scale; x += pitch * scale) {
          for (let i = 0; i < scale; i++) expected.push(Math.round(x) + i)
        }
        expect(lineColumns).toEqual(expected)
        // The line is close to the background (at most 1.25:1, checked in
        // scripts/contrast.test.ts), so it is faint, not a band.
        const channel = (colour: string) => colour.match(/\d+/g)!.map(Number)
        const [line, base] = [channel(other[0]), channel(background)]
        for (let i = 0; i < 3; i++) expect(Math.abs(line[i] - base[i])).toBeLessThanOrEqual(24)
      })
    }
  }
})
