import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/cx'
import { routes } from '../../routes'
import { Send } from '../../components/icons'
import { answerQuestion, suggestedQuestions, type Answer, type DashboardSummary } from './dashboardSummary'

type Turn = { id: number; question: string; answer: Answer }

const MAX_QUESTION_LENGTH = 300

export function DashboardAssistant({ summary, headingLevel = 2, className, showFullPageLink = false }: {
  summary: DashboardSummary
  headingLevel?: 1 | 2
  className?: string
  showFullPageLink?: boolean
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const [turns, setTurns] = useState<Turn[]>([])
  const [value, setValue] = useState('')
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns.length])

  function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    setTurns((current) => [...current, { id: current.length, question: trimmed, answer: answerQuestion(trimmed, summary) }])
    setValue('')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    ask(value)
  }

  return (
    <section aria-labelledby="assistant-title" className={cx('flex min-h-[32rem] flex-col rounded-2xl border border-border bg-background p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <Heading id="assistant-title" className="text-[16px] font-normal tracking-[0.01em] text-foreground">Ask Pearl</Heading>
        {showFullPageLink && <Link to={routes.askPearl} className="text-[14px] text-foreground underline underline-offset-4">Open full page</Link>}
      </div>
      <p className="mt-1 text-[14px] text-muted-foreground">Ask about your requests, drafts, and messages.</p>

      <div ref={log} role="log" aria-label="Conversation" aria-live="polite" className="mt-5 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {turns.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                className="min-h-9 rounded-full bg-background px-4 text-left text-[14px] text-foreground shadow-[inset_0_0_0_1px_var(--input)] transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          <ol className="grid gap-5">
            {turns.map((turn) => (
              <li key={turn.id} className="grid gap-3">
                <p className="ml-auto max-w-[85%] rounded-2xl bg-secondary px-4 py-2 text-[14px] text-foreground">
                  <span className="sr-only">You: </span>{turn.question}
                </p>
                <div className="max-w-[92%] text-[14px] leading-[1.45] text-foreground">
                  <p className="whitespace-pre-line [text-wrap:pretty]"><span className="sr-only">Assistant: </span>{turn.answer.text}</p>
                  {turn.answer.href && (
                    <Link to={turn.answer.href} className="mt-2 inline-block text-[14px] underline underline-offset-4">{turn.answer.linkLabel}</Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form onSubmit={submit} className="mt-5 flex items-center gap-2 rounded-full bg-background p-1 pl-5 shadow-[inset_0_0_0_1px_var(--input)] transition-shadow duration-150 focus-within:shadow-[inset_0_0_0_2px_var(--ring)]">
        <label htmlFor="assistant-input" className="sr-only">Ask a question</label>
        <input
          id="assistant-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={MAX_QUESTION_LENGTH}
          autoComplete="off"
          placeholder="Ask a question"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={!value.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}
