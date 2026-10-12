import type { ReactNode } from 'react'
import Contact from './Contact.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'

// The frame of every landing page (#67), as App.tsx frames the homepage:
// the #top target, the solid header (there is no dark hero to overlay),
// main with the page's content and the closing call to action, then the
// footer. The header and footer section links lead back to the homepage.
function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="top" />
      <Header home="/" />
      <main id="main" tabIndex={-1}>
        {children}
        <Contact />
      </main>
      <Footer home="/" />
    </>
  )
}

export default PageLayout
