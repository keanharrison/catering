export const routes = {
  customer: '/customer',
  customerDashboard: '/customer/dashboard',
  askPearl: '/customer/ask-pearl',
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
