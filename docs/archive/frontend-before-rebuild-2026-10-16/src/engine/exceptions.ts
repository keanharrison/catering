import {
  catalog as defaultCatalog,
  type Catalog,
  type ExceptionFlag,
  type LeadTimeClass,
  type OrderIntent,
  type OrderLine,
} from '../data'
import { pluralize } from '../lib/format'
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

/** The longest notice any part of the order needs: large order, custom request, or custom item. */
function requiredLeadClass(input: ExceptionInput, catalog: Catalog): LeadTimeClass {
  const classes = new Set<LeadTimeClass>(input.lines.map((l) => getItem(catalog, l.itemId).leadTimeClass))
  classes.add('standard')
  if (input.intent.customRequest.trim().length > 0) classes.add('custom')
  const guests = input.intent.guestCount
  if (guests !== null && guests > catalog.exceptionThresholds.largeOrderOverGuests) classes.add('large')

  const hours = (c: LeadTimeClass) => catalog.leadTimeRules.find((r) => r.leadTimeClass === c)?.businessHours ?? 0
  return [...classes].sort((a, b) => hours(b) - hours(a))[0]
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
  } else if (guests > thresholds.largeOrderOverGuests) {
    flags.push({
      code: 'large_order',
      reason: `${guests} guests is over the ${thresholds.largeOrderOverGuests}-guest limit for standard ordering.`,
    })
  }

  const leadClass = requiredLeadClass(input, catalog)
  const leadRule = catalog.leadTimeRules.find((r) => r.leadTimeClass === leadClass)
  if (!leadRule) throw new Error(`Missing lead time rule: ${leadClass}`)
  const noticeHours = businessHoursBetween(now, intent.eventAt)
  if (noticeHours < leadRule.businessHours) {
    flags.push({
      code: 'short_notice',
      reason: `${pluralize(Math.floor(noticeHours / 24), 'business day')} of notice; this order needs ${pluralize(Math.round(leadRule.businessHours / 24), 'business day')}. ${leadRule.explanation}`,
    })
  }

  const needs = intent.dietary.filter((tag) => tag !== 'spicy')
  const unsupported = needs.filter((tag) => !catalog.menu.some((i) => i.dietaryTags.includes(tag)))
  if (needs.length >= thresholds.dietaryComplexityCount || unsupported.length > 0) {
    const parts = [`Dietary needs listed: ${needs.join(', ')}. Our team will confirm what can be accommodated.`]
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
