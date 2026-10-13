import { catalog as defaultCatalog, type Catalog, type OrderIntent } from '../data'
import { getItem, unitsFor } from './lookup'

export type RecommendedLine = {
  itemId: string
  units: number
  servings: number
  /** Plain explanation tied to the rule that produced this line. */
  reason: string
  /** Assumption notes behind this line, for disclosure. */
  assumptions: string[]
}

export type Recommendation = {
  lines: RecommendedLine[]
  notes: string[]
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))]
}

/** Proposes items and quantities from the rule set. Pure: same intent in, same result out. */
export function recommend(intent: OrderIntent, catalog: Catalog = defaultCatalog): Recommendation {
  const guests = intent.guestCount
  if (guests === null || guests < 1) {
    return { lines: [], notes: ['A guest count is needed before quantities can be suggested.'] }
  }

  const defaults = catalog.recommendationDefaults
  const entreeRule = catalog.portionRules.find((r) => r.category === 'entree')
  const sideRule = catalog.portionRules.find((r) => r.category === 'side')
  if (!entreeRule || !sideRule) throw new Error('Missing entree or side portion rule')

  const notes: string[] = []
  const wantsPlantBased = intent.dietary.includes('vegetarian') || intent.dietary.includes('vegan')
  const plantServings = wantsPlantBased ? Math.ceil(guests * defaults.plantBasedShare) : 0
  const meatServings = guests * entreeRule.servingsPerGuest - plantServings
  const perMeatEntree = Math.ceil(meatServings / defaults.defaultEntreeIds.length)

  const lines: RecommendedLine[] = []

  for (const id of defaults.defaultEntreeIds) {
    const item = getItem(catalog, id)
    const units = unitsFor(item, perMeatEntree)
    lines.push({
      itemId: id,
      units,
      servings: units * item.servingsPerUnit,
      reason: `${entreeRule.explanation} ${perMeatEntree} servings of ${item.name}; one tray serves ${item.servingsPerUnit}, so ${units} trays.`,
      assumptions: unique([item.assumption, entreeRule.assumption, defaults.assumption]),
    })
  }

  if (plantServings > 0) {
    const item = getItem(catalog, defaults.plantBasedEntreeId)
    const units = unitsFor(item, plantServings)
    lines.push({
      itemId: item.id,
      units,
      servings: units * item.servingsPerUnit,
      reason: `Vegetarian or vegan guests were listed, so ${plantServings} entree servings go to ${item.name}; one tray serves ${item.servingsPerUnit}, so ${units} trays.`,
      assumptions: unique([item.assumption, entreeRule.assumption, defaults.assumption]),
    })
    notes.push(
      `About ${Math.round(defaults.plantBasedShare * 100)}% of entree servings are set aside for plant-based guests (an assumed share).`,
    )
  }

  const sideIds = unique(lines.flatMap((l) => getItem(catalog, l.itemId).includedSideIds))
  const sideServings = guests * sideRule.servingsPerGuest
  for (const id of sideIds) {
    const item = getItem(catalog, id)
    const units = unitsFor(item, sideServings)
    lines.push({
      itemId: id,
      units,
      servings: units * item.servingsPerUnit,
      reason: `${sideRule.explanation} ${sideServings} servings of ${item.name}; one tray serves ${item.servingsPerUnit}, so ${units} trays.`,
      assumptions: unique([item.assumption, sideRule.assumption]),
    })
  }

  if (intent.dietary.includes('gluten-free')) {
    notes.push('Gluten-free needs cannot be confirmed from the menu data. Staff will check.')
  }

  return { lines, notes }
}
