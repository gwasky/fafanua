// @vitest-environment node
// Checks the plugin in vite.config.ts that preloads the hashed Inter woff2.
import type { IndexHtmlTransformContext, Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import { FONT_FILE, preloadFont } from '../vite.config.ts'

const HTML = [
  '<head>',
  '    <meta charset="UTF-8" />',
  '    <title>Fafanua Technologies</title>',
  '    <link rel="stylesheet" crossorigin href="/assets/index-abc.css">',
  '  </head>',
].join('\n')

// Runs the plugin's transformIndexHtml as the build would, with a bundle
// holding the given file names.
function transform(files: string[], html = HTML, base = '/') {
  const plugin = preloadFont() as Plugin & {
    configResolved: (config: { base: string }) => void
    transformIndexHtml: {
      handler: (html: string, ctx: IndexHtmlTransformContext) => string
    }
  }
  plugin.configResolved({ base })
  const bundle = Object.fromEntries(files.map((file) => [file, {}]))
  return plugin.transformIndexHtml.handler(html, {
    bundle,
  } as unknown as IndexHtmlTransformContext)
}

describe('FONT_FILE', () => {
  it.each([
    'assets/inter-latin-wght-normal-Dx4kXJAl.woff2',
    'assets/inter-latin-wght-normal-a_b-C.woff2',
  ])('matches %s', (file) => {
    expect(FONT_FILE.test(file)).toBe(true)
  })

  it.each([
    'assets/inter-latin-wght-italic-Dx4kXJAl.woff2',
    'assets/inter-cyrillic-wght-normal-Dx4kXJAl.woff2',
    'assets/inter-latin-wght-normal-Dx4kXJAl.woff',
    'assets/index-Dx4kXJAl.css',
  ])('does not match %s', (file) => {
    expect(FONT_FILE.test(file)).toBe(false)
  })
})

describe('preloadFont', () => {
  it('only runs in the build', () => {
    expect(preloadFont().apply).toBe('build')
  })

  it('adds a crossorigin woff2 preload for the hashed file after <title>', () => {
    const html = transform([
      'assets/index-abc.js',
      'assets/index-abc.css',
      'assets/inter-latin-wght-normal-Dx4kXJAl.woff2',
    ])

    expect(html).toContain(
      '<title>Fafanua Technologies</title>\n    <link rel="preload" href="/assets/inter-latin-wght-normal-Dx4kXJAl.woff2" as="font" type="font/woff2" crossorigin>',
    )
    expect(html.indexOf('rel="preload"')).toBeLessThan(
      html.indexOf('rel="stylesheet"'),
    )
  })

  it('prefixes the configured base', () => {
    const html = transform(
      ['assets/inter-latin-wght-normal-Dx4kXJAl.woff2'],
      HTML,
      '/site/',
    )
    expect(html).toContain('href="/site/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"')
  })

  it('fails the build if the font is missing', () => {
    expect(() => transform(['assets/index-abc.css'])).toThrow(
      'found 0',
    )
  })

  it('fails the build if more than one Inter woff2 is emitted', () => {
    expect(() =>
      transform([
        'assets/inter-latin-wght-normal-aaa.woff2',
        'assets/inter-latin-wght-normal-bbb.woff2',
      ]),
    ).toThrow('found 2')
  })

  it('fails the build if index.html has no <title>', () => {
    expect(() =>
      transform(['assets/inter-latin-wght-normal-aaa.woff2'], '<head></head>'),
    ).toThrow('no <title>')
  })
})
