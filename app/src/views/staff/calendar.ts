import { addDays, addHours, addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { catalog, type Order } from '../../data'

/** Date math for the Admin calendar. Weeks start on Sunday, as in Google Calendar. */

export type CalendarView = 'week' | 'month'

/**
 * What a calendar entry will look like once events exist. Nothing creates these yet;
 * `orderId` is where a later step links an entry to its request.
 */
export type CalendarEvent = {
  id: string
  title: string
  /** Local date-time, e.g. 2026-10-24T12:00 */
  start: string
  end: string
  allDay?: boolean
  orderId?: string
  /** Accepted by Pearl Island, or still waiting on a decision or a reply. */
  tone?: 'accepted' | 'pending'
}

export const HOUR_HEIGHT = 56
export const hours = Array.from({ length: 24 }, (_, hour) => hour)

export const hourLabel = (hour: number) => (hour === 0 ? '' : format(new Date(2000, 0, 1, hour), 'h a'))

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

/** Every day shown in a month view, in whole weeks, so the grid has no ragged edges. */
export function monthDays(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor))
  const end = endOfWeek(endOfMonth(anchor))
  const days: Date[] = []
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day)
  return days
}

export const step = (anchor: Date, view: CalendarView, direction: 1 | -1) => (view === 'week' ? addWeeks(anchor, direction) : addMonths(anchor, direction))

/** "October 2026", or "Oct – Nov 2026" when a week crosses a month. */
export function rangeTitle(anchor: Date, view: CalendarView): string {
  if (view === 'month') return format(anchor, 'MMMM yyyy')
  const days = weekDays(anchor)
  const [first, last] = [days[0], days[6]]
  if (isSameMonth(first, last)) return format(first, 'MMMM yyyy')
  return first.getFullYear() === last.getFullYear()
    ? `${format(first, 'MMM')} – ${format(last, 'MMM yyyy')}`
    : `${format(first, 'MMM yyyy')} – ${format(last, 'MMM yyyy')}`
}

/** Distance from the top of the 24-hour grid, in pixels, for a local time. */
export const offsetFor = (hour: number, minute: number) => ((hour * 60 + minute) / 60) * HOUR_HEIGHT

export const sameDay = (a: Date, b: Date) => format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')

/** Events that start on a given day, earliest first. */
export const eventsOn = (events: CalendarEvent[], day: Date) =>
  events.filter((event) => event.start.slice(0, 10) === format(day, 'yyyy-MM-dd')).sort((a, b) => a.start.localeCompare(b.start))

/**
 * One entry per request that is still alive: accepted ones, and ones waiting on a decision or a reply.
 * Declined requests and drafts are left off. Requests store a start time only, so each entry is drawn one hour long.
 */
export function eventsFromOrders(orders: Order[]): CalendarEvent[] {
  return orders.flatMap((order): CalendarEvent[] => {
    if (order.status === 'draft' || order.status === 'rejected' || !order.intent.eventAt) return []
    const eventType = catalog.eventTypes.find((type) => type.id === order.intent.eventType)?.label ?? 'Catering event'
    const start = order.intent.eventAt
    return [{
      id: order.id,
      orderId: order.id,
      title: order.intent.contactName ? `${eventType} · ${order.intent.contactName}` : eventType,
      start,
      end: format(addHours(parseISO(start), 1), "yyyy-MM-dd'T'HH:mm"),
      tone: order.status === 'confirmed' ? 'accepted' : 'pending',
    }]
  })
}

export type PlacedEvent = { event: CalendarEvent; column: number; columns: number }

/** Lays one day's events side by side where they overlap, so none hides another. */
export function placeEvents(events: CalendarEvent[]): PlacedEvent[] {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start))
  const placed: PlacedEvent[] = []
  let cluster: PlacedEvent[] = []
  let clusterEnd = ''
  const close = () => { for (const item of cluster) item.columns = Math.max(1, ...cluster.map((c) => c.column + 1)); placed.push(...cluster); cluster = [] }
  for (const event of sorted) {
    if (cluster.length && event.start >= clusterEnd) close()
    const taken = new Set(cluster.filter((item) => item.event.end > event.start).map((item) => item.column))
    let column = 0
    while (taken.has(column)) column += 1
    cluster.push({ event, column, columns: 1 })
    clusterEnd = clusterEnd > event.end ? clusterEnd : event.end
  }
  close()
  return placed
}
