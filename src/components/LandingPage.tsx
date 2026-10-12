import type { Page } from '../pages.ts'
import NotFoundPage from './NotFoundPage.tsx'
import PageLayout from './PageLayout.tsx'
import ServicePage from './ServicePage.tsx'
import SolutionPage from './SolutionPage.tsx'

// The landing page at one of the paths in pages.ts, in the shared frame.
// The build pre-renders it (render.tsx) and page.tsx hydrates it.
function LandingPage({ page }: { page: Page }) {
  return (
    <PageLayout>
      {page.kind === 'service' && <ServicePage page={page.service} />}
      {page.kind === 'solution' && <SolutionPage solution={page.solution} page={page.copy} />}
      {page.kind === 'not-found' && <NotFoundPage />}
    </PageLayout>
  )
}

export default LandingPage
