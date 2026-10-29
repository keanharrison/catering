import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { FieldError } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'
import { catalog, type DietaryTag, type OrderLine } from '../../data'
import { dietaryOptions } from './dietary'
import type { IntakeForm } from './intake'
import {
  entreeOptions, parseBudgetAmount, parseGuests, proposeOrder, questionText, quickDates, supplyOptions,
  type AssistantState, type EntreePref, type SupplyPref,
} from './assistant'

const chip = 'flex min-h-11 cursor-pointer items-center rounded-full border border-input bg-background px-4 text-body transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px aria-checked:border-foreground aria-checked:bg-secondary md:min-h-10'
const unitLabel: Record<string, string> = { serving: 'servings', person: 'per person', each: 'each', set: 'sets', bottle: 'bottles' }

function Choices({ label, role = 'radiogroup', children }: { label: string; role?: 'radiogroup' | 'group'; children: ReactNode }) {
  return <div role={role} aria-label={label} className="flex flex-wrap gap-2">{children}</div>
}

type Props = {
  form: IntakeForm
  setField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void
  /** The earliest date the form accepts (yyyy-MM-dd). */
  earliest: string
  state: AssistantState
  onChange: (state: AssistantState) => void
  /** Hands the reviewed order to the form; false when the form still needs fixing first. */
  onUse: (lines: OrderLine[]) => boolean
  onClose: () => void
  className?: string
}

