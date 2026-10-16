// @vitest-environment node
// Checks the plugin in vite.config.ts that puts the header logo's sprite,
// built from public/fafanua-logo.svg, into every page (#86).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import { LOGO_FILE, LOGO_SYMBOL_ID, logoSprite, logoSymbol } from '../vite.config.ts'

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const positive = read(LOGO_FILE)
const reversed = read('public/fafanua-logo-reversed.svg')
const logoTsx = read('src/components/Logo.tsx')

/** Each <path>'s raw transform and d, as written in the markup. */
const geometry = (svg: string) =>
  [...svg.matchAll(/<path\b([^>]*)\/>/g)].map(([, attributes]) => ({
    transform: / transform="([^"]*)"/.exec(attributes)?.[1],
    d: / d="([^"]*)"/.exec(attributes)?.[1],
  }))

describe('logoSprite', () => {
  const sprite = logoSprite(positive)

  it('copies both paths\' transform and d byte for byte from both logo files', () => {
    const paths = geometry(sprite)

    expect(paths).toHaveLength(2)
    expect(paths).toEqual(geometry(positive))
    expect(paths).toEqual(geometry(reversed))
    for (const { transform, d } of paths) {
      expect(transform).toMatch(/^translate\(\d+ 714\) scale\(0\.1 -0\.1\)$/)
      expect(d!.length).toBeGreaterThan(1_000)
      // The exact bytes, not a reformatted copy.
      expect(positive).toContain(` d="${d}"`)
    }
  })

  it('fills the symbol and the wordmark from the logo tokens, with no colour or title', () => {
    expect([...sprite.matchAll(/style="([^"]*)"/g)].map(([, style]) => style)).toEqual([
      'display: none',
      'fill: var(--color-logo-mark)',
      'fill: var(--color-logo-wordmark)',
    ])
    expect(sprite).not.toMatch(/\bfill="/)
    expect(sprite).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i)
    expect(sprite).not.toMatch(/<title\b/)
  })

  it('is a hidden, aria-hidden <svg> holding one <symbol> with the logo\'s viewBox and the only id', () => {
    expect(sprite).toMatch(
      new RegExp(
        `^<svg aria-hidden="true" style="display: none"><symbol id="${LOGO_SYMBOL_ID}" viewBox="0 0 5046 714"><path [^>]*/><path [^>]*/></symbol></svg>$`,
      ),
    )
    expect([...sprite.matchAll(/\bid="([^"]*)"/g)].map(([, id]) => id)).toEqual([LOGO_SYMBOL_ID])
  })

  it('is the symbol Logo.tsx uses', () => {
    expect(logoTsx).toContain(`const LOGO_SYMBOL = '${LOGO_SYMBOL_ID}'`)
  })

  it.each([
    ['a third path', positive.replace('</svg>', '<path fill="#000" transform="" d="M0 0"/></svg>')],
    ['one path', positive.replace(/<path\b[^>]*\/>(?=<\/svg>)/, '')],
    ['a <style>', positive.replace('</svg>', '<style>path{}</style></svg>')],
    ['<defs>', positive.replace('</svg>', '<defs></defs></svg>')],
    ['an extra attribute', positive.replace('<path fill=', '<path id="x" fill=')],
    ['a path without its fill', positive.replace(/<path fill="[^"]*"/, '<path')],
    ['another viewBox', positive.replace('viewBox="0 0 5046 714"', 'viewBox="0 0 100 100"')],
    ['no <svg> root', '<g></g>'],
  ])('throws if the file has %s', (_change, svg) => {
    expect(() => logoSprite(svg)).toThrow(/public\/fafanua-logo\.svg is not the expected logo/)
  })
})

describe('logoSymbol', () => {
  // Runs the plugin's transformIndexHtml as Vite would.
  async function transform(html: string) {
    const plugin = logoSymbol() as Plugin & {
      configResolved: (config: { root: string }) => void
      transformIndexHtml: { order: string; handler: (html: string) => Promise<string> }
    }
    plugin.configResolved({ root: path.resolve(import.meta.dirname, '..') })
    return plugin.transformIndexHtml.handler(html)
  }

  it('runs in dev and in the build, on every page', () => {
    const plugin = logoSymbol()
    expect(plugin.apply).toBeUndefined()
    expect(plugin.applyToEnvironment).toBeUndefined()
  })

  it.each(['index.html', 'page.html'])('puts the sprite at the start of <body> in %s, before #root', async (file) => {
    const html = read(file)
    const out = await transform(html)

    expect(out).toBe(html.replace('<body>', `<body>\n    ${logoSprite(positive)}`))
    expect(out.indexOf(`id="${LOGO_SYMBOL_ID}"`)).toBeLessThan(out.indexOf('id="root"'))
    expect(out.match(new RegExp(`id="${LOGO_SYMBOL_ID}"`, 'g'))).toHaveLength(1)
  })

  it('throws without exactly one <body>', async () => {
    await expect(transform('<html><head></head></html>')).rejects.toThrow(/found 0/)
  })
})
