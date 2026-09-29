import { StrictMode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

// Render synchronously, while the module runs, so the page exists before
// DOMContentLoaded. The browser then finds the element a URL hash names,
// and on a reload or a history traversal it can restore the visitor's
// scroll position; with a later render it restores nothing (#38).
const root = createRoot(document.getElementById('root')!)
flushSync(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
