import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { routes } from '../routes'
import { DemoBar } from './DemoBar'

const nav = [
  { to: routes.customer, label: 'Customer' },
  { to: routes.staff, label: 'Staff' },
  { to: routes.handoff, label: 'Handoff' },
]

// Fin-style top bar: wordmark left, plain links right; demo controls below.
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  // After navigating, move focus to the page so keyboard and screen reader users start at the top.
  useEffect(() => {
    document.getElementById('main')?.focus()
  }, [pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `underline-offset-4 ${isActive ? 'font-semibold text-nav-active underline' : 'text-charcoal hover:underline'}`

  return (
    <div className="min-h-screen bg-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-charcoal focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 md:px-6">
          <span className="font-sans text-xl tracking-tight md:text-2xl">Pearl Island2GO</span>
          <nav aria-label="Primary" className="flex items-center gap-5 font-sans text-sm md:gap-6 md:text-base">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to={routes.gallery} className={(state) => `hidden md:inline ${linkClass(state)}`}>
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>
      <DemoBar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  )
}
