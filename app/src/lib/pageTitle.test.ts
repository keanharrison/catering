import { describe, expect, it } from 'vitest'
import { pageTitle } from './pageTitle'

describe('pageTitle', () => {
  it('names customer areas after their sidebar labels', () => {
    expect(pageTitle('/customer', 'customer')).toBe('New request')
    expect(pageTitle('/customer/menu', 'customer')).toBe('New request')
    expect(pageTitle('/customer/ask-pearl', 'customer')).toBe('Chat')
    expect(pageTitle('/customer/orders/past', 'customer')).toBe('Past orders')
    expect(pageTitle('/settings', 'customer')).toBe('Account settings')
  })

  it('names staff areas and calls the shared settings route by its staff label', () => {
    expect(pageTitle('/staff', 'team')).toBe('Requests')
    expect(pageTitle('/settings', 'team')).toBe('Menu and rules')
    expect(pageTitle('/staff/settings', 'team')).toBe('Settings')
  })
})
