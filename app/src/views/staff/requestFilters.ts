import type { Order } from '../../data'

// Filter rules and display helpers used by the Staff page.
export type RequestFilter = 'all' | 'review' | 'awaiting' | 'confirmed'

export const filterLabel: Record<RequestFilter, string> = {
  all: 'All',
  review: 'Needs review',
  awaiting: 'Awaiting customer',
  confirmed: 'Accepted',
}

export function matchesFilter(order: Order, filter: RequestFilter) {
  if (filter === 'all') return true
  if (filter === 'review') return order.status === 'submitted' || order.status === 'needs_review'
  if (filter === 'awaiting') return order.status === 'awaiting_customer_approval'
  return order.status === 'confirmed'
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
