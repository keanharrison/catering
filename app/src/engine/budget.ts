import { catalog as defaultCatalog, type Catalog, type MenuItem, type OrderIntent, type OrderLine } from '../data'
import { getItem, unitsFor } from './lookup'
import { recommend, type Recommendation, type RecommendedLine } from './recommend'

/**
 * Budget-aware suggestions. The customer's food budget is a ceiling, never a target: the suggestion starts from the
 * standard portions, trims only as far as it must to fit, and offers add-ons only when there is real room left.
 * Supplies are priced separately and are not counted against the food budget.
 */

export type Upgrade = { itemId: string; units: number; costCents: number; reason: string }

export type BudgetFit = {
  budgetCents: number | null
  /** Estimated cost of the food items only. */
  totalCents: number
  /** Budget minus total; negative when over. Null with no budget. */
  remainingCents: number | null
  status: 'none' | 'within' | 'over'
  /** A short plain-language account of how the suggestion fits (or why it cannot). */
  explanation: string
  /** Optional extras that fit in what is left. Empty unless the order is well under budget. */
  upgrades: Upgrade[]
}

export type BudgetedRecommendation = Recommendation & { fit: BudgetFit }

/** "Well under budget" means at least this share of the budget is unspent. */
const UPGRADE_THRESHOLD = 0.2
const MAX_UPGRADES = 3

export const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const isFood = (item: MenuItem) => item.category !== 'supply'
const isSide = (item: MenuItem) => item.category === 'side' || item.category === 'salad'

/** Whether an item respects the dietary tags the customer listed. Vegetarian is also met by vegan items. */
function fitsDiet(item: MenuItem, intent: OrderIntent): boolean {
  return intent.dietary.every((tag) => {
    if (tag === 'vegetarian') return item.dietaryTags.includes('vegetarian') || item.dietaryTags.includes('vegan')
    return item.dietaryTags.includes(tag)
  })
}

export function foodCostCents(lines: OrderLine[], catalog: Catalog = defaultCatalog): number {
  return lines.reduce((sum, line) => {
    const item = getItem(catalog, line.itemId)
    return isFood(item) ? sum + line.units * item.priceCents : sum
  }, 0)
}

/** Totals for any set of lines against a budget; used again when the customer adds an upgrade. */
export function budgetStatus(lines: OrderLine[], budgetCents: number | null, catalog: Catalog = defaultCatalog) {
  const totalCents = foodCostCents(lines, catalog)
  return {
    totalCents,
    remainingCents: budgetCents === null ? null : budgetCents - totalCents,
    status: (budgetCents === null ? 'none' : totalCents <= budgetCents ? 'within' : 'over') as BudgetFit['status'],
  }
}

type Entry = { line: RecommendedLine; fixed: boolean }

