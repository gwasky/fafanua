import {
  expect,
  type BrowserContext,
  type Page,
  type Request,
} from '@playwright/test'
import { test } from './fixtures.ts'

// Checks that the production preview downloads the Inter woff2 once per
// page load, from its own origin, through the preload link, and that the
// page requests nothing from any other host. Runs once, in the chromium
// project: the CDP calls are Chromium only (#39).

/**
 * The one font file the page may download. #40 changes this to two
 * files, upright and italic.
 */
const FONT_FILE = /^\/assets\/inter-latin-wght-normal-[\w-]+\.woff2$/

// Chromium reports a preload that was not used about 3 seconds after load.
const AFTER_LOAD_MS = 4_000
// How long the network must be idle to count as quiet.
const QUIET_MS = 500

const FONT_EXTENSION = /\.(woff2|woff|ttf|otf)$/i

/** A font request: resource type font, or a font file extension. */
function isFontRequest(request: Request) {
  return (
    request.resourceType() === 'font' ||
    FONT_EXTENSION.test(new URL(request.url()).pathname)
  )
}

type CdpRequest = { url: string; type?: string; fromCache: boolean }

/**
 * Records every request on the browser context, every WebSocket and
 * every console message on the page and, through CDP, whether each
 * request was served from the browser cache. Start it before page.goto.
 * Each load is the slice of the records that load() made.
 */
class Recorder {
  requests: Request[] = []
  sockets: string[] = []
  console: string[] = []
  cdp = new Map<string, CdpRequest>()
  private inFlight = new Set<Request>()
  private lastActivity = Date.now()
  private marks = { requests: 0, sockets: 0, console: 0, cdp: 0 }

  readonly page: Page

  private constructor(page: Page) {
    this.page = page
  }

  static async start(page: Page, context: BrowserContext, { cacheDisabled }: { cacheDisabled: boolean }) {
    const session = await context.newCDPSession(page)
    await session.send('Network.enable')
    await session.send('Network.setCacheDisabled', { cacheDisabled })
    const recorder = new Recorder(page)

    const touch = () => {
      recorder.lastActivity = Date.now()
    }
    context.on('request', (request) => {
      recorder.requests.push(request)
      recorder.inFlight.add(request)
      touch()
    })
    const done = (request: Request) => {
      recorder.inFlight.delete(request)
      touch()
    }
    context.on('requestfinished', done)
    context.on('requestfailed', done)
    page.on('websocket', (socket) => {
      recorder.sockets.push(socket.url())
      touch()
    })
    page.on('console', (message) => {
      recorder.console.push(`${message.type()}: ${message.text()}`)
    })

    session.on('Network.requestWillBeSent', ({ requestId, request, type }) => {
      const known = recorder.cdp.get(requestId)
      recorder.cdp.set(requestId, { url: request.url, type, fromCache: known?.fromCache ?? false })
    })
    session.on('Network.requestServedFromCache', ({ requestId }) => {
      const known = recorder.cdp.get(requestId)
      if (known) known.fromCache = true
    })
    // A memory-cache hit is reported through requestServedFromCache; this
    // protocol version has no fromMemoryCache on the response.
    session.on('Network.responseReceived', ({ requestId, response }) => {
      const known = recorder.cdp.get(requestId)
      if (known && response.fromDiskCache) known.fromCache = true
    })
    return recorder
  }

  /** Starts a new load: everything recorded from here on belongs to it. */
  private begin() {
    this.marks = {
      requests: this.requests.length,
      sockets: this.sockets.length,
      console: this.console.length,
      cdp: this.cdp.size,
    }
  }

  /**
   * Runs a navigation, then waits for the load event, document.fonts.ready,
   * a scroll to the footer with the network gone quiet, and at least
   * AFTER_LOAD_MS after load. Returns what this load recorded.
   */
  async load(navigate: () => Promise<unknown>) {
    this.begin()
    await navigate()
    const loadedAt = Date.now()
    await this.page.evaluate(async () => {
      await document.fonts.ready
    })
    await this.page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await this.waitForQuiet()
    const remaining = AFTER_LOAD_MS - (Date.now() - loadedAt)
    if (remaining > 0) await this.page.waitForTimeout(remaining)
    await this.waitForQuiet()
    return this.snapshot()
  }

