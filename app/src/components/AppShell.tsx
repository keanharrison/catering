import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { routes } from '../routes'
import { DemoBar } from './DemoBar'

const nav = [
  { to: routes.customer, label: 'Customer' },
  { to: routes.staff, label: 'Staff' },
  { to: routes.handoff, label: 'Handoff' },
  { to: routes.gallery, label: 'Gallery' },
]

// Fin-style top bar: wordmark left, plain links right; demo controls below.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-sans text-2xl tracking-tight">Pearl Island2GO</span>
          <nav aria-label="Primary" className="flex items-center gap-6 font-sans text-base">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'underline underline-offset-4' : 'hover:underline underline-offset-4')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <DemoBar />
      <main>{children}</main>
    </div>
  )
}
