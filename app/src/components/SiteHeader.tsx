import { Link, useLocation } from 'react-router-dom'
import { IconUser, PanelLeftIcon } from './icons'
import { NotificationsMenu } from './NotificationsMenu'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { pageTitle } from '@/lib/pageTitle'
import { routes } from '@/routes'
import { useDemoAccount } from '@/state/demoAccount'
import { readCustomerProfile } from '@/state/customerProfile'

function initials(name: string) {
  const letters = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase())
  return letters.join('')
}

// The persistent top bar: sidebar toggle and page title on the left; notifications, Ask Pearl and account on the right.
export function SiteHeader() {
  const { pathname } = useLocation()
  const { account } = useDemoAccount()
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar()
  const accountPath = account === 'team' ? routes.staffSettings : routes.settings
  const initialsText = account === 'team' ? '' : initials(readCustomerProfile().name)
  const sidebarShown = isMobile ? openMobile : open

  return (
    <header data-slot="site-header" className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <Tooltip>
        <TooltipTrigger
          aria-label="Toggle navigation"
          aria-expanded={sidebarShown}
          onClick={toggleSidebar}
          render={<button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-10" />}
        >
          <PanelLeftIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="bottom">{sidebarShown ? 'Close sidebar' : 'Open sidebar'}</TooltipContent>
      </Tooltip>
      <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
      <p className="min-w-0 flex-1 truncate text-[20px] font-medium leading-none tracking-[-0.02em] text-foreground">{pageTitle(pathname, account)}</p>

      <nav aria-label="Notifications and account" className="flex shrink-0 items-center gap-2">
        <NotificationsMenu />
        {account !== 'team' && (
          <Link
            to={routes.askPearl}
            aria-label="Ask Pearl"
            aria-current={pathname === routes.askPearl ? 'page' : undefined}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary pl-3.5 pr-3.5 text-[14px] tracking-[0.01em] text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary-hover hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:pr-4 md:h-10"
          >
            <span aria-hidden="true" className="text-[17px] font-bold leading-none tracking-[-0.03em]">X</span>
            <span aria-hidden="true" className="hidden sm:inline">Ask Pearl</span>
          </Link>
        )}
        <Link
          to={accountPath}
          aria-label="Account settings"
          aria-current={pathname === accountPath ? 'page' : undefined}
          data-icon-surface
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-medium text-foreground no-underline shadow-[inset_0_0_0_1px_var(--border)] transition-colors duration-150 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:shadow-[inset_0_0_0_1.5px_var(--foreground)] md:size-10"
        >
          {initialsText ? <span aria-hidden="true">{initialsText}</span> : <IconUser aria-hidden="true" />}
        </Link>
      </nav>
    </header>
  )
}
