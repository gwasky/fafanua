import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import { email } from './src/data/contact.ts'

// The Inter woff2 imported by src/styles/fonts.css. Its built name is
// hashed, so a static preload link in index.html cannot point at it.
export const FONT_FILE = /(^|\/)inter-latin-wght-normal-[\w-]+\.woff2$/

/**
 * Preloads the Inter font in the production build, so the browser fetches
 * it alongside the stylesheet instead of after parsing it. crossorigin is
 * required: fonts are always fetched in CORS mode, and without it the
 * preload is not reused and the font downloads twice. The dev server
 * skips the preload.
 */
export function preloadFont(): Plugin {
  let base = '/'
  return {
    name: 'fafanua:preload-font',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonts = Object.keys(ctx.bundle ?? {}).filter((file) =>
          FONT_FILE.test(file),
        )
        if (fonts.length !== 1) {
          throw new Error(
            `Expected one Inter woff2 in the bundle, found ${fonts.length}`,
          )
        }
        // Straight after <title>, so it stays below the charset and
        // viewport meta tags and above the script and stylesheet Vite
        // injects.
        const link = `<link rel="preload" href="${base}${fonts[0]}" as="font" type="font/woff2" crossorigin>`
        if (!html.includes('</title>')) {
          throw new Error('index.html has no <title> to place the preload after')
        }
        return html.replace('</title>', `</title>\n    ${link}`)
      },
    },
  }
}

// A module <script src> tag, and a stylesheet <link> tag, as Vite writes
// them into the built head.
const MODULE_SCRIPT = /<script\b[^>]*\btype="module"[^>]*\bsrc="[^"]*"[^>]*><\/script>/gi
const STYLESHEET = /<link\b[^>]*\brel="stylesheet"[^>]*>/gi

/**
 * Moves the module script Vite injects so that it comes after the
 * stylesheet links in the built head (#62). Vite writes the script first,
 * and WebKit can then run it before any CSS applies: the header paints in
 * the browser's default colours, and a hash landing scrolls in an
 * unstyled layout. Each script keeps its attributes; only the order
 * changes. The dev server is left alone.
 */
export function stylesheetFirst(): Plugin {
  return {
    name: 'fafanua:stylesheet-first',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const head = /<head\b[^>]*>[\s\S]*?<\/head>/i.exec(html)
        if (!head) throw new Error('index.html has no <head> to order')
        const stylesheets = [...head[0].matchAll(STYLESHEET)]
        if (stylesheets.length === 0) return html
        const scripts = head[0].match(MODULE_SCRIPT) ?? []
        if (scripts.length === 0) return html

        // Take the scripts out, with the indentation before each, then put
        // them back straight after the last stylesheet.
        let body = head[0]
        for (const script of scripts) {
          body = body.replace(new RegExp(`\\n?[ \\t]*${escape(script)}`), '')
        }
        const last = [...body.matchAll(STYLESHEET)].at(-1)!
        const end = last.index + last[0].length
        const indent = /[ \t]*$/.exec(body.slice(0, last.index))![0]
        body = body.slice(0, end) + scripts.map((script) => `\n${indent}${script}`).join('') + body.slice(end)
        return html.slice(0, head.index) + body + html.slice(head.index + head[0].length)
      },
    },
  }
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Checks that the built head links at least one stylesheet and loads at
 * least one module script, and that every stylesheet comes before the
 * first module script (#62). Throws when it does not.
 */
export function checkStylesheetOrder(html: string) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1]
  if (head === undefined) {
    throw new Error('index.html order check failed: no <head> element')
  }
  const stylesheets = [...head.matchAll(STYLESHEET)].map((match) => match.index)
  const scripts = [...head.matchAll(MODULE_SCRIPT)].map((match) => match.index)
  if (stylesheets.length === 0) {
    throw new Error('index.html order check failed: no stylesheet <link> in <head>')
  }
  if (scripts.length === 0) {
    throw new Error('index.html order check failed: no module <script> in <head>')
  }
  if (Math.max(...stylesheets) > Math.min(...scripts)) {
    throw new Error(
      'index.html order check failed: a module <script> comes before a stylesheet <link>, so WebKit can run the page before its CSS applies (#62)',
    )
  }
}

