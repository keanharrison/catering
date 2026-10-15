import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { JourneyNav } from '../../components/JourneyNav'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { QuantityStepper } from '../../components/QuantityStepper'
import { StageGate } from '../../components/StageGate'
import { setQuantity } from '../../engine'
import { formatMoney } from '../../lib/format'
import { useDemoStore } from '../../state/store'
import { completedStages, stagePath } from './journey'
import { supplyEntries } from './menuView'
import { buildOrderSummary } from './orderSummary'

export function SuppliesPage() {
  return (
    <StageGate stage="supplies">
      <SuppliesView />
    </StageGate>
  )
}

function SuppliesView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const entries = supplyEntries(order)
  const guests = order.intent.guestCount ?? 0
  const supplyIds = entries.map((e) => e.item.id)
  const foodLines = order.lines.filter((l) => !supplyIds.includes(l.itemId))
  const wantsSupplies = order.suppliesChoice === 'selected'
  const summary = buildOrderSummary(order, clock)
  const canContinue = completedStages(order, clock).supplies

  return (
    <Band>
      <Eyebrow marker>Disposable catering supplies</Eyebrow>
      <h1 className="mt-6 text-4xl md:text-7xl">Plates, cutlery and serving.</h1>
      <div className="mt-10">
        <JourneyNav active="supplies" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel className="self-start p-6 md:p-8">
          <fieldset className="grid gap-3">
            <legend className="mb-2 font-sans text-sm">Do you need disposable supplies?</legend>
            <label className="flex min-h-11 items-center gap-2 font-sans text-base">
              <input
                type="radio"
                name="supplies"
                className="accent-accent"
                checked={order.suppliesChoice === 'none'}
                onChange={() => updateDraft({ suppliesChoice: 'none', lines: foodLines })}
              />
              No cutlery, plates or serving utensils needed
            </label>
            <label className="flex min-h-11 items-center gap-2 font-sans text-base">
              <input
                type="radio"
                name="supplies"
                className="accent-accent"
                checked={wantsSupplies}
                onChange={() => updateDraft({ suppliesChoice: 'selected' })}
              />
              Add supplies
            </label>
          </fieldset>

          {wantsSupplies && (
            <ul className="mt-6 border-t border-line">
              {entries.map(({ item, quantity }) => {
                const perPerson = item.unit === 'person'
                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4">
                    <div>
                      <p className="font-sans text-lg">{item.name}</p>
                      <p className="font-sans text-sm text-muted">
                        {perPerson
                          ? `${formatMoney(item.priceCents)} per person (${guests} guests)`
                          : `${formatMoney(item.priceCents)} per ${item.unit === 'set' ? 'set' : 'piece'}`}
                      </p>
                    </div>
                    {perPerson ? (
                      <label className="flex min-h-11 items-center gap-2 font-sans text-sm">
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={quantity > 0}
                          aria-label={`Add ${item.name}`}
                          onChange={(e) => updateDraft({ lines: setQuantity(order.lines, item.id, e.target.checked ? 1 : 0) })}
                        />
                        Add
                      </label>
                    ) : (
                      <QuantityStepper
                        label={item.name}
                        value={quantity}
                        onChange={(value) => updateDraft({ lines: setQuantity(order.lines, item.id, value) })}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          {wantsSupplies && !canContinue && (
            <p role="alert" className="mt-4 font-sans text-sm text-status-blocked">
              Choose at least one supply, or select that none are needed.
            </p>
          )}
        </Panel>

        <div className="self-start">
          <OrderSummaryPanel summary={summary} />
        </div>
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate(stagePath('menu'))}>
          Back
        </Button>
        <Button disabled={!canContinue} onClick={() => navigate(stagePath('details'))}>
          Continue to details
        </Button>
      </div>
    </Band>
  )
}
