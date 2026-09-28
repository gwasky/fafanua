// Checks robots.txt and sitemap.xml in public/, which the build copies to
// dist/client/ unchanged. Runs in jsdom for DOMParser.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')
const read = (name: string) => readFileSync(path.join(PUBLIC, name), 'utf8')

// The production URL (AGENTS.md). vite.config.ts is not imported: its
// Cloudflare plugin cannot load under jsdom.
const SITE_URL = 'https://fafanua.tech/'
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

describe('robots.txt', () => {
  it('allows everything and points at the sitemap, in exactly three lines', () => {
    expect(read('robots.txt')).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://fafanua.tech/sitemap.xml\n',
    )
  })
})

describe('sitemap.xml', () => {
  const doc = new DOMParser().parseFromString(read('sitemap.xml'), 'application/xml')
  const root = doc.documentElement

  it('is well-formed XML', () => {
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
  })

  it('is a urlset in the sitemap 0.9 namespace', () => {
    expect(root.localName).toBe('urlset')
    expect(root.namespaceURI).toBe(SITEMAP_NS)
  })

  it('lists exactly one URL, the production home page', () => {
    const urls = doc.getElementsByTagNameNS(SITEMAP_NS, 'url')
    expect(urls).toHaveLength(1)
    const locs = urls[0].getElementsByTagNameNS(SITEMAP_NS, 'loc')
    expect(locs).toHaveLength(1)
    expect(locs[0].textContent).toBe(SITE_URL)
  })

  it('has no fragment URLs and no lastmod, changefreq or priority', () => {
    const text = read('sitemap.xml')
    expect(text).not.toContain('#')
    for (const name of ['lastmod', 'changefreq', 'priority']) {
      expect(doc.getElementsByTagNameNS(SITEMAP_NS, name)).toHaveLength(0)
    }
    // Only urlset, url and loc elements.
    const names = [...doc.getElementsByTagName('*')].map((element) => element.localName)
    expect(new Set(names)).toEqual(new Set(['urlset', 'url', 'loc']))
  })
})
