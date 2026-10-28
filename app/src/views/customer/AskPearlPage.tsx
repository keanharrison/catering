import { useDemoStore } from '../../state/store'
import { DashboardAssistant } from './DashboardAssistant'
import { summarizeDashboard } from './dashboardSummary'

export function AskPearlPage() {
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const summary = summarizeDashboard(orders, draftOrder, clock)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-8 md:min-h-[calc(100svh-5rem)]">
      <DashboardAssistant summary={summary} headingLevel={1} className="flex-1" />
    </div>
  )
}
