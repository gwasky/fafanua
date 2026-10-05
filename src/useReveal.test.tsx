import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LINE_THRESHOLD, REVEAL_STATE, startReveal, useReveal } from './useReveal.ts'

// A stand-in for IntersectionObserver: records every instance, what it
// observes, and lets a test report entries to its callback.
class FakeObserver {
  static instances: FakeObserver[] = []
  readonly observed = new Set<Element>()
  disconnected = false

  readonly callback: IntersectionObserverCallback
  readonly options?: IntersectionObserverInit

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    FakeObserver.instances.push(this)
  }

  observe(element: Element) {
    this.observed.add(element)
  }

  unobserve(element: Element) {
    this.observed.delete(element)
  }

  disconnect() {
    this.disconnected = true
    this.observed.clear()
  }

  /** Reports one entry per [element, ratio], as the browser would. */
  report(...entries: [Element, number][]) {
    this.callback(
      entries.map(
        ([target, ratio]) =>
          ({ target, intersectionRatio: ratio, isIntersecting: ratio > 0 }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    )
  }
}

function setMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query === '(prefers-reduced-motion: reduce)',
      media: query,
    })),
  )
}

function Page() {
  useReveal()
  return (
    <main>
      <section data-reveal="section" aria-label="One">
        <div className="container">
          <div data-reveal="line" />
          <button type="button">Inside</button>
        </div>
      </section>
      <section data-reveal="section" aria-label="Two">
        <p>Two</p>
      </section>
      <section aria-label="Unmarked" />
    </main>
  )
}

const sections = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('[data-reveal="section"]')]
const line = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-reveal="line"]')!
const observer = () => {
  expect(FakeObserver.instances).toHaveLength(1)
  return FakeObserver.instances[0]
}

