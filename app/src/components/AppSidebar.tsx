import './linear-sidebar.css'
import { NavLink, useLocation } from 'react-router-dom'
import { useState, type ComponentType, type SVGProps } from 'react'
import { ChevronDown, X } from './icons'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { destinationIcons } from './destinationIcons'
import { cx } from '@/lib/cx'
import { routes } from '@/routes'
import { stages } from '@/views/customer/journey'
import { demoAccountLabels, useDemoAccount, type DemoAccount } from '@/state/demoAccount'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '@/state/store'

type Destination = {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  href?: string
  disabled?: boolean
}

const customerNavigation: Destination[] = [
  { label: 'Chat', icon: destinationIcons.chat, href: routes.askPearl },
  { label: 'New request', icon: destinationIcons.newRequest, href: routes.customer },
  { label: 'Current orders', icon: destinationIcons.currentOrders, href: routes.currentOrders },
  { label: 'Past orders', icon: destinationIcons.pastOrders, href: routes.pastOrders },
  { label: 'Messages', icon: destinationIcons.messages, href: routes.customerMessages },
  { label: 'Account settings', icon: destinationIcons.accountSettings, href: routes.settings },
]

const teamNavigation: Destination[] = [
  { label: 'Requests', icon: destinationIcons.requests, href: routes.staff },
  { label: 'Handoff', icon: destinationIcons.handoff, href: routes.handoff },
  { label: 'Messages', icon: destinationIcons.messages, href: routes.staffMessages },
  { label: 'Menu and rules', icon: destinationIcons.menuAndRules, href: routes.settings },
  { label: 'Integrations', icon: destinationIcons.integrations, href: routes.integrations },
  { label: 'AI & agents', icon: destinationIcons.agents, href: routes.agents },
  { label: 'Settings', icon: destinationIcons.staffSettings, href: routes.staffSettings },
]

// EXPERIMENT: pages that get the refined sidebar (32px rows, 10px radius, fading labels). Empty this list, and delete the
// "refined sidebar" block at the end of linear-sidebar.css, to go back to the earlier sidebar everywhere.
const REFINED_SIDEBAR_ROUTES: string[] = [routes.askPearl]

function navigationFor(account: DemoAccount) {
  if (account === 'team') return teamNavigation
  return customerNavigation
}

function MobileSidebarClose() {
  const { setOpenMobile } = useSidebar()
  return (
    <button
      type="button"
      aria-label="Close navigation"
      onClick={() => setOpenMobile(false)}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring md:hidden"
    >
      <X aria-hidden="true" className="size-4" />
    </button>
  )
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { account, setAccount } = useDemoAccount()
  const { isMobile, setOpenMobile } = useSidebar()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const items = navigationFor(account)
  const refined = REFINED_SIDEBAR_ROUTES.includes(pathname)
  const firstGroupSize = account === 'team' ? 3 : 4

  function chooseAccount(value: string) {
    const next = value as DemoAccount
    setAccount(next)
    if (next !== 'team') useDemoStore.getState().activateDraft()
    setAccountMenuOpen(false)
    if (isMobile) setOpenMobile(false)
    navigate(next === 'team' ? routes.staff : routes.customer)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className={cx('linear-sidebar', refined && 'linear-sidebar-refined')}>
      <SidebarHeader className="linear-sidebar-header">
        <div className="linear-workspace-row">
          <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
            <DropdownMenuTrigger
              aria-label={`${demoAccountLabels[account]} account menu`}
              render={<button type="button" className="linear-workspace-brand" />}
            >
              <span className="linear-wordmark" aria-hidden="true">X</span>
              <ChevronDown aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="linear-menu w-60">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Switch account</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="linear-menu">
                    <DropdownMenuRadioGroup value={account} onValueChange={chooseAccount}>
                      <DropdownMenuRadioItem value="customer">Customer account</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="team">Pearl Island team account</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => {
                  navigate(account === 'team' ? routes.staffSettings : routes.settings)
                  if (isMobile) setOpenMobile(false)
                }}
              >
                Account settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.assign('/pearl-login.html')}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MobileSidebarClose />
        </div>
      </SidebarHeader>
      <SidebarContent className="linear-sidebar-content">
        {[items.slice(0, firstGroupSize), items.slice(firstGroupSize)].map((section, index) => (
          <SidebarGroup key={index} className="linear-nav-group">
            <SidebarGroupLabel>{index === 0 ? account === 'team' ? 'Operations' : 'Catering' : account === 'team' ? 'Workspace' : 'Account'}</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>
              {section.map((item) => {
                const Icon = item.icon
                const active = item.href === routes.customer
                  ? stages.some((stage) => stage.path === pathname)
                  : pathname === item.href
                return <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton render={<NavLink to={item.href!} onClick={() => {
                    if (item.href === routes.customer) useDemoStore.getState().activateDraft()
                    if (isMobile) setOpenMobile(false)
                  }} />} isActive={active} tooltip={item.label}>
                    <Icon aria-hidden="true" /><span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              })}
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
