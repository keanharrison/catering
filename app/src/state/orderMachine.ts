import {
  catalog as defaultCatalog,
  type Actor,
  type Catalog,
  type Message,
  type MessageAuthor,
  type Order,
  type OrderIntent,
  type OrderLine,
  type OrderStatus,
  type Scenario,
} from '../data'
import { detectExceptions } from '../engine'

/**
 * The order status machine. Pure functions: each takes an order and returns a new
 * order, or an error explaining why the move is not allowed. Every rule that keeps
 * an unreviewed or unapproved order from being confirmed lives in this file.
 */

export type Result = { ok: true; order: Order } | { ok: false; error: string }

const ok = (order: Order): Result => ({ ok: true, order })
const fail = (error: string): Result => ({ ok: false, error })

const OPEN_STATUSES: OrderStatus[] = ['submitted', 'needs_review', 'awaiting_customer_approval']

function moveTo(order: Order, to: OrderStatus, actor: Actor | 'system', at: string, note?: string): Order {
  return {
    ...order,
    status: to,
    history: [...order.history, { from: order.status, to, actor, at, note }],
  }
}

function addMessage(order: Order, author: MessageAuthor, text: string, at: string): Order {
  const message: Message = { id: `m${order.messages.length + 1}`, author, text, at }
  return { ...order, messages: [...order.messages, message] }
}

/** Starts a draft from a scenario: event answers are prefilled, the menu starts empty. */
export function createOrder(scenario: Scenario): Order {
  return {
    id: `order-${scenario.id}`,
    status: 'draft',
    intent: scenario.intent,
    lines: [],
    suppliesChoice: null,
    flags: [],
    revision: 'none',
    messages: [],
    history: [{ from: null, to: 'draft', actor: 'system', at: scenario.now }],
  }
}

/** The customer edits answers or quantities. Only possible before submission. */
export function updateDraft(
  order: Order,
  patch: { intent?: OrderIntent; lines?: OrderLine[]; suppliesChoice?: Order['suppliesChoice'] },
): Result {
  if (order.status !== 'draft') return fail('Only a draft can be edited by the customer.')
  return ok({
    ...order,
    intent: patch.intent ?? order.intent,
    lines: patch.lines ?? order.lines,
    suppliesChoice: patch.suppliesChoice === undefined ? order.suppliesChoice : patch.suppliesChoice,
  })
}

/** Submitting creates a request. It never means the restaurant accepted it. */
export function submit(order: Order, at: string, catalog: Catalog = defaultCatalog): Result {
  if (order.status !== 'draft') return fail('Only a draft can be submitted.')
  if (!order.lines.some((l) => catalog.menu.find((i) => i.id === l.itemId)?.category !== 'supply')) {
    return fail('Add at least one menu item before submitting.')
  }
  if (order.suppliesChoice === null) return fail('Choose supplies, or choose that none are needed.')
  const flags = detectExceptions({ intent: order.intent, lines: order.lines, now: at }, catalog)
  const to: OrderStatus = flags.length > 0 ? 'needs_review' : 'submitted'
  return ok(moveTo({ ...order, flags }, to, 'customer', at))
}

export function requestClarification(order: Order, text: string, at: string): Result {
  if (order.status !== 'submitted' && order.status !== 'needs_review') {
    return fail('Clarification can only be requested on a submitted request awaiting review.')
  }
  const withMessage = addMessage(order, 'staff', text, at)
  return ok(order.status === 'needs_review' ? withMessage : moveTo(withMessage, 'needs_review', 'staff', at, 'Clarification requested'))
}

export function customerReply(order: Order, text: string, at: string): Result {
  if (!OPEN_STATUSES.includes(order.status)) return fail('This request is closed.')
  return ok(addMessage(order, 'customer', text, at))
}

/** Staff change the proposal. The customer must approve before it can be accepted. */
export function revise(order: Order, lines: OrderLine[], at: string): Result {
  if (!OPEN_STATUSES.includes(order.status)) return fail('This request is closed.')
  const flags = detectExceptions({ intent: order.intent, lines, now: at }, defaultCatalog)
  const revised: Order = { ...order, lines, flags, revision: 'pending' }
  const withNote = addMessage(revised, 'system', 'Staff revised the proposal. Customer approval is needed.', at)
  return ok(
    order.status === 'awaiting_customer_approval'
      ? withNote
      : moveTo(withNote, 'awaiting_customer_approval', 'staff', at, 'Proposal revised'),
  )
}

export function customerApprove(order: Order, at: string): Result {
  if (order.status !== 'awaiting_customer_approval' || order.revision !== 'pending') {
    return fail('There is no revised proposal waiting for approval.')
  }
  const approved: Order = { ...order, revision: 'approved' }
  return ok(addMessage(approved, 'customer', 'Customer approved the revised proposal.', at))
}

export function canAccept(order: Order, actor: Actor): { allowed: boolean; reason?: string } {
  if (actor !== 'staff') return { allowed: false, reason: 'Only authorized staff can accept a request.' }
  switch (order.status) {
    case 'submitted':
      return order.flags.length === 0
        ? { allowed: true }
        : { allowed: false, reason: 'A flagged request needs staff review first.' }
    case 'needs_review':
      return { allowed: true }
    case 'awaiting_customer_approval':
      return order.revision === 'approved'
        ? { allowed: true }
        : { allowed: false, reason: 'The customer has not approved the revised proposal.' }
    default:
      return { allowed: false, reason: 'This request cannot be accepted from its current status.' }
  }
}

export function accept(order: Order, actor: Actor, at: string): Result {
  const check = canAccept(order, actor)
  if (!check.allowed) return fail(check.reason ?? 'Not allowed.')
  return ok(moveTo(order, 'confirmed', actor, at, 'Accepted by staff'))
}

export function reject(order: Order, reason: string, at: string): Result {
  if (!OPEN_STATUSES.includes(order.status)) return fail('This request is closed.')
  return ok(moveTo(addMessage(order, 'staff', reason, at), 'rejected', 'staff', at, 'Rejected by staff'))
}
