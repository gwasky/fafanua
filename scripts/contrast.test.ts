// @vitest-environment node
// Checks every text and background pairing implied by the semantic colour
// tokens against WCAG AA, computing ratios from the hex values in
// src/styles/tokens.css. Lives in scripts/ because it reads the CSS with
// node:fs (Vitest does not load CSS, even with ?raw).
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) =>
  readFileSync(new URL(`../src/styles/${file}`, import.meta.url), 'utf8')
const tokensCss = read('tokens.css')
const globalCss = read('global.css')

type Declarations = Record<string, string>

// Custom property declarations inside the block for `selector`.
function customProperties(css: string, selector: string): Declarations {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const declarations: Declarations = {}
  for (const block of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (block[1].trim() !== selector) continue
    for (const [, name, value] of block[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      declarations[name] = value.trim()
    }
  }
  return declarations
}

// Follows var() references until a hex value is reached.
function resolve(name: string, tokens: Declarations): string {
  const value = tokens[name]
  if (value === undefined) throw new Error(`${name} is not defined`)
  const reference = value.match(/^var\((--[\w-]+)\)$/)
  if (reference) return resolve(reference[1], tokens)
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${name} is not a hex colour`)
  return value
}

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const root = customProperties(tokensCss, ':root')
const surfaceAlt = { ...root, ...customProperties(globalCss, '.surface-alt') }
const surfaceDarkBlock = customProperties(globalCss, '.surface-dark')
const surfaceDark = { ...root, ...surfaceDarkBlock }

const textTokens = [
  '--color-text',
  '--color-heading',
  '--color-text-muted',
  '--color-link',
  '--color-link-hover',
]

// Each background, with the tokens in effect on it.
const pairs: [string, string, Declarations][] = [
  ...textTokens.map((text): [string, string, Declarations] => [text, '--color-bg', root]),
  ...textTokens.map((text): [string, string, Declarations] => [
    text,
    '--color-surface',
    root,
  ]),
  ...textTokens.map((text): [string, string, Declarations] => [
    text,
    '--color-surface-alt',
    surfaceAlt,
  ]),
  ['--color-button-text', '--color-button-bg', root],
  ['--color-button-text', '--color-button-bg-hover', root],
  ['--color-button-secondary-text', '--color-bg', root],
  ['--color-button-secondary-text', '--color-surface', root],
  ['--color-button-secondary-text', '--color-button-secondary-bg-hover', root],
  // Inside .surface-dark (graphite 900, with graphite 800 raised surfaces).
  ...textTokens.map((text): [string, string, Declarations] => [
    text,
    '--color-bg',
    surfaceDark,
  ]),
  ...textTokens.map((text): [string, string, Declarations] => [
    text,
    '--color-surface',
    surfaceDark,
  ]),
  ['--color-button-text', '--color-button-bg', surfaceDark],
  ['--color-button-text', '--color-button-bg-hover', surfaceDark],
  ['--color-button-secondary-text', '--color-bg', surfaceDark],
  ['--color-button-secondary-text', '--color-button-secondary-bg-hover', surfaceDark],
]

// Resolved hex for each pair, so a failure names the colours and the
// dark pairs are labelled apart from the light ones in the test output.
const surfaceName = (tokens: Declarations) =>
  tokens === surfaceDark ? 'dark' : tokens === surfaceAlt ? 'surface-alt' : 'light'

describe('semantic colour tokens', () => {
  it.each(pairs.map(([text, background, tokens]) => [
    text,
    background,
    surfaceName(tokens),
    tokens,
  ] as const))(
    '%s on %s (%s) meets WCAG AA (4.5:1)',
    (text, background, _surface, tokens) => {
      const ratio = contrast(resolve(text, tokens), resolve(background, tokens))
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('reassigns links inside .surface-alt, because the default link colour fails there', () => {
    const defaultLink = contrast(
      resolve('--color-link', root),
      resolve('--color-surface-alt', root),
    )
    expect(defaultLink).toBeLessThan(4.5)
    expect(surfaceAlt['--color-link']).not.toBe(root['--color-link'])
    expect(surfaceAlt['--color-link-hover']).not.toBe(root['--color-link-hover'])
  })

  it('reassigns every semantic colour token inside .surface-dark', () => {
    const semantic = Object.keys(root).filter(
      (name) =>
        name.startsWith('--color-') &&
        !name.endsWith('-on-surface-alt') &&
        !name.endsWith('-on-dark'),
    )

    expect(semantic.length).toBeGreaterThan(0)
    expect(
      semantic.filter((name) => !(name in surfaceDarkBlock)),
    ).toEqual([])
  })

  it('points .surface-dark only at the matching -on-dark tokens', () => {
    for (const [name, value] of Object.entries(surfaceDarkBlock)) {
      expect(value).toBe(`var(${name}-on-dark)`)
      expect(root).toHaveProperty(`${name}-on-dark`)
    }
  })

  it('uses a graphite 900 background and changes the secondary hover fill inside .surface-dark', () => {
    expect(resolve('--color-bg', surfaceDark)).toBe(resolve('--graphite-900', root))
    // The light hover fill is white, and paper text on white fails.
    expect(
      contrast(
        resolve('--color-button-secondary-text', surfaceDark),
        resolve('--color-button-secondary-bg-hover', root),
      ),
    ).toBeLessThan(4.5)
    expect(surfaceDark['--color-button-secondary-bg-hover']).not.toBe(
      root['--color-button-secondary-bg-hover'],
    )
  })
})
