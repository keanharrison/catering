import { Link } from 'react-router-dom'
import { ChevronRight } from '../../components/icons'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { DashboardAssistant } from './DashboardAssistant'
import { shortDate, summarizeDashboard } from './dashboardSummary'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function Tile({ title, to, headline, detail }: { title: string; to: string; headline: string; detail?: string }) {
  return (
    <Link
      to={to}
      className="group flex min-h-40 flex-col justify-between rounded-2xl bg-secondary p-6 no-underline transition-[background-color,box-shadow] duration-150 hover:bg-card hover:shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-normal tracking-[0.01em] text-foreground">{title}</h2>
        <ChevronRight aria-hidden="true" className="mt-0.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
      <span className="grid gap-1">
        <span className="text-[14px] tabular-nums text-[#44403b]">{headline}</span>
        {detail && <span className="text-[13px] text-muted-foreground">{detail}</span>}
      </span>
    </Link>
  )
}

export function DashboardPage() {
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const summary = summarizeDashboard(orders, draftOrder, clock)

  return (
    <section aria-labelledby="dashboard-title" className="mx-auto w-full max-w-[1306px] px-5 py-6 sm:px-8 sm:py-8">
      <h1 id="dashboard-title" className="sr-only">Dashboard</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4 min-[560px]:grid-cols-2 xl:grid-rows-2">
          <Tile
            title="Past"
            to={routes.pastOrders}
            headline={summary.past.length ? plural(summary.past.length, 'past request') : 'No past requests yet'}
          />
          <Tile
            title="Active"
            to={routes.currentOrders}
            headline={summary.active.length ? plural(summary.active.length, 'active request') : 'No active requests'}
            detail={summary.needsAction.length
              ? `${plural(summary.needsAction.length, 'request')} waiting on your reply`
              : summary.nextEvent ? `Next event ${shortDate(summary.nextEvent.intent.eventAt)}` : undefined}
          />
          <Tile
            title="Drafts"
            to={routes.customer}
            headline={summary.drafts ? '1 draft in progress' : 'No drafts in progress'}
            detail={summary.drafts ? 'Continue where you left off' : 'Start one from New request'}
          />
          <Tile
            title="Messages"
            to={routes.customerMessages}
            headline={summary.threads.length ? plural(summary.threads.length, 'conversation') : 'No messages yet'}
          />
        </div>
        <DashboardAssistant summary={summary} showFullPageLink />
      </div>
    </section>
  )
}
