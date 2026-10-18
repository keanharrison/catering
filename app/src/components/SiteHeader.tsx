import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { routes } from '@/routes'
import { useDemoAccount } from '@/state/demoAccount'
import { useTheme } from './ThemeProvider'

function pageLabel(pathname: string) {
  if (pathname === routes.customer) return 'Event details'
  if (pathname === routes.staff) return 'Requests'
  if (pathname === routes.handoff) return 'Handoff'
  if (pathname === routes.gallery) return 'Gallery'
  const segment = pathname.split('/').filter(Boolean).at(-1)
  return segment ? segment.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'New request'
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const { account } = useDemoAccount()
  const { theme, setTheme } = useTheme()
  const homeRoute = account === 'team' ? routes.staff : routes.customer
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const darkMode = theme === 'dark' || (theme === 'system' && prefersDark)

  return (
    <header data-slot="site-header" className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-3 border-b border-border bg-background px-3 sm:px-5">
      <SidebarTrigger aria-label="Toggle navigation" className="-ml-1 size-11 md:size-9" />
      <Link to={homeRoute} aria-label="Pearl Island2GO home" className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
        <img
          src="/branding/pearl-island-logo.png"
          alt="Pearl Island"
          width={320}
          height={311}
          className="size-7 shrink-0"
        />
        <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">Pearl Island2GO</span>
      </Link>
      <Separator orientation="vertical" className="hidden h-5 !self-center md:block" />
      <Breadcrumb className="hidden min-w-0 md:block">
        <BreadcrumbList className="flex-nowrap">
          {account === 'team' ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel(pathname)}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
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

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Separator orientation="vertical" className="h-5 !self-center" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 sm:size-9"
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          onClick={() => setTheme(darkMode ? 'light' : 'dark')}
        >
          {darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
        <Separator orientation="vertical" className="h-5 !self-center" />
      </div>

    </header>
  )
}
