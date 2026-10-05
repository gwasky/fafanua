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
    unmount()
    expect(observer().disconnected).toBe(true)
    expect(removed).toHaveBeenCalledWith('focusin', expect.any(Function), true)
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
