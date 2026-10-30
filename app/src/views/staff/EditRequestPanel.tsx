import { useState } from 'react'
import { QuantityStepper } from '../../components/QuantityStepper'
import { catalog, type OrderLine } from '../../data'
import { estimate, MAX_QUANTITY } from '../../engine'
import { formatMoney } from '../../lib/format'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'

type EditRequestPanelProps = {
  lines: OrderLine[]
  guestCount: number | null
  /** Called with the edited lines; the demo state records them as a revised proposal. */
  onSave: (lines: OrderLine[]) => void
  onCancel: () => void
  error?: string | null
}

function itemOf(itemId: string) {
  const item = catalog.menu.find((i) => i.id === itemId)
  if (!item) throw new Error(`Unknown menu item: ${itemId}`)
  return item
}

// Edits the order's items and quantities. Saving goes through the existing revise action, so the
// customer must approve the change before staff can accept (the guardrail from the status machine).
export function EditRequestPanel({ lines, guestCount, onSave, onCancel, error }: EditRequestPanelProps) {
  // While editing, a quantity of 0 keeps its row (so you can clear the box and type a new number).
  // Zero rows are dropped from the estimate and from what gets saved.
  const [draft, setDraft] = useState<OrderLine[]>(lines)

  const setUnits = (itemId: string, units: number) =>
    setDraft(draft.map((l) => (l.itemId === itemId ? { itemId, units: Math.min(MAX_QUANTITY, Math.max(0, Math.floor(units))) } : l)))
  const kept = draft.filter((l) => l.units > 0)

  const result = estimate(kept, guestCount)
  const hasFood = kept.some((l) => itemOf(l.itemId).category !== 'supply')
  const changed = JSON.stringify(kept) !== JSON.stringify(lines)
  const addable = catalog.menu.filter((item) => item.available && !draft.some((l) => l.itemId === item.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit proposal</CardTitle>
        <CardDescription>Changes need the customer's approval before this request can be accepted.</CardDescription>
      </CardHeader>
      <CardContent>
      <ul className="grid gap-3">
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
        <Select
          items={addable.map((item) => ({ label: item.name, value: item.id }))}
          value={null}
          onValueChange={(value) => value && setDraft([...draft, { itemId: String(value), units: 1 }])}
        >
          <SelectTrigger id="add-item" className="min-h-9 w-full md:w-72">
            <SelectValue placeholder="Add an item…" />
          </SelectTrigger>
          <SelectContent>
            {addable.map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      {error && <p role="alert" className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button disabled={!hasFood || !changed} onClick={() => onSave(kept)}>
          Save changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