/**
 * Fails the build if the client's index.html loads its module script
 * before its stylesheet, by running checkStylesheetOrder() on the file as
 * written to disk.
 */
export function checkOrder(): Plugin {
  return {
    name: 'fafanua:check-order',
    apply: 'build',
    applyToEnvironment: (environment) => environment.name === 'client',
    async writeBundle(options) {
      const file = path.join(options.dir ?? '', 'index.html')
      let html: string
      try {
        html = await readFile(file, 'utf8')
      } catch {
        throw new Error(`index.html order check failed: ${file} is missing`)
      }
      checkStylesheetOrder(html)
    },
  }
}

// The production URL. Every absolute URL in the page's metadata, robots.txt
// and sitemap.xml starts with it.
export const SITE_URL = 'https://fafanua.tech/'

// The metadata index.html must carry, from _docs/plan.md Section 16 and
// issue #14. checkHtml() fails the build if the built page differs.
export const TITLE = 'Fafanua Technologies | Trusted Data Foundations'
export const DESCRIPTION =
  'Fafanua Technologies helps African organisations build trusted data platforms, governance systems, analytics models, and reporting products.'
export const IMAGE_ALT =
  'Fafanua Technologies logo with the words "Build a data foundation you can trust."'

const PROPERTIES: Record<string, string> = {
  'og:type': 'website',
  'og:url': SITE_URL,
  'og:site_name': 'Fafanua Technologies',
  'og:locale': 'en_GB',
  'og:title': TITLE,
  'og:description': DESCRIPTION,
  'og:image': `${SITE_URL}og-image.png`,
  'og:image:type': 'image/png',
  'og:image:width': '1200',
  'og:image:height': '630',
  'og:image:alt': IMAGE_ALT,
}

const NAMES: Record<string, string> = {
  description: DESCRIPTION,
  'twitter:card': 'summary_large_image',
  'twitter:title': PROPERTIES['og:title'],
  'twitter:description': PROPERTIES['og:description'],
  'twitter:image': PROPERTIES['og:image'],
  'twitter:image:alt': PROPERTIES['og:image:alt'],
}

/** The schema.org organisation data published as JSON-LD. */
export function organisation(address: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fafanua Technologies Limited',
    url: SITE_URL,
    logo: `${SITE_URL}apple-touch-icon.png`,
    email: address,
  }
}

/**
 * Adds the organisation JSON-LD as the last element in <head>, in dev and
 * in the build. The email comes from src/data/contact.ts, so it is never
 * typed into index.html. "<" is escaped so the JSON cannot close the
 * script tag.
 */
export function structuredData(address = email): Plugin {
  const json = JSON.stringify(organisation(address)).replace(/</g, '\\u003c')
  const script = `<script type="application/ld+json">${json}</script>`
  return {
    name: 'fafanua:structured-data',
    transformIndexHtml: {
      // After Vite adds the built script and stylesheet, so it stays last.
      order: 'post',
      handler(html) {
        if (!html.includes('</head>')) {
          throw new Error('index.html has no </head> to place the JSON-LD before')
        }
        return html.replace('</head>', `  ${script}\n  </head>`)
      },
    },
  }
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  '#39': "'",
}

const decode = (text: string) =>
  text.replace(/&(amp|quot|apos|lt|gt|#39);/g, (_, name: string) => ENTITIES[name])

/** Reads the attributes of every <name …> tag in a piece of HTML. */
function tags(html: string, name: string) {
  const found: Record<string, string>[] = []
  for (const [, body] of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))) {
    const attributes: Record<string, string> = {}
    for (const [, key, double, single, bare] of body.matchAll(
      /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
    )) {
      attributes[key.toLowerCase()] = decode(double ?? single ?? bare ?? '')
    }
    found.push(attributes)
  }
  return found
}

/**
 * Checks the built index.html's title, description, language, canonical,
 * Open Graph and Twitter tags and JSON-LD. Throws one error listing every
 * problem found.
 */
