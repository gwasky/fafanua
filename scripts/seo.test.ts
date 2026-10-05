// @vitest-environment node
// Checks the search and social metadata: the tags in index.html, the
// plugin in vite.config.ts that adds the JSON-LD, and the build-time check
// that fails the build when the built page is wrong.
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { email, phone } from '../src/data/contact.ts'
import {
  DESCRIPTION,
  SITE_URL,
  TITLE,
  checkHtml,
  checkSeo,
  structuredData,
} from '../vite.config.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const PLAN = readFileSync(path.join(ROOT, '_docs', 'plan.md'), 'utf8')

type HtmlPlugin = Plugin & {
  transformIndexHtml: { order: string; handler: (html: string) => string }
}

// Runs the JSON-LD plugin on some HTML, as Vite would.
const addJsonLd = (html: string, address?: string) =>
  (structuredData(address) as HtmlPlugin).transformIndexHtml.handler(html)

// index.html as the build writes it, before Vite adds its script tags.
const BUILT = addJsonLd(SOURCE)

const jsonLdOf = (html: string) =>
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)![1]

describe('copy', () => {
  it('uses the plan Section 16 title and description verbatim', () => {
    expect(PLAN).toContain(`> ${TITLE}\n`)
    expect(PLAN).toContain(`> ${DESCRIPTION}\n`)
  })

  it('uses the production domain without www', () => {
    expect(SITE_URL).toBe('https://fafanua.tech/')
  })
})

describe('index.html', () => {
  it('passes the build check once the JSON-LD is added', () => {
    expect(() => checkHtml(BUILT)).not.toThrow()
  })

  it('keeps charset first and the title before the icon tags', () => {
    const head = /<head>\s*([\s\S]*?)<\/head>/.exec(SOURCE)![1]
    expect(head.startsWith('<meta charset="UTF-8" />')).toBe(true)
    expect(head.indexOf('</title>')).toBeLessThan(head.indexOf('rel="icon"'))
    expect(head.indexOf('name="theme-color"')).toBeLessThan(
      head.indexOf('name="description"'),
    )
  })

  it('does not type the email address or the phone number', () => {
    expect(SOURCE).not.toContain(email)
    expect(SOURCE).not.toContain(phone)
    expect(SOURCE).not.toContain(phone.replace(/ /g, ''))
    expect(SOURCE).not.toContain('application/ld+json')
  })

  it('makes every metadata URL absolute on the production domain', () => {
    const urls = [
      ...SOURCE.matchAll(/<(?:meta|link)\b[^>]*(?:content|href)="([^"]*)"/g),
    ]
      .map(([, value]) => value)
      .filter((value) => /^(?:\/|https?:|\.)|\.(?:png|xml|txt)$/.test(value))
    // The icon links from #5 stay relative; everything else is absolute.
    const added = urls.filter(
      (value) => !['/favicon.svg', '/apple-touch-icon.png'].includes(value),
    )
    expect(added.length).toBeGreaterThan(0)
    for (const url of added) {
      expect(url.startsWith(SITE_URL)).toBe(true)
      expect(url).not.toMatch(/localhost|workers\.dev|www\./)
    }
  })

  it('has no robots meta tag and no Twitter account tags', () => {
    expect(SOURCE).not.toMatch(/name="robots"|twitter:site|twitter:creator/)
  })
})

describe('structuredData', () => {
  it('runs in dev and build, after Vite adds its tags', () => {
    const plugin = structuredData() as HtmlPlugin
    expect(plugin.apply).toBeUndefined()
    expect(plugin.transformIndexHtml.order).toBe('post')
  })

  it('adds one JSON-LD script as the last element in <head>', () => {
    const html = addJsonLd('<head>\n    <title>x</title>\n  </head>')
    expect(html).toMatch(/<script type="application\/ld\+json">\{.*\}<\/script>\n {2}<\/head>$/)
  })

  it('publishes exactly the organisation fields, with the contact email and phone', () => {
    expect(JSON.parse(jsonLdOf(BUILT))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Fafanua Technologies Limited',
      url: 'https://fafanua.tech/',
      logo: 'https://fafanua.tech/apple-touch-icon.png',
      email,
      telephone: phone,
    })
    expect(email).not.toMatch(/^mailto:/)
  })

  // The owner's addition on #61 (2026-10-05): the number as the page shows
  // it, read from src/data/contact.ts, which the CTA and footer also use.
  it('publishes the telephone +256 752 008822, the number the page links to', () => {
    expect(JSON.parse(jsonLdOf(BUILT)).telephone).toBe('+256 752 008822')
    expect(phone).toBe('+256 752 008822')
  })

  it('follows the email constant it is given', () => {
    const html = addJsonLd(SOURCE, 'hello@example.org')
    expect(JSON.parse(jsonLdOf(html)).email).toBe('hello@example.org')
  })

  it('escapes < so the JSON cannot close the script tag', () => {
    const html = addJsonLd('<head></head>', '</script><b>@x')
    expect(jsonLdOf(html)).not.toContain('<')
    expect(JSON.parse(jsonLdOf(html)).email).toBe('</script><b>@x')
  })

  it('fails if there is no </head>', () => {
    expect(() => addJsonLd('<title>x</title>')).toThrow('no </head>')
  })
})

