import type { OrderStatus } from '../data'

export const statusLabel: Record<OrderStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_review: 'Needs review',
  awaiting_customer_approval: 'Awaiting approval',
  confirmed: 'Accepted',
  rejected: 'Declined',
}

export const statusTone: Record<OrderStatus, 'neutral' | 'confirmed' | 'review' | 'blocked'> = {
  draft: 'neutral',
  submitted: 'neutral',
  needs_review: 'review',
  awaiting_customer_approval: 'review',
  confirmed: 'confirmed',
  rejected: 'blocked',
}

export function formatEventTime(eventAt: string): string {
  const date = new Date(eventAt)
  if (Number.isNaN(date.getTime())) return eventAt
  return date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
}
