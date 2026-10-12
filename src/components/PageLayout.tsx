import type { ReactNode } from 'react'
import Contact from './Contact.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import './PageLayout.css'

// The ids of the two parts of a landing page the browser hydrates (#67):
// the header, for its Menu toggle and sticky behaviour, and the footer,
// for the current year. Everything else is static HTML from the build.
export const HEADER_ISLAND = 'header-island'
export const FOOTER_ISLAND = 'footer-island'

// The frame of every landing page (#67), as App.tsx frames the homepage:
// the #top target, the solid header (there is no dark hero to overlay),
// main with the page's content and the closing call to action, then the
// footer. The header and footer section links lead back to the homepage.
// Each island's wrapper generates no box, so the header still sticks to
// the page and the layout is the homepage's.
function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="top" />
      <div id={HEADER_ISLAND} className="page-island">
        <Header home="/" />
      </div>
      <main id="main" tabIndex={-1}>
        {children}
        <Contact />
      </main>
      <div id={FOOTER_ISLAND} className="page-island">
        <Footer home="/" />
      </div>
    </>
  )
}

export default PageLayout
