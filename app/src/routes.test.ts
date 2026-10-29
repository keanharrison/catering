import { describe, expect, it } from 'vitest'
import { routes } from './routes'

describe('routes', () => {
  it('defines the customer and staff destinations', () => {
    expect(routes).toEqual({
      customer: '/customer',
      askPearl: '/customer/ask-pearl',
      planRequest: '/customer/plan',
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
    })
  })
})
