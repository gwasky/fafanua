import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import Footer from './components/Footer.tsx'
import Header from './components/Header.tsx'
import { FOOTER_ISLAND, HEADER_ISLAND } from './components/PageLayout.tsx'
import { focusSectionOnClick } from './focusSectionHeading.ts'
import './styles/global.css'
// The shared landing-page foundation's styles (#93), all scoped under
// main.sector-landing, so no other page changes. Imported here, by the
// entry, so the build ships them with the pre-rendered pages.
import './components/SectorLanding.css'

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
  const headerIsland = document.getElementById(HEADER_ISLAND)!
  hydrateRoot(
    headerIsland,
    <StrictMode>
      <Header home="/" current={headerIsland.dataset.navCurrent} />
    </StrictMode>,
  )
  hydrateRoot(
    document.getElementById(FOOTER_ISLAND)!,
    <StrictMode>
      <Footer home="/" />
    </StrictMode>,
  )
}

// An in-page link marked data-focus-section (the landing hero's "See how
// the assessment works", #93) also moves focus to its section's heading on
// a plain click or Enter, as focusSectionOnClick does for the homepage's
// links. One delegated listener, so no page copy ships as JavaScript;
// without JavaScript the link still jumps.
document.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[data-focus-section]') : null
  if (!(link instanceof HTMLAnchorElement) || !link.dataset.focusSection) return
  focusSectionOnClick(link.dataset.focusSection)(
    event as unknown as Parameters<ReturnType<typeof focusSectionOnClick>>[0],
  )
})
