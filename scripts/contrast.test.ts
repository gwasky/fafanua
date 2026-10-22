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

// An @media rule and its blocks, as written in tokens.css.
const MEDIA_RULE = /@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g

// Custom property declarations inside the top-level blocks whose selector
// list includes `selector`. Blocks inside an @media rule are left out:
// mediaCustomProperties() reads those.
function customProperties(css: string, selector: string): Declarations {
  return declarationsIn(css.replace(/\/\*[\s\S]*?\*\//g, '').replace(MEDIA_RULE, ''), selector)
}

// The same, for the blocks inside the @media rules whose condition is
// exactly `condition`.
function mediaCustomProperties(css: string, condition: string, selector: string): Declarations {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(MEDIA_RULE)]
  return Object.assign(
    {},
    ...rules.filter(([, query]) => query.trim() === condition).map(([, , body]) => declarationsIn(body, selector)),
  )
}

function declarationsIn(css: string, selector: string): Declarations {
  const declarations: Declarations = {}
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!block[1].split(',').some((part) => part.trim() === selector)) continue
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

// A hex colour as its 0-255 sRGB channels, and back.
const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb: number[]) =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const root = customProperties(tokensCss, ':root')
const surfaceAlt = { ...root, ...customProperties(globalCss, '.surface-alt') }
const surfaceDarkBlock = customProperties(globalCss, '.surface-dark')
const surfaceDark = { ...root, ...surfaceDarkBlock }
// The transparent header over a dark section makes the same reassignment.
const onDarkBlock = customProperties(globalCss, '.on-dark')
// A light card inside a dark panel (#82) declares the light values again.
const surfaceLightBlock = customProperties(tokensCss, '.surface-light')

/**
 * A translucent token, written color-mix(in srgb, var(--x) N%,
 * transparent), drawn over a background: the browser composites in sRGB,
 * so the result is the straight mix of the two colours' channels.
 */
function blend(name: string, background: string, tokens: Declarations): string {
  const value = tokens[name]
  if (value === undefined) throw new Error(`${name} is not defined`)
  const reference = value.match(/^var\((--[\w-]+)\)$/)
  if (reference) return blend(reference[1], background, tokens)
  const mix = value.match(
    /^color-mix\(in srgb, var\((--[\w-]+)\) (\d+(?:\.\d+)?)%, transparent\)$/,
  )
  if (!mix) throw new Error(`${name} is not a color-mix() with transparent`)
  const alpha = Number(mix[2]) / 100
  const [line, under] = [channels(resolve(mix[1], tokens)), channels(background)]
  return toHex(line.map((c, i) => alpha * c + (1 - alpha) * under[i]))
}

const textTokens = [
  '--color-text',
  '--color-heading',
  '--color-text-muted',
  '--color-link',
  '--color-link-hover',
  // Accent-coloured small text: the Data Trust Assessment's eyebrows (#82).
  '--color-accent-text',
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
  // The tag in the teal tint (added by W11, #81): the Data Trust
  // Assessment's Trusted rating chip's tint (#82).
  ['--color-tag-text', '--color-tag-bg', root],
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
  ['--color-tag-text', '--color-tag-bg', surfaceDark],
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

  it('pairs the tag text with teal 800 on teal 100, because teal 700 fails there (#81)', () => {
    expect(resolve('--color-tag-text', root)).toBe(resolve('--teal-800', root))
    expect(resolve('--color-tag-bg', root)).toBe(resolve('--teal-100', root))
    expect(contrast(resolve('--teal-800', root), resolve('--teal-100', root))).toBeCloseTo(6.93, 1)
    expect(contrast(resolve('--color-tag-text', surfaceDark), resolve('--color-tag-bg', surfaceDark))).toBeCloseTo(8.67, 1)
    // Never used: teal 700 on teal 100 is 4.47:1.
    const teal700 = contrast(resolve('--teal-700', root), resolve('--teal-100', root))
    expect(teal700).toBeLessThan(4.5)
    expect(teal700).toBeCloseTo(4.47, 1)
  })

  it('keeps the soft line graphite 500, graphics only, at least 3:1 on graphite 100 (#90)', () => {
    expect(resolve('--color-line-soft', root)).toBe(resolve('--graphite-500', root))
    const ratio = contrast(resolve('--color-line-soft', surfaceAlt), resolve('--color-surface-alt', surfaceAlt))
    expect(ratio).toBeGreaterThanOrEqual(3)
    expect(ratio).toBeCloseTo(3.7, 1)
    // Graphics only: it is not a text token.
    expect(textTokens).not.toContain('--color-line-soft')
  })

  it('makes .on-dark the same reassignment as .surface-dark', () => {
    expect(onDarkBlock).toEqual(surfaceDarkBlock)
  })

  it('declares exactly the light semantic colour set inside .surface-light (#82)', () => {
    const lightSemantic = Object.fromEntries(
      Object.entries(root).filter(
        ([name]) =>
          name.startsWith('--color-') &&
          !name.endsWith('-on-surface-alt') &&
          !name.endsWith('-on-dark'),
      ),
    )

    expect(Object.keys(lightSemantic).length).toBeGreaterThan(0)
    expect(surfaceLightBlock).toEqual(lightSemantic)
    // Every token .surface-dark reassigns is set back inside the card.
    expect(Object.keys(surfaceLightBlock).sort()).toEqual(Object.keys(surfaceDarkBlock).sort())
    // It resets the text colour inherited from the panel and paints no
    // background, and holds no other surface.
    const rule = globalCss.match(/\n\.surface-light \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/color: var\(--color-text\);/)
    expect(rule).not.toMatch(/background/)
  })

  it('gives the accent text teal 800 on light and teal 400 on dark (#82)', () => {
    expect(resolve('--color-accent-text', root)).toBe(resolve('--teal-800', root))
    expect(resolve('--color-accent-text', surfaceDark)).toBe(resolve('--teal-400', root))
    expect(contrast(resolve('--color-accent-text', surfaceDark), resolve('--graphite-900', root))).toBeCloseTo(7.47, 1)
    expect(contrast(resolve('--color-accent-text', surfaceDark), resolve('--graphite-800', root))).toBeCloseTo(6.08, 1)
  })
})

