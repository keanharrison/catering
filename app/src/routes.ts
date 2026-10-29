export const routes = {
  customer: '/customer',
  askPearl: '/customer/ask-pearl',
  drafts: '/customer/drafts',
  staff: '/staff',
  analytics: '/staff/analytics',
  calendar: '/staff/calendar',
  handoff: '/handoff',
  currentOrders: '/customer/orders',
  pastOrders: '/customer/orders/past',
  customerMessages: '/customer/messages',
  staffMessages: '/staff/messages',
  settings: '/settings',
  integrations: '/staff/integrations',
  agents: '/staff/agents',
  staffSettings: '/staff/settings',
} as const

export type Area = keyof typeof routes
