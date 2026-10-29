import { useMemo, type ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Separator } from '../../components/ui/separator'
import { catalog } from '../../data'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { useDemoStore } from '../../state/store'
import { ANALYTICS_DAYS, acceptedEvents, dailyCounts, eventTypeMix, fulfillmentMix, menuDemand } from './analytics'
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

const none = (text: string) => <p className="text-ui text-muted-foreground">{text}</p>

/** Admin > Analytics: patterns across the requests customers have submitted. Everything is counted from request records; with none yet, the page says so. */
export function AnalyticsPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)

  const daily = useMemo(() => dailyCounts(orders, clock), [orders, clock])
  const types = useMemo(() => eventTypeMix(orders), [orders])
  const fulfillment = useMemo(() => fulfillmentMix(orders), [orders])
  const demand = useMemo(() => menuDemand(orders), [orders])
  const events = useMemo(() => acceptedEvents(orders, clock), [orders, clock])
  const received = daily.reduce((sum, point) => sum + point.received, 0)
  const caption = `Requests received and accepted per day, last ${ANALYTICS_DAYS} days`

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="analytics-title">
      <header className="mb-6">
        <h1 id="analytics-title" className="type-page-title">Analytics</h1>
        <p className="mt-1 text-body text-muted-foreground">Patterns across the requests customers have submitted.</p>
      </header>

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
                  <CardDescription className="mt-1">Last {ANALYTICS_DAYS} days</CardDescription>
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
            <Widget title="Event types" description={`Across ${plural(orders.length, 'request')}`}>
              <Bars rows={types} total={orders.length} color="var(--tile-indigo)" />
            </Widget>

            <Widget title="Pickup or delivery" description={`Across ${plural(orders.length, 'request')}`}>
              <Bars rows={fulfillment} total={orders.length} color="var(--tile-sky)" />
            </Widget>

            <Widget title="Menu demand" description="Most-requested food and drink, by quantity. Each item counts in its own unit.">
              {demand.length ? <Bars rows={demand} color="var(--tile-teal)" /> : none('No menu items have been requested yet.')}
            </Widget>

            <Widget
              title="Accepted events"
              description={events.upcoming.length ? `${plural(events.upcoming.length, 'upcoming event')} · ${plural(events.upcomingGuests, 'guest')}` : 'Nothing upcoming'}
            >
              {events.upcoming.length ? (
                <ul className="grid gap-2">
                  {events.upcoming.slice(0, 5).map((order) => (
                    <li key={order.id} className="flex items-baseline justify-between gap-3 text-ui">
                      <span className="min-w-0 truncate">
                        <span className="text-foreground">{format(parseISO(order.intent.eventAt), 'EEE, MMM d')}</span>
                        <span className="text-muted-foreground"> · {catalog.eventTypes.find((type) => type.id === order.intent.eventType)?.label ?? order.intent.eventType}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{order.intent.guestCount ?? '—'} guests</span>
                    </li>
                  ))}
                </ul>
              ) : none('No accepted events are coming up.')}
              <Separator className="my-4" />
              <p className="text-ui text-muted-foreground">
                Completed: {plural(events.completed, 'event')}{events.completed ? ` · ${plural(events.completedGuests, 'guest')} served` : ''}
              </p>
            </Widget>
          </div>
        </div>
      )}
    </section>
  )
}
