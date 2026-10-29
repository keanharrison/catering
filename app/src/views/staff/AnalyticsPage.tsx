import { useMemo, useState, type ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { catalog, type Order } from '../../data'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { useDemoStore } from '../../state/store'
import { RANGES, acceptedEvents, dailyCounts, eventTypeMix, fulfillmentMix, menuDemand, receivedWithin, type RangeDays } from './analytics'
import { Bars } from './Bars'
import { LineChart } from './LineChart'

const dayLabel = (date: string) => format(parseISO(date), 'MMM d')
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function Widget({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EventList({ orders, eventName, empty }: { orders: Order[]; eventName: (id: string) => string; empty: string }) {
  if (orders.length === 0) return none(empty)
  return (
    <ul className="grid gap-2">
      {orders.map((order) => (
        <li key={order.id} className="flex items-baseline justify-between gap-3 text-ui">
          <span className="min-w-0 truncate">
            <span className="text-foreground">{format(parseISO(order.intent.eventAt), 'EEE, MMM d')}</span>
            <span className="text-muted-foreground"> · {eventName(order.intent.eventType)}</span>
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">{order.intent.guestCount ?? '—'} guests</span>
        </li>
      ))}
    </ul>
  )
}

const none = (text: string) => <p className="text-ui text-muted-foreground">{text}</p>

/** Admin > Analytics: patterns across the requests customers have submitted. Everything is counted from request records; with none yet, the page says so. */
export function AnalyticsPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)

  const [days, setDays] = useState<RangeDays>(14)
  const inRange = useMemo(() => receivedWithin(orders, clock, days), [orders, clock, days])
  const daily = useMemo(() => dailyCounts(orders, clock, days), [orders, clock, days])
  const types = useMemo(() => eventTypeMix(inRange), [inRange])
  const fulfillment = useMemo(() => fulfillmentMix(inRange), [inRange])
  const demand = useMemo(() => menuDemand(inRange), [inRange])
  const events = useMemo(() => acceptedEvents(orders, clock, days), [orders, clock, days])
  const received = daily.reduce((sum, point) => sum + point.received, 0)
  const period = `Last ${days} days`
  const caption = `Requests received and accepted per day, last ${days} days`
  const eventName = (id: string) => catalog.eventTypes.find((type) => type.id === id)?.label ?? id

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="analytics-title">
      <header className="mb-6">
        <h1 id="analytics-title" className="type-page-title">Analytics</h1>
        <p className="mt-1 text-body text-muted-foreground">Patterns across the requests customers have submitted.</p>
      </header>

      {orders.length > 0 && (
        <Tabs value={String(days)} onValueChange={(value) => setDays(Number(value) as RangeDays)} className="mb-4">
          <TabsList aria-label="Date range">
            {RANGES.map((range) => <TabsTrigger key={range} value={String(range)}>{range} days</TabsTrigger>)}
          </TabsList>
        </Tabs>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <Empty className="min-h-72 border-0">
              <EmptyHeader>
                <EmptyMedia variant="tile" tone={destinationTones.analytics}><destinationIcons.analytics /></EmptyMedia>
                <EmptyTitle>No analytics yet</EmptyTitle>
                <EmptyDescription>Charts and breakdowns appear here once customers have submitted requests.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                  <CardTitle className="text-base">Requests received</CardTitle>
                  <p className="mt-1 text-hero font-normal leading-none tabular-nums text-muted-foreground">{received}</p>
                  <CardDescription className="mt-1">{period}</CardDescription>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-ui" aria-label="Legend">
                  <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-info" />Received</li>
                  <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-success" />Accepted</li>
                </ul>
              </div>
            </CardHeader>
            <CardContent>
              <LineChart
                labels={daily.map((point) => point.date)}
                formatLabel={dayLabel}
                caption={caption}
                series={[
                  { id: 'received', label: 'Received', color: 'var(--info)', values: daily.map((point) => point.received) },
                  { id: 'accepted', label: 'Accepted', color: 'var(--success)', values: daily.map((point) => point.accepted) },
                ]}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Widget title="Event types" description={`${plural(inRange.length, 'request')} · ${period.toLowerCase()}`}>
              {inRange.length ? <Bars rows={types} total={inRange.length} color="var(--tile-indigo)" /> : none('No requests in this period.')}
            </Widget>

            <Widget title="Pickup or delivery" description={`${plural(inRange.length, 'request')} · ${period.toLowerCase()}`}>
              {inRange.length ? <Bars rows={fulfillment} total={inRange.length} color="var(--tile-sky)" /> : none('No requests in this period.')}
            </Widget>

            <Widget title="Menu demand" description={`Most-requested food and drink by quantity · ${period.toLowerCase()}. Each item counts in its own unit.`}>
              {demand.length ? <Bars rows={demand} color="var(--tile-teal)" /> : none('No menu items were requested in this period.')}
            </Widget>

            <Widget
              title="Upcoming events"
              description={events.upcoming.length ? `${plural(events.upcoming.length, 'accepted event')} · ${plural(events.upcomingGuests, 'guest')}` : 'Accepted events not yet held'}
            >
              <EventList orders={events.upcoming.slice(0, 5)} eventName={eventName} empty="No accepted events are coming up." />
            </Widget>

            <div className="md:col-span-2">
              <Widget
                title="Completed events"
                description={events.completed.length ? `${plural(events.completed.length, 'event')} · ${plural(events.completedGuests, 'guest')} served · ${period.toLowerCase()}` : period}
              >
                <EventList orders={events.completed.slice(0, 5)} eventName={eventName} empty="No accepted events took place in this period." />
              </Widget>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
