import { heroPromise } from './data/hero.ts'
import { serviceName } from './pages.ts'
import type { Page } from './pages.ts'

// The landing pages' search and social metadata (SEO plan §20, §21 and
// §23, #67), written into each pre-rendered page's head by the build. The
// homepage's is in index.html, checked by vite.config.ts.

// The production URL (AGENTS.md). vite.config.ts uses the same constant.
export const SITE_URL = 'https://fafanua.tech/'

// The homepage organisation's @id, which vite.config.ts publishes; the
// service pages name it as their provider.
export const ORGANISATION_ID = `${SITE_URL}#organisation`

export const OG_IMAGE = `${SITE_URL}og-image.png`

// The social image shows the brand promise, read from hero.ts.
export const OG_IMAGE_ALT = `Fafanua Technologies logo with the words "${heroPromise}"`

export type PageMeta = {
  readonly title: string
  readonly description: string
  /** The absolute canonical URL; none for the not-found page. */
  readonly url?: string
  /** The page's name in the breadcrumb trail. */
  readonly name: string
}

/** The page's absolute URL on the production domain, without a slash at the end. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.slice(1)}`

export function pageMeta(page: Page): PageMeta {
  switch (page.kind) {
    case 'service':
      return {
        title: page.service.title,
        description: page.service.description,
        url: absoluteUrl(page.path),
        name: serviceName(page.service.key),
      }
    case 'solution':
      return {
        title: page.copy.title,
        description: page.copy.description,
        url: absoluteUrl(page.path),
        name: page.solution.title,
      }
    case 'not-found':
      return {
        title: 'Page not found | Fafanua Technologies',
        description: 'The page you were looking for does not exist or has moved.',
        name: 'Page not found',
      }
  }
}

/**
 * The page's JSON-LD, besides the organisation that every page carries: a
 * breadcrumb trail from the homepage, and for a service page the service
 * itself, provided by the organisation. None for the not-found page.
 */
export function pageStructuredData(page: Page) {
  const meta = pageMeta(page)
  if (meta.url === undefined) return []
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: meta.name, item: meta.url },
    ],
  }
  if (page.kind !== 'service') return [breadcrumbs]
  return [
    breadcrumbs,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.name,
      serviceType: meta.name,
      description: meta.description,
      url: meta.url,
      provider: { '@id': ORGANISATION_ID },
      areaServed: ['Uganda', 'East Africa'],
    },
  ]
}

const escapeAttribute = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The head tags for a landing page, as HTML: its title, description,
 * canonical link, Open Graph and Twitter tags and JSON-LD. The not-found
 * page has a title, a description and a noindex robots tag only.
 */
export function pageHead(page: Page) {
  const meta = pageMeta(page)
  const tags = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(meta.description)}">`,
  ]
  if (meta.url === undefined) {
    tags.push('<meta name="robots" content="noindex">')
    return tags.join('\n    ')
  }
  const properties: [string, string][] = [
    ['og:type', 'website'],
    ['og:url', meta.url],
    ['og:site_name', 'Fafanua Technologies'],
    ['og:locale', 'en_GB'],
    ['og:title', meta.title],
    ['og:description', meta.description],
    ['og:image', OG_IMAGE],
    ['og:image:type', 'image/png'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', OG_IMAGE_ALT],
  ]
  const names: [string, string][] = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', meta.title],
    ['twitter:description', meta.description],
    ['twitter:image', OG_IMAGE],
    ['twitter:image:alt', OG_IMAGE_ALT],
  ]
  tags.push(`<link rel="canonical" href="${escapeAttribute(meta.url)}">`)
  for (const [property, value] of properties) {
    tags.push(`<meta property="${property}" content="${escapeAttribute(value)}">`)
  }
  for (const [name, value] of names) {
    tags.push(`<meta name="${name}" content="${escapeAttribute(value)}">`)
  }
  for (const data of pageStructuredData(page)) {
    // "<" is escaped so the JSON cannot close the script tag.
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }
  return tags.join('\n    ')
}
