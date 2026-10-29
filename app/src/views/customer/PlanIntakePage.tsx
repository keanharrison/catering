import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ChevronDownIcon } from '../../components/icons'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar } from '../../components/ui/calendar'
import { Card } from '../../components/ui/card'
import { Field, FieldError, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Progress } from '../../components/ui/progress'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/cn'
import { catalog } from '../../data'
import { useDemoStore } from '../../state/store'
import { blankBasics } from './EventPage'
import { intentToForm, loadIntakeFormDraft, saveIntakeFormDraft } from './intake'
import { stagePath } from './journey'
import {
  PREFERENCES_LIMIT, answersToFormPatch, dietaryOptions, emptyAnswers, fulfillmentOptions, mealSizeOptions,
  planSteps, stepError, type PlanAnswers,
} from './planScript'
import { loadPlanAnswers, savePlanAnswers, savePlanningState } from './planning'

const chip = 'flex min-h-11 cursor-pointer items-center rounded-full border border-input bg-background px-4 text-body transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-foreground aria-checked:bg-secondary md:min-h-10'

function Chips({ label, role, children }: { label: string; role: 'radiogroup' | 'group'; children: ReactNode }) {
  return <div role={role} aria-label={label} className="flex flex-wrap gap-2">{children}</div>
}

export function PlanIntakePage() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const today = format(new Date(), 'yyyy-MM-dd')
  const earliest = clock.slice(0, 10)
  const [answers, setAnswers] = useState<PlanAnswers>(() => loadPlanAnswers(session) ?? emptyAnswers(today))
  const [error, setError] = useState('')
  const [dateOpen, setDateOpen] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  const step = planSteps[answers.step]
  const selectedDate = answers.eventDate ? parseISO(answers.eventDate) : undefined

  useEffect(() => {
    if (first.current) { first.current = false; return }
    heading.current?.focus({ preventScroll: true })
  }, [answers.step])

  function update(patch: Partial<PlanAnswers>) {
    const next = { ...answers, ...patch }
    setAnswers(next)
    savePlanAnswers(session, next)
    if (error) setError('')
  }

  function carryAnswersToForm(next: PlanAnswers, menuPending: boolean) {
    const base = loadIntakeFormDraft(session, { ...intentToForm(order.intent), ...blankBasics() })
    const patch = answersToFormPatch(next)
    saveIntakeFormDraft(session, { ...base, ...patch })
    savePlanningState(session, { mode: menuPending ? 'assisted' : 'manual', prefilled: Object.keys(patch).length > 0, menuPending })
    navigate(stagePath('event'))
  }

  function next() {
    const problem = stepError(step.id, answers, earliest)
    if (problem) { setError(problem); return }
    if (answers.step < planSteps.length - 1) update({ step: answers.step + 1 })
    else carryAnswersToForm(answers, true)
  }

  const isLast = answers.step === planSteps.length - 1

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-ui text-muted-foreground">
          Question {answers.step + 1} of {planSteps.length}
          <Badge variant="secondary">Preview</Badge>
        </span>
        <Button variant="ghost" onClick={() => carryAnswersToForm(answers, false)}>Switch to manual</Button>
      </div>
      <Progress value={((answers.step + 1) / planSteps.length) * 100} aria-label="Planning progress" className="mb-6" />

      <Card className="p-5 sm:p-6">
        <h1 ref={heading} tabIndex={-1} className="type-page-title outline-none">{step.title}</h1>
        <p className="mt-1 text-ui text-muted-foreground">{step.help}</p>

        <div className="mt-6 grid gap-5">
          {step.id === 'eventType' && (
            <Chips label="Event type" role="radiogroup">
              {catalog.eventTypes.map((type) => (
                <button key={type.id} type="button" role="radio" aria-checked={answers.eventType === type.id} className={chip} onClick={() => update({ eventType: type.id })}>{type.label}</button>
              ))}
            </Chips>
          )}

          {step.id === 'guests' && (
            <Field data-invalid={Boolean(error) || undefined}>
              <FieldLabel htmlFor="plan-guests">Number of guests</FieldLabel>
              <Input id="plan-guests" inputMode="numeric" autoComplete="off" className="h-11" value={answers.guests} aria-invalid={Boolean(error)} onChange={(event) => update({ guests: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); next() } }} />
            </Field>
          )}

          {step.id === 'when' && (
            <>
              <Field>
                <FieldLabel htmlFor="plan-date">Date</FieldLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger render={
                    <Button id="plan-date" type="button" variant="outline" className="h-11 w-full justify-between text-left text-body font-normal">
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Please select</span>}
                      <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => { if (!date) return; update({ eventDate: format(date, 'yyyy-MM-dd') }); setDateOpen(false) }}
                      defaultMonth={selectedDate ?? parseISO(earliest)}
                      disabled={{ before: parseISO(earliest) }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <FieldLabel>Pickup or delivery</FieldLabel>
                <Chips label="Pickup or delivery" role="radiogroup">
                  {fulfillmentOptions.map((option) => (
                    <button key={option.id} type="button" role="radio" aria-checked={answers.fulfillment === option.id} className={chip} onClick={() => update({ fulfillment: option.id })}>{option.label}</button>
                  ))}
                </Chips>
              </Field>
            </>
          )}

          {step.id === 'dietary' && (
            <Chips label="Dietary needs" role="group">
              {dietaryOptions.map((option) => {
                const on = answers.dietary.includes(option.id)
                return (
                  <button key={option.id} type="button" role="checkbox" aria-checked={on} className={chip} onClick={() => update({ dietary: on ? answers.dietary.filter((tag) => tag !== option.id) : [...answers.dietary, option.id] })}>{option.label}</button>
                )
              })}
            </Chips>
          )}

          {step.id === 'extras' && (
            <>
              <Field>
                <FieldLabel>Meal size</FieldLabel>
                <Chips label="Meal size" role="radiogroup">
                  {mealSizeOptions.map((option) => (
                    <button key={option.id} type="button" role="radio" aria-checked={answers.mealSize === option.id} className={chip} onClick={() => update({ mealSize: answers.mealSize === option.id ? '' : option.id })}>{option.label}</button>
                  ))}
                </Chips>
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-preferences">Food preferences or allergies (optional)</FieldLabel>
                <Textarea id="plan-preferences" rows={3} maxLength={PREFERENCES_LIMIT} value={answers.preferences} onChange={(event) => update({ preferences: event.target.value })} />
              </Field>
            </>
          )}

          {error && <FieldError role="alert">{error}</FieldError>}
        </div>

        <div className={cn('mt-8 flex items-center gap-2', answers.step > 0 ? 'justify-between' : 'justify-end')}>
          {answers.step > 0 && <Button variant="outline" onClick={() => update({ step: answers.step - 1 })}>Back</Button>}
          <div className="flex gap-2">
            {step.optional && <Button variant="ghost" onClick={() => { if (isLast) carryAnswersToForm(answers, true); else update({ step: answers.step + 1 }) }}>Skip</Button>}
            <Button onClick={next}>{isLast ? 'Fill in my request' : 'Next'}</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

