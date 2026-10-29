import type { Fulfillment, Order, OrderStatus } from '../../data'

// Views, filters and display helpers used by the Admin Requests page.

/** All: everything. Past: declined, or accepted with the event date behind us. Current: still being worked on. Upcoming accepted: accepted, event not yet held. */
export type RequestView = 'all' | 'past' | 'current' | 'upcoming'

export const viewLabel: Record<RequestView, string> = {
  all: 'All',
  past: 'Past',
  current: 'Current',
  upcoming: 'Upcoming accepted',
}

const IN_PROGRESS: OrderStatus[] = ['submitted', 'needs_review', 'awaiting_customer_approval']

const eventHasPassed = (order: Order, clock: string) => new Date(order.intent.eventAt).getTime() < new Date(clock).getTime()

export function matchesView(order: Order, view: RequestView, clock: string) {
  if (view === 'all') return true
  if (view === 'current') return IN_PROGRESS.includes(order.status)
  if (view === 'upcoming') return order.status === 'confirmed' && !eventHasPassed(order, clock)
  return order.status === 'rejected' || (order.status === 'confirmed' && eventHasPassed(order, clock))
}

export type RequestCriteria = {
  query: string
  status: 'all' | OrderStatus
  eventType: string
  fulfillment: 'all' | Fulfillment
  /** Event date range, yyyy-MM-dd; empty means open-ended. */
  from: string
  to: string
}

export const noCriteria: RequestCriteria = { query: '', status: 'all', eventType: 'all', fulfillment: 'all', from: '', to: '' }

export const hasCriteria = (criteria: RequestCriteria) => (Object.keys(noCriteria) as Array<keyof RequestCriteria>).some((key) => criteria[key] !== noCriteria[key])

export function matchesCriteria(order: Order, criteria: RequestCriteria) {
  const query = criteria.query.trim().toLowerCase()
  if (query && !`${order.intent.contactName} ${order.intent.organization}`.toLowerCase().includes(query)) return false
  if (criteria.status !== 'all' && order.status !== criteria.status) return false
  if (criteria.eventType !== 'all' && order.intent.eventType !== criteria.eventType) return false
  if (criteria.fulfillment !== 'all' && order.intent.fulfillment !== criteria.fulfillment) return false
  const day = order.intent.eventAt.slice(0, 10)
  if (criteria.from && day < criteria.from) return false
  if (criteria.to && day > criteria.to) return false
  return true
}

export function dateOnly(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function shortRequestId(id: string) {
  return `…${id.slice(-6).toUpperCase()}`
}
