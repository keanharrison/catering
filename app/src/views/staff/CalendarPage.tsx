import { useEffect, useMemo, useRef, useState } from 'react'
import { format, isSameMonth, parseISO } from 'date-fns'
import { OptionSelect } from '../../components/OptionSelect'
import { Button } from '../../components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import { cn } from '../../lib/cn'
import { useDemoStore } from '../../state/store'
import {
  HOUR_HEIGHT, hourLabel, hours, monthDays, offsetFor, rangeTitle, sameDay, step, weekDays, eventsOn,
  type CalendarEvent, type CalendarView,
} from './calendar'

const viewOptions = [{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The day number: a filled circle on today, the way every calendar marks it. */
function DayNumber({ day, today, muted = false }: { day: Date; today: boolean; muted?: boolean }) {
  return (
    <span className={cn(
      'flex size-8 items-center justify-center rounded-full text-heading tabular-nums',
      today ? 'bg-primary font-medium text-primary-foreground' : muted ? 'text-muted-foreground' : 'text-foreground',
    )}>{format(day, 'd')}</span>
  )
}

function WeekView({ anchor, today, now, events }: { anchor: Date; today: Date; now: Date; events: CalendarEvent[] }) {
  const days = weekDays(anchor)
  const scroller = useRef<HTMLDivElement>(null)

  // Open at 7 AM, where the working day starts.
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = 7 * HOUR_HEIGHT - 8 }, [])

  return (
    <div ref={scroller} className="max-h-[calc(100svh-12.5rem)] min-h-[28rem] overflow-auto rounded-xl border border-border bg-card">
      <div role="grid" aria-label={`Week of ${format(days[0], 'MMMM d')} to ${format(days[6], 'MMMM d, yyyy')}`} aria-readonly="true" className="min-w-[44rem]">
        <div role="row" className="sticky top-0 z-20 grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-border bg-card">
          <div aria-hidden="true" />
          {days.map((day) => (
            <div key={day.toISOString()} role="columnheader" aria-label={format(day, 'EEEE, MMMM d')} aria-current={sameDay(day, today) ? 'date' : undefined} className="flex flex-col items-center gap-0.5 border-l border-border py-2">
              <span className={cn('text-caption font-medium uppercase tracking-[0.04em]', sameDay(day, today) ? 'text-foreground' : 'text-muted-foreground')}>{format(day, 'EEE')}</span>
              <DayNumber day={day} today={sameDay(day, today)} />
            </div>
          ))}
        </div>

        <div role="row" className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
          <div aria-hidden="true" className="relative">
            {hours.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
                <span className="absolute -top-2 right-2 text-caption text-muted-foreground">{hourLabel(hour)}</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const isToday = sameDay(day, today)
            return (
              <div key={day.toISOString()} role="gridcell" aria-label={format(day, 'EEEE, MMMM d')} className={cn('relative border-l border-border', (day.getDay() === 0 || day.getDay() === 6) && 'bg-muted/40')}>
                {hours.map((hour) => <div key={hour} style={{ height: HOUR_HEIGHT }} className="border-b border-border/70" />)}
                {eventsOn(events, day).map((event) => {
                  const start = parseISO(event.start)
                  const end = parseISO(event.end)
                  const top = offsetFor(start.getHours(), start.getMinutes())
                  const height = Math.max(24, offsetFor(end.getHours(), end.getMinutes()) - top)
                  return (
                    <div key={event.id} style={{ top, height }} className="absolute inset-x-1 overflow-hidden rounded-lg border border-info/30 bg-info-soft px-2 py-1 text-ui text-info">
                      <p className="truncate font-medium">{event.title}</p>
                      <p className="truncate text-caption">{format(start, 'h:mm a')}</p>
                    </div>
                  )
                })}
                {isToday && (
                  <div aria-hidden="true" style={{ top: offsetFor(now.getHours(), now.getMinutes()) }} className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-destructive">
                    <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-destructive" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MonthView({ anchor, today, events, onPick }: { anchor: Date; today: Date; events: CalendarEvent[]; onPick: (day: Date) => void }) {
  const days = monthDays(anchor)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div role="grid" aria-label={format(anchor, 'MMMM yyyy')} aria-readonly="true">
        <div role="row" className="grid grid-cols-7 border-b border-border">
          {weekdayNames.map((name) => <div key={name} role="columnheader" className="py-2 text-center text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">{name}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const inMonth = isSameMonth(day, anchor)
            const dayEvents = eventsOn(events, day)
            return (
              <div key={day.toISOString()} role="gridcell" className={cn('min-h-20 border-border p-1 sm:min-h-28', index % 7 !== 0 && 'border-l', index >= 7 && 'border-t', !inMonth && 'bg-muted/40')}>
                <button
                  type="button"
                  onClick={() => onPick(day)}
                  aria-label={`${format(day, 'EEEE, MMMM d')}, open week`}
                  aria-current={sameDay(day, today) ? 'date' : undefined}
                  className="mx-auto flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <DayNumber day={day} today={sameDay(day, today)} muted={!inMonth} />
                </button>
                <ul className="mt-1 grid gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => <li key={event.id} className="truncate rounded-md bg-info-soft px-1.5 py-0.5 text-caption text-info">{event.title}</li>)}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Admin > Calendar: week and month views with date navigation. It shows the demo clock's today and no events yet;
 * pass `events` and each one lands in its time slot, ready for a later step that links an entry to its order.
 */
export function CalendarPage({ events = [] }: { events?: CalendarEvent[] }) {
  const clock = useDemoStore((state) => state.clock)
  const now = useMemo(() => parseISO(clock), [clock])
  const [anchor, setAnchor] = useState(() => parseISO(clock))
  const [view, setView] = useState<CalendarView>('week')
  const unit = view === 'week' ? 'week' : 'month'

  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="calendar-title">
      <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-3">
        <h1 id="calendar-title" className="type-page-title mr-2">Calendar</h1>
        <Button variant="outline" onClick={() => setAnchor(now)}>Today</Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={`Previous ${unit}`} onClick={() => setAnchor(step(anchor, view, -1))}><ChevronLeftIcon aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon" aria-label={`Next ${unit}`} onClick={() => setAnchor(step(anchor, view, 1))}><ChevronRightIcon aria-hidden="true" /></Button>
        </div>
        <p role="status" aria-live="polite" className="min-w-0 flex-1 text-heading text-foreground">{rangeTitle(anchor, view)}</p>
        <div className="w-32">
          <OptionSelect label="Calendar view" value={view} onValueChange={(next) => setView(next as CalendarView)} options={viewOptions} />
        </div>
      </header>

      {view === 'week'
        ? <WeekView anchor={anchor} today={now} now={now} events={events} />
        : <MonthView anchor={anchor} today={now} events={events} onPick={(day) => { setAnchor(day); setView('week') }} />}

      {events.length === 0 && <p className="mt-3 text-ui text-muted-foreground">No events yet.</p>}
    </section>
  )
}
