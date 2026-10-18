import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { routes } from '../routes'
import { DemoBar } from './DemoBar'

// Keep the brand in the site header; prototype navigation lives with the walkthrough controls.
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  // After navigating, move focus to the page so keyboard and screen reader users start at the top.
  // Not on first load, so the skip link and header stay first in the Tab order.
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    // Start each page at the top, then focus it without letting the browser scroll past the header.
    document.documentElement.scrollTop = 0
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="min-h-screen bg-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-charcoal focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-3 md:py-4">
          <Link to={routes.customer} className="flex min-h-11 items-center gap-3">
            <img
              src="/branding/pearl-island-logo.png"
              alt="Pearl Island Catering"
              width={320}
              height={311}
              className="h-14 w-auto md:h-16"
            />
            <span className="font-sans text-base font-semibold tracking-tight text-charcoal md:text-lg">
              Pearl Island2GO
            </span>
          </Link>
        </div>
      </header>
      <DemoBar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  )
}
