import type { Order } from '../../data'

/** Which list a customer's request belongs to. Shared by the orders pages and the Chat page's summaries so counts always agree. */

export function latestMessage(order: Order) {
  return order.messages.at(-1)
}

export function needsCustomerAction(order: Order) {
  return order.status === 'awaiting_customer_approval' && order.revision === 'pending'
    || order.status === 'needs_review' && latestMessage(order)?.author === 'staff'
}

export function isActive(order: Order, clock: string) {
  if (order.status === 'draft' || order.status === 'rejected') return false
  if (order.status === 'confirmed') return new Date(order.intent.eventAt).getTime() >= new Date(clock).getTime()
  return true
}

export function isHistorical(order: Order, clock: string) {
  if (order.status === 'rejected') return true
  return order.status === 'confirmed' && new Date(order.intent.eventAt).getTime() < new Date(clock).getTime()
}
