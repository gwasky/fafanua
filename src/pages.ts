import { managedServices, services, stages } from './data/services.ts'
import { servicePages, type ServiceKey, type ServicePage } from './data/servicePages.ts'
import { solutions, type Solution } from './data/solutions.ts'
import { solutionPages, type SolutionPage } from './data/solutionPages.ts'
import { servicePath, solutionPath } from './paths.ts'

export { servicePath, solutionPath }

// The site's landing pages besides the homepage (SEO plan §16, #67): the
// seven service pages and the six solution pages, at clean paths with no
// hash, plus the not-found page. The build pre-renders each of them to its
// own HTML file (vite.config.ts), page.tsx hydrates it, and sitemap.xml
// lists every path in `pages`.

export type Page =
  | { readonly kind: 'service'; readonly path: string; readonly service: ServicePage }
  | {
      readonly kind: 'solution'
      readonly path: string
      readonly solution: Solution
      readonly copy: SolutionPage
    }
  | { readonly kind: 'not-found'; readonly path: string }

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
    path: servicePath(service.key),
    service,
  })),
  ...solutions.map((solution) => ({
    kind: 'solution' as const,
    path: solutionPath(solution.id),
    solution,
    copy: solutionPages[solution.id],
  })),
]

// Served with a 404 status by the Worker for every unknown path.
export const notFound: Page = { kind: 'not-found', path: '/404' }

/** The page at a path, ignoring a trailing slash; notFound if none. */
export function pageFor(pathname: string): Page {
  const path = pathname.replace(/\/+$/, '')
  return pages.find((page) => page.path === path) ?? notFound
}
