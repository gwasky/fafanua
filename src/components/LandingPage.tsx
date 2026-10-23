import type { Page } from '../pages.ts'
import NotFoundPage from './NotFoundPage.tsx'
import PageLayout from './PageLayout.tsx'
import ServicePage from './ServicePage.tsx'
import SectorLandingPage from './SectorLandingPage.tsx'
import SolutionPage from './SolutionPage.tsx'

// The landing page at one of the paths in pages.ts, in the shared frame.
// The build pre-renders it (render.tsx) and page.tsx hydrates it. A
// solution page on the shared landing-page foundation (#93, layout
// 'sector') marks Solutions as the header's current section.
function LandingPage({ page }: { page: Page }) {
  if (page.kind === 'solution' && page.copy.layout === 'sector') {
    return (
      <PageLayout sector current="solutions">
        <SectorLandingPage page={page.copy} />
      </PageLayout>
    )
  }
  return (
    <PageLayout>
      {page.kind === 'service' && <ServicePage page={page.service} />}
      {page.kind === 'solution' && page.copy.layout !== 'sector' && <SolutionPage solution={page.solution} page={page.copy} />}
      {page.kind === 'not-found' && <NotFoundPage />}
    </PageLayout>
  )
}

export default LandingPage