  /** Waits until no request is in flight and none has started for QUIET_MS. */
  private async waitForQuiet() {
    await expect
      .poll(() => this.inFlight.size === 0 && Date.now() - this.lastActivity >= QUIET_MS, {
        intervals: [100],
        timeout: 10_000,
      })
      .toBe(true)
  }

  private snapshot(): Load {
    return {
      requests: this.requests.slice(this.marks.requests),
      sockets: this.sockets.slice(this.marks.sockets),
      console: this.console.slice(this.marks.console),
      cdp: [...this.cdp.values()].slice(this.marks.cdp),
    }
  }
}

type Load = {
  requests: Request[]
  sockets: string[]
  console: string[]
  cdp: CdpRequest[]
}

/** The font requests a load made, with a failure message listing them. */
function fontRequests(load: Load) {
  const fonts = load.requests.filter(isFontRequest)
  const message = `font requests:\n- ${fonts.map((request) => request.url()).join('\n- ')}`
  return { fonts, message }
}

/** Console messages of any type that mention a preload. */
function preloadMessages(load: Load) {
  return load.console.filter((text) => /preload/i.test(text))
}

/**
 * Every http(s) or ws(s) request and WebSocket not on the preview origin,
 * grouped by host.
 */
function offOrigin(load: Load, origin: string) {
  const byHost: Record<string, string[]> = {}
  for (const url of [...load.requests.map((request) => request.url()), ...load.sockets]) {
    const parsed = new URL(url)
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) continue
    // ws: on the same host and port would still be a different origin.
    if (parsed.origin === origin) continue
    ;(byHost[parsed.host] ??= []).push(url)
  }
  return byHost
}

/**
 * Asserts that a load requested nothing from another host, for example
 * fonts.googleapis.com or fonts.gstatic.com, and made at least `minimum`
 * requests, so the check cannot pass on an empty list. It checks requests,
 * so the production URLs in the markup (canonical, og:image,
 * twitter:image, JSON-LD) do not count.
 */
function expectSameOrigin(load: Load, origin: string, minimum: number) {
  const urls = [...load.requests.map((request) => request.url()), ...load.sockets]
  expect(urls.length, `requests recorded:\n- ${urls.join('\n- ')}`).toBeGreaterThanOrEqual(minimum)

  const offending = offOrigin(load, origin)
  const report = Object.entries(offending)
    .map(([host, list]) => `${host}:\n  - ${list.join('\n  - ')}`)
    .join('\n')
  expect(offending, `requests to other hosts than ${origin}:\n${report}`).toEqual({})
}

function expectNoPreloadMessages(load: Load) {
  const messages = preloadMessages(load)
  expect(messages, `console messages about a preload:\n- ${messages.join('\n- ')}`).toEqual([])
}

/** The page's font preload hrefs, resolved to absolute URLs. */
const preloadHrefs = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]')].map(
      (link) => link.href,
    ),
  )

/** The initiator type of each resource-timing entry for a .woff2. */
const woff2Initiators = (page: Page) =>
  page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((entry) => new URL(entry.name).pathname.endsWith('.woff2'))
      .map((entry) => (entry as PerformanceResourceTiming).initiatorType),
  )

/**
 * The status of each "Inter Variable" FontFace with style normal. Not
 * document.fonts.check(), which is true even when nothing loaded (#22).
 */