export function AssistantPanel({ form, setField, earliest, state, onChange, onUse, onClose, className }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const plan = state.plan ?? []
  const reviewing = state.index >= plan.length
  const question = reviewing ? null : plan[state.index]
  const lines = state.lines ?? []

  // Move focus to each new question, and to the review, so keyboard and screen-reader users follow along.
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [state.index, reviewing])

  function advance(patch: Partial<AssistantState> = {}) {
    const next = { ...state, ...patch, index: state.index + 1 }
    // Reaching the end builds the proposal from everything answered so far.
    onChange({ ...next, lines: next.index >= plan.length ? proposeOrder(form, next.entree, next.supplies) : state.lines })
    setText('')
    setError('')
  }

  function back() {
    onChange({ ...state, index: Math.max(0, state.index - 1) })
    setText('')
    setError('')
  }

  function startOver() {
    onChange({ ...state, index: 0, entree: '', supplies: '', lines: null })
    setBlocked(false)
  }

  function setUnits(itemId: string, units: number) {
    onChange({ ...state, lines: lines.map((line) => (line.itemId === itemId ? { ...line, units: Math.max(0, Math.min(5000, Math.floor(units) || 0)) } : line)) })
  }

  function answerGuests() {
    const guests = parseGuests(text)
    if (guests === null) return setError('Enter a number of guests, from 1 up to 5,000.')
    setField('guestCount', String(guests))
    advance()
  }

  function answerBudget() {
    const amount = parseBudgetAmount(text)
    if (amount === null) return setError('Enter a dollar amount, or skip this question.')
    setField('budget', String(amount))
    advance()
  }

  function answerDate(value: string) {
    if (!value || value < earliest) return setError('Choose today or a later date.')
    setField('eventDate', value)
    advance()
  }

  const toggleDietary = (tag: DietaryTag) => setField('dietary', form.dietary.includes(tag) ? form.dietary.filter((item) => item !== tag) : [...form.dietary, tag])

  return (
    <aside id="assistant-panel" aria-label="AI assistant" className={className}>
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">AI assistant</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>Switch to manual</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {question && (
            <>
              <Progress value={((state.index + 1) / plan.length) * 100} aria-label="Assistant progress">
                <span className="text-ui text-muted-foreground">Question {state.index + 1} of {plan.length}</span>
              </Progress>
              <h2 ref={heading} tabIndex={-1} className="text-heading font-medium outline-none">{questionText[question]}</h2>

              {question === 'eventType' && (
                <Choices label="Event type">
                  {catalog.eventTypes.map((type) => (
                    <button key={type.id} type="button" role="radio" aria-checked={form.eventType === type.id} className={chip} onClick={() => { setField('eventType', type.id); advance() }}>{type.label}</button>
                  ))}
                </Choices>
              )}

              {question === 'eventDate' && (
                <>
                  <Choices label="Quick dates">
                    {quickDates(earliest).map((option) => <button key={option.value} type="button" role="radio" aria-checked={form.eventDate === option.value} className={chip} onClick={() => answerDate(option.value)}>{option.label}</button>)}
                  </Choices>
                  <label className="grid gap-1 text-ui text-muted-foreground">Or pick a date
                    <Input type="date" min={earliest} value={text} onChange={(event) => { setText(event.target.value); setError('') }} className="h-10 text-foreground" />
                  </label>
                  <div><Button onClick={() => answerDate(text)}>Next</Button></div>
                </>
              )}

              {question === 'guests' && (
                <>
                  <Choices label="Common guest counts">
                    {[10, 25, 50, 100].map((count) => <button key={count} type="button" role="radio" aria-checked={form.guestCount === String(count)} className={chip} onClick={() => { setField('guestCount', String(count)); advance() }}>{count}</button>)}
                  </Choices>
                  <label className="grid gap-1 text-ui text-muted-foreground">Or type a number
                    <Input inputMode="numeric" autoComplete="off" value={text} onChange={(event) => { setText(event.target.value); setError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); answerGuests() } }} className="h-10 text-foreground" />
                  </label>
                  <div><Button onClick={answerGuests}>Next</Button></div>
                </>
              )}

              {question === 'fulfillment' && (
                <Choices label="Pickup or delivery">
                  {(['pickup', 'delivery'] as const).map((option) => (
                    <button key={option} type="button" role="radio" aria-checked={form.fulfillment === option} className={chip} onClick={() => { setField('fulfillment', option); advance() }}>{option === 'pickup' ? 'Pickup' : 'Delivery'}</button>
                  ))}
                </Choices>
              )}

              {question === 'dietary' && (
                <>
                  <Choices label="Dietary needs" role="group">
                    {dietaryOptions.map((option) => <button key={option.id} type="button" role="checkbox" aria-checked={form.dietary.includes(option.id)} className={chip} onClick={() => toggleDietary(option.id)}>{option.label}</button>)}
                  </Choices>
                  <div><Button onClick={() => advance()}>{form.dietary.length ? 'Next' : 'No dietary needs'}</Button></div>
                </>
              )}

              {question === 'budget' && (
                <>
                  <label className="grid gap-1 text-ui text-muted-foreground">Food budget in dollars
                    <Input inputMode="decimal" autoComplete="off" value={text} onChange={(event) => { setText(event.target.value); setError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); answerBudget() } }} className="h-10 text-foreground" />
                  </label>
                  <div className="flex gap-2"><Button onClick={answerBudget}>Next</Button><Button variant="ghost" onClick={() => advance()}>Skip</Button></div>
                </>
              )}

              {question === 'entree' && (
                <Choices label="Entree preference">
                  {entreeOptions.map((option) => <button key={option.id} type="button" role="radio" aria-checked={state.entree === option.id} className={chip} onClick={() => advance({ entree: option.id as EntreePref })}>{option.label}</button>)}
                </Choices>
              )}

              {question === 'supplies' && (
                <Choices label="Supplies">
                  {supplyOptions.map((option) => <button key={option.id} type="button" role="radio" aria-checked={state.supplies === option.id} className={chip} onClick={() => advance({ supplies: option.id as SupplyPref })}>{option.label}</button>)}
                </Choices>
              )}

              {error && <FieldError role="alert">{error}</FieldError>}
              {state.index > 0 && <div><Button variant="ghost" size="sm" onClick={back}>Back</Button></div>}
            </>
          )}

          {reviewing && (
            <>
              <h2 ref={heading} tabIndex={-1} className="text-heading font-medium outline-none">Suggested order</h2>
              {lines.length === 0 ? (
                <p className="text-ui text-muted-foreground">There’s nothing to suggest yet. Add a guest count to the form, then start over.</p>
              ) : (
                <>
                  <p className="text-ui text-muted-foreground">From Pearl Island’s menu. Change a quantity or remove an item; you can edit everything again on the next steps.</p>
                  <ul className="grid gap-2">
                    {lines.map((line) => {
                      const item = catalog.menu.find((entry) => entry.id === line.itemId)
                      if (!item) return null
                      return (
                        <li key={line.itemId} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 break-words">{item.name}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <Input type="number" min={0} max={5000} value={line.units} aria-label={`Quantity of ${item.name}`} onChange={(event) => setUnits(line.itemId, Number(event.target.value))} className="h-9 w-20 text-right tabular-nums" />
                            <span className="w-16 text-caption text-muted-foreground">{unitLabel[item.unit] ?? item.unit}</span>
                            <Button variant="ghost" size="sm" aria-label={`Remove ${item.name}`} onClick={() => onChange({ ...state, lines: lines.filter((entry) => entry.itemId !== line.itemId) })}>Remove</Button>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
              {blocked && <FieldError role="alert">Fill in the highlighted fields in the form first, then use this order.</FieldError>}
              <div className="flex flex-wrap gap-2">
                <Button disabled={!lines.some((line) => line.units > 0)} onClick={() => setBlocked(!onUse(lines.filter((line) => line.units > 0)))}>Use this order</Button>
                <Button variant="ghost" onClick={startOver}>Start over</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
