import { catalog, type Order } from '../../data'
import { statusLabel } from '../../lib/status'
import { routes } from '../../routes'
import { isActive, isHistorical, needsCustomerAction } from './orderBuckets'

export type DashboardSummary = {
  drafts: number
  active: Order[]
  past: Order[]
  threads: Order[]
  needsAction: Order[]
  nextEvent: Order | null
}

export type Answer = { text: string; href?: string; linkLabel?: string }

function eventTypeLabel(order: Order) {
  return (catalog.eventTypes.find((event) => event.id === order.intent.eventType)?.label ?? order.intent.eventType) || 'Catering request'
}

export function shortDate(eventAt: string) {
  const date = new Date(eventAt)
  if (Number.isNaN(date.getTime())) return 'a date to be set'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** The customer's own picture of their requests. Sample fixtures belong to other illustrative customers and stay out. */
export function summarizeDashboard(orders: Order[], draftOrder: Order, clock: string): DashboardSummary {
  const mine = orders.filter((order) => !order.demoSample)
  const active = mine.filter((order) => isActive(order, clock))
  const started = draftOrder.status === 'draft'
    && (draftOrder.intent.eventType !== '' || draftOrder.intent.guestCount !== null || draftOrder.lines.length > 0)
  const upcoming = active
    .filter((order) => !Number.isNaN(new Date(order.intent.eventAt).getTime()))
    .sort((a, b) => new Date(a.intent.eventAt).getTime() - new Date(b.intent.eventAt).getTime())
  return {
    drafts: started ? 1 : 0,
    active,
    past: mine.filter((order) => isHistorical(order, clock)),
    threads: mine.filter((order) => order.status !== 'draft' && order.messages.length > 0),
    needsAction: active.filter(needsCustomerAction),
    nextEvent: upcoming[0] ?? null,
  }
}

export const suggestedPrompts = [
  { title: 'Check a request', description: 'See where your current catering requests stand.', question: 'What is the status of my request?' },
  { title: 'Next event', description: 'Find out when your next event is and where it stands.', question: 'When is my next event?' },
  { title: 'Drafts', description: 'See whether you have a request in progress.', question: 'Do I have any drafts?' },
  { title: 'Changing a request', description: 'Learn how to change a request you already submitted.', question: 'How do I change a submitted request?' },
]


/** Answers come from the requests stored in this browser; there is no language-model service behind this yet. */
export function answerQuestion(question: string, summary: DashboardSummary): Answer {
  const q = question.toLowerCase()
  const has = (...words: string[]) => words.some((word) => q.includes(word))

  if (has('draft')) {
    return summary.drafts
      ? { text: 'You have a request in progress. Open New request to pick up where you left off.', href: routes.customer, linkLabel: 'Open New request' }
      : { text: 'You have no draft right now. Start one from New request.', href: routes.customer, linkLabel: 'Open New request' }
  }
  if (has('change', 'edit', 'cancel', 'revise', 'update')) {
    return {
      text: 'To change a submitted request, send the team a message from Messages and they can revise it. A request still in draft can be edited from New request.',
      href: routes.customerMessages,
      linkLabel: 'Open Messages',
    }
  }
  if (has('message', 'reply', 'respond', 'team', 'contact')) {
    if (summary.needsAction.length) {
      return { text: `${plural(summary.needsAction.length, 'request')} waiting on your reply.`, href: routes.currentOrders, linkLabel: 'Open Current orders' }
    }
    return summary.threads.length
      ? { text: `You have ${plural(summary.threads.length, 'conversation')} with the Pearl Island team. Nothing is waiting on you.`, href: routes.customerMessages, linkLabel: 'Open Messages' }
      : { text: 'No messages yet. After you submit a request, the team’s questions and updates appear in Messages.', href: routes.customerMessages, linkLabel: 'Open Messages' }
  }
  if (has('next', 'upcoming', 'when', 'date')) {
    return summary.nextEvent
      ? { text: `Your next event is the ${eventTypeLabel(summary.nextEvent)} on ${shortDate(summary.nextEvent.intent.eventAt)}. Status: ${statusLabel[summary.nextEvent.status].toLowerCase()}.`, href: routes.currentOrders, linkLabel: 'Open Current orders' }
      : { text: 'You have no upcoming event. Start a request from New request.', href: routes.customer, linkLabel: 'Open New request' }
  }
  if (has('status', 'where', 'progress', 'review', 'approved', 'accepted', 'submitted', 'order', 'request')) {
    if (!summary.active.length) {
      return { text: 'You have no active requests. Past requests are under Past orders.', href: routes.pastOrders, linkLabel: 'Open Past orders' }
    }
    const lines = summary.active.map((order) => `${eventTypeLabel(order)}, ${shortDate(order.intent.eventAt)}: ${statusLabel[order.status].toLowerCase()}`)
    const action = summary.needsAction.length ? `\n${plural(summary.needsAction.length, 'request')} waiting on your reply.` : ''
    return { text: `${lines.join('\n')}${action}`, href: routes.currentOrders, linkLabel: 'Open Current orders' }
  }
  if (has('past', 'history', 'previous', 'last')) {
    return summary.past.length
      ? { text: `You have ${plural(summary.past.length, 'past request')}.`, href: routes.pastOrders, linkLabel: 'Open Past orders' }
      : { text: 'You have no past requests yet.' }
  }
  if (has('menu', 'price', 'dietary', 'allergy', 'allergen', 'vegan', 'vegetarian', 'gluten')) {
    return {
      text: 'The full menu and quantities are on the Menu step of a new request. Dietary tags are guides, not allergy or nutrition guarantees.',
      href: routes.customer,
      linkLabel: 'Open New request',
    }
  }
  return {
    text: 'I can answer questions about your requests, drafts, and messages. For anything else, message the team from Messages.',
    href: routes.customerMessages,
    linkLabel: 'Open Messages',
  }
}
