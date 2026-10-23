import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'

// Guards the "no italics" finding in #22: the site loads no italic Inter
// face, so any italic text would be a slant the browser synthesises.
// scripts/italics.test.ts checks the stylesheets and inline styles, and
// e2e/italics.spec.ts checks the rendered page.

const ITALICS_POINTER = 'Italic text needs the real Inter italic face. See #40.'

// Browsers style all six as italic by default.
const ITALIC_ELEMENTS = ['em', 'i', 'cite', 'address', 'dfn', 'var'] as const

// The one exception: About's defined word (section D, #92), a dfn whose
// italic About.css resets to normal. scripts/italics.test.ts checks that
// reset, and e2e/italics.spec.ts the word's computed style.
const UPRIGHT_DFN = '#about dfn.about__word'

// jsdom has no matchMedia, which the header uses for its breakpoint.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('italics in the markup', () => {
  it('renders no element that browsers show in italic', () => {
    const { container } = render(<App />)

    const found = [...container.querySelectorAll(ITALIC_ELEMENTS.join(', '))]
      .filter((element) => !element.matches(UPRIGHT_DFN))
      .map(
      (element) =>
        `<${element.tagName.toLowerCase()}> "${(element.textContent ?? '').replace(/\s+/g, ' ').trim()}"`,
    )

    expect(found, `${ITALICS_POINTER}\nFound:\n- ${found.join('\n- ')}`).toEqual([])
  })

  it('makes the About word the only exception, once', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('dfn')).toHaveLength(1)
    expect(container.querySelectorAll(UPRIGHT_DFN)).toHaveLength(1)
  })
})
