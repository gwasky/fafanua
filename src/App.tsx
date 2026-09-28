import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'

function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
      </main>
    </>
  )
}

export default App
