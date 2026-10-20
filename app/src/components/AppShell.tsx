import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { JourneyNav } from './JourneyNav'
import { SiteHeader } from './SiteHeader'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { Toaster } from './ui/sonner'
import { useDemoAccount } from '../state/demoAccount'
import { stages, type Stage } from '../views/customer/journey'

// One account-aware shell wraps customer and team screens; individual page content changes inside it.
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { account } = useDemoAccount()
  const activeStage = stages.find((stage) => stage.path === pathname)?.id
  const showJourney = account !== 'team' && Boolean(activeStage)

  // After navigating, move focus to the page so keyboard and screen reader users start at the top.
  // Not on first load, so the skip link and header stay first in the Tab order.
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    // Start each page at the top, then focus it without letting the browser scroll past the header.
    document.documentElement.scrollTop = 0
    const panel = document.querySelector('[data-slot="sidebar-inset"]')
    if (panel) panel.scrollTop = 0
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <TooltipProvider>
      <SidebarProvider style={{ "--sidebar-width": "224px" } as React.CSSProperties} className="min-h-svh bg-background text-foreground">
        <Toaster position="top-right" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <AppSidebar />
        <SidebarInset className="min-h-svh min-w-0 md:h-[calc(100svh-1rem)] md:min-h-0 md:overflow-y-auto md:border md:border-border">
          <SiteHeader />
          {showJourney && (
            <div className="border-b border-border bg-background px-5 py-4 sm:px-8">
              <div className="mx-auto w-full max-w-3xl">
                <JourneyNav active={activeStage as Stage} />
              </div>
            </div>
          )}
          <div id="main" tabIndex={-1} className="min-h-[calc(100svh-3.5rem)] min-w-0 outline-none md:min-h-[calc(100svh-4.5rem)]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
