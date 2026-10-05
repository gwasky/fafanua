import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hashIds, hashTarget } from './landOnHash.ts'

describe('hashIds', () => {
  it('names nothing for an empty hash', () => {
    expect(hashIds('')).toEqual([])
    expect(hashIds('#')).toEqual([])
  })

  it('names the raw fragment, without the #', () => {
    expect(hashIds('#services')).toEqual(['services'])
    expect(hashIds('#Services')).toEqual(['Services'])
    expect(hashIds('#a.b')).toEqual(['a.b'])
    expect(hashIds('#1')).toEqual(['1'])
  })

  it('names the raw fragment first, then its percent-decoded form', () => {
    expect(hashIds('#how%2Dwe%2Dwork')).toEqual(['how%2Dwe%2Dwork', 'how-we-work'])
    expect(hashIds('#contact%20')).toEqual(['contact%20', 'contact '])
    expect(hashIds('#%22%3E%3Cimg%20src%3Dx%3E')).toEqual([
      '%22%3E%3Cimg%20src%3Dx%3E',
      '"><img src=x>',
    ])
  })

  it('names only the raw fragment when the percent-encoding is malformed', () => {
    expect(hashIds('#%E0%A4%A')).toEqual(['%E0%A4%A'])
    expect(hashIds('#half%')).toEqual(['half%'])
  })
})

describe('hashTarget', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
  })

  /**
   * jsdom lays nothing out, so here an element has a box unless it, or
   * an ancestor, is hidden.
   */
  function rendered() {
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
      const rects = this.closest('[hidden]') ? [] : [new DOMRect(0, 0, 10, 10)]
      return rects as unknown as DOMRectList
    })
  }

  function add(id: string, hidden = false) {
    const element = document.createElement('section')
    element.id = id
    element.hidden = hidden
    document.body.append(element)
    return element
  }

  it('finds the element with the raw id', () => {
    rendered()
    const contact = add('contact')

    expect(hashTarget(document, '#contact')).toBe(contact)
  })

  it('finds the element with the decoded id', () => {
    rendered()
    const process = add('how-we-work')

    expect(hashTarget(document, '#how%2Dwe%2Dwork')).toBe(process)
  })

  it('prefers the raw id to the decoded one', () => {
    rendered()
    const raw = add('a%2Db')
    add('a-b')

    expect(hashTarget(document, '#a%2Db')).toBe(raw)
  })

  it('finds nothing for ids that match no element, without throwing', () => {
    rendered()
    add('services')

    for (const hash of ['', '#', '#nope', '#Services', '#a.b', '#1', '#%E0%A4%A', '#contact%20']) {
      expect(hashTarget(document, hash), hash).toBeNull()
    }
  })

  it('finds nothing for an element that is not rendered', () => {
    rendered()
    add('panel', true).append(Object.assign(document.createElement('p'), { id: 'inside' }))
    add('shown')

    expect(hashTarget(document, '#panel')).toBeNull()
    expect(hashTarget(document, '#inside')).toBeNull()
    expect(hashTarget(document, '#shown')).not.toBeNull()
  })
})

