import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronDown,
  ClipboardList,
  History,
  MessageSquare,
  PackageCheck,
  Plus,
  Settings2,
  Truck,
  X,
  UserRound,
} from 'lucide-react'
import {
  SidebarFooter,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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

  function chooseAccount(value: string) {
    const next = value as DemoAccount
    setAccount(next)
    if (next !== 'team') useDemoStore.getState().activateDraft()
    setAccountMenuOpen(false)
    if (isMobile) setOpenMobile(false)
    navigate(next === 'team' ? routes.staff : routes.customer)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <div className="flex min-h-11 items-center justify-between gap-2">
          <Link
            to={account === 'team' ? routes.staff : routes.customer}
            aria-label="Pearl Island2GO home"
            className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <img
              src="/branding/pearl-island-logo.png"
              alt="Pearl Island"
              width={320}
              height={311}
              className="size-10 shrink-0 group-data-[collapsible=icon]:size-8"
            />
            <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Pearl Island2GO
            </span>
          </Link>
          <MobileSidebarClose />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup className="px-3 py-3 group-data-[collapsible=icon]:px-2">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                const active = item.href === routes.customer
                  ? pathname === routes.customer || pathname.startsWith(`${routes.customer}/`) && !pathname.startsWith(routes.currentOrders) && !pathname.startsWith(routes.customerMessages)
                  : item.href === routes.currentOrders
                    ? pathname === routes.currentOrders
                    : item.href === routes.pastOrders
                      ? pathname === routes.pastOrders
                      : item.href === routes.customerMessages || item.href === routes.staffMessages
                        ? pathname === item.href
                        : item.href === routes.settings
                          ? pathname === routes.settings
                          : pathname === item.href

                return (
                  <SidebarMenuItem key={item.label}>
                    {item.href ? (
                      <SidebarMenuButton
                        render={<NavLink to={item.href} onClick={() => {
                          if (item.href === routes.customer) useDemoStore.getState().activateDraft()
                          if (isMobile) setOpenMobile(false)
                        }} />}
                        isActive={active}
                        size="lg"
                        tooltip={item.label}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton disabled size="lg" tooltip={item.label}>
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                    {item.disabled && <SidebarMenuBadge>Later</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarSeparator />
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <SidebarMenuButton
            disabled
            size="lg"
            tooltip="Settings (coming soon)"
            aria-label="Settings (coming soon)"
            className="size-11 w-11 shrink-0 justify-center p-0 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:w-8!"
          >
            <Settings2 aria-hidden="true" />
          </SidebarMenuButton>
          <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
            <DropdownMenuTrigger
              aria-label={`${demoAccountLabels[account]} account menu`}
              render={
                <SidebarMenuButton
                  size="lg"
                  className="min-w-0 flex-1 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:flex-none"
                >
                  <UserRound aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                    {demoAccountLabels[account]}
                  </span>
                  <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent side="top" align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {account === 'customer' ? 'Customer demo account' : 'Pearl Island team account'}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Switch demo account</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={account} onValueChange={chooseAccount}>
                      <DropdownMenuRadioItem value="customer">Customer demo account</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="team">Pearl Island team account</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Sign-in and permissions are not connected in this demo.</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