describe('logo tokens (#86)', () => {
  const LOGO = ['--color-logo-mark', '--color-logo-wordmark']
  const FORCED_LIGHT = '(forced-colors: active) and (prefers-color-scheme: light)'
  const forcedLight = mediaCustomProperties(tokensCss, FORCED_LIGHT, ':root')
  const FORCED_DARK = '(forced-colors: active) and (prefers-color-scheme: dark)'
  const forcedDark = mediaCustomProperties(tokensCss, FORCED_DARK, ':root')

  it('gives the header logo the positive file\'s colours on light: teal 600 and graphite 900', () => {
    expect(LOGO.map((name) => root[name])).toEqual(['var(--teal-600)', 'var(--graphite-900)'])
    expect(LOGO.map((name) => surfaceLightBlock[name])).toEqual(['var(--teal-600)', 'var(--graphite-900)'])
  })

  it('gives it the reversed file\'s colours on dark: teal 400 and paper', () => {
    expect(LOGO.map((name) => root[`${name}-on-dark`])).toEqual(['var(--teal-400)', 'var(--paper)'])
  })

  it('reassigns both inside .surface-dark and .on-dark', () => {
    for (const block of [surfaceDarkBlock, onDarkBlock]) {
      for (const name of LOGO) expect(block[name]).toBe(`var(${name}-on-dark)`)
    }
    expect(LOGO.map((name) => resolve(name, surfaceDark))).toEqual([
      resolve('--teal-400', root),
      resolve('--paper', root),
    ])
  })

  it('aliases only the colours in the logo files, so they add no colour', () => {
    const fills = (file: string) =>
      [...readFileSync(new URL(`../public/${file}`, import.meta.url), 'utf8').matchAll(/fill="(#[0-9a-f]{6})"/gi)].map(
        ([, hex]) => hex.toUpperCase(),
      )
    expect(LOGO.map((name) => resolve(name, root).toUpperCase())).toEqual(fills('fafanua-logo.svg'))
    expect(LOGO.map((name) => resolve(name, surfaceDark).toUpperCase())).toEqual(fills('fafanua-logo-reversed.svg'))
  })

  it('makes the on-dark logo the positive one under a light forced-colours theme, and sets nothing else', () => {
    expect(forcedLight).toEqual({
      '--color-logo-mark-on-dark': 'var(--teal-600)',
      '--color-logo-wordmark-on-dark': 'var(--graphite-900)',
    })
    const forced = { ...root, ...forcedLight, ...surfaceDarkBlock }
    expect(LOGO.map((name) => resolve(name, forced))).toEqual(LOGO.map((name) => resolve(name, root)))
  })

  it('makes the header logo the reversed one under a dark forced-colours theme, and sets nothing else (#87)', () => {
    expect(forcedDark).toEqual({
      '--color-logo-mark': 'var(--teal-400)',
      '--color-logo-wordmark': 'var(--paper)',
    })
    const reversed = [...readFileSync(new URL('../public/fafanua-logo-reversed.svg', import.meta.url), 'utf8').matchAll(
      /fill="(#[0-9a-f]{6})"/gi,
    )].map(([, hex]) => hex.toUpperCase())
    const forced = { ...root, ...forcedDark }
    expect(LOGO.map((name) => resolve(name, forced).toUpperCase())).toEqual(reversed)
    // .surface-dark and .on-dark keep the reversed logo there.
    expect(LOGO.map((name) => resolve(name, { ...forced, ...surfaceDarkBlock }).toUpperCase())).toEqual(reversed)
  })

  it('has only the two forced-colours rules as @media rules in tokens.css, light then dark', () => {
    expect([...tokensCss.matchAll(/@media([^{]+)\{/g)].map(([, query]) => query.trim())).toEqual([
      FORCED_LIGHT,
      FORCED_DARK,
    ])
  })
})

describe('technical grid lines', () => {
  // Low contrast (plan V2 §19): at most 1.25:1 against the surface each is
  // drawn on, and still drawn (above 1:1).
  const cases = [
    ['light', '--paper', root],
    ['dark', '--graphite-900', surfaceDark],
  ] as const

  it.each(cases)('the %s grid line is at most 1.25:1 on its surface', (_name, surface, tokens) => {
    const background = resolve(surface, root)
    const ratio = contrast(blend('--color-grid-line', background, tokens), background)

    expect(ratio).toBeGreaterThan(1)
    expect(ratio).toBeLessThanOrEqual(1.25)
  })

  it('are color-mix() of existing primitives with transparent, light and dark', () => {
    expect(root['--color-grid-line']).toMatch(/^color-mix\(in srgb, var\(--[\w-]+\) [\d.]+%, transparent\)$/)
    expect(root['--color-grid-line-on-dark']).toMatch(
      /^color-mix\(in srgb, var\(--[\w-]+\) [\d.]+%, transparent\)$/,
    )
    expect(surfaceDarkBlock['--color-grid-line']).toBe('var(--color-grid-line-on-dark)')
  })
})
