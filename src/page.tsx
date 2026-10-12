import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import Footer from './components/Footer.tsx'
import Header from './components/Header.tsx'
import { FOOTER_ISLAND, HEADER_ISLAND } from './components/PageLayout.tsx'
import './styles/global.css'

// The landing pages' entry (#67). The build pre-renders each page in full
// (render.tsx), so the HTML a crawler or a visitor gets is the whole page.
// Only the header and the footer need the browser, so only they are
// hydrated, and the pages' copy is never shipped as JavaScript. The dev
// server serves the empty template instead, so there the whole page is
// rendered and titled here; that branch is dropped from the build.
const root = document.getElementById('root')!

if (import.meta.env.DEV && !root.firstElementChild) {
  const [{ createRoot }, { default: LandingPage }, { pageFor }, { pageMeta }] = await Promise.all([
    import('react-dom/client'),
    import('./components/LandingPage.tsx'),
    import('./pages.ts'),
    import('./seo.ts'),
  ])
  const page = pageFor(window.location.pathname)
  document.title = pageMeta(page).title
  createRoot(root).render(
    <StrictMode>
      <LandingPage page={page} />
    </StrictMode>,
  )
} else {
  hydrateRoot(
    document.getElementById(HEADER_ISLAND)!,
    <StrictMode>
      <Header home="/" />
    </StrictMode>,
  )
  hydrateRoot(
    document.getElementById(FOOTER_ISLAND)!,
    <StrictMode>
      <Footer home="/" />
    </StrictMode>,
  )
}
