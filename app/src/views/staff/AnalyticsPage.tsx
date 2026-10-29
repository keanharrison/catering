import { useMemo, type ComponentType, type SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { BadgeCheck, Clock3, TriangleAlert } from '../../components/icons'
import type { Tone } from '../../components/destinationIcons'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { ANALYTICS_DAYS, actionSummary, dailyCounts, sampleCounts } from './analytics'
import { LineChart } from './LineChart'

const dayLabel = (date: string) => format(parseISO(date), 'MMM d')

function ActionCard({ icon: Icon, tone, count, label, detail }: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone: Tone
  count: number
  label: string
  detail: string
}) {
  return (
    <li>
      <Link to={routes.staff} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors duration-150 hover:bg-muted/40">
          <CardContent className="flex items-start gap-3 py-3">
            <span aria-hidden="true" data-icon-surface data-tone={tone} data-size="sm" className="floating-tile"><Icon /></span>
            <span className="flex min-w-0 flex-col">
              <span className="text-ui text-muted-foreground">{label}</span>
              <span className="text-xl font-semibold leading-7 tabular-nums">{count}</span>
              <span className="text-ui leading-tight text-muted-foreground">{detail}</span>
            </span>
          </CardContent>
        </Card>
      </Link>
    </li>
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** Admin > Analytics: what needs action today, then requests over time. Everything is counted from requests in this walkthrough; with none yet, the chart shows labeled sample data. */
export function AnalyticsPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)

  const real = useMemo(() => dailyCounts(orders, clock), [orders, clock])
  const action = useMemo(() => actionSummary(orders, clock), [orders, clock])
  const hasRealData = real.some((point) => point.received > 0 || point.accepted > 0)
  const points = hasRealData ? real : sampleCounts(clock)
  const received = points.reduce((sum, point) => sum + point.received, 0)
  const caption = `Requests received and accepted per day, last ${ANALYTICS_DAYS} days${hasRealData ? '' : ' (sample data)'}`

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="analytics-title">
      <header className="mb-6">
        <h1 id="analytics-title" className="type-page-title">Analytics</h1>
        <p className="mt-1 text-body text-muted-foreground">What needs attention today, and how requests are arriving.</p>
      </header>

      <h2 className="sr-only">Needs attention</h2>
      <ul className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Needs attention">
        <ActionCard
          icon={TriangleAlert} tone="indigo" label="Needs review" count={action.needsReview}
          detail={action.oldestWaitingDays === null ? 'Nothing waiting' : action.oldestWaitingDays === 0 ? 'Oldest arrived today' : `Oldest waiting ${plural(action.oldestWaitingDays, 'day')}`}
        />
        <ActionCard
          icon={Clock3} tone="sky" label="Awaiting customer" count={action.awaitingCustomer}
          detail={action.awaitingCustomer ? 'Proposed changes need a reply' : 'No replies pending'}
        />
        <ActionCard
          icon={BadgeCheck} tone="teal" label="Accepted events, next 7 days" count={action.upcoming}
          detail={action.nextEventAt ? `Next: ${format(parseISO(action.nextEventAt), 'EEE, MMM d')}` : 'None scheduled'}
        />
      </ul>

      {!hasRealData && (
        <Alert className="mb-4 px-4 py-3">
          <AlertTitle>Sample data</AlertTitle>
          <AlertDescription>The chart below uses made-up numbers because no requests have been submitted yet. The counts above are real.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <CardTitle className="text-base">Requests received</CardTitle>
              <p className="mt-1 text-hero font-normal leading-none tabular-nums text-muted-foreground">{received}</p>
              <CardDescription className="mt-1">Last {ANALYTICS_DAYS} days{hasRealData ? '' : ' · sample'}</CardDescription>
            </div>
            <div>
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
            {hasRealData ? 'Counted from each request’s status history. Nothing here is estimated.' : 'Submit a request as a customer to replace the sample with real counts.'}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
