// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { catalog } from '../data'
import { seedMenu } from '../data/menu'
import { createOrder } from './orderMachine'
import { menuEntries } from '../views/customer/menuView'
import { resolveMenu, useMenuStore } from './menuStore'

const reset = () => useMenuStore.setState({ edits: {}, added: [] })
const order = () => createOrder(catalog.scenarios[0])

describe('menu store', () => {
  afterEach(reset)

  it('ships every item with ingredients, a serving size and a photo path, and supplies without recipes', () => {
    for (const item of seedMenu) {
      expect(item.description, item.id).toBeTruthy()
      expect(item.servingNote, item.id).toBeTruthy()
      expect(item.image).toBe(`/menu/${item.id}.jpg`)
      if (item.category === 'supply') expect(item.ingredients).toEqual([])
      else expect(item.ingredients.length, item.id).toBeGreaterThan(0)
    }
  })

  it('applies edits to the live catalog the estimate engine reads', () => {
    useMenuStore.getState().updateItem('jerk-chicken', { priceCents: 650, description: 'New copy' })
    const item = catalog.menu.find((entry) => entry.id === 'jerk-chicken')
    expect(item?.priceCents).toBe(650)
    expect(item?.description).toBe('New copy')
    useMenuStore.getState().resetItem('jerk-chicken')
    expect(catalog.menu.find((entry) => entry.id === 'jerk-chicken')?.priceCents).toBe(500)
  })

  it('hides an item from the customer menu but keeps it findable for existing requests', () => {
    expect(menuEntries(order(), 'entree', []).some((entry) => entry.item.id === 'jerk-chicken')).toBe(true)
    useMenuStore.getState().updateItem('jerk-chicken', { available: false })
    expect(menuEntries(order(), 'entree', []).some((entry) => entry.item.id === 'jerk-chicken')).toBe(false)
    expect(catalog.menu.some((entry) => entry.id === 'jerk-chicken')).toBe(true)
  })

  it('adds new items after the shipped ones and edits them in place', () => {
    const added = { ...seedMenu[0], id: 'coconut-flan', name: 'Coconut Flan', category: 'salad' as const }
    useMenuStore.getState().addItem(added)
    useMenuStore.getState().updateItem('coconut-flan', { priceCents: 450 })
    const menu = resolveMenu(useMenuStore.getState())
    expect(menu.at(-1)).toMatchObject({ id: 'coconut-flan', priceCents: 450 })
    expect(menu).toHaveLength(seedMenu.length + 1)
  })
})
