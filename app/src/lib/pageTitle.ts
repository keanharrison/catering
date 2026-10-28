import { routes } from '@/routes'
import type { DemoAccount } from '@/state/demoAccount'
import { stages } from '@/views/customer/journey'

/** The name shown in the top bar. It mirrors the sidebar label of the area the person is in. */
export function pageTitle(pathname: string, account: DemoAccount): string {
  if (account === 'team') {
    const staff: Record<string, string> = {
      [routes.staff]: 'Requests',
      [routes.handoff]: 'Handoff',
      [routes.staffMessages]: 'Messages',
      [routes.settings]: 'Menu and rules',
      [routes.integrations]: 'Integrations',
      [routes.agents]: 'AI & agents',
      [routes.staffSettings]: 'Settings',
    }
    return staff[pathname] ?? 'Requests'
  }
  if (stages.some((stage) => stage.path === pathname)) return 'New request'
  const customer: Record<string, string> = {
    [routes.customerDashboard]: 'Dashboard',
    [routes.askPearl]: 'Chat',
    [routes.currentOrders]: 'Current orders',
    [routes.pastOrders]: 'Past orders',
    [routes.customerMessages]: 'Messages',
    [routes.settings]: 'Account settings',
  }
  return customer[pathname] ?? 'New request'
}