beforeEach(() => {
  FakeObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  setMotion(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useReveal', () => {
  it('creates one observer for every marked element, and nothing else', () => {
    const { container } = render(<Page />)
    const [one, two] = sections(container)
    expect([...observer().observed]).toEqual([one, line(container), two])
    expect(observer().options?.threshold).toEqual([0, LINE_THRESHOLD])
  })

  it('hides nothing before the observer reports', () => {
    const { container } = render(<Page />)
    expect(container.querySelector(`[${REVEAL_STATE}]`)).toBeNull()
  })

  it('leaves an element in view on load in its final state, and unobserves it', () => {
    const { container } = render(<Page />)
    const [one, two] = sections(container)
    observer().report([one, 0.3], [two, 0])
    expect(one).not.toHaveAttribute(REVEAL_STATE)
    expect(two).toHaveAttribute(REVEAL_STATE, 'hidden')
    expect(observer().observed.has(one)).toBe(false)
    expect(observer().observed.has(two)).toBe(true)
  })

  it('reveals a hidden section once, the first time it intersects, then unobserves it', () => {
    const { container } = render(<Page />)
    const [, two] = sections(container)
    observer().report([two, 0])
    observer().report([two, 0.01])
    expect(two).toHaveAttribute(REVEAL_STATE, 'in')
    expect(observer().observed.has(two)).toBe(false)
    // Leaving the viewport again does not hide it.
    observer().report([two, 0])
    expect(two).toHaveAttribute(REVEAL_STATE, 'in')
  })

  it('draws the line only once at least half of it is in view', () => {
    const { container } = render(<Page />)
    const rail = line(container)
    observer().report([rail, 0])
    expect(rail).toHaveAttribute(REVEAL_STATE, 'hidden')
    observer().report([rail, 0.2])
    expect(rail).toHaveAttribute(REVEAL_STATE, 'hidden')
    observer().report([rail, LINE_THRESHOLD])
    expect(rail).toHaveAttribute(REVEAL_STATE, 'in')
    expect(observer().observed.has(rail)).toBe(false)
  })

  // A stand-in for a running reveal transition on the section's
  // .container, and a way to end it.
  function runningReveal(element: Element) {
    let end!: () => void
    const finished = new Promise<void>((resolve) => {
      end = resolve
    })
    const animation = { finished } as unknown as Animation
    Object.defineProperty(element, 'getAnimations', {
      configurable: true,
      value: () => [animation],
    })
    return () => {
      Object.defineProperty(element, 'getAnimations', { configurable: true, value: () => [] })
      end()
    }
  }

  it('holds the line until its section has finished revealing, then draws it', async () => {
    const { container } = render(<Page />)
    const [one] = sections(container)
    const rail = line(container)
    observer().report([one, 0], [rail, 0])
    const end = runningReveal(one.querySelector('.container')!)
    // The section and the line come into view together.
    observer().report([one, 0.6], [rail, 1])
    expect(one).toHaveAttribute(REVEAL_STATE, 'in')
    expect(rail).toHaveAttribute(REVEAL_STATE, 'hidden')
    expect(observer().observed.has(rail)).toBe(false)
    await Promise.resolve()
    expect(rail).toHaveAttribute(REVEAL_STATE, 'hidden')
    end()
    await vi.waitFor(() => expect(rail).toHaveAttribute(REVEAL_STATE, 'in'))
  })

  it('draws the line once a reveal is cut short, and never after unmount', async () => {
    const { container, unmount } = render(<Page />)
    const [one] = sections(container)
    const rail = line(container)
    observer().report([one, 0], [rail, 0])
    let fail!: () => void
    const finished = new Promise<void>((_resolve, reject) => {
      fail = () => reject(new DOMException('cancelled', 'AbortError'))
    })
    Object.defineProperty(one.querySelector('.container')!, 'getAnimations', {
      configurable: true,
      value: () => [{ finished }],
    })
    observer().report([one, 0.6], [rail, 1])
    expect(rail).toHaveAttribute(REVEAL_STATE, 'hidden')
    fail()
    await vi.waitFor(() => expect(rail).toHaveAttribute(REVEAL_STATE, 'in'))

    // A second page, unmounted while its line is held, never draws it.
    unmount()
    FakeObserver.instances = []
    const again = render(<Page />)
    const [first] = sections(again.container)
    const held = line(again.container)
    observer().report([first, 0], [held, 0])
    const end = runningReveal(first.querySelector('.container')!)
    observer().report([first, 0.6], [held, 1])
    again.unmount()
    expect(held).not.toHaveAttribute(REVEAL_STATE)
    end()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(held).not.toHaveAttribute(REVEAL_STATE)
  })

  describe('a hash change to an element inside a section', () => {
    function HashPage() {
      useReveal()
      return (
        <main>
          <section id="one" data-reveal="section" aria-label="One">
            <div className="container">
              <h2 id="one-heading">One</h2>
            </div>
          </section>
        </main>
      )
    }

    // jsdom lays nothing out, so every element has no client rects, which
    // hashTarget reads as not rendered: give the targets one.
    function setUp() {
      const view = render(<HashPage />)
      const section = view.container.querySelector<HTMLElement>('#one')!
      const heading = view.container.querySelector<HTMLElement>('#one-heading')!
      for (const element of [section, heading]) {
        vi.spyOn(element, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
      }
      const scrolled = vi.fn()
      heading.scrollIntoView = scrolled
      section.scrollIntoView = vi.fn()
      return { ...view, section, heading, scrolled }
    }

    afterEach(() => {
      history.replaceState(null, '', location.pathname)
    })

    function changeHash(hash: string) {
      history.replaceState(null, '', hash)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }

    it('shows a hidden section at once and scrolls to the target again', () => {
      const { section, scrolled } = setUp()
      observer().report([section, 0])
      changeHash('#one-heading')
      expect(section).not.toHaveAttribute(REVEAL_STATE)
      expect(observer().observed.has(section)).toBe(false)
      expect(scrolled).toHaveBeenCalledTimes(1)
      expect(scrolled).toHaveBeenCalledWith()
    })

    it('cuts short a reveal under way and scrolls again', () => {
      const { section, scrolled } = setUp()
      observer().report([section, 0])
      observer().report([section, 0.1])
      runningReveal(section.querySelector('.container')!)
      changeHash('#one-heading')
      expect(section).not.toHaveAttribute(REVEAL_STATE)
      expect(scrolled).toHaveBeenCalledTimes(1)
    })

    it('does nothing for a revealed section, a section\'s own id or an unknown hash', () => {
      const { section, scrolled } = setUp()
      observer().report([section, 0])
      changeHash('#one')
      changeHash('#nothing')
      expect(section).toHaveAttribute(REVEAL_STATE, 'hidden')
      observer().report([section, 0.1])
      changeHash('#one-heading')
      expect(section).toHaveAttribute(REVEAL_STATE, 'in')
      expect(scrolled).not.toHaveBeenCalled()
      expect(section.scrollIntoView).not.toHaveBeenCalled()
    })

    it('stops listening on unmount', () => {
      const { section, scrolled, unmount } = setUp()
      observer().report([section, 0])
      unmount()
      changeHash('#one-heading')
      expect(scrolled).not.toHaveBeenCalled()
    })
  })

  it('shows a hidden section at once, with no transition state, when focus enters it', () => {
    const { container, getByRole } = render(<Page />)
    const [one] = sections(container)
    observer().report([one, 0])
    expect(one).toHaveAttribute(REVEAL_STATE, 'hidden')
    getByRole('button', { name: 'Inside' }).focus()
    expect(one).not.toHaveAttribute(REVEAL_STATE)
    expect(observer().observed.has(one)).toBe(false)
  })

  it('cuts short a reveal under way when focus enters the section', () => {
    const { container, getByRole } = render(<Page />)
    const [one] = sections(container)
    observer().report([one, 0])
    observer().report([one, 0.1])
    expect(one).toHaveAttribute(REVEAL_STATE, 'in')
    getByRole('button', { name: 'Inside' }).focus()
    expect(one).not.toHaveAttribute(REVEAL_STATE)
  })

  it('disconnects, stops listening for focus and shows anything hidden on unmount', () => {
    const { container, unmount } = render(<Page />)
    const [one, two] = sections(container)
    observer().report([one, 0], [two, 0])
    const removed = vi.spyOn(document, 'removeEventListener')
    const removedFromWindow = vi.spyOn(window, 'removeEventListener')
    unmount()
    expect(observer().disconnected).toBe(true)
    expect(removed).toHaveBeenCalledWith('focusin', expect.any(Function), true)
    expect(removedFromWindow).toHaveBeenCalledWith('hashchange', expect.any(Function))
    expect(one).not.toHaveAttribute(REVEAL_STATE)
    expect(two).not.toHaveAttribute(REVEAL_STATE)
  })

  it('under reduced motion creates no observer and hides nothing', () => {
    setMotion(true)
    const { container } = render(<Page />)
    expect(FakeObserver.instances).toHaveLength(0)
    expect(container.querySelector(`[${REVEAL_STATE}]`)).toBeNull()
  })

  it('without IntersectionObserver hides nothing and does not throw', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(<Page />)
    expect(container.querySelector(`[${REVEAL_STATE}]`)).toBeNull()
  })

  it('on a reload or a history traversal creates no observer and hides nothing', () => {
    for (const type of ['reload', 'back_forward']) {
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        { type } as PerformanceNavigationTiming,
      ])
      const { container, unmount } = render(<Page />)
      expect(FakeObserver.instances).toHaveLength(0)
      expect(container.querySelector(`[${REVEAL_STATE}]`)).toBeNull()
      unmount()
    }
  })

  it('runs on a fresh navigation', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { type: 'navigate' } as PerformanceNavigationTiming,
    ])
    render(<Page />)
    expect(FakeObserver.instances).toHaveLength(1)
  })

  it('returns a no-op stop when it cannot run', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    expect(startReveal()).toBeTypeOf('function')
  })
})
