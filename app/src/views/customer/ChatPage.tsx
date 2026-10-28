import { useEffect, useMemo, useRef, useState, type ComponentType, type SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { destinationIcons } from '../../components/destinationIcons'
import { deriveNotifications } from '../../lib/notifications'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { plural, shortDate, summarizeDashboard, suggestedPrompts } from './dashboardSummary'
import { ChatComposer } from './ChatComposer'
import { useAssistant } from './useAssistant'

const cardClass = 'rounded-xl border border-border bg-background px-4 py-3 text-left no-underline transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Shortcut({ title, to, status, icon: Icon, attention = false }: { title: string; to: string; status: string; icon: ComponentType<SVGProps<SVGSVGElement>>; attention?: boolean }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span data-icon-surface className="floating-tile transition-colors duration-150 group-hover:bg-secondary">
        <Icon aria-hidden="true" style={{ width: 20, height: 20 }} />
      </span>
      <span className="text-ui font-medium text-foreground">{title}</span>
      <span className={attention ? 'text-ui leading-[1.3] text-warning' : 'text-ui leading-[1.3] text-muted-foreground'}>{status}</span>
    </Link>
  )
}

/** The whole page is the conversation. Empty, it is also home: headline, composer, where each part of the account stands, suggestions, and recent updates. */
export function ChatPage() {
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const summary = useMemo(() => summarizeDashboard(orders, draftOrder, clock), [orders, draftOrder, clock])
  const recent = useMemo(() => deriveNotifications(orders, 'customer', 4), [orders])
  const { turns, ask } = useAssistant(summary)
  const [value, setValue] = useState('')
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (turns.length === 0) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    end.current?.scrollIntoView?.({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [turns.length])

  function send(question: string, attachments: string[] = []) {
    ask(question, attachments)
    setValue('')
  }

  if (turns.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-3.25rem)] w-full max-w-[800px] flex-col px-5 pb-16 pt-[12vh] sm:px-8">
        <h1 className="text-balance text-center text-hero font-normal leading-[1.1] tracking-[-0.02em] text-foreground">What can I help you with?</h1>
        <div className="mx-auto mt-8 w-full max-w-[640px]">
          <ChatComposer value={value} onChange={setValue} onSubmit={(files) => send(value, files)} autoFocus />
        </div>

        <nav aria-label="Your account" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          <Shortcut title="Past orders" to={routes.pastOrders} icon={destinationIcons.pastOrders} status={summary.past.length ? plural(summary.past.length, 'past request') : 'No past requests yet'} />
          <Shortcut
            title="Current orders"
            to={routes.currentOrders}
            icon={destinationIcons.currentOrders}
            attention={summary.needsAction.length > 0}
            status={summary.needsAction.length
              ? `${plural(summary.needsAction.length, 'request')} waiting on your reply`
              : summary.active.length
                ? `${plural(summary.active.length, 'active request')}${summary.nextEvent ? `, next ${shortDate(summary.nextEvent.intent.eventAt)}` : ''}`
                : 'No active requests'}
          />
          <Shortcut title="Drafts" to={routes.customer} icon={destinationIcons.drafts} status={summary.drafts ? '1 draft in progress' : 'No drafts in progress'} />
          <Shortcut title="Messages" to={routes.customerMessages} icon={destinationIcons.messages} status={summary.threads.length ? plural(summary.threads.length, 'conversation') : 'No messages yet'} />
        </nav>

        <section aria-labelledby="chat-suggestions" className="mt-14">
          <h2 id="chat-suggestions" className="mb-2 px-1 text-ui font-normal text-muted-foreground">Suggestions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt.question} type="button" onClick={() => send(prompt.question)} aria-label={prompt.question} className={cardClass}>
                <span className="block text-body font-medium text-foreground">{prompt.title}</span>
                <span className="mt-0.5 block text-ui text-muted-foreground">{prompt.description}</span>
              </button>
            ))}
            <Link to={routes.customer} className={cardClass}>
              <span className="block text-body font-medium text-foreground">Start a catering request</span>
              <span className="mt-0.5 block text-ui text-muted-foreground">Plan an event with guests, a menu and supplies.</span>
            </Link>
          </div>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="chat-recent" className="mt-10">
            <h2 id="chat-recent" className="mb-2 px-1 text-ui font-normal text-muted-foreground">Recent</h2>
            <ul className="grid gap-2">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className={`${cardClass} flex items-center justify-between gap-4 text-body text-foreground`}>
                    <span>{item.title}</span>
                    <span className="shrink-0 text-ui text-muted-foreground">{shortDate(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.25rem)] w-full max-w-[760px] flex-col px-5 sm:px-8">
      <h1 className="sr-only">Chat</h1>
      <div role="log" aria-label="Conversation" aria-live="polite" className="flex-1 py-8">
        <ol className="grid gap-8">
          {turns.map((turn) => (
            <li key={turn.id} className="grid gap-4">
              <p className="ml-auto max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-body text-foreground">
                <span className="sr-only">You: </span>{turn.question}
                {turn.attachments.length > 0 && <span className="mt-1 block text-ui text-muted-foreground">Attached: {turn.attachments.join(', ')}</span>}
              </p>
              <div className="max-w-[92%] text-body leading-[1.55] text-foreground">
                <p className="whitespace-pre-line [text-wrap:pretty]"><span className="sr-only">Assistant: </span>{turn.answer.text}</p>
                {turn.answer.href && (
                  <Link to={turn.answer.href} className="mt-2 inline-block text-body underline underline-offset-4">{turn.answer.linkLabel}</Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 bg-background pb-6 pt-3">
        <ChatComposer value={value} onChange={setValue} onSubmit={(files) => send(value, files)} autoFocus />
      </div>
    </div>
  )
}
