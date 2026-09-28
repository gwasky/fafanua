// @vitest-environment node
// Checks the social preview image in public/ and the HTML source it is
// rendered from (scripts/og-image/og-image.html).
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_PATH = path.join(ROOT, 'scripts', 'og-image', 'og-image.html')
const SOURCE = readFileSync(SOURCE_PATH, 'utf8')
const PNG = readFileSync(path.join(ROOT, 'public', 'og-image.png'))
const TOKENS = readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8')
const PLAN = readFileSync(path.join(ROOT, '_docs', 'plan.md'), 'utf8')

const PROPOSITION = 'Build a data foundation you can trust.'
const HEX = /#[0-9a-f]{3,8}\b/gi

describe('og-image.png', () => {
  it('is a PNG', () => {
    expect(PNG.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    expect(PNG.toString('latin1', 12, 16)).toBe('IHDR')
  })

  it('is exactly 1200 × 630 pixels, read from the IHDR chunk', () => {
    expect(PNG.readUInt32BE(16)).toBe(1200)
    expect(PNG.readUInt32BE(20)).toBe(630)
  })

  it('is under 300 KB', () => {
    expect(PNG.length).toBeLessThan(300_000)
  })
})

describe('og-image.html', () => {
  // The source without its leading comment, which quotes other files.
  const markup = SOURCE.replace(/<!--[\s\S]*?-->/g, '')

  it('says how to regenerate the PNG', () => {
    expect(SOURCE).toContain('--window-size=1200,630')
    expect(SOURCE).toContain('--screenshot=public/og-image.png')
    expect(SOURCE).toContain('stripPng')
  })

  it('uses only colours that are values in tokens.css', () => {
    const tokens = new Set(
      [...TOKENS.matchAll(/--[\w-]+:\s*(#[0-9a-f]{3,8})\b/gi)].map(([, hex]) => hex.toUpperCase()),
    )
    const colours = [...SOURCE.matchAll(HEX)].map(([hex]) => hex.toUpperCase())
    expect(colours.length).toBeGreaterThan(0)
    for (const colour of colours) {
      expect(tokens, `${colour} is not a token value`).toContain(colour)
    }
  })

  it('uses paper for the background and graphite 900 for the text, and nothing else', () => {
    const colours = new Set([...markup.matchAll(HEX)].map(([hex]) => hex.toUpperCase()))
    expect(TOKENS).toContain('--graphite-50: #F4F4F1')
    expect(TOKENS).toContain('--graphite-900: #1C2024')
    expect(colours).toEqual(new Set(['#F4F4F1', '#1C2024']))
    expect(markup).toContain('background: #F4F4F1')
    expect(markup).toContain('color: #1C2024')
  })

  it('has no other colour syntax, gradients or images besides the logo', () => {
    expect(markup).not.toMatch(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i)
    expect(markup).not.toMatch(/gradient|box-shadow|filter|opacity/i)
    expect([...markup.matchAll(/<img\b/g)]).toHaveLength(1)
    expect(markup).not.toMatch(/<svg|<picture|<video|<canvas|background-image/i)
  })

  it('shows the unmodified positive logo from public/ at least 120px wide', () => {
    expect(markup).toContain('src="../../public/fafanua-logo.svg"')
    expect(existsSync(path.resolve(path.dirname(SOURCE_PATH), '../../public/fafanua-logo.svg'))).toBe(true)
    const width = Number(/\.logo\s*\{[^}]*\bwidth:\s*(\d+)px/.exec(markup)![1])
    expect(width).toBeGreaterThanOrEqual(120)
    // The logo keeps its aspect ratio.
    expect(markup).toMatch(/\.logo\s*\{[^}]*\bheight:\s*auto/)
  })

  it('shows only the plan Section 5 proposition as text', () => {
    expect(PLAN).toContain(`> ${PROPOSITION}\n`)
    const body = /<body>([\s\S]*)<\/body>/.exec(markup)![1]
    const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    expect(text).toBe(PROPOSITION)
  })

  it('sets the text in the self-hosted Inter at weight 300', () => {
    const font = /src:\s*url\("([^"]+)"\)/.exec(markup)![1]
    expect(font).toBe(
      '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    )
    expect(existsSync(path.resolve(path.dirname(SOURCE_PATH), font))).toBe(true)
    expect(markup).toMatch(/p\s*\{[^}]*font-family:\s*"Inter Export";/)
    expect(markup).toMatch(/p\s*\{[^}]*font-weight:\s*300;/)
    // Waits for Inter rather than rendering a fallback.
    expect(markup).toContain('font-display: block')
    expect(markup).not.toMatch(/fonts\.googleapis|https?:\/\//)
  })

  it('keeps the content inside the centred 630 × 630 square, 60px from its edges', () => {
    expect(markup).toMatch(/html,\s*body\s*\{[^}]*width: 1200px;[^}]*height: 630px;/)
    expect(markup).toMatch(/body\s*\{[^}]*align-items: center;[^}]*justify-content: center;/)
    expect(markup).toMatch(/\.safe\s*\{[^}]*width: 510px;[^}]*height: 510px;/)
  })
})
