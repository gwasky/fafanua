import { describe, expect, it } from 'vitest'
import { notFound, pages } from './pages.ts'
import { ORGANISATION_ID, SITE_URL, pageHead, pageMeta, pageStructuredData } from './seo.ts'

// The landing pages' head tags (#67), as the build writes them.
const headOf = (html: string) => new DOMParser().parseFromString(`<head>${html}</head>`, 'text/html')

describe('pageMeta', () => {
  it('gives every page a unique title and description', () => {
    const metas = pages.map(pageMeta)
    expect(new Set(metas.map((meta) => meta.title)).size).toBe(13)
    expect(new Set(metas.map((meta) => meta.description)).size).toBe(13)
  })

  it('makes each canonical the page path on the production domain, without www or a slash at the end', () => {
    for (const page of pages) {
      expect(pageMeta(page).url).toBe(`https://fafanua.tech${page.path}`)
    }
    expect(SITE_URL).toBe('https://fafanua.tech/')
  })

  it('gives the not-found page no canonical URL', () => {
    expect(pageMeta(notFound).url).toBeUndefined()
  })
})

describe('pageHead', () => {
  it.each(pages.map((page) => [page.path, page] as const))('writes the tags for %s', (_path, page) => {
    const meta = pageMeta(page)
    const doc = headOf(pageHead(page))
    const content = (selector: string) =>
      [...doc.querySelectorAll(selector)].map((element) => element.getAttribute('content'))

    expect(doc.title).toBe(meta.title)
    expect(content('meta[name="description"]')).toEqual([meta.description])
    expect([...doc.querySelectorAll('link[rel="canonical"]')].map((link) => link.getAttribute('href'))).toEqual([meta.url])
    expect(content('meta[property="og:url"]')).toEqual([meta.url])
    expect(content('meta[property="og:title"]')).toEqual([meta.title])
    expect(content('meta[property="og:description"]')).toEqual([meta.description])
    expect(content('meta[property="og:image"]')).toEqual(['https://fafanua.tech/og-image.png'])
    expect(content('meta[name="twitter:card"]')).toEqual(['summary_large_image'])
    expect(doc.querySelector('meta[name="robots"]')).toBeNull()

    const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((script) =>
      JSON.parse(script.textContent!),
    )
    expect(blocks).toEqual(pageStructuredData(page))
  })

  it('marks the not-found page noindex, with no canonical or social tags', () => {
    const doc = headOf(pageHead(notFound))
    expect(doc.title).toBe('Page not found | Fafanua Technologies')
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
    expect(doc.querySelector('link[rel="canonical"], meta[property^="og:"], script')).toBeNull()
  })

  it('gives Health the title of its plan (#94)', () => {
    const page = pages.find((item) => item.path === '/solutions/health')!
    expect(pageHead(page)).toContain('<title>Traceable Health Data Analytics Uganda | Fafanua</title>')
  })

  it('escapes the ampersands in titles', () => {
    const page = pages.find((item) => item.path === '/solutions/financial-services')!
    expect(pageHead(page)).toContain('<title>Reconciliation &amp; Banking Analytics Uganda | Fafanua</title>')
  })

  it('gives Education the title of its issue, its ampersand escaped (issue 100)', () => {
    const page = pages.find((item) => item.path === '/solutions/education')!
    expect(pageHead(page)).toContain('<title>Learner &amp; Education Data Analytics Uganda | Fafanua</title>')
  })

  it('gives Retail & Distribution the recommended title of its issue, its ampersand escaped, pending the owner (issue 101)', () => {
    const page = pages.find((item) => item.path === '/solutions/retail-distribution')!
    expect(pageHead(page)).toContain('<title>Retail Analytics Uganda: Sales, Stock &amp; Margin | Fafanua</title>')
  })
})

describe('pageStructuredData', () => {
  it('gives every page a two-step breadcrumb trail from the homepage', () => {
    for (const page of pages) {
      const [breadcrumbs] = pageStructuredData(page) as Record<string, unknown>[]
      expect(breadcrumbs['@type']).toBe('BreadcrumbList')
      expect(breadcrumbs.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: pageMeta(page).name, item: pageMeta(page).url },
      ])
    }
  })

  it('describes each service page as a Service provided by the organisation', () => {
    for (const page of pages.filter((item) => item.kind === 'service')) {
      const service = pageStructuredData(page)[1] as Record<string, unknown>
      expect(service['@type']).toBe('Service')
      expect(service.provider).toEqual({ '@id': ORGANISATION_ID })
      expect(service.url).toBe(pageMeta(page).url)
    }
    for (const page of pages.filter((item) => item.kind === 'solution')) {
      expect(pageStructuredData(page)).toHaveLength(1)
    }
  })

  it('publishes nothing for the not-found page', () => {
    expect(pageStructuredData(notFound)).toEqual([])
  })
})
