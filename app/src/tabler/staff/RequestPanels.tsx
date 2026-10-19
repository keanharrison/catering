import { useEffect, useRef, useState } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { catalog, MAX_MESSAGE_LENGTH, type OrderLine } from '../../data'
import { estimate, MAX_QUANTITY } from '../../engine'
import { formatMoney } from '../../lib/format'

// Tabler versions of the staff clarification and revision panels. Behavior matches
// views/staff/AskCustomerPanel.tsx and EditRequestPanel.tsx; saving still goes through the store actions.

function usePanelFocus() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: false })
  }, [])
  return ref
}

export function AskPanel({ onSave, onCancel, error }: { onSave: (text: string) => void; onCancel: () => void; error: string | null }) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const ref = usePanelFocus()
  return (
    <div className="card" ref={ref} tabIndex={-1} role="group" aria-labelledby="ask-panel-title">
      <div className="card-header">
        <div>
          <h3 className="card-title" id="ask-panel-title">Ask for clarification</h3>
          <div className="card-subtitle">Draft a question about this request. This demo records it locally; it does not send a message.</div>
        </div>
      </div>
      <div className="card-body">
        <label className="form-label" htmlFor="customer-question">Question for the customer</label>
        <textarea
          id="customer-question"
          className={`form-control${error ? ' is-invalid' : ''}`}
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH}
          aria-describedby={`customer-question-hint customer-question-count${error ? ' customer-question-error' : ''}`}
          aria-invalid={Boolean(error)}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="form-hint mt-1" id="customer-question-hint">
          Enter the clarification request that should be recorded. Up to {MAX_MESSAGE_LENGTH} characters.
        </div>
        <div className="form-hint" id="customer-question-count" aria-live="polite">
          {text.length}/{MAX_MESSAGE_LENGTH} characters
        </div>
        {error && <div className="invalid-feedback d-block" id="customer-question-error" role="alert">{error}</div>}
        {!trimmed && <div className="text-secondary small mt-2">Enter a question to enable saving.</div>}
      </div>
      <div className="card-footer">
        <div className="btn-list">
          <button type="button" className="btn btn-primary" disabled={trimmed === ''} onClick={() => onSave(trimmed)}>Save question</button>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function itemOf(itemId: string) {
  const item = catalog.menu.find((i) => i.id === itemId)
  if (!item) throw new Error(`Unknown menu item: ${itemId}`)
  return item
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="input-group staff-stepper" role="group" aria-label={`${label} quantity`}>
      <button type="button" className="btn btn-icon" aria-label={`Decrease quantity of ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>
        <IconMinus className="icon" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className="form-control text-center"
        aria-label={`Quantity of ${label}`}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
      <button type="button" className="btn btn-icon" aria-label={`Increase quantity of ${label}`} onClick={() => onChange(value + 1)}>
        <IconPlus className="icon" aria-hidden="true" />
      </button>
    </div>
  )
}

export function EditPanel({
  lines,
  guestCount,
  onSave,
  onCancel,
  error,
}: {
  lines: OrderLine[]
  guestCount: number | null
  onSave: (lines: OrderLine[]) => void
  onCancel: () => void
  error: string | null
}) {
  // A quantity of 0 keeps its row while editing so the box can be cleared and retyped; zero rows are dropped on save.
  const [draft, setDraft] = useState<OrderLine[]>(lines)
  const ref = usePanelFocus()

  const setUnits = (itemId: string, units: number) =>
    setDraft(draft.map((l) => (l.itemId === itemId ? { itemId, units: Math.min(MAX_QUANTITY, Math.max(0, Math.floor(units))) } : l)))
  const kept = draft.filter((l) => l.units > 0)
  const result = estimate(kept, guestCount)
  const hasFood = kept.some((l) => itemOf(l.itemId).category !== 'supply')
  const changed = JSON.stringify(kept) !== JSON.stringify(lines)
  const addable = catalog.menu.filter((item) => !draft.some((l) => l.itemId === item.id))

  return (
    <div className="card" ref={ref} tabIndex={-1} role="group" aria-labelledby="edit-panel-title">
      <div className="card-header">
        <div>
          <h3 className="card-title" id="edit-panel-title">Edit proposal</h3>
          <div className="card-subtitle">Changes need the customer's approval before this request can be accepted.</div>
        </div>
      </div>
      <div className="card-body">
        <ul className="list-unstyled m-0 d-grid gap-3">
          {draft.map((line) => {
            const item = itemOf(line.itemId)
            return (
              <li key={line.itemId} className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <span>
                  {item.name} <span className="text-secondary small">({formatMoney(item.priceCents)} per {item.unit})</span>
                </span>
                {item.unit === 'person' ? (
                  <span className="d-flex align-items-center gap-2 small">
                    per person x {guestCount ?? 0}
                    <button type="button" className="btn btn-sm" onClick={() => setDraft(draft.filter((l) => l.itemId !== item.id))}>
                      Remove {item.name}
                    </button>
                  </span>
                ) : (
                  <Stepper label={item.name} value={line.units} onChange={(value) => setUnits(item.id, value)} />
                )}
              </li>
            )
          })}
        </ul>
        <div className="mt-3">
          <label htmlFor="add-item" className="visually-hidden">Add an item</label>
          <select
            id="add-item"
            className="form-select"
            value=""
            onChange={(event) => event.target.value && setDraft([...draft, { itemId: event.target.value, units: 1 }])}
          >
            <option value="">Add an item...</option>
            {addable.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <p className="mt-3 mb-0" data-testid="edit-estimate">
          Estimate with changes: <strong>{formatMoney(result.subtotalCents)}</strong>
          {guestCount !== null && (
            <>
              {' '}&middot; Entree servings: <strong>{result.entreeServings}</strong> of {guestCount} guests
            </>
          )}
        </p>
        {error && <div role="alert" className="alert alert-danger mt-3 mb-0">{error}</div>}
      </div>
      <div className="card-footer">
        <div className="btn-list">
          <button type="button" className="btn btn-primary" disabled={!hasFood || !changed} onClick={() => onSave(kept)}>Save changes</button>
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