const interFaces = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready
    return [...document.fonts]
      .filter((face) => face.family.replace(/^["']|["']$/g, '') === 'Inter Variable')
      .filter((face) => face.style === 'normal')
      .map((face) => face.status)
  })

/**
 * The checks for a load with the cache disabled: one font request, for
 * the preloaded woff2 on the preview origin, served with the right
 * headers, fetched through the preload, and loaded as the Inter face.
 * Returns the font URL.
 */
async function expectFontLoadedOnce(page: Page, load: Load, origin: string) {
  const { fonts, message } = fontRequests(load)
  expect(fonts, message).toHaveLength(1)
  const font = fonts[0]
  const url = new URL(font.url())
  expect(url.origin, message).toBe(origin)
  expect(url.pathname, message).toMatch(FONT_FILE)

  const response = await font.response()
  expect(response, message).not.toBeNull()
  expect(response?.status()).toBe(200)
  const headers = await response!.allHeaders()
  expect(headers['content-type']).toBe('font/woff2')
  expect(headers['cache-control']).toContain('max-age=31536000')
  expect(headers['cache-control']).toContain('immutable')

  expect(await preloadHrefs(page)).toEqual([font.url()])
  expect(await woff2Initiators(page), 'initiatorType of the .woff2 resource entries').toEqual([
    'link',
  ])
  expect(await interFaces(page), '"Inter Variable" normal FontFace statuses').toEqual(['loaded'])

  expectNoPreloadMessages(load)
  expectSameOrigin(load, origin, 4)
  return font.url()
}

test.describe('web font', () => {
  test('cold load and reload fetch the preloaded woff2 once each, from the site only', async ({
    page,
    context,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? '').origin
    const recorder = await Recorder.start(page, context, { cacheDisabled: true })

    const first = await recorder.load(() => page.goto('/', { waitUntil: 'load' }))
    const fontUrl = await expectFontLoadedOnce(page, first, origin)

    const second = await recorder.load(() => page.reload({ waitUntil: 'load' }))
    expect(await expectFontLoadedOnce(page, second, origin)).toBe(fontUrl)
  })

  test('a reload with the cache enabled does not download the woff2 again', async ({
    page,
    context,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? '').origin
    const recorder = await Recorder.start(page, context, { cacheDisabled: false })

    const first = await recorder.load(() => page.goto('/', { waitUntil: 'load' }))
    await expectFontLoadedOnce(page, first, origin)

    const reload = await recorder.load(() => page.reload({ waitUntil: 'load' }))
    const { fonts, message } = fontRequests(reload)
    // Each font request on the reload, if any, was answered by the cache.
    // The main document may be 200 or 304, so its status is not checked.
    const notCached = fonts
      .map((request) => request.url())
      .filter(
        (url) =>
          !reload.cdp.some((entry) => entry.url === url && entry.fromCache) ||
          reload.cdp.some((entry) => entry.url === url && !entry.fromCache),
      )
    expect(notCached, `font requests not served from the cache\n${message}`).toEqual([])
    const cdpFonts = reload.cdp.filter(
      (entry) => entry.type === 'Font' || FONT_EXTENSION.test(new URL(entry.url).pathname),
    )
    expect(
      cdpFonts.filter((entry) => !entry.fromCache).map((entry) => entry.url),
      'font requests CDP saw going to the network',
    ).toEqual([])

    expect(await interFaces(page), '"Inter Variable" normal FontFace statuses').toEqual(['loaded'])
    expectNoPreloadMessages(reload)
    // Only the document is sure to be requested again on a reload.
    expectSameOrigin(reload, origin, 1)
  })

  test('the checks catch a preload without crossorigin', async ({ page, context, baseURL }) => {
    // Fonts are fetched in CORS mode, so a preload without crossorigin
    // does not match the font request and the woff2 is fetched twice.
    const origin = new URL(baseURL ?? '').origin
    const documentUrl = new URL('/', baseURL).href
    let stripped = false
    await page.route(documentUrl, async (route) => {
      const response = await route.fetch()
      const html = await response.text()
      const changed = html.replace(/(<link rel="preload"[^>]*as="font"[^>]*?) crossorigin>/, '$1>')
      stripped = changed !== html
      await route.fulfill({ response, body: changed })
    })
    const recorder = await Recorder.start(page, context, { cacheDisabled: true })

    const load = await recorder.load(() => page.goto('/', { waitUntil: 'load' }))
    expect(stripped, 'crossorigin removed from the font preload').toBe(true)

    const { fonts, message } = fontRequests(load)
    expect(
      fonts.filter((request) => new URL(request.url()).pathname.endsWith('.woff2')),
      message,
    ).toHaveLength(2)
    expect(preloadMessages(load), load.console.join('\n')).toContainEqual(
      expect.stringMatching(/preload/i),
    )
    expectSameOrigin(load, origin, 4)
  })
})