describe('checkHtml', () => {
  it.each([
    ['a wrong title', [TITLE, 'Fafanua'], '<title> is "Fafanua"'],
    [
      'a wrong description',
      [`name="description" content="${DESCRIPTION}"`, 'name="description" content="x"'],
      '<meta name="description"> is "x"',
    ],
    ['the wrong lang', ['lang="en-GB"', 'lang="en"'], '<html lang> is "en"'],
    [
      'a www canonical',
      ['rel="canonical" href="https://fafanua.tech/"', 'rel="canonical" href="https://www.fafanua.tech/"'],
      '<link rel="canonical"> is "https://www.fafanua.tech/"',
    ],
    [
      'a relative og:image',
      ['property="og:image" content="https://fafanua.tech/og-image.png"', 'property="og:image" content="/og-image.png"'],
      '<meta property="og:image"> is "/og-image.png", expected "https://fafanua.tech/og-image.png"',
    ],
    [
      'a different og:url',
      ['property="og:url" content="https://fafanua.tech/"', 'property="og:url" content="https://fafanua.tech"'],
      '<meta property="og:url">',
    ],
    [
      'a twitter:card that is not the large image',
      ['content="summary_large_image"', 'content="summary"'],
      '<meta name="twitter:card"> is "summary"',
    ],
    [
      'a missing og:title',
      [/\n\s*<meta property="og:title"[^>]*>/, ''],
      'expected one <meta property="og:title">, found 0',
    ],
    [
      'a duplicated og:description',
      ['<meta property="og:description"', '<meta property="og:description" content="x"><meta property="og:description"'],
      'expected one <meta property="og:description">, found 2',
    ],
    ['a missing JSON-LD block', [/<script type="application\/ld\+json">.*<\/script>/, ''], 'expected one JSON-LD <script> in <head>, found 0'],
    ['invalid JSON in the JSON-LD', ['"@type":"Organization",', '"@type":"Organization",,'], 'JSON-LD is not valid JSON'],
    [
      'a mismatched email',
      [`"email":"${email}"`, '"email":"info@example.org"'],
      `JSON-LD email is "info@example.org", expected "${email}" (from src/data/contact.ts)`,
    ],
    [
      'a mismatched telephone',
      [`"telephone":"${phone}"`, '"telephone":"+256 700 000000"'],
      `JSON-LD telephone is "+256 700 000000", expected "${phone}" (from src/data/contact.ts)`,
    ],
    [
      'a missing telephone',
      [`,"telephone":"${phone}"`, ''],
      'JSON-LD has keys',
    ],
    [
      'an extra JSON-LD field',
      ['"@type":"Organization",', '"@type":"Organization","faxNumber":"1",'],
      'JSON-LD has keys',
    ],
    ['a noindex robots tag', ['</title>', '</title><meta name="robots" content="noindex">'], 'must not block indexing'],
    ['a twitter:site tag', ['</title>', '</title><meta name="twitter:site" content="@x">'], 'twitter:site'],
  ] as const)('fails with a clear message for %s', (_, [from, to], message) => {
    const html = BUILT.replace(from, to)
    expect(html).not.toBe(BUILT)
    expect(() => checkHtml(html)).toThrow(message)
  })

  it('lists every problem in one error', () => {
    const html = BUILT.replace(TITLE, 'x').replace('lang="en-GB"', 'lang="en"')
    expect(() => checkHtml(html)).toThrow(/<html lang>[\s\S]*<title>/)
  })

  it('checks the email against the constant it is given', () => {
    expect(() => checkHtml(BUILT, 'other@fafanua.tech')).toThrow(
      'JSON-LD email is "info@fafanua.tech", expected "other@fafanua.tech"',
    )
  })

  it('fails if there is no <head>', () => {
    expect(() => checkHtml('<html></html>')).toThrow('no <head>')
  })
})

describe('checkSeo', () => {
  type WriteBundle = (options: { dir: string }) => Promise<void>
  const plugin = checkSeo() as Plugin & {
    applyToEnvironment: (environment: { name: string }) => boolean
    writeBundle: WriteBundle
  }
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'fafanua-seo-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('only runs on the client build', () => {
    expect(plugin.apply).toBe('build')
    expect(plugin.applyToEnvironment({ name: 'client' })).toBe(true)
    expect(plugin.applyToEnvironment({ name: 'fafanua_website' })).toBe(false)
  })

  it('passes a correct index.html', async () => {
    await writeFile(path.join(dir, 'index.html'), BUILT)
    await expect(plugin.writeBundle({ dir })).resolves.toBeUndefined()
  })

  it('fails the build if index.html is missing', async () => {
    await expect(plugin.writeBundle({ dir })).rejects.toThrow('index.html is missing')
  })

  it('fails the build if index.html is wrong', async () => {
    await writeFile(path.join(dir, 'index.html'), BUILT.replace(TITLE, 'x'))
    await expect(plugin.writeBundle({ dir })).rejects.toThrow('<title> is "x"')
  })
})
