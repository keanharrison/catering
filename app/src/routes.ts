export const routes = {
  customer: '/customer',
  staff: '/staff',
  handoff: '/handoff',
} as const

export type Area = keyof typeof routes
