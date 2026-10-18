import type { OrderLine } from '../data'

/** Largest quantity of one item in an order; guards against typos like an extra zero. */
export const MAX_QUANTITY = 5000

/** Sets an item's quantity (capped); zero or less removes the line. Pure: returns a new list. */
export function setQuantity(lines: OrderLine[], itemId: string, units: number): OrderLine[] {
  const quantity = Math.min(MAX_QUANTITY, Math.max(0, Math.floor(Number.isFinite(units) ? units : 0)))
  const rest = lines.filter((l) => l.itemId !== itemId)
  if (quantity === 0) return rest
  const existing = lines.findIndex((l) => l.itemId === itemId)
  if (existing === -1) return [...rest, { itemId, units: quantity }]
  return lines.map((l) => (l.itemId === itemId ? { itemId, units: quantity } : l))
}

export function quantityOf(lines: OrderLine[], itemId: string): number {
  return lines.find((l) => l.itemId === itemId)?.units ?? 0
}
