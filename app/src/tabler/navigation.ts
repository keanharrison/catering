import type { Icon } from '../components/icons'
import {
  IconClipboardList,
  IconPlug,
  IconRobot,
  IconAdjustments,
  IconHistory,
  IconMessage,
  IconPackage,
  IconPlus,
  IconSettings,
  IconToolsKitchen2,
  IconTruckDelivery,
} from '../components/icons'
import { routes } from '../routes'
import type { DemoAccount } from '../state/demoAccount'

export type Destination = { label: string; icon: Icon; href: string }
export type NavSection = { title: string; items: Destination[] }

// Same destinations and labels as components/AppSidebar.tsx, grouped under Tabler's section titles.
// Hrefs are the real app routes; the preview shows each one under a matching hash route.
export const navigation: Record<DemoAccount, NavSection[]> = {
  customer: [
    {
      title: 'Catering',
      items: [
        { label: 'New request', icon: IconPlus, href: routes.customer },
        { label: 'Current orders', icon: IconPackage, href: routes.currentOrders },
        { label: 'Past orders', icon: IconHistory, href: routes.pastOrders },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Messages', icon: IconMessage, href: routes.customerMessages },
        { label: 'Account settings', icon: IconSettings, href: routes.settings },
      ],
    },
  ],
  team: [
    {
      title: 'Operations',
      items: [
        { label: 'Requests', icon: IconClipboardList, href: routes.staff },
        { label: 'Handoff', icon: IconTruckDelivery, href: routes.handoff },
        { label: 'Messages', icon: IconMessage, href: routes.staffMessages },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Menu and rules', icon: IconToolsKitchen2, href: routes.settings },
        { label: 'Integrations', icon: IconPlug, href: routes.integrations },
        { label: 'AI & agents', icon: IconRobot, href: routes.agents },
        { label: 'Settings', icon: IconAdjustments, href: routes.staffSettings },
      ],
    },
  ],
}

export const accountHome: Record<DemoAccount, string> = { customer: routes.customer, team: routes.staff }

export function findDestination(account: DemoAccount, pathname: string): Destination | undefined {
  return navigation[account].flatMap((section) => section.items).find((item) => item.href === pathname)
}
