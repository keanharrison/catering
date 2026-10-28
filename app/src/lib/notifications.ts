import { catalog, type Order } from '../data'
import { routes } from '../routes'
import type { DemoAccount } from '../state/demoAccount'

export type Notification = { id: string; title: string; detail?: string; at: string; href: string }

function eventLabel(order: Order) {
  return (catalog.eventTypes.find((event) => event.id === order.intent.eventType)?.label ?? order.intent.eventType) || 'catering'
}

/** What changed, newest first. Customers hear about the team's decisions; the team hears about requests waiting on them. */
export function deriveNotifications(orders: Order[], account: DemoAccount, limit = 6): Notification[] {
  const items: Notification[] = []

  if (account === 'team') {
    for (const order of orders) {
      if (order.status !== 'submitted' && order.status !== 'needs_review') continue
      const last = order.history.at(-1)
      items.push({
        id: `${order.id}-review`,
        title: `${eventLabel(order)} request is waiting for review`,
        detail: order.demoSample ? 'Sample request' : undefined,
        at: last?.at ?? '',
        href: routes.staff,
      })
    }
  } else {
    for (const order of orders.filter((o) => !o.demoSample)) {
      order.history.forEach((change, index) => {
        if (change.actor !== 'staff') return
        const href = `${routes.currentOrders}?order=${encodeURIComponent(order.id)}`
        const id = `${order.id}-${index}`
        const label = eventLabel(order)
        if (change.to === 'confirmed') items.push({ id, title: `Your ${label} request was accepted`, at: change.at, href })
        else if (change.to === 'rejected') items.push({ id, title: `Your ${label} request was declined`, at: change.at, href: `${routes.pastOrders}?order=${encodeURIComponent(order.id)}` })
        else if (change.to === 'awaiting_customer_approval') items.push({ id, title: `Changes to your ${label} request need your approval`, at: change.at, href })
        else if (change.to === 'needs_review') items.push({ id, title: `The team has a question about your ${label} request`, at: change.at, href })
      })
    }
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
}
