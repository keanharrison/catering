import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AssistantOrb } from '../../components/AssistantOrb'
import { ArrowUp } from '../../components/icons'
import { useDemoStore } from '../../state/store'
import { summarizeDashboard, suggestedPrompts } from './dashboardSummary'
import { useAssistant } from './useAssistant'

const MAX_QUESTION_LENGTH = 300

function Composer({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }
  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-3 rounded-full bg-background p-2 pl-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1px_var(--border)] transition-shadow duration-150 focus-within:shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1.5px_var(--foreground)]"
    >
      <AssistantOrb size={30} />
      <label htmlFor="chat-input" className="sr-only">Ask a question</label>
      <input
        id="chat-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_QUESTION_LENGTH}
        autoComplete="off"
        placeholder="Ask about your requests…"
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label="Send question"
        disabled={!value.trim()}
        data-icon-surface
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c3c3c3] disabled:hover:bg-[#c3c3c3] md:size-10"
      >
        <ArrowUp aria-hidden="true" />
      </button>
    </form>
  )
}

/** The whole page is the conversation: a centered headline, composer and suggestions, then a thread with the composer pinned below. */
export function ChatPage() {
  const orders = useDemoStore((state) => state.orders)
  const draftOrder = useDemoStore((state) => state.draftOrder)
  const clock = useDemoStore((state) => state.clock)
  const summary = summarizeDashboard(orders, draftOrder, clock)
  const { turns, ask } = useAssistant(summary)
  const [value, setValue] = useState('')
  const end = useRef<HTMLDivElement>(null)

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
          <Composer value={value} onChange={setValue} onSubmit={() => send(value)} />
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
              <div className="flex max-w-[92%] gap-3">
                <span className="mt-0.5"><AssistantOrb size={24} /></span>
                <div className="text-[15px] leading-[1.5] text-foreground">
                  <p className="whitespace-pre-line [text-wrap:pretty]"><span className="sr-only">Assistant: </span>{turn.answer.text}</p>
                  {turn.answer.href && (
                    <Link to={turn.answer.href} className="mt-2 inline-block text-[14px] underline underline-offset-4">{turn.answer.linkLabel}</Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 bg-background pb-6 pt-3">
        <Composer value={value} onChange={setValue} onSubmit={() => send(value)} />
      </div>
    </div>
  )
}
