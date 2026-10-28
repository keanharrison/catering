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
    <header data-slot="site-header" className="sticky top-0 z-40 flex h-[3.25rem] w-full shrink-0 items-center gap-2 border-b border-[#ececec] bg-background px-3 sm:px-4">
      <Tooltip>
        <TooltipTrigger
          aria-label="Toggle navigation"
          aria-expanded={sidebarShown}
          onClick={toggleSidebar}
          render={<button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-9" />}
        >
          <PanelLeftIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="bottom">{sidebarShown ? 'Close sidebar' : 'Open sidebar'}</TooltipContent>
      </Tooltip>
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
        <p className="truncate text-[15px] leading-none tracking-[0.01em] text-foreground">{pageTitle(pathname, account)}</p>
        {pathname === routes.askPearl && <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[12px] leading-none text-foreground">Preview</span>}
      </div>

      <nav aria-label="Notifications and account" className="flex shrink-0 items-center gap-2">
        {account !== 'team' && (
          <Link
            to={routes.askPearl}
            aria-label="Ask"
            aria-current={pathname === routes.askPearl ? 'page' : undefined}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-background px-3 text-[14px] tracking-[0.01em] text-foreground no-underline shadow-[inset_0_0_0_1px_var(--input)] transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-secondary md:h-9"
          >
            <span aria-hidden="true" className="text-[16px] font-bold leading-none tracking-[-0.03em]">X</span>
            <span aria-hidden="true" className="hidden sm:inline">Ask</span>
          </Link>
        )}
        <NotificationsMenu />
        <Link
          to={accountPath}
          aria-label="Account settings"
          aria-current={pathname === accountPath ? 'page' : undefined}
          data-icon-surface
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-medium text-foreground no-underline shadow-[inset_0_0_0_1px_var(--input)] transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:shadow-[inset_0_0_0_1.5px_var(--foreground)] md:size-9"
        >
          {initialsText ? <span aria-hidden="true">{initialsText}</span> : <IconUser aria-hidden="true" />}
        </Link>
      </nav>
    </header>
  )
}