export function recommendForBudget(intent: OrderIntent, existing: OrderLine[] = [], catalog: Catalog = defaultCatalog): BudgetedRecommendation {
  const base = recommend(intent, catalog)
  const guests = intent.guestCount
  const budget = intent.budgetCents !== null && intent.budgetCents > 0 ? intent.budgetCents : null
  if (guests === null || guests < 1) {
    return { ...base, fit: { budgetCents: budget, totalCents: 0, remainingCents: budget, status: budget === null ? 'none' : 'within', explanation: '', upgrades: [] } }
  }

  const notes = [...base.notes]
  const adjustments: string[] = []
  const entries: Entry[] = []
  const name = (id: string) => getItem(catalog, id).name

  // The customer's own food selections stay exactly as they chose them.
  const kept = existing.filter((line) => line.units > 0 && isFood(getItem(catalog, line.itemId)))
  for (const line of kept) {
    const item = getItem(catalog, line.itemId)
    entries.push({ fixed: true, line: { itemId: line.itemId, units: line.units, servings: line.units * item.servingsPerUnit, reason: 'Kept your current quantity.', assumptions: [] } })
  }
  const keptIds = new Set(kept.map((line) => line.itemId))
  const keptEntreeServings = kept.reduce((sum, line) => {
    const item = getItem(catalog, line.itemId)
    return item.category === 'entree' ? sum + line.units * item.servingsPerUnit : sum
  }, 0)

  const additions = base.lines.filter((line) => !keptIds.has(line.itemId))
  const entreeAdditions = additions.filter((line) => getItem(catalog, line.itemId).category === 'entree')
  if (keptEntreeServings >= guests) {
    adjustments.push('Your current entrees already cover every guest, so no more are suggested.')
    for (const line of additions) if (!entreeAdditions.includes(line)) entries.push({ fixed: false, line })
  } else {
    // Cover only what the customer's own entrees leave over.
    const shortfall = guests - keptEntreeServings
    for (const line of additions) {
      const item = getItem(catalog, line.itemId)
      if (item.category === 'entree' && keptEntreeServings > 0) {
        const units = unitsFor(item, Math.ceil(shortfall / entreeAdditions.length))
        entries.push({ fixed: false, line: { ...line, units, servings: units * item.servingsPerUnit } })
      } else entries.push({ fixed: false, line })
    }
    if (keptEntreeServings > 0) adjustments.push('Suggested entrees only fill the servings your current entrees leave open.')
  }

  const total = () => entries.reduce((sum, entry) => sum + entry.line.units * getItem(catalog, entry.line.itemId).priceCents, 0)
  const sideCount = () => entries.filter((entry) => isSide(getItem(catalog, entry.line.itemId))).length

  if (budget !== null && total() > budget) {
    // 1. Trim sides, most expensive first, but never the last one.
    while (total() > budget && sideCount() > 1) {
      const removable = entries.filter((entry) => !entry.fixed && isSide(getItem(catalog, entry.line.itemId)))
      if (removable.length === 0) break
      const costliest = removable.reduce((a, b) => (getItem(catalog, b.line.itemId).priceCents > getItem(catalog, a.line.itemId).priceCents ? b : a))
      entries.splice(entries.indexOf(costliest), 1)
      adjustments.push(`Left out ${name(costliest.line.itemId)} to stay within budget.`)
    }

    // 2. Swap pricier meat entrees for the least expensive one that still suits the dietary needs.
    const meat = catalog.menu.filter((item) => item.category === 'entree' && !item.dietaryTags.includes('vegan') && !item.dietaryTags.includes('vegetarian') && fitsDiet(item, { ...intent, dietary: intent.dietary.filter((tag) => tag !== 'vegan' && tag !== 'vegetarian') }))
    const cheapest = [...meat].sort((a, b) => a.priceCents - b.priceCents)[0]
    if (cheapest) {
      for (const entry of [...entries]) {
        if (total() <= budget) break
        const item = getItem(catalog, entry.line.itemId)
        if (entry.fixed || item.category !== 'entree' || item.id === cheapest.id || item.dietaryTags.includes('vegan') || item.dietaryTags.includes('vegetarian') || item.priceCents <= cheapest.priceCents) continue
        const servings = entry.line.servings
        entries.splice(entries.indexOf(entry), 1)
        const target = entries.find((other) => other.line.itemId === cheapest.id && !other.fixed)
        const extra = unitsFor(cheapest, servings)
        if (target) { target.line = { ...target.line, units: target.line.units + extra, servings: target.line.servings + extra * cheapest.servingsPerUnit } }
        else entries.push({ fixed: false, line: { itemId: cheapest.id, units: extra, servings: extra * cheapest.servingsPerUnit, reason: `Swapped in for ${item.name}, which costs more per serving.`, assumptions: [] } })
        adjustments.push(`Swapped ${item.name} for ${cheapest.name}, which costs less per serving.`)
      }
    }
  }

  const fit = budgetStatus(entries.map((entry) => entry.line), budget, catalog)
  let explanation: string
  let upgrades: Upgrade[] = []
  if (budget === null) {
    explanation = 'No food budget was entered, so this uses standard portions. Add a budget on the event step to fit the suggestion to it.'
  } else if (fit.status === 'over') {
    explanation = `This is the lowest-cost order we can suggest for ${guests} guests: ${money(fit.totalCents)}, which is ${money(fit.totalCents - budget)} over your ${money(budget)} food budget. To fit, raise the budget or lower the guest count.`
    if (adjustments.length) explanation += ` ${adjustments.join(' ')}`
  } else {
    const spare = budget - fit.totalCents
    explanation = adjustments.length
      ? `Fits your ${money(budget)} food budget at ${money(fit.totalCents)}. To get there: ${adjustments.join(' ')}`
      : `Standard portions for ${guests} guests come to ${money(fit.totalCents)}, ${money(spare)} under your ${money(budget)} food budget.`
    if (spare >= budget * UPGRADE_THRESHOLD) upgrades = suggestUpgrades(intent, entries.map((entry) => entry.line), spare, catalog)
  }

  return { lines: entries.map((entry) => entry.line), notes, fit: { budgetCents: budget, ...fit, explanation, upgrades } }
}

/** Optional extra sides or salads, one serving per guest, that fit what is left and the dietary needs. */
export function suggestUpgrades(intent: OrderIntent, lines: OrderLine[], remainingCents: number, catalog: Catalog = defaultCatalog): Upgrade[] {
  const guests = intent.guestCount ?? 0
  const have = new Set(lines.map((line) => line.itemId))
  return catalog.menu
    .filter((item) => isSide(item) && item.unit !== 'bottle' && !have.has(item.id) && fitsDiet(item, intent))
    .map((item) => {
      const units = unitsFor(item, guests)
      return { itemId: item.id, units, costCents: units * item.priceCents, reason: `One more side for every guest, ${money(units * item.priceCents)} in all.` }
    })
    .filter((upgrade) => upgrade.costCents <= remainingCents)
    .sort((a, b) => a.costCents - b.costCents)
    .slice(0, MAX_UPGRADES)
}
