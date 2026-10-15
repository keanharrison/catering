import { useState } from 'react'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { QuantityStepper } from '../../components/QuantityStepper'
import { Panel } from '../../components/Panel'
import { catalog, type OrderLine } from '../../data'
import { estimate, MAX_QUANTITY } from '../../engine'
import { formatMoney } from '../../lib/format'

type EditRequestPanelProps = {
  lines: OrderLine[]
  guestCount: number | null
  /** Called with the edited lines; the demo state records them as a revised proposal. */
  onSave: (lines: OrderLine[]) => void
  onCancel: () => void
}

function itemOf(itemId: string) {
  const item = catalog.menu.find((i) => i.id === itemId)
  if (!item) throw new Error(`Unknown menu item: ${itemId}`)
  return item
}

// Edits the order's items and quantities. Saving goes through the existing revise action, so the
// customer must approve the change before staff can accept (the guardrail from the status machine).
export function EditRequestPanel({ lines, guestCount, onSave, onCancel }: EditRequestPanelProps) {
  // While editing, a quantity of 0 keeps its row (so you can clear the box and type a new number).
  // Zero rows are dropped from the estimate and from what gets saved.
  const [draft, setDraft] = useState<OrderLine[]>(lines)

  const setUnits = (itemId: string, units: number) =>
    setDraft(draft.map((l) => (l.itemId === itemId ? { itemId, units: Math.min(MAX_QUANTITY, Math.max(0, Math.floor(units))) } : l)))
  const kept = draft.filter((l) => l.units > 0)

  const result = estimate(kept, guestCount)
  const hasFood = kept.some((l) => itemOf(l.itemId).category !== 'supply')
  const changed = JSON.stringify(kept) !== JSON.stringify(lines)
  const addable = catalog.menu.filter((item) => !draft.some((l) => l.itemId === item.id))

  return (
    <Panel tone="deep" className="mt-6 p-6">
      <Eyebrow>Edit request</Eyebrow>
      <p className="mt-2 text-sm text-muted">
        Changes need the customer's approval before this request can be accepted.
      </p>

      <ul className="mt-4 grid gap-3">
        {draft.map((line) => {
          const item = itemOf(line.itemId)
          return (
            <li key={line.itemId} className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-sans">
                {item.name} <span className="text-sm text-muted">({formatMoney(item.priceCents)} per {item.unit})</span>
              </span>
              {item.unit === 'person' ? (
                <span className="flex items-center gap-3 text-sm">
                  per person x {guestCount ?? 0}
                  <Button size="sm" variant="secondary" onClick={() => setDraft(draft.filter((l) => l.itemId !== item.id))}>
                    Remove {item.name}
                  </Button>
                </span>
              ) : (
                <QuantityStepper
                  label={item.name}
                  value={line.units}
                  onChange={(value) => setUnits(item.id, value)}
                />
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-4">
        <label htmlFor="add-item" className="sr-only">
          Add an item
        </label>
        <select
          id="add-item"
          className="min-h-11 w-full rounded-lg border border-control-line bg-panel px-3 py-2 font-sans text-base md:w-auto"
          value=""
          onChange={(event) => event.target.value && setDraft([...draft, { itemId: event.target.value, units: 1 }])}
        >
          <option value="">Add an item...</option>
          {addable.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 font-sans text-sm" data-testid="edit-estimate">
        Estimate with changes: <strong>{formatMoney(result.subtotalCents)}</strong>
        {guestCount !== null && (
          <>
            {' '}
            &middot; Entree servings: <strong>{result.entreeServings}</strong> of {guestCount} guests
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!hasFood || !changed} onClick={() => onSave(kept)}>
          Save changes
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Panel>
  )
}
