import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/texture.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Temporary: ?texture=shadow|watermark|grain|dots (combine with +) previews texture options.
const texture = new URLSearchParams(window.location.search).get('texture')
if (texture) document.documentElement.dataset.texture = texture.replaceAll('+', ' ')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
