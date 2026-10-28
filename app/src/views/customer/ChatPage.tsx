import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../state/store'
import { summarizeDashboard, suggestedPrompts } from './dashboardSummary'
import { ChatComposer } from './ChatComposer'
import { useAssistant } from './useAssistant'

/** The whole page is the conversation: a centered headline, composer and suggestions, then a thread with the composer pinned below. */
export function ChatPage() {
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const summary = summarizeDashboard(orders, draftOrder, clock)
  const { turns, ask } = useAssistant(summary)
  const [value, setValue] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const incoming = (location.state as { question?: string } | null)?.question
  const handedOver = useRef(false)

  // A question typed on the Dashboard arrives here and is answered once.
  useEffect(() => {
    if (!incoming || handedOver.current) return
    handedOver.current = true
    ask(incoming)
    navigate(location.pathname, { replace: true, state: null })
  }, [incoming, ask, navigate, location.pathname])

  useEffect(() => {
    if (turns.length === 0) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    end.current?.scrollIntoView?.({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [turns.length])

  function send(question: string) {
    ask(question)
    setValue('')
  }

  if (turns.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-3.25rem)] w-full max-w-[900px] flex-col px-5 pb-12 pt-[14vh] sm:px-8">
        <h1 className="text-balance text-center text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">What can I help you with?</h1>
        <div className="mx-auto mt-8 w-full max-w-[760px]">
          <ChatComposer value={value} onChange={setValue} onSubmit={() => send(value)} />
        </div>
        <section aria-labelledby="chat-suggestions" className="mt-16">
          <h2 id="chat-suggestions" className="mb-3 px-1 text-[14px] font-normal text-muted-foreground">Suggestions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.question}
                type="button"
                onClick={() => send(prompt.question)}
                aria-label={prompt.question}
                className="rounded-xl border border-border bg-background px-5 py-4 text-left transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block text-[15px] text-foreground">{prompt.title}</span>
                <span className="mt-1 block text-[14px] leading-[1.4] text-muted-foreground">{prompt.description}</span>
              </button>
            ))}
          </div>
        </section>
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
              <p className="ml-auto max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-[15px] text-foreground">
                <span className="sr-only">You: </span>{turn.question}
              </p>
              <div className="max-w-[92%] text-[15px] leading-[1.5] text-foreground">
                <p className="whitespace-pre-line [text-wrap:pretty]"><span className="sr-only">Assistant: </span>{turn.answer.text}</p>
                {turn.answer.href && (
                  <Link to={turn.answer.href} className="mt-2 inline-block text-[14px] underline underline-offset-4">{turn.answer.linkLabel}</Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 bg-background pb-6 pt-3">
        <ChatComposer value={value} onChange={setValue} onSubmit={() => send(value)} />
      </div>
    </div>
  )
}
