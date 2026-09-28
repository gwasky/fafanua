import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Services from './components/Services.tsx'

function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Services />
      </main>
    </>
  )
}

export default App
