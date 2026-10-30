import type { Fulfillment, Order, OrderStatus } from '../../data'
import { statusLabel } from '../../lib/status'

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
  if (query && !`${order.intent.contactName} ${order.intent.organization} ${requestId(order.id)}`.toLowerCase().includes(query)) return false
  if (criteria.status !== 'all' && order.status !== criteria.status) return false
  if (criteria.eventType !== 'all' && order.intent.eventType !== criteria.eventType) return false
  if (criteria.fulfillment !== 'all' && order.intent.fulfillment !== criteria.fulfillment) return false
  const day = order.intent.eventAt.slice(0, 10)
  if (criteria.from && day < criteria.from) return false
  if (criteria.to && day > criteria.to) return false
  return true
}

/** Latest activity on a request: a status change or a message, whichever is newer. */
export function updatedAt(order: Order) {
  const stamps = [...order.history.map((change) => change.at), ...order.messages.map((message) => message.at)]
  return stamps.reduce((latest, at) => (at > latest ? at : latest), '')
}

export type SortKey = 'id' | 'customer' | 'eventDate' | 'guests' | 'fulfillment' | 'status' | 'updated'
export type SortState = { key: SortKey; direction: 'asc' | 'desc' }

/** Most recently updated first, the default order of the request list. */
export const defaultSort: SortState = { key: 'updated', direction: 'desc' }

const customerName = (order: Order) => (order.intent.contactName || order.intent.organization).toLowerCase()

const sortValue: Record<SortKey, (order: Order) => string | number> = {
  id: (order) => requestNumber(order.id),
  customer: customerName,
  eventDate: (order) => order.intent.eventAt,
  guests: (order) => order.intent.guestCount ?? -1,
  fulfillment: (order) => order.intent.fulfillment,
  status: (order) => statusLabel[order.status],
  updated: updatedAt,
}

export function sortRequests(orders: Order[], { key, direction }: SortState) {
  const read = sortValue[key]
  const sign = direction === 'asc' ? 1 : -1
  return [...orders].sort((a, b) => {
    const left = read(a)
    const right = read(b)
    const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
    return sign * order || updatedAt(b).localeCompare(updatedAt(a))
  })
}

/** Date and time of the last update, e.g. "Oct 12, 4:20 PM". */
export function updatedLabel(order: Order) {
  const date = new Date(updatedAt(order))
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function dateOnly(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const requestNumber = (id: string) => Number(/^pi-(\d+)/i.exec(id)?.[1] ?? 0)

/** The ID staff see, e.g. PI-0001. Requests are numbered when they are submitted. */
export function requestId(id: string) {
  return /^pi-\d+$/i.test(id) ? id.toUpperCase() : `PI-${id.slice(-4).toUpperCase()}`
}
