import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DemoAccountProvider } from '../state/demoAccount'

/** Render the same account-aware application shell used by the browser app. */
export function renderAppAt(path: string, children: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DemoAccountProvider>
        <AppShell>{children}</AppShell>
      </DemoAccountProvider>
    </MemoryRouter>,
  )
}
