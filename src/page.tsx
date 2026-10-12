import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import LandingPage from './components/LandingPage.tsx'
import { pageFor } from './pages.ts'
import { pageMeta } from './seo.ts'
import './styles/global.css'

// The landing pages' entry (#67). The build pre-renders each page into
// its own copy of page.html, so the page is hydrated: the HTML a crawler
// or a visitor without JavaScript gets is the whole page. The dev server
// serves the empty template instead, so there the page is rendered and
// titled here. The page is chosen by path; an unknown one is the 404 page
// the Worker serves.
const container = document.getElementById('root')!
const page = pageFor(window.location.pathname)
const app = (
  <StrictMode>
    <LandingPage page={page} />
  </StrictMode>
)

if (container.firstElementChild) {
  hydrateRoot(container, app)
} else {
  document.title = pageMeta(page).title
  createRoot(container).render(app)
}
