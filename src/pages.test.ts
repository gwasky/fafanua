import { describe, expect, it } from 'vitest'
import seoPlan from '../_docs/fafanua-seo-keyword-and-implementation-plan.md?raw'
import { managedServices, servicePages, services } from './data/services.ts'
import { solutions } from './data/solutions.ts'
import { notFound, pageFor, pages, serviceName, servicePath, serviceStage, solutionPath } from './pages.ts'

// The URL architecture of SEO plan §16 (#67).
const section16 = /# 16\. Recommended URL Architecture([\s\S]*?)\n# 17\./.exec(seoPlan)![1]
const planPaths = [...section16.matchAll(/^(\/(?:services|solutions)\/[a-z-]+)$/gm)].map(
  ([, path]) => path,
)

describe('pages', () => {
  it('has exactly the seven service and six solution paths of SEO plan §16', () => {
    expect(planPaths).toHaveLength(13)
    expect(pages.map((page) => page.path).sort()).toEqual([...planPaths].sort())
  })

  it('lists the service pages in lifecycle order, then Managed, then the solutions', () => {
    expect(pages.slice(0, 7).map((page) => page.kind)).toEqual(Array(7).fill('service'))
    expect(pages.slice(7).map((page) => page.kind)).toEqual(Array(6).fill('solution'))
    expect(servicePages.map((page) => page.key)).toEqual([
      ...services.map((service) => service.id),
      'managed-data-and-analytics',
    ])
  })

  it('uses clean paths: lowercase, no hash, no extension, no trailing slash', () => {
    for (const page of pages) expect(page.path).toMatch(/^\/[a-z]+\/[a-z]+(-[a-z]+)*$/)
  })

  it('finds a page by its path, with or without a trailing slash', () => {
    expect(pageFor('/solutions/health')).toBe(pages.find((page) => page.path === '/solutions/health'))
    expect(pageFor('/solutions/health/')).toBe(pageFor('/solutions/health'))
  })

  it('answers the not-found page for any other path', () => {
    for (const path of ['/', '/services', '/services/', '/services/ai', '/solutions/HEALTH', '/404']) {
      expect(pageFor(path)).toBe(notFound)
    }
  })

  it('builds each path from the slug', () => {
    expect(servicePath('data-engineering-and-integration')).toBe('/services/data-engineering-integration')
    expect(servicePath('managed-data-and-analytics')).toBe('/services/managed-data-analytics')
    expect(solutionPath('retail-and-distribution')).toBe('/solutions/retail-distribution')
  })

  it('names and numbers each service as its card does, and Managed as Operate', () => {
    expect(serviceName('data-quality-and-reliability')).toBe(services[3].name)
    expect(serviceStage('data-quality-and-reliability')).toEqual({ number: '04', label: 'Trust' })
    expect(serviceName('managed-data-and-analytics')).toBe(managedServices.heading)
    expect(serviceStage('managed-data-and-analytics')).toEqual({ number: undefined, label: 'Operate' })
  })

  it('has one page per solution', () => {
    expect(solutions).toHaveLength(6)
  })
})
