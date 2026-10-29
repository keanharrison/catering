import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { BadgeCheck, Clock3, ListChecks, TriangleAlert } from '../../components/icons'
import type { Tone } from '../../components/destinationIcons'
import { useDemoStore } from '../../state/store'
import { ANALYTICS_DAYS, dailyCounts, sampleCounts } from './analytics'
import { LineChart } from './LineChart'
import { filterLabel, matchesFilter, type RequestFilter } from './requestFilters'

const stats: Array<{ key: RequestFilter; icon: typeof ListChecks; tone: Tone }> = [
  { key: 'all', icon: ListChecks, tone: 'slate' },
  { key: 'review', icon: TriangleAlert, tone: 'indigo' },
  { key: 'awaiting', icon: Clock3, tone: 'sky' },
  { key: 'confirmed', icon: BadgeCheck, tone: 'teal' },
]

const dayLabel = (date: string) => format(parseISO(date), 'MMM d')

/** Admin > Analytics: counts taken from the requests made in this walkthrough. With none yet, the chart shows labeled sample data instead. */
export function AnalyticsPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)

  const real = useMemo(() => dailyCounts(orders, clock), [orders, clock])
  const hasRealData = real.some((point) => point.received > 0 || point.accepted > 0)
  const points = hasRealData ? real : sampleCounts(clock)
  const received = points.reduce((sum, point) => sum + point.received, 0)
  const caption = `Requests received and accepted per day, last ${ANALYTICS_DAYS} days${hasRealData ? '' : ' (sample data)'}`

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="analytics-title">
      <header className="mb-6">
        <h1 id="analytics-title" className="type-page-title">Analytics</h1>
        <p className="mt-1 text-body text-muted-foreground">Basic counts from the requests customers have submitted.</p>
      </header>

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Request totals">
        {stats.map(({ key, icon: Icon, tone }) => (
          <li key={key}>
            <Card className="h-full">
              <CardContent className="flex items-center gap-3 py-3">
                <span aria-hidden="true" data-icon-surface data-tone={tone} data-size="sm" className="floating-tile"><Icon /></span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-xl font-semibold leading-6 tabular-nums">{orders.filter((order) => matchesFilter(order, key)).length}</span>
                  <span className="text-ui leading-tight text-muted-foreground">{filterLabel[key]}</span>
                </span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <CardTitle className="text-base">Requests received</CardTitle>
              <p className="mt-1 text-hero font-normal leading-none tabular-nums text-muted-foreground">{received}</p>
              <CardDescription className="mt-1">Last {ANALYTICS_DAYS} days</CardDescription>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {!hasRealData && <Badge variant="outline">Sample data</Badge>}
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-ui" aria-label="Legend">
                <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-info" />Received</li>
                <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-success" />Accepted</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LineChart
            labels={points.map((point) => point.date)}
            formatLabel={dayLabel}
            caption={caption}
            series={[
              { id: 'received', label: 'Received', color: 'var(--info)', values: points.map((point) => point.received) },
              { id: 'accepted', label: 'Accepted', color: 'var(--success)', values: points.map((point) => point.accepted) },
            ]}
          />
          <p className="mt-3 text-ui text-muted-foreground">
            {hasRealData
              ? 'Counted from each request’s status history. Nothing here is estimated.'
              : 'No requests yet, so this chart shows made-up sample data to preview the view. Submit a request as a customer to see real counts.'}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
