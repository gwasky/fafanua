import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import LandingPage from './components/LandingPage.tsx'
import { notFound, pages, type Page } from './pages.ts'
import { pageHead } from './seo.ts'

// The build's pre-render entry (vite.config.ts, #67), loaded in Node:
// each landing page's markup and head tags, and the file it is written to.
// Every page is a .html file named by its path, which Workers Static Assets
// serves at the path without the extension.

export { pages, notFound }

export const fileFor = (page: Page) => `${page.path.slice(1)}.html`

export function render(page: Page) {
  return {
    head: pageHead(page),
    html: renderToString(
      <StrictMode>
        <LandingPage page={page} />
      </StrictMode>,
    ),
  }
}
