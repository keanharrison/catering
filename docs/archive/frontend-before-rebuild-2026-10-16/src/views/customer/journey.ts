import { catalog as defaultCatalog, type Catalog, type Order } from '../../data'
import { intentToForm, sectionErrors, validateForm } from './intake'

export type Stage = 'event' | 'menu' | 'supplies' | 'details' | 'review'

export const stages: Array<{ id: Stage; label: string; path: string }> = [
  { id: 'event', label: 'Event', path: '/customer' },
  { id: 'menu', label: 'Menu', path: '/customer/menu' },
  { id: 'supplies', label: 'Supplies', path: '/customer/supplies' },
  { id: 'details', label: 'Details', path: '/customer/details' },
  { id: 'review', label: 'Review', path: '/customer/review' },
]

export function stagePath(stage: Stage): string {
  return stages.find((s) => s.id === stage)?.path ?? '/customer'
}

function isSupply(itemId: string, catalog: Catalog): boolean {
  return catalog.menu.find((i) => i.id === itemId)?.category === 'supply'
}

/** Which stages the customer has finished, derived from the order itself. */
export function completedStages(order: Order, clock: string, catalog: Catalog = defaultCatalog): Record<Stage, boolean> {
  const errors = validateForm(intentToForm(order.intent), clock, catalog)
  const food = order.lines.filter((l) => !isSupply(l.itemId, catalog))
  const supplies = order.lines.filter((l) => isSupply(l.itemId, catalog))
  return {
    event: Object.keys(sectionErrors(errors, 'basics')).length === 0,
    menu: food.length > 0,
    supplies: order.suppliesChoice === 'none' || (order.suppliesChoice === 'selected' && supplies.length > 0),
    details: Object.keys(sectionErrors(errors, 'details')).length === 0,
    review: order.status !== 'draft',
  }
}

/** A stage can be opened when every earlier stage is finished. */
export function canEnter(stage: Stage, order: Order, clock: string, catalog: Catalog = defaultCatalog): boolean {
  const done = completedStages(order, clock, catalog)
  const index = stages.findIndex((s) => s.id === stage)
  return stages.slice(0, index).every((s) => done[s.id])
}

export function firstIncompleteStage(order: Order, clock: string, catalog: Catalog = defaultCatalog): Stage {
  const done = completedStages(order, clock, catalog)
  return stages.find((s) => !done[s.id])?.id ?? 'review'
}