export function checkHtml(html: string, address = email) {
  const problems: string[] = []
  const expectOne = (label: string, values: string[], expected: string) => {
    if (values.length !== 1) {
      problems.push(`expected one ${label}, found ${values.length}`)
    } else if (values[0] !== expected) {
      problems.push(`${label} is ${JSON.stringify(values[0])}, expected ${JSON.stringify(expected)}`)
    }
  }

  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1]
  if (head === undefined) {
    throw new Error('index.html SEO check failed:\n- no <head> element')
  }

  expectOne('<html lang>', tags(html, 'html').map((tag) => tag.lang ?? ''), 'en-GB')
  expectOne(
    '<title>',
    [...head.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(([, text]) => decode(text)),
    TITLE,
  )

  const metas = tags(head, 'meta')
  for (const [name, value] of Object.entries(NAMES)) {
    expectOne(
      `<meta name="${name}">`,
      metas.filter((tag) => tag.name === name).map((tag) => tag.content ?? ''),
      value,
    )
  }
  for (const [property, value] of Object.entries(PROPERTIES)) {
    expectOne(
      `<meta property="${property}">`,
      metas.filter((tag) => tag.property === property).map((tag) => tag.content ?? ''),
      value,
    )
  }
  for (const name of ['twitter:site', 'twitter:creator']) {
    if (metas.some((tag) => tag.name === name)) {
      problems.push(`<meta name="${name}"> must not be present`)
    }
  }
  if (
    metas.some(
      (tag) => tag.name?.toLowerCase() === 'robots' && /noindex|nofollow/i.test(tag.content ?? ''),
    )
  ) {
    problems.push('<meta name="robots"> must not block indexing')
  }

  expectOne(
    '<link rel="canonical">',
    tags(head, 'link').filter((tag) => tag.rel === 'canonical').map((tag) => tag.href ?? ''),
    SITE_URL,
  )

  const blocks = [
    ...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ].map(([, json]) => json)
  if (blocks.length !== 1) {
    problems.push(`expected one JSON-LD <script> in <head>, found ${blocks.length}`)
  } else {
    let data: unknown
    try {
      data = JSON.parse(blocks[0])
    } catch (error) {
      problems.push(`JSON-LD is not valid JSON: ${(error as Error).message}`)
    }
    if (data !== undefined) {
      const expected: Record<string, string> = organisation(address)
      const actual = data as Record<string, unknown>
      const keys = Object.keys(actual).sort()
      if (keys.join() !== Object.keys(expected).sort().join()) {
        problems.push(
          `JSON-LD has keys ${keys.join(', ')}, expected ${Object.keys(expected).sort().join(', ')}`,
        )
      }
      for (const [key, value] of Object.entries(expected)) {
        if (key in actual && actual[key] !== value) {
          const source = key === 'email' ? ' (from src/data/contact.ts)' : ''
          problems.push(
            `JSON-LD ${key} is ${JSON.stringify(actual[key])}, expected ${JSON.stringify(value)}${source}`,
          )
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`index.html SEO check failed:\n- ${problems.join('\n- ')}`)
  }
}

/**
 * Fails the build if the client's index.html is missing or its metadata
 * is wrong, by running checkHtml() on the file as written to disk.
 */
export function checkSeo(address = email): Plugin {
  return {
    name: 'fafanua:check-seo',
    apply: 'build',
    applyToEnvironment: (environment) => environment.name === 'client',
    async writeBundle(options) {
      const file = path.join(options.dir ?? '', 'index.html')
      let html: string
      try {
        html = await readFile(file, 'utf8')
      } catch {
        throw new Error(`index.html SEO check failed: ${file} is missing`)
      }
      checkHtml(html, address)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The Cloudflare plugin runs on the Workers runtime, which clashes with
  // Vitest's jsdom environment, so it is left out under test.
  plugins: [
    react(),
    preloadFont(),
    structuredData(),
    stylesheetFirst(),
    checkSeo(),
    checkOrder(),
    ...(process.env.VITEST ? [] : [cloudflare()]),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // e2e/ holds the Playwright specs, run by npm run test:e2e.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
