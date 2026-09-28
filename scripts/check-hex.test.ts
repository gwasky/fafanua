// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { findColours } from './check-hex.mjs'

const matches = (text: string) =>
  findColours(text).map((result: { match: string }) => result.match)

describe('findColours', () => {
  it.each([
    ['3-digit', 'color: #fff;', '#fff'],
    ['4-digit', 'color: #ffff;', '#ffff'],
    ['6-digit upper case', "const c = '#1C2024'", '#1C2024'],
    ['6-digit lower case', 'color: #1c2024;', '#1c2024'],
    ['8-digit', 'color: #1c2024cc;', '#1c2024cc'],
    ['8-digit upper case', 'color: #1C2024CC;', '#1C2024CC'],
    ['3-digit upper case', "style={{ color: '#ABC' }}", '#ABC'],
  ])('flags a %s hex value', (_label, text, expected) => {
    expect(matches(text)).toEqual([expected])
  })

  it('flags a hex value inside a CSS comment', () => {
    expect(matches('/* was #1C2024 */')).toEqual(['#1C2024'])
  })

  it('flags a hex value inside a TypeScript comment', () => {
    expect(matches('// brand colour #16978a')).toEqual(['#16978a'])
  })

  it.each(['rgb(', 'rgba(', 'hsl(', 'hsla(', 'RGB(', 'Hsla('])(
    'flags the %s colour function',
    (fn) => {
      expect(matches(`color: ${fn}0 0 0);`)).toEqual([fn])
    },
  )

  it.each([
    'href="#top"',
    'href="#main"',
    'href="#services"',
    'href="#how-we-work"',
    'href="#about"',
    'href="#contact"',
    'href="#future-ready"',
  ])('does not flag the in-page anchor %s', (text) => {
    expect(findColours(text)).toEqual([])
  })

  it.each([
    ['5-digit hex-like text', '#abcde'],
    ['7-digit hex-like text', '#abcdef1'],
    ['a longer run of hex digits', '#1c2024cc1'],
    ['a hyphenated id', 'href="#face-value"'],
    ['an HTML numeric entity', '&#123;'],
    ['an issue reference', 'Closes #12'],
    ['a function name ending in rgb', 'toRgb(value)'],
    ['a CSS variable', 'color: var(--color-text);'],
  ])('does not flag %s', (_label, text) => {
    expect(findColours(text)).toEqual([])
  })

  it('reports the line and column of each match', () => {
    const text = ['a {', '  color: #fff;', '  background: rgb(0 0 0);', '}'].join(
      '\n',
    )

    expect(findColours(text)).toEqual([
      { line: 2, column: 10, match: '#fff' },
      { line: 3, column: 15, match: 'rgb(' },
    ])
  })

  it('reports every match on the same line in order', () => {
    expect(matches('border: 1px solid #ccc; color: hsl(0 0% 0%);')).toEqual([
      '#ccc',
      'hsl(',
    ])
  })
})
