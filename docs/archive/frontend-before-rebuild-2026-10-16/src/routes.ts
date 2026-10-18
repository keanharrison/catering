export const routes = {
  customer: '/customer',
  staff: '/staff',
  handoff: '/handoff',
  gallery: '/gallery',
} as const

export type Area = keyof typeof routes
