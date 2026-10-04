import { useLayoutEffect } from 'react'
import About from './components/About.tsx'
import Contact from './components/Contact.tsx'
import Footer from './components/Footer.tsx'
import FutureReady from './components/FutureReady.tsx'
import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Positioning from './components/Positioning.tsx'
import Process from './components/Process.tsx'
import Services from './components/Services.tsx'
import Solutions from './components/Solutions.tsx'
import { landOnHash } from './landOnHash.ts'

function App() {
  // Once, after the first render, before the first paint.
  useLayoutEffect(landOnHash, [])

  // #top is the logo link's target. It is an empty element above the
  // sticky header, because scrolling to a stuck element does nothing.
  return (
    <>
      <div id="top" />
      {/* The hero below is a [data-header-overlay] section. */}
      <Header overlay />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Positioning />
        <Services />
        <Solutions />
        <Process />
        <FutureReady />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
