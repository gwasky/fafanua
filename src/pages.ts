import {
  managedServices,
  servicePages,
  services,
  stages,
  type ServiceKey,
  type ServicePage,
} from './data/services.ts'
import { solutions, type Solution } from './data/solutions.ts'

// The site's landing pages besides the homepage (SEO plan §16, #67): the
// seven service pages and the six solution pages, at clean paths with no
// hash, plus the not-found page. The build pre-renders each of them to its
// own HTML file (vite.config.ts), page.tsx hydrates it, and sitemap.xml
// lists every path in `pages`.

export type Page =
  | { readonly kind: 'service'; readonly path: string; readonly service: ServicePage }
  | { readonly kind: 'solution'; readonly path: string; readonly solution: Solution }
  | { readonly kind: 'not-found'; readonly path: string }

export const servicePath = (key: ServiceKey | string) =>
  `/services/${servicePages.find((page) => page.key === key)!.slug}`

export const solutionPath = (id: string) =>
  `/solutions/${solutions.find((solution) => solution.id === id)!.slug}`

/** The service's approved name, as its card or the managed panel shows it. */
export const serviceName = (key: ServiceKey) =>
  services.find((service) => service.id === key)?.name ?? managedServices.heading

/**
 * The service's lifecycle stage and its number, as the cards show them,
 * or Operate (services-positioning doc §1) for Managed Data & Analytics.
 */
export function serviceStage(key: ServiceKey) {
  const index = services.findIndex((service) => service.id === key)
  if (index === -1) return { number: undefined, label: 'Operate' }
  return {
    number: String(index + 1).padStart(2, '0'),
    label: stages[services[index].stage],
  }
}

export const pages: readonly Page[] = [
  ...servicePages.map((service) => ({
    kind: 'service' as const,
    path: `/services/${service.slug}`,
    service,
  })),
  ...solutions.map((solution) => ({
    kind: 'solution' as const,
    path: `/solutions/${solution.slug}`,
    solution,
  })),
]

// Served with a 404 status by the Worker for every unknown path.
export const notFound: Page = { kind: 'not-found', path: '/404' }

/** The page at a path, ignoring a trailing slash; notFound if none. */
export function pageFor(pathname: string): Page {
  const path = pathname.replace(/\/+$/, '')
  return pages.find((page) => page.path === path) ?? notFound
}
