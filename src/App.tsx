import FutureReady from './components/FutureReady.tsx'
import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Process from './components/Process.tsx'
import Services from './components/Services.tsx'

function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Services />
        <Process />
        <FutureReady />
      </main>
    </>
  )
}

export default App
