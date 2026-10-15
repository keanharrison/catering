import { catalog as defaultCatalog, type Catalog, type ExceptionFlag, type MenuCategory, type Order } from '../../data'
import { detectExceptions, estimate, type Estimate } from '../../engine'
import { pluralize } from '../../lib/format'

export type SummaryRow = {
  itemId: string
  name: string
  quantityLabel: string
  costCents: number
}

export type SummaryGroup = { category: MenuCategory; title: string; rows: SummaryRow[] }

export type OrderSummary = {
  guestCount: number | null
  groups: SummaryGroup[]
  estimate: Estimate
  /** Entree servings against the guest count (rule: servings per guest, an assumption). */
  coverage: { servings: number; guests: number | null; shortfall: number }
  flags: ExceptionFlag[]
  hasFood: boolean
}

const GROUPS: Array<{ category: MenuCategory; title: string }> = [
  { category: 'entree', title: 'Entrees' },
  { category: 'side', title: 'Sides' },
  { category: 'salad', title: 'Salads' },
  { category: 'supply', title: 'Disposable catering supplies' },
]

/** Everything the order summary shows, derived from the order and the rule engine. */
export function buildOrderSummary(order: Order, clock: string, catalog: Catalog = defaultCatalog): OrderSummary {
  const guests = order.intent.guestCount
  const priced = estimate(order.lines, guests, catalog)

  const rows = order.lines.map((line, index) => {
    const item = catalog.menu.find((i) => i.id === line.itemId)
    if (!item) throw new Error(`Unknown menu item: ${line.itemId}`)
    const quantityLabel =
      item.unit === 'person' ? `per person x ${guests ?? 0}` : pluralize(line.units, item.unit)
    return {
      category: item.category,
      row: { itemId: item.id, name: item.name, quantityLabel, costCents: priced.lines[index].costCents },
    }
  })

  return {
    guestCount: guests,
    groups: GROUPS.map((g) => ({
      category: g.category,
      title: g.title,
      rows: rows.filter((r) => r.category === g.category).map((r) => r.row),
    })).filter((g) => g.rows.length > 0),
    estimate: priced,
    coverage: { servings: priced.entreeServings, guests, shortfall: priced.entreeShortfall },
    flags: detectExceptions({ intent: order.intent, lines: order.lines, now: clock }, catalog),
    hasFood: rows.some((r) => r.category !== 'supply'),
  }
}
