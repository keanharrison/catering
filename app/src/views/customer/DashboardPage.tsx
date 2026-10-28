import { useState, type ComponentType, type SVGProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Edit05, History, MessageSquare, PackageCheck } from '../../components/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { deriveNotifications } from '../../lib/notifications'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { ChatComposer } from './ChatComposer'
import { shortDate, summarizeDashboard } from './dashboardSummary'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function Shortcut({ title, to, status, icon: Icon }: { title: string; to: string; status: string; icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span data-icon-surface className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors duration-150 group-hover:bg-secondary">
        <Icon aria-hidden="true" style={{ width: 20, height: 20 }} />
      </span>
      <span className="text-[14px] text-foreground">{title}</span>
      <span className="text-[13px] leading-[1.3] text-muted-foreground">{status}</span>
    </Link>
  )
}

const quickstarts = [
  { title: 'Start a catering request', description: 'Plan an event with guests, a menu and supplies.', to: routes.customer },
  { title: 'Ask a question', description: 'Check on a request, a draft or a message.', to: routes.askPearl },
]

/** Home: the same composition as Chat (headline, composer), then shortcuts to each part of the account and what happened lately. */
export function DashboardPage() {
  const navigate = useNavigate()
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const [value, setValue] = useState('')
  const summary = summarizeDashboard(orders, draftOrder, clock)
  const recent = deriveNotifications(orders, 'customer', 5)

  function ask() {
    const question = value.trim()
    if (question) navigate(routes.askPearl, { state: { question } })
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col px-5 pb-12 pt-[10vh] sm:px-8">
      <h1 className="text-balance text-center text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">What can I help you with?</h1>
      <div className="mx-auto mt-8 w-full max-w-[760px]">
        <ChatComposer value={value} onChange={setValue} onSubmit={ask} />
      </div>

      <nav aria-label="Your account" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        <Shortcut title="Past" to={routes.pastOrders} icon={History} status={summary.past.length ? plural(summary.past.length, 'past request') : 'No past requests yet'} />
        <Shortcut
          title="Active"
          to={routes.currentOrders}
          icon={PackageCheck}
          status={summary.needsAction.length
            ? `${plural(summary.needsAction.length, 'request')} waiting on your reply`
            : summary.active.length
              ? `${plural(summary.active.length, 'active request')}${summary.nextEvent ? `, next ${shortDate(summary.nextEvent.intent.eventAt)}` : ''}`
              : 'No active requests'}
        />
        <Shortcut title="Drafts" to={routes.customer} icon={Edit05} status={summary.drafts ? '1 draft in progress' : 'No drafts in progress'} />
        <Shortcut title="Messages" to={routes.customerMessages} icon={MessageSquare} status={summary.threads.length ? plural(summary.threads.length, 'conversation') : 'No messages yet'} />
      </nav>

      <Tabs defaultValue="recent" className="mt-14">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="quickstarts">Quickstarts</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="pt-4">
          {recent.length === 0 ? (
            <p className="rounded-xl border border-border px-5 py-4 text-[14px] text-muted-foreground">Nothing yet. Updates from the team on your requests appear here.</p>
          ) : (
            <ul className="grid gap-2">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 text-[14px] text-foreground no-underline transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span>{item.title}</span>
                    <span className="shrink-0 text-[13px] text-muted-foreground">{shortDate(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="quickstarts" className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickstarts.map((item) => (
              <Link key={item.title} to={item.to} className="rounded-xl border border-border px-5 py-4 no-underline transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="block text-[15px] text-foreground">{item.title}</span>
                <span className="mt-1 block text-[14px] leading-[1.4] text-muted-foreground">{item.description}</span>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
