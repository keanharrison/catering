import type { Catalog, MenuItem } from '../data'

export function getItem(catalog: Catalog, itemId: string): MenuItem {
  const item = catalog.menu.find((i) => i.id === itemId)
  if (!item) throw new Error(`Unknown menu item: ${itemId}`)
  return item
}

export function unitsFor(item: MenuItem, servingsNeeded: number): number {
  return Math.max(item.minUnits, Math.ceil(servingsNeeded / item.servingsPerUnit))
}
