// @vitest-environment node
// Checks the plugin in vite.config.ts that puts the stylesheet before the
// module script in the built head, and the build-time check that fails
// the build when the script comes first or nothing holds it back (#62).
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Plugin } from 'vite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  WAIT_FOR_STYLESHEET as WAIT,
  checkOrder,
  checkStylesheetOrder,
  stylesheetFirst,
} from '../vite.config.ts'

const SCRIPT = '<script type="module" crossorigin src="/assets/index-abc.js"></script>'
const STYLESHEET = '<link rel="stylesheet" crossorigin href="/assets/index-abc.css">'
const PRELOAD =
  '<link rel="preload" href="/assets/inter-latin-wght-normal-abc.woff2" as="font" type="font/woff2" crossorigin>'
const JSON_LD = '<script type="application/ld+json">{"name":"x"}</script>'

/** A built page whose head holds these lines, in this order. */
const page = (...lines: string[]) =>
  [
    '<!doctype html>',
    '<html lang="en-GB">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <title>Fafanua</title>',
    ...lines.map((line) => `    ${line}`),
    '  </head>',
    '  <body>',
    '    <div id="root"></div>',
    '  </body>',
    '</html>',
  ].join('\n')

// The head as Vite writes it, with the script before the stylesheet.
const VITE = page(PRELOAD, '<link rel="icon" href="/favicon.svg">', SCRIPT, STYLESHEET, JSON_LD)

type HtmlPlugin = Plugin & {
  transformIndexHtml: { order: string; handler: (html: string) => string }
}
const reorder = (html: string) => (stylesheetFirst() as HtmlPlugin).transformIndexHtml.handler(html)

describe('stylesheetFirst', () => {
  it('runs in the build only, after Vite adds its tags', () => {
    const plugin = stylesheetFirst() as HtmlPlugin
    expect(plugin.apply).toBe('build')
    expect(plugin.transformIndexHtml.order).toBe('post')
  })

  it('moves the module script to after the stylesheet, behind the wait, and changes nothing else', () => {
    expect(reorder(VITE)).toBe(
      page(PRELOAD, '<link rel="icon" href="/favicon.svg">', STYLESHEET, WAIT, SCRIPT, JSON_LD),
    )
  })

  it('waits with a classic inline script that is not empty', () => {
    expect(WAIT).toMatch(/^<script>[^<]+<\/script>$/)
    expect(WAIT).not.toMatch(/\b(type|src|async|defer)=/)
  })

  it('puts the script after the last of several stylesheets', () => {
    const second = '<link rel="stylesheet" crossorigin href="/assets/other-abc.css">'
    expect(reorder(page(SCRIPT, STYLESHEET, second))).toBe(page(STYLESHEET, second, WAIT, SCRIPT))
  })

  it('adds the wait to a page with the script already after the stylesheet', () => {
    expect(reorder(page(STYLESHEET, SCRIPT, JSON_LD))).toBe(page(STYLESHEET, WAIT, SCRIPT, JSON_LD))
  })

  it('leaves a page already in order, or without both tags, unchanged', () => {
    for (const html of [page(STYLESHEET, WAIT, SCRIPT, JSON_LD), page(SCRIPT), page(STYLESHEET), page()]) {
      expect(reorder(html)).toBe(html)
    }
  })

  it('leaves the JSON-LD and scripts in <body> where they are', () => {
    const html = VITE.replace('<div id="root"></div>', `<div id="root"></div>\n    ${SCRIPT}`)
    const result = reorder(html)
    expect(result.indexOf(JSON_LD)).toBeGreaterThan(result.indexOf(SCRIPT))
    expect(result.slice(result.indexOf('<body>'))).toContain(SCRIPT)
  })

  it('produces a page that passes the order check', () => {
    expect(() => checkStylesheetOrder(reorder(VITE))).not.toThrow()
  })

  it('fails if there is no <head>', () => {
    expect(() => reorder('<body></body>')).toThrow('no <head>')
  })
})

describe('checkStylesheetOrder', () => {
  it('passes the stylesheet, then the wait, then the module script', () => {
    expect(() => checkStylesheetOrder(page(PRELOAD, STYLESHEET, WAIT, SCRIPT, JSON_LD))).not.toThrow()
  })

  it('fails the stylesheet before the module script with nothing to wait for it', () => {
    expect(() => checkStylesheetOrder(page(STYLESHEET, SCRIPT))).toThrow('no inline script waits for the stylesheet')
    expect(() => checkStylesheetOrder(page(WAIT, STYLESHEET, SCRIPT)), 'wait before the stylesheet').toThrow(
      'no inline script waits',
    )
    expect(() => checkStylesheetOrder(page(STYLESHEET, SCRIPT, WAIT)), 'wait after the script').toThrow(
      'no inline script waits',
    )
  })

  it('fails the module script before the stylesheet', () => {
    expect(() => checkStylesheetOrder(VITE)).toThrow('a module <script> comes before a stylesheet <link>')
  })

  it('fails the script between two stylesheets', () => {
    const second = '<link rel="stylesheet" href="/assets/other-abc.css">'
    expect(() => checkStylesheetOrder(page(STYLESHEET, SCRIPT, second))).toThrow('comes before')
  })

  it('ignores the JSON-LD script, which is not a module', () => {
    expect(() => checkStylesheetOrder(page(JSON_LD, STYLESHEET, WAIT, SCRIPT))).not.toThrow()
  })

  it('fails a head with no stylesheet or no module script', () => {
    expect(() => checkStylesheetOrder(page(SCRIPT))).toThrow('no stylesheet <link>')
    expect(() => checkStylesheetOrder(page(STYLESHEET))).toThrow('no module <script>')
    expect(() => checkStylesheetOrder('<body></body>')).toThrow('no <head>')
  })
})

describe('checkOrder', () => {
  type WriteBundle = (options: { dir: string }) => Promise<void>
  const plugin = checkOrder() as Plugin & {
    applyToEnvironment: (environment: { name: string }) => boolean
    writeBundle: WriteBundle
  }
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'fafanua-order-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('only runs on the client build', () => {
    expect(plugin.apply).toBe('build')
    expect(plugin.applyToEnvironment({ name: 'client' })).toBe(true)
    expect(plugin.applyToEnvironment({ name: 'fafanua_website' })).toBe(false)
  })

  it('passes a built page with the stylesheet first', async () => {
    await writeFile(path.join(dir, 'index.html'), reorder(VITE))
    await expect(plugin.writeBundle({ dir })).resolves.toBeUndefined()
  })

  it('fails the build if the script comes first', async () => {
    await writeFile(path.join(dir, 'index.html'), VITE)
    await expect(plugin.writeBundle({ dir })).rejects.toThrow('comes before a stylesheet')
  })

  it('fails the build if index.html is missing', async () => {
    await expect(plugin.writeBundle({ dir })).rejects.toThrow('index.html is missing')
  })
})
