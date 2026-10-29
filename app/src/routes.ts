export const routes = {
  customer: '/customer',
  askPearl: '/customer/ask-pearl',
  planRequest: '/customer/plan',
  drafts: '/customer/drafts',
  staff: '/staff',
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
