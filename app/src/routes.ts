export const routes = {
  customer: '/customer',
  staff: '/staff',
  handoff: '/handoff',
  gallery: '/gallery',
  currentOrders: '/customer/orders',
  pastOrders: '/customer/orders/past',
  customerMessages: '/customer/messages',
  staffMessages: '/staff/messages',
  settings: '/settings',
} as const

export type Area = keyof typeof routes
