import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { catalog, type Message, type Order } from '../../data'

/** What Admin needs to list a request's conversation: ordering, unread counts, previews, search. */

export const READ_KEY = 'pi2go-admin-read'

/** Message ids read so far, per request. A customer message not in the list counts as unread. */
export type ReadState = Record<string, string[]>

export function readReadState(): ReadState {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as unknown
    return parsed && typeof parsed === 'object' ? (parsed as ReadState) : {}
  } catch {
    return {}
  }
}

export function writeReadState(state: ReadState) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(state))
  } catch {
    // Without storage the page still works; unread counts just reset on reload.
  }
}

export const unreadCount = (order: Order, read: ReadState) =>
  order.messages.filter((message) => message.author === 'customer' && !(read[order.id] ?? []).includes(message.id)).length

export const latestMessage = (order: Order): Message | undefined => order.messages.at(-1)

/** When a thread last had activity: its newest message, or when the request arrived if nobody has written yet. */
export const lastActivity = (order: Order) => latestMessage(order)?.at ?? order.history.find((change) => change.to !== 'draft')?.at ?? ''

export type ThreadSort = 'newest' | 'oldest'

export function sortThreads(orders: Order[], sort: ThreadSort): Order[] {
  const direction = sort === 'newest' ? -1 : 1
  return [...orders].sort((a, b) => direction * lastActivity(a).localeCompare(lastActivity(b)))
}

const eventTypeLabel = (order: Order) => catalog.eventTypes.find((type) => type.id === order.intent.eventType)?.label ?? 'Catering request'

/** Requests carry no event name of their own, so the organization stands in; a private customer gets "<name>’s event". */
export const eventName = (order: Order) => order.intent.organization || (order.intent.contactName ? `${order.intent.contactName}’s event` : eventTypeLabel(order))

export function matchesSearch(order: Order, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [order.intent.contactName, order.intent.organization, eventTypeLabel(order), ...order.messages.map((message) => message.text)].join(' ').toLowerCase()
  return haystack.includes(needle)
}

/** "16h ago" within a day of the demo clock, a short date after that. */
export function relativeTime(at: string, clock: string): string {
  if (!at) return ''
  const date = parseISO(at)
  const minutes = Math.round((parseISO(clock).getTime() - date.getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`
  return differenceInCalendarDays(parseISO(clock), date) < 7 ? format(date, 'EEE') : format(date, 'MMM d')
}
