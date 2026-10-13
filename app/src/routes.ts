export const routes = {
  customer: '/customer',
  staff: '/staff',
  handoff: '/handoff',
  gallery: '/gallery',
} as const

export const customerRoutes = {
  intake: '/customer',
  recommendation: '/customer/recommendation',
  review: '/customer/review',
} as const

export type Area = keyof typeof routes