describe('landOnHash', () => {
  let frames: FrameRequestCallback[]
  let fontsLoaded: () => void
  let scrolls: { id: string; options: unknown }[]
  let top: number
  let scrollY: number

  /** Runs the queued animation frames, once each. */
  function frame(count = 1) {
    for (let i = 0; i < count; i++) {
      const queued = frames
      frames = []
      for (const callback of queued) callback(0)
    }
  }

  /** A fresh copy of the module, since it lands only once per page. */
  async function load(hash: string, type = 'navigate') {
    vi.resetModules()
    history.replaceState(null, '', `/${hash}`)
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { type } as unknown as PerformanceEntry,
    ])
    return import('./landOnHash.ts')
  }

  beforeEach(() => {
    frames = []
    scrolls = []
    top = 500
    scrollY = 0
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY })
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise<void>((resolve) => (fontsLoaded = resolve)) },
    })
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([
      new DOMRect(0, 0, 10, 10),
    ] as unknown as DOMRectList)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, top, 10, 10),
    )
    Element.prototype.scrollIntoView = function (this: Element, options?: unknown) {
      scrolls.push({ id: this.id, options })
    }
    const contact = document.createElement('section')
    contact.id = 'contact'
    document.body.append(contact)
  })

  afterEach(() => {
    document.body.replaceChildren()
    history.replaceState(null, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete (document as { fonts?: unknown }).fonts
    delete (window as { scrollY?: unknown }).scrollY
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
  })

  const instant = { id: 'contact', options: { behavior: 'instant' } }

  it('scrolls instantly to the target on a fresh load, before the fonts load', async () => {
    const { landOnHash } = await load('#contact')
    landOnHash()

    expect(scrolls).toEqual([instant])
  })

  it('scrolls once more after the fonts load and the target stays put for STABLE_FRAMES frames', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    frame(5)
    expect(scrolls).toHaveLength(1)

    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES)
    expect(scrolls, 'still settling').toHaveLength(1)
    frame()
    expect(scrolls).toEqual([instant, instant])
    frame(5)
    expect(frames, 'stops checking').toEqual([])
    expect(scrolls).toHaveLength(2)
  })

  it('waits while the target is still moving after the fonts load', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    fontsLoaded()
    await Promise.resolve()

    frame(2)
    top = 466
    frame(STABLE_FRAMES)
    expect(scrolls).toHaveLength(1)
    frame()
    expect(scrolls).toEqual([instant, instant])
  })

  it.each(['wheel', 'touchstart', 'keydown', 'pointerdown'])(
    'does not scroll again after %s input since landing',
    async (type) => {
      const { landOnHash, STABLE_FRAMES } = await load('#contact')
      landOnHash()
      window.dispatchEvent(new Event(type))
      fontsLoaded()
      await Promise.resolve()
      frame(STABLE_FRAMES + 5)

      expect(scrolls).toEqual([instant])
      expect(frames).toEqual([])
    },
  )

  it('does not scroll again after input while the target is settling', async () => {
    const { landOnHash } = await load('#contact')
    landOnHash()
    fontsLoaded()
    await Promise.resolve()
    frame(2)
    document.body.dispatchEvent(new Event('wheel', { bubbles: true }))
    frame(10)

    expect(scrolls).toEqual([instant])
  })

  /**
   * Scrolls the page by a distance with no input event, as find-in-page,
   * a screen reader or a script would, moving the target the other way.
   */
  function scrollBy(distance: number) {
    scrollY += distance
    top -= distance
  }

  it('does not scroll again when the page has scrolled away before the fonts load', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    scrollBy(-1500)
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 5)

    expect(scrolls).toEqual([instant])
    expect(frames, 'stops checking').toEqual([])
  })

  it('does not scroll again when the page scrolls away while the target is settling', async () => {
    const { landOnHash } = await load('#contact')
    landOnHash()
    fontsLoaded()
    await Promise.resolve()
    frame(2)
    scrollBy(800)
    frame(10)

    expect(scrolls).toEqual([instant])
    expect(frames).toEqual([])
  })

  it('does not scroll again after a scroll away and part of the way back', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    scrollBy(400)
    scrollBy(-398)
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 5)

    expect(scrolls).toEqual([instant])
  })

  it('still scrolls again after a scroll of a pixel or less', async () => {
    const { landOnHash, STABLE_FRAMES, MOVE_TOLERANCE } = await load('#contact')
    landOnHash()
    scrollBy(MOVE_TOLERANCE)
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 1)

    expect(scrolls).toEqual([instant, instant])
  })

  it('still scrolls again when only the target moves, as a font swap does without scroll anchoring', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    top = 466
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 1)

    expect(scrolls).toEqual([instant, instant])
  })

  it('still scrolls again when the scroll position changes but the target stays in place, as scroll anchoring does', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    scrollY = 34
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 1)

    expect(scrolls).toEqual([instant, instant])
  })

  it('still scrolls again after the browser scrolls back to the target and the target then shifts', async () => {
    // Measured in WebKit at 360px for #managed-services: the font swap
    // moves the target down, WebKit's fragment scroll follows it, then
    // the heading re-balances and moves it up 34px (#62).
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    top = 522
    frame()
    scrollY = 22
    top = 500
    frame()
    fontsLoaded()
    await Promise.resolve()
    top = 466
    frame(STABLE_FRAMES + 1)

    expect(scrolls).toEqual([instant, instant])
  })

  it('still scrolls again while the browser glides back towards the target', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    top = 560
    frame()
    for (const y of [20, 40, 55, 60]) {
      scrollY = y
      top = 560 - y
      frame()
    }
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 1)

    expect(scrolls).toEqual([instant, instant])
  })

  it('does not scroll again after a scroll away in the same frame as a font swap', async () => {
    const { landOnHash, STABLE_FRAMES } = await load('#contact')
    landOnHash()
    top = 466
    scrollBy(1500)
    fontsLoaded()
    await Promise.resolve()
    frame(STABLE_FRAMES + 5)

    expect(scrolls).toEqual([instant])
  })

  it.each(['reload', 'back_forward'])('leaves a %s to the browser', async (type) => {
    const { landOnHash } = await load('#contact', type)
    landOnHash()
    fontsLoaded()
    await Promise.resolve()
    frame(10)

    expect(scrolls).toEqual([])
  })

  it('does nothing for a hash that names nothing, and runs only once', async () => {
    let { landOnHash } = await load('#nope')
    landOnHash()
    expect(scrolls).toEqual([])
    ;({ landOnHash } = await load('#contact'))
    landOnHash()
    landOnHash()
    fontsLoaded()
    await Promise.resolve()
    frame(10)
    expect(scrolls).toEqual([instant, instant])
  })
})
