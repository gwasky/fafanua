// @vitest-environment node
// Checks the self-hosted Inter setup in src/styles/fonts.css and the font
// stack in tokens.css. Lives in scripts/ because it reads the CSS with
// node:fs (Vitest does not load CSS, even with ?raw).
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) =>
  readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const tokensCss = withoutComments(read('src/styles/tokens.css'))
const fontsCss = withoutComments(read('src/styles/fonts.css'))
const globalCss = withoutComments(read('src/styles/global.css'))
const packageWght = read('node_modules/@fontsource-variable/inter/wght.css')

type Descriptors = Record<string, string>

// The descriptors of every @font-face rule, with quotes normalised.
function fontFaces(css: string): Descriptors[] {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((rule) => {
    const descriptors: Descriptors = {}
    for (const [, name, value] of rule[1].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
      descriptors[name] = value.trim().replace(/'/g, '"')
    }
    return descriptors
  })
}

const faces = fontFaces(fontsCss)
const interFaces = faces.filter((face) => face['font-family'] === '"Inter Variable"')
const fallbackFaces = faces.filter((face) => face['font-family'] === '"Inter Fallback"')

// Inter's hhea metrics, read from inter-latin-wght-normal.woff2.
const INTER_UNITS_PER_EM = 2048
const INTER_ASCENDER = 1984
const INTER_DESCENDER = 494

const percent = (value: string) => {
  const match = value.match(/^([\d.]+)%$/)
  if (!match) throw new Error(`${value} is not a percentage`)
  return Number(match[1]) / 100
}

describe('--font-sans', () => {
  it('puts Inter, then its fallback, then the system stack', () => {
    const value = tokensCss.match(/--font-sans\s*:\s*([^;]+);/)?.[1].trim()
    expect(value).toBe(
      '"Inter Variable", "Inter Fallback", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    )
  })
})

describe('"Inter Variable" @font-face', () => {
  it('is declared exactly once', () => {
    expect(interFaces).toHaveLength(1)
  })

  const [inter] = interFaces

  it('swaps in when loaded, so text is never invisible', () => {
    expect(inter['font-display']).toBe('swap')
  })

  it('covers the whole weight axis in normal style', () => {
    expect(inter['font-weight']).toBe('100 900')
    expect(inter['font-style']).toBe('normal')
  })

  it('points at the Latin variable woff2 from the package', () => {
    expect(inter.src).toBe(
      'url("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2") format("woff2")',
    )
  })

  it("uses the unicode-range of the package's Latin rule", () => {
    const latinRule = packageWght.match(
      /\/\* inter-latin-wght-normal \*\/\s*@font-face\s*\{([^}]*)\}/,
    )
    const packageRange = latinRule?.[1].match(/unicode-range:\s*([^;]+);/)?.[1]
    const normalise = (range: string) => range.replace(/\s+/g, '')

    expect(packageRange).toBeDefined()
    expect(normalise(inter['unicode-range'])).toBe(normalise(packageRange!))
  })
})

describe('"Inter Fallback" @font-face', () => {
  it('is declared', () => {
    expect(fallbackFaces.length).toBeGreaterThan(0)
  })

  it.each(fallbackFaces.map((face) => [face['font-weight'], face]))(
    'uses Arial with all four metric overrides (weights %s)',
    (_weights, face) => {
      expect(face.src).toBe('local("Arial")')
      for (const descriptor of [
        'size-adjust',
        'ascent-override',
        'descent-override',
        'line-gap-override',
      ]) {
        expect(face[descriptor], descriptor).toMatch(/^[\d.]+%$/)
      }
    },
  )

  it.each(fallbackFaces.map((face) => [face['font-weight'], face]))(
    "scales Inter's vertical metrics by size-adjust (weights %s)",
    (_weights, face) => {
      const sizeAdjust = percent(face['size-adjust'])
      expect(percent(face['ascent-override'])).toBeCloseTo(
        INTER_ASCENDER / INTER_UNITS_PER_EM / sizeAdjust,
        3,
      )
      expect(percent(face['descent-override'])).toBeCloseTo(
        INTER_DESCENDER / INTER_UNITS_PER_EM / sizeAdjust,
        3,
      )
      expect(face['line-gap-override']).toBe('0%')
    },
  )

  it('covers weights 100 to 900 once each, with no gaps or overlaps', () => {
    const ranges = fallbackFaces
      .map((face) => face['font-weight'].split(/\s+/).map(Number))
      .sort((a, b) => a[0] - b[0])

    expect(ranges[0][0]).toBe(100)
    expect(ranges[ranges.length - 1][1]).toBe(900)
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i][0]).toBe(ranges[i - 1][1] + 1)
    }
  })
})

describe('global.css', () => {
  it('imports fonts.css', () => {
    expect(globalCss).toMatch(/@import\s+['"]\.\/fonts\.css['"];/)
  })

  it('makes form controls inherit the page font', () => {
    const rule = globalCss.match(/button,\s*input,\s*select,\s*textarea\s*\{([^}]*)\}/)
    expect(rule?.[1]).toMatch(/font:\s*inherit;/)
  })
})

describe('package.json', () => {
  it('lists the font package as a dev dependency only', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.devDependencies).toHaveProperty('@fontsource-variable/inter')
    expect(pkg.dependencies).not.toHaveProperty('@fontsource-variable/inter')
  })
})
