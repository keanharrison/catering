import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ChevronDownIcon } from '../../components/icons'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar } from '../../components/ui/calendar'
import { FieldError } from '../../components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { catalog } from '../../data'
import { useDemoStore } from '../../state/store'
import { ChatComposer } from './ChatComposer'
import { startingForm } from './EventPage'
import { loadIntakeFormDraft, saveIntakeFormDraft } from './intake'
import { stagePath } from './journey'
import {
  answerText, answersToFormPatch, dietaryOptions, emptyAnswers, fulfillmentOptions, planSteps, stepError,
  type PlanAnswers,
} from './planScript'
import { loadPlanAnswers, savePlanAnswers, savePlanningState } from './planning'

const chip = 'flex min-h-11 cursor-pointer items-center rounded-full border border-input bg-background px-4 text-body transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-foreground aria-checked:bg-secondary md:min-h-10'

function Assistant({ children }: { children: string }) {
  return <p className="max-w-[92%] text-body leading-[1.55] text-foreground [text-wrap:pretty]"><span className="sr-only">Assistant: </span>{children}</p>
}

function Customer({ children }: { children: string }) {
  return <p className="ml-auto max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-body text-foreground"><span className="sr-only">You: </span>{children}</p>
}

/** A guided chat that asks six fixed questions and carries the answers into the normal request form. Scripted, not a language model. */
export function PlanIntakePage() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const earliest = clock.slice(0, 10)
  const [answers, setAnswers] = useState<PlanAnswers>(() => loadPlanAnswers(session) ?? emptyAnswers())
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const [dateOpen, setDateOpen] = useState(false)
  const dock = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const finished = answers.step >= planSteps.length
  const current = finished ? null : planSteps[answers.step]
  const selectedDate = answers.eventDate ? parseISO(answers.eventDate) : undefined

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    end.current?.scrollIntoView?.({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
    if (first.current) { first.current = false; return }
    dock.current?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true })
  }, [answers.step])

  function commit(patch: Partial<PlanAnswers>) {
    if (!current) return
    const next = { ...answers, ...patch }
    const problem = stepError(current.id, next, earliest)
    if (problem) { setError(problem); return }
    const advanced = { ...next, step: answers.step + 1 }
    setAnswers(advanced)
    savePlanAnswers(session, advanced)
    setReply('')
    setError('')
  }

  function carryAnswersToForm(mode: 'assisted' | 'manual') {
    const patch = answersToFormPatch(answers)
    saveIntakeFormDraft(session, { ...loadIntakeFormDraft(session, startingForm(order)), ...patch })
    savePlanningState(session, { mode, prefilled: Object.keys(patch).length > 0 })
    navigate(stagePath('event'))
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.25rem)] w-full max-w-[760px] flex-col px-5 sm:px-8">
      <div className="flex items-center justify-between gap-3 pt-6">
        <h1 className="flex items-center gap-2 text-heading font-semibold tracking-[-0.01em] text-foreground">
          Plan with AI
          <Badge variant="secondary">Preview</Badge>
        </h1>
        <Button variant="ghost" onClick={() => carryAnswersToForm('manual')}>Switch to manual</Button>
      </div>

      <div role="log" aria-label="Conversation" aria-live="polite" className="flex-1 py-8">
        <ol className="grid gap-5">
          <li><Assistant>I’ll ask six quick questions, then fill in your request. You can change anything afterward.</Assistant></li>
          {planSteps.map((step, index) => index <= answers.step && (
            <li key={step.id} className="grid gap-3">
              <Assistant>{step.question}</Assistant>
              {index < answers.step && <Customer>{answerText(step.id, answers)}</Customer>}
            </li>
          ))}
          {finished && <li><Assistant>That’s everything. Your answers are in a draft request you can review and edit.</Assistant></li>}
        </ol>
        <div ref={end} />
      </div>

      <div ref={dock} className="sticky bottom-0 grid gap-2 bg-background pb-6 pt-3">
        {error && <FieldError role="alert" className="px-2">{error}</FieldError>}

        {current?.id === 'eventType' && (
          <div role="radiogroup" aria-label="Event type" className="flex flex-wrap gap-2">
            {catalog.eventTypes.map((type) => (
              <button key={type.id} type="button" role="radio" aria-checked={answers.eventType === type.id} className={chip} onClick={() => commit({ eventType: type.id })}>{type.label}</button>
            ))}
          </div>
        )}

        {current?.id === 'eventDate' && (
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger render={
              <Button type="button" variant="outline" className="h-11 w-full justify-between text-left text-body font-normal sm:w-72">
                Choose a date
                <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
            } />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { if (!date) return; setDateOpen(false); commit({ eventDate: format(date, 'yyyy-MM-dd') }) }}
                defaultMonth={selectedDate ?? parseISO(earliest)}
                disabled={{ before: parseISO(earliest) }}
              />
            </PopoverContent>
          </Popover>
        )}

        {current?.id === 'guests' && (
          <ChatComposer
            value={reply} onChange={setReply} onSubmit={() => commit({ guests: reply })}
            label="Number of guests" placeholder="Number of guests" hints={[]} attach={false} inputMode="numeric" sendLabel="Send guest count" autoFocus
          />
        )}

        {current?.id === 'fulfillment' && (
          <div role="radiogroup" aria-label="Pickup or delivery" className="flex flex-wrap gap-2">
            {fulfillmentOptions.map((option) => (
              <button key={option.id} type="button" role="radio" aria-checked={answers.fulfillment === option.id} className={chip} onClick={() => commit({ fulfillment: option.id })}>{option.label}</button>
            ))}
          </div>
        )}

        {current?.id === 'dietary' && (
          <>
            <div role="group" aria-label="Dietary needs" className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => {
                const on = answers.dietary.includes(option.id)
                return (
                  <button key={option.id} type="button" role="checkbox" aria-checked={on} className={chip} onClick={() => setAnswers({ ...answers, dietary: on ? answers.dietary.filter((tag) => tag !== option.id) : [...answers.dietary, option.id] })}>{option.label}</button>
                )
              })}
            </div>
            <div><Button onClick={() => commit({})}>{answers.dietary.length ? 'Done' : 'No dietary needs'}</Button></div>
          </>
        )}

        {current?.id === 'budget' && (
          <>
            <ChatComposer
              value={reply} onChange={setReply} onSubmit={() => commit({ budget: reply })}
              label="Budget in dollars" placeholder="Budget in dollars" hints={[]} attach={false} inputMode="decimal" sendLabel="Send budget" autoFocus
            />
            <div><Button variant="ghost" onClick={() => commit({ budget: '' })}>Skip</Button></div>
          </>
        )}

        {finished && <div><Button onClick={() => carryAnswersToForm('assisted')}>Review your request</Button></div>}
      </div>
    </div>
  )
}
