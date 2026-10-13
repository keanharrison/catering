import {
  catalog as defaultCatalog,
  type Catalog,
  type ExceptionFlag,
  type LeadTimeClass,
  type OrderIntent,
  type OrderLine,
} from '../data'
import { estimate } from './estimate'
import { getItem } from './lookup'
import { businessHoursBetween } from './time'

export type ExceptionInput = {
  intent: OrderIntent
  lines: OrderLine[]
  /** The current time, passed in so results are repeatable. */
  now: string
}

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

/** Custom requests and box lunches need the longer notice period. */
function requiredLeadClass(input: ExceptionInput, catalog: Catalog): LeadTimeClass {
  const hasCustomRequest = input.intent.customRequest.trim().length > 0
  const hasCustomItem = input.lines.some((l) => getItem(catalog, l.itemId).leadTimeClass === 'custom')
  return hasCustomRequest || hasCustomItem ? 'custom' : 'standard'
}

/** Raises the reasons an order needs staff review. Pure and explains every flag. */
export function detectExceptions(
  input: ExceptionInput,
  catalog: Catalog = defaultCatalog,
): ExceptionFlag[] {
  const { intent, lines, now } = input
  const thresholds = catalog.exceptionThresholds
  const flags: ExceptionFlag[] = []

  const guests = intent.guestCount
  if (guests === null || guests < 1) {
    flags.push({ code: 'unclear_headcount', reason: 'The guest count is missing or unclear.' })
  } else if (guests >= thresholds.largeOrderGuests) {
    flags.push({
      code: 'large_order',
      reason: `${guests} guests is at or above the ${thresholds.largeOrderGuests}-guest review threshold.`,
    })
  }

  const leadClass = requiredLeadClass(input, catalog)
  const leadRule = catalog.leadTimeRules.find((r) => r.leadTimeClass === leadClass)
  if (!leadRule) throw new Error(`Missing lead time rule: ${leadClass}`)
  const noticeHours = businessHoursBetween(now, intent.eventAt)
  if (noticeHours < leadRule.businessHours) {
    flags.push({
      code: 'short_notice',
      reason: `${noticeHours} business hours of notice; this order needs ${leadRule.businessHours}. ${leadRule.explanation}`,
    })
  }

  const needs = intent.dietary.filter((tag) => tag !== 'spicy')
  const unsupported = needs.filter((tag) => !catalog.menu.some((i) => i.dietaryTags.includes(tag)))
  if (needs.length >= thresholds.dietaryComplexityCount || unsupported.length > 0) {
    const parts = [`Dietary needs listed: ${needs.join(', ')}.`]
    if (unsupported.length > 0) {
      parts.push(`No menu item is tagged ${unsupported.join(', ')}, so staff must check.`)
    }
    flags.push({ code: 'dietary_complexity', reason: parts.join(' ') })
  }

  if (intent.customRequest.trim().length > 0) {
    flags.push({
      code: 'unavailable_request',
      reason: `Custom request outside the standard menu: "${intent.customRequest.trim()}"`,
    })
  }

  if (intent.budgetCents !== null) {
    const { subtotalCents } = estimate(lines, intent.guestCount, catalog)
    if (subtotalCents > intent.budgetCents) {
      flags.push({
        code: 'budget_mismatch',
        reason: `The estimate (${dollars(subtotalCents)}) is above the stated budget (${dollars(intent.budgetCents)}).`,
      })
    }
  }

  return flags
}
