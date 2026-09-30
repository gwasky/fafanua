import { useLayoutEffect } from 'react'
import About from './components/About.tsx'
import Contact from './components/Contact.tsx'
import Footer from './components/Footer.tsx'
import FutureReady from './components/FutureReady.tsx'
import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Process from './components/Process.tsx'
import Services from './components/Services.tsx'
import Solutions from './components/Solutions.tsx'
import { landOnHash } from './landOnHash.ts'

function App() {
  // Once, after the first render, before the first paint.
  useLayoutEffect(landOnHash, [])

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
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
