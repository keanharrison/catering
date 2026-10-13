const HOUR_MS = 3_600_000

/**
 * Hours between two local date-times that fall on weekdays (Mon-Fri).
 * Assumption: "business hours" means elapsed hours on weekdays, weekends excluded.
 * Inputs look like 2026-10-19T12:00 and are read as local time.
 */
export function businessHoursBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return 0

  let hours = 0
  for (let t = from; t < to; t += HOUR_MS) {
    const day = new Date(t).getDay()
    if (day !== 0 && day !== 6) hours += Math.min(HOUR_MS, to - t) / HOUR_MS
  }
  return Math.floor(hours)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Adds minutes to a local date-time like 2026-10-13T09:00 and returns the same format. */
export function addMinutes(iso: string, minutes: number): string {
  const d = new Date(new Date(iso).getTime() + minutes * 60_000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
