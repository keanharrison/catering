import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './tabler.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { DemoAccountProvider } from '../state/demoAccount'
import { PreviewShell } from './PreviewShell'
import { ThemeBridge } from './ThemeBridge'

// Isolated entry for tabler-preview.html. It must not import src/index.css or any Tailwind/shadcn component.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemeBridge />
      <DemoAccountProvider>
        <HashRouter>
          <PreviewShell />
        </HashRouter>
      </DemoAccountProvider>
    </ThemeProvider>
  </StrictMode>,
)
