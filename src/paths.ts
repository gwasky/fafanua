import { managedServices, services } from './data/services.ts'
import { solutions } from './data/solutions.ts'

// The landing pages' paths (SEO plan §16, #67), from each service's and
// sector's slug. Kept apart from pages.ts, which holds the pages' copy, so
// the homepage can link to them without shipping that copy.

export const servicePath = (id: string) =>
  `/services/${services.find((service) => service.id === id)?.slug ?? managedServices.slug}`

export const solutionPath = (id: string) =>
  `/solutions/${solutions.find((solution) => solution.id === id)!.slug}`
