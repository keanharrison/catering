import { addDays, format, parseISO } from 'date-fns'
import { catalog, type Order } from '../../data'

/** Daily counts for the Admin Analytics chart, taken straight from each request's status history. */

export const ANALYTICS_DAYS = 14

export type DailyPoint = { date: string; received: number; accepted: number }

const RECEIVED: Array<Order['status']> = ['submitted', 'needs_review']

/** The last `days` calendar days ending on the demo clock's day, oldest first. */
export function dailyCounts(orders: Order[], clock: string, days = ANALYTICS_DAYS): DailyPoint[] {
  const end = parseISO(clock.slice(0, 10))
  const points: DailyPoint[] = Array.from({ length: days }, (_, index) => ({
    date: format(addDays(end, index - (days - 1)), 'yyyy-MM-dd'),
    received: 0,
    accepted: 0,
  }))
  const byDate = new Map(points.map((point) => [point.date, point]))
  for (const order of orders) {
    const arrival = order.history.find((change) => change.from === 'draft' && RECEIVED.includes(change.to))
    if (arrival) {
      const point = byDate.get(arrival.at.slice(0, 10))
      if (point) point.received += 1
    }
    const acceptance = order.history.find((change) => change.to === 'confirmed')
    if (acceptance) {
      const point = byDate.get(acceptance.at.slice(0, 10))
      if (point) point.accepted += 1
    }
  }
  return points
}

/** A tidy top for the vertical axis: 4, 5, 8, 10, 20, 50 ... never below 4 so a quiet chart is not exaggerated. */
export function niceMax(value: number): number {
  if (value <= 4) return 4
  const scale = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 4, 5, 8, 10]) if (value <= step * scale) return step * scale
  return 10 * scale
}

/** A smooth path through the points that never dips below or above its neighbours (monotone cubic). */
export function smoothPath(points: Array<[number, number]>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`
  const n = points.length
  const dx = points.slice(1).map((p, i) => p[0] - points[i][0])
  const slope = points.slice(1).map((p, i) => (p[1] - points[i][1]) / dx[i])
  const tangent = points.map((_, i) => {
    if (i === 0) return slope[0]
    if (i === n - 1) return slope[n - 2]
    return slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2
  })
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) { tangent[i] = 0; tangent[i + 1] = 0; continue }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const sum = a * a + b * b
    if (sum > 9) {
      const t = 3 / Math.sqrt(sum)
      tangent[i] = t * a * slope[i]
      tangent[i + 1] = t * b * slope[i]
    }
  }
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    d += ` C${x0 + dx[i] / 3},${y0 + (tangent[i] * dx[i]) / 3} ${x1 - dx[i] / 3},${y1 - (tangent[i + 1] * dx[i]) / 3} ${x1},${y1}`
  }
  return d
}

export type Share = { id: string; label: string; value: number }

/** Counts of each answer to a question across requests, biggest first (ties keep the order they were first seen). */
function tally(orders: Order[], pick: (order: Order) => string | undefined, name: (id: string) => string): Share[] {
  const counts = new Map<string, number>()
  for (const order of orders) {
    const id = pick(order)
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return [...counts].map(([id, value]) => ({ id, label: name(id), value })).sort((a, b) => b.value - a.value)
}

export const eventTypeMix = (orders: Order[]) =>
  tally(orders, (order) => order.intent.eventType, (id) => catalog.eventTypes.find((type) => type.id === id)?.label ?? id)

export const fulfillmentMix = (orders: Order[]) =>
  tally(orders, (order) => order.intent.fulfillment, (id) => (id === 'delivery' ? 'Delivery' : 'Pickup'))

/** Food and drink quantities across every request that was not declined, largest first. Supplies are left out. */
export function menuDemand(orders: Order[], limit = 5): Share[] {
  const totals = new Map<string, number>()
  for (const order of orders) {
    if (order.status === 'rejected') continue
    for (const line of order.lines) totals.set(line.itemId, (totals.get(line.itemId) ?? 0) + line.units)
  }
  return [...totals]
    .flatMap(([id, value]) => {
      const item = catalog.menu.find((entry) => entry.id === id)
      return item && item.category !== 'supply' && value > 0 ? [{ id, label: item.name, value }] : []
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

export type AcceptedEvents = {
  upcoming: Order[]
  upcomingGuests: number
  completed: number
  completedGuests: number
}

/** Accepted events split by whether the event date has passed on the demo clock. Soonest upcoming event first. */
export function acceptedEvents(orders: Order[], clock: string): AcceptedEvents {
  const now = new Date(clock).getTime()
  const accepted = orders.filter((order) => order.status === 'confirmed' && order.intent.eventAt)
  const isPast = (order: Order) => new Date(order.intent.eventAt).getTime() < now
  const guests = (list: Order[]) => list.reduce((sum, order) => sum + (order.intent.guestCount ?? 0), 0)
  const upcoming = accepted.filter((order) => !isPast(order)).sort((a, b) => a.intent.eventAt.localeCompare(b.intent.eventAt))
  const completed = accepted.filter(isPast)
  return { upcoming, upcomingGuests: guests(upcoming), completed: completed.length, completedGuests: guests(completed) }
}
