// Checks robots.txt and sitemap.xml in public/, which the build copies to
// dist/client/ unchanged. Runs in jsdom for DOMParser.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { pages } from '../src/pages.ts'

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')
const read = (name: string) => readFileSync(path.join(PUBLIC, name), 'utf8')

// The production URL (AGENTS.md). vite.config.ts is not imported: its
// Cloudflare plugin cannot load under jsdom.
const SITE_URL = 'https://fafanua.tech/'
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

describe('robots.txt', () => {
  it('allows everything and points at the sitemap, exactly as SEO plan §26 writes it', () => {
    expect(read('robots.txt')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://fafanua.tech/sitemap.xml\n',
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

  // SEO plan §26 (#67): the canonical, indexable pages only, which are the
  // homepage and every landing page in src/pages.ts, in that order; never
  // the 404 page.
  it('lists the homepage, then every service and solution page, and nothing else', () => {
    const urls = [...doc.getElementsByTagNameNS(SITEMAP_NS, 'url')]
    const locs = urls.map((url) => {
      const loc = url.getElementsByTagNameNS(SITEMAP_NS, 'loc')
      expect(loc).toHaveLength(1)
      return loc[0].textContent
    })
    expect(locs).toEqual([SITE_URL, ...pages.map((page) => `${SITE_URL}${page.path.slice(1)}`)])
    expect(locs).toHaveLength(14)
    expect(locs.filter((loc) => loc!.includes('/services/'))).toHaveLength(7)
    expect(locs.filter((loc) => loc!.includes('/solutions/'))).toHaveLength(6)
    expect(locs.some((loc) => loc!.includes('404'))).toBe(false)
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
