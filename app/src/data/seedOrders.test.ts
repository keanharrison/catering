// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { catalog } from '.'
import { seedOrders } from './seedOrders'
import { isValidDemoState } from '../state/validate'
import { useDemoStore } from '../state/store'
import { matchesView } from '../views/staff/requestFilters'

const clock = '2026-10-13T09:00'

describe('Pearl Island starting requests', () => {
  it('uses only event types, menu items and statuses the app knows', () => {
    expect(seedOrders).toHaveLength(10)
    expect(new Set(seedOrders.map((order) => order.id)).size).toBe(10)
    for (const order of seedOrders) {
      expect(catalog.eventTypes.some((type) => type.id === order.intent.eventType)).toBe(true)
      for (const line of order.lines) expect(catalog.menu.some((item) => item.id === line.itemId)).toBe(true)
      if (order.intent.fulfillment === 'delivery') expect(order.intent.deliveryAddress && order.intent.deliveryZip).toBeTruthy()
      expect(order.history.every((change, i, all) => i === 0 || change.at >= all[i - 1].at)).toBe(true)
      expect(order.messages.every((message) => message.at >= order.history[1].at)).toBe(true)
    }
  })

  it('splits into the four Admin views the way the brief defines them', () => {
    const named = (view: Parameters<typeof matchesView>[1]) => seedOrders.filter((order) => matchesView(order, view, clock)).map((order) => order.intent.contactName).sort()
    expect(named('past')).toEqual(['Derek Owens', 'Maya Patel', 'Priya Nair', 'Tasha Greene'])
    expect(named('current')).toEqual(['Elena Ruiz', 'Luis Ortega', 'Owen Park'])
    expect(named('upcoming')).toEqual(['Grace Kim', 'Hannah Brooks', 'Marcus Bell'])
  })

  it('passes the saved-state check so a reload keeps them', () => {
    expect(isValidDemoState({ ...useDemoStore.getState(), orders: seedOrders })).toBe(true)
  })
})

describe('loading and deleting requests', () => {
  it('loads once, and a deleted request never comes back', () => {
    const store = useDemoStore
    store.setState({ orders: [], seeded: false })
    store.getState().seedStartingRequests()
    expect(store.getState().orders).toHaveLength(10)
    store.getState().deleteRequest('pi-0001')
    expect(store.getState().orders).toHaveLength(9)
    store.getState().seedStartingRequests()
    expect(store.getState().orders).toHaveLength(9)
    store.setState({ orders: [], seeded: true })
  })
})
