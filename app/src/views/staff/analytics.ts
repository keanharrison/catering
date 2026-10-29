import { addDays, format, parseISO } from 'date-fns'
import type { Order } from '../../data'

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

/** Made-up counts with a gentle weekly rhythm, so an empty prototype still shows what the chart will look like. Always labeled as sample data. */
export function sampleCounts(clock: string, days = ANALYTICS_DAYS): DailyPoint[] {
  return dailyCounts([], clock, days).map((point, index) => {
    const received = 4 + Math.round(1.6 * Math.sin(index * 0.7) + 1.1 * Math.cos(index * 0.31))
    return { ...point, received, accepted: Math.max(0, received - 1 - (index % 5 === 2 ? 1 : 0)) }
  })
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
