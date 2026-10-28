import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { routes } from '@/routes'
import { useDemoAccount } from '@/state/demoAccount'

function pageLabel(pathname: string) {
  if (pathname === routes.customer) return 'Event details'
  if (pathname === routes.staff) return 'Requests'
  if (pathname === routes.agents) return 'AI & agents'
  if (pathname === routes.staffSettings) return 'Settings'
  if (pathname === routes.handoff) return 'Handoff'
  const segment = pathname.split('/').filter(Boolean).at(-1)
  return segment ? segment.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'New request'
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const { account } = useDemoAccount()

  return (
    <header data-slot="site-header" className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-2.5 border-b border-border bg-card px-3 sm:gap-3 sm:px-5">
      <SidebarTrigger aria-label="Toggle navigation" className="-ml-1 size-11 md:hidden" />
      <Link to="/pearl-login.html" reloadDocument aria-label="Pearl Island 2 GO login" className="flex min-h-11 min-w-0 flex-1 items-center gap-2 md:hidden">
        <img
          src="/branding/pearl-island-logo.png"
          alt="Pearl Island"
          width={320}
          height={311}
          className="size-7 shrink-0"
        />
        <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">Pearl Island 2 GO</span>
      </Link>
      <Breadcrumb className="hidden min-w-0 md:block">
        <BreadcrumbList className="flex-nowrap">
          {account === 'team' || pathname === routes.customerDashboard ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel(pathname)}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : pathname === routes.customer ? null : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={routes.customer} />}>New request</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel(pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

    </header>
  )
}
