import { catalog as defaultCatalog, type Catalog, type ExceptionFlag, type MenuCategory, type Order } from '../../data'
import { detectExceptions, estimate, recommend, type Estimate } from '../../engine'
import { pluralize } from '../../lib/format'

export type RecommendationRow = {
  itemId: string
  name: string
  unitLabel: string
  servings: number
  costCents: number
  reason: string
  /** Notes disclosing what is assumed about this row. */
  assumptions: string[]
}

export type RecommendationGroup = {
  category: MenuCategory
  title: string
  rows: RecommendationRow[]
}

export type RecommendationView = {
  guestCount: number | null
  groups: RecommendationGroup[]
  estimate: Estimate
  flags: ExceptionFlag[]
  notes: string[]
}

const GROUPS: Array<{ category: MenuCategory; title: string }> = [
  { category: 'entree', title: 'Entrees' },
  { category: 'side', title: 'Sides' },
  { category: 'boxed', title: 'Boxed meals' },
]

/** Everything the recommendation screen shows, derived from the order and the engine. */
export function buildRecommendationView(
  order: Order,
  clock: string,
  catalog: Catalog = defaultCatalog,
): RecommendationView {
  const recommendation = recommend(order.intent, catalog)
  const priced = estimate(order.lines, order.intent.guestCount, catalog)

  const rows = order.lines.map((line, index): RecommendationRow & { category: MenuCategory } => {
    const item = catalog.menu.find((i) => i.id === line.itemId)
    if (!item) throw new Error(`Unknown menu item: ${line.itemId}`)
    const suggested = recommendation.lines.find((r) => r.itemId === line.itemId)
    return {
      category: item.category,
      itemId: item.id,
      name: item.name,
      unitLabel: pluralize(line.units, item.unit),
      servings: priced.lines[index].servings,
      costCents: priced.lines[index].costCents,
      reason: suggested?.reason ?? 'Added to your order.',
      assumptions: suggested?.assumptions ?? (item.assumption ? [item.assumption] : []),
    }
  })

  return {
    guestCount: order.intent.guestCount,
    groups: GROUPS.map((g) => ({
      category: g.category,
      title: g.title,
      rows: rows.filter((r) => r.category === g.category),
    })).filter((g) => g.rows.length > 0),
    estimate: priced,
    flags: detectExceptions({ intent: order.intent, lines: order.lines, now: clock }, catalog),
    notes: recommendation.notes,
  }
}
