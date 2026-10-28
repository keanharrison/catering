import './linear-sidebar.css'
import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronDown,
  ClipboardList,
  History,
  Home,
  MessageSquare,
  PackageCheck,
  Plus,
  Settings2,
  Truck,
  X,
  Plug,
  Bot,
  ChatCircle,
  SlidersHorizontal,
} from './icons'
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
import { routes } from '@/routes'
import { stages } from '@/views/customer/journey'
import { demoAccountLabels, useDemoAccount, type DemoAccount } from '@/state/demoAccount'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '@/state/store'

type Destination = {
  label: string
  icon: typeof Plus
  href?: string
  disabled?: boolean
}

const customerNavigation: Destination[] = [
  { label: 'Dashboard', icon: Home, href: routes.customerDashboard },
  { label: 'Ask Pearl', icon: ChatCircle, href: routes.askPearl },
  { label: 'New request', icon: Plus, href: routes.customer },
  { label: 'Current orders', icon: PackageCheck, href: routes.currentOrders },
  { label: 'Past orders', icon: History, href: routes.pastOrders },
  { label: 'Messages', icon: MessageSquare, href: routes.customerMessages },
  { label: 'Account settings', icon: Settings2, href: routes.settings },
]

const teamNavigation: Destination[] = [
  { label: 'Requests', icon: ClipboardList, href: routes.staff },
  { label: 'Handoff', icon: Truck, href: routes.handoff },
  { label: 'Messages', icon: MessageSquare, href: routes.staffMessages },
  { label: 'Menu and rules', icon: Settings2, href: routes.settings },
  { label: 'Integrations', icon: Plug, href: routes.integrations },
  { label: 'AI & agents', icon: Bot, href: routes.agents },
  { label: 'Settings', icon: SlidersHorizontal, href: routes.staffSettings },
]

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
  const firstGroupSize = account === 'team' ? 3 : 5

  function chooseAccount(value: string) {
    const next = value as DemoAccount
    setAccount(next)
    if (next !== 'team') useDemoStore.getState().activateDraft()
    setAccountMenuOpen(false)
    if (isMobile) setOpenMobile(false)
    navigate(next === 'team' ? routes.staff : routes.customer)
  }

  return (
    <Sidebar collapsible="icon" variant="inset" className="linear-sidebar">
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
