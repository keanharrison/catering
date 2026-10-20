import { describe, expect, it } from 'vitest'
import { routes } from './routes'

describe('routes', () => {
  it('defines the customer and staff destinations', () => {
    expect(routes).toEqual({
      customer: '/customer',
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
    })
  })
})
