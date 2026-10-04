// @vitest-environment node
// Checks the V2 type, spacing, grid and motion tokens in
// src/styles/tokens.css (#54): their exact values, and that each display
// size falls in the plan's range (_docs/fafanua-v2-visual-upgrade-plan.md
// §7) at 1024px and 1440px. Lives in scripts/ because it reads the CSS
// with node:fs (Vitest does not load CSS, even with ?raw).
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) =>
  readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  )
const tokensCss = read('styles/tokens.css')

const tokens: Record<string, string> = {}
for (const [, name, value] of tokensCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  tokens[name] = value.trim()
}

const ROOT_PX = 16

/** A length in rem or vw, or a sum of them, in px at a viewport width. */
function length(value: string, width: number): number {
  return value.split('+').reduce((sum, term) => {
    const match = term.trim().match(/^([\d.]+)(rem|vw)$/)
    if (!match) throw new Error(`Cannot read "${term}"`)
    const n = Number(match[1])
    return sum + (match[2] === 'rem' ? n * ROOT_PX : (n * width) / 100)
  }, 0)
}

/** A clamp(min, preferred, max) or a plain length, in px at a width. */
function size(name: string, width: number): number {
  const value = tokens[name]
  const clamp = value.match(/^clamp\(([^,]+),([^,]+),([^,]+)\)$/)
  if (!clamp) return length(value, width)
  const [min, preferred, max] = clamp.slice(1).map((part) => length(part, width))
  return Math.min(Math.max(preferred, min), max)
}

describe('V2 tokens', () => {
  it('has the agreed values', () => {
    expect(tokens).toMatchObject({
      '--text-hero': 'clamp(2.75rem, 1.6rem + 5.2vw, 6rem)',
      '--text-section': 'clamp(2rem, 1.2rem + 3.2vw, 3.5rem)',
      '--text-service': 'clamp(1.375rem, 1.1rem + 0.8vw, 1.75rem)',
      '--text-body-lg': 'clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)',
      '--text-eyebrow': '0.8125rem',
      '--leading-display': '1.05',
      '--tracking-eyebrow': '0.08em',
      '--measure-display': '16ch',
      '--space-section': 'clamp(4rem, 2.5rem + 6vw, 8rem)',
      '--space-section-dark': 'clamp(5rem, 3rem + 8vw, 10rem)',
      '--grid-size': '4rem',
      '--grid-line-width': '1px',
      '--duration-header': 'var(--duration-base)',
      '--duration-cta-arrow': 'var(--duration-fast)',
      '--cta-arrow-shift': 'var(--space-1)',
      '--duration-card-hover': 'var(--duration-base)',
    })
  })

  // Plan §7's suggested desktop ranges, in px.
  const ranges = [
    ['--text-hero', 72, 104],
    ['--text-section', 48, 64],
    ['--text-service', 24, 28],
    ['--text-body-lg', 18, 20],
  ] as const

  for (const width of [1024, 1440]) {
    it.each(ranges)(`%s is between %ipx and %ipx at ${width}px`, (name, min, max) => {
      const px = size(name, width)
      expect(px).toBeGreaterThanOrEqual(min)
      expect(px).toBeLessThanOrEqual(max)
    })
  }

  it('keeps the eyebrow compact: smaller than body text', () => {
    expect(size('--text-eyebrow', 1440)).toBeLessThan(ROOT_PX)
  })
})

describe('component durations', () => {
  // Every duration comes from a motion token; global.css's reduced-motion
  // override (0.01ms) is the one literal.
  const files = [
    'styles/components.css',
    ...readdirSync(new URL('../src/components/', import.meta.url))
      .filter((name) => name.endsWith('.css'))
      .map((name) => `components/${name}`),
  ]

  it.each(files)('%s has no raw ms or s duration', (file) => {
    expect(read(file)).not.toMatch(/(?<![\w-])\d*\.?\d+m?s\b/)
  })
})

describe('inline navigation breakpoint', () => {
  // CSS variables cannot be used in media queries, so the breakpoint is
  // written twice; these must stay the same.
  const headerTsx = read('components/Header.tsx')
  const headerCss = read('components/Header.css')

  it('is 64em in Header.tsx and Header.css alike', () => {
    const query = headerTsx.match(/const INLINE_NAV_QUERY = '([^']+)'/)?.[1]
    const media = [...headerCss.matchAll(/@media ([^{]+)\{/g)]
      .map((match) => match[1].trim())
      .filter((condition) => condition.includes('min-width'))

    expect(query).toBe('(min-width: 64em)')
    expect(media).toEqual([query])
  })
})

describe('content breakpoints', () => {
  // Width breakpoints are in em, so a larger browser text size moves them
  // up with the text (#54): 48em and 64em, 768px and 1024px at 16px.
  const files = [
    'styles/global.css',
    'styles/components.css',
    ...readdirSync(new URL('../src/components/', import.meta.url))
      .filter((name) => name.endsWith('.css'))
      .map((name) => `components/${name}`),
  ]

  it.each(files)('%s uses only (min-width: 48em) and (min-width: 64em)', (file) => {
    const widths = [...read(file).matchAll(/\((?:min|max)-width:\s*([^)]+)\)/g)].map(
      (match) => match[1].trim(),
    )
    for (const width of widths) expect(['48em', '64em']).toContain(width)
  })
})
