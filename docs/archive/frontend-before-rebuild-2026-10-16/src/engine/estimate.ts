import { catalog as defaultCatalog, type Catalog, type OrderLine } from '../data'
import { getItem } from './lookup'

export type EstimateLine = {
  itemId: string
  units: number
  servings: number
  costCents: number
  belowMinimum: boolean
}

export type Estimate = {
  lines: EstimateLine[]
  /** Item cost only. No tax, fees or tips. An estimate, not a quote. */
  subtotalCents: number
  entreeServings: number
  /** Entree servings still missing for the guest count; 0 when covered. */
  entreeShortfall: number
  costPerGuestCents: number | null
}

export function estimate(
  lines: OrderLine[],
  guestCount: number | null,
  catalog: Catalog = defaultCatalog,
): Estimate {
  const estimateLines = lines.map((line) => {
    const item = getItem(catalog, line.itemId)
    // Per-person supplies are priced once per guest; units only marks them as selected.
    const perPerson = item.unit === 'person'
    return {
      itemId: line.itemId,
      units: line.units,
      servings: item.category === 'supply' ? 0 : line.units * item.servingsPerUnit,
      costCents: (perPerson ? (guestCount ?? 0) : line.units) * item.priceCents,
      belowMinimum: line.units < item.minUnits,
    }
  })

  const subtotalCents = estimateLines.reduce((sum, l) => sum + l.costCents, 0)
  const entreeServings = estimateLines
    .filter((l) => getItem(catalog, l.itemId).category === 'entree')
    .reduce((sum, l) => sum + l.servings, 0)

  const hasGuests = guestCount !== null && guestCount > 0
  return {
    lines: estimateLines,
    subtotalCents,
    entreeServings,
    entreeShortfall: hasGuests ? Math.max(0, guestCount - entreeServings) : 0,
    costPerGuestCents: hasGuests ? Math.round(subtotalCents / guestCount) : null,
  }
}
