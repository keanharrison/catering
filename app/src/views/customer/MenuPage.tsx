import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { JourneyNav } from '../../components/JourneyNav'
import { AssistantPanel } from '../../components/AssistantPanel'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { QuantityStepper } from '../../components/QuantityStepper'
import { StageGate } from '../../components/StageGate'
import { StepTabs } from '../../components/StepTabs'
import { catalog, type DietaryTag, type MenuCategory, type OrderLine } from '../../data'
import { recommend, setQuantity, type Recommendation } from '../../engine'
import { formatMoney } from '../../lib/format'
import { useDemoStore } from '../../state/store'
import { stagePath } from './journey'
import { browseCategories, filterTags, menuEntries } from './menuView'
import { buildOrderSummary } from './orderSummary'

const tagLabel: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-free',
  'dairy-free': 'Dairy-free',
  spicy: 'Spicy',
}

type Suggestion = { recommendation: Recommendation; undoLines: OrderLine[] | null; applied: boolean }

export function MenuPage() {
  return (
    <StageGate stage="menu">
      <MenuView />
    </StageGate>
  )
}

function isSupply(itemId: string): boolean {
  return catalog.menu.find((i) => i.id === itemId)?.category === 'supply'
}

function MenuView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const [category, setCategory] = useState<MenuCategory>('entree')
  const [filters, setFilters] = useState<DietaryTag[]>([])
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)

  const summary = buildOrderSummary(order, clock)
  const entries = menuEntries(order, category, filters)

  function toggleFilter(tag: DietaryTag) {
    setFilters((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  function applySuggestion() {
    if (!suggestion) return
    const supplyLines = order.lines.filter((l) => isSupply(l.itemId))
    const suggested = suggestion.recommendation.lines.map(({ itemId, units }) => ({ itemId, units }))
    setSuggestion({ ...suggestion, undoLines: order.lines, applied: true })
    updateDraft({ lines: [...suggested, ...supplyLines] })
  }

  function undoSuggestion() {
    if (suggestion?.undoLines) updateDraft({ lines: suggestion.undoLines })
    setSuggestion(null)
  }

  return (
    <Band>
      <Eyebrow marker>Your menu</Eyebrow>
      <h1 className="mt-6 text-4xl md:text-7xl">Choose what you would like.</h1>
      <div className="mt-10">
        <JourneyNav active="menu" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="grid gap-6 self-start">
          <StepTabs
            label="Menu categories"
            items={browseCategories.map((c) => ({ id: c.category, label: c.title }))}
            activeId={category}
            onChange={(id) => setCategory(id as MenuCategory)}
            panelId="menu-panel"
          />

          <div role="group" aria-label="Show only" className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-eyebrow text-muted">Show only</span>
            {filterTags.map(({ tag, label }) => (
              <button
                key={tag}
                type="button"
                aria-pressed={filters.includes(tag)}
                onClick={() => toggleFilter(tag)}
                className={`rounded-sm border px-3 py-1 font-sans text-sm ${
                  filters.includes(tag) ? 'border-action bg-action text-on-action' : 'border-control-line bg-panel'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Panel className="p-0">
            <div role="tabpanel" id="menu-panel" aria-labelledby={`tab-${category}`}>
            {entries.length === 0 ? (
              <p className="px-6 py-6 text-sm text-muted">No items match these filters in this category.</p>
            ) : (
              <ul>
                {entries.map(({ item, quantity }) => (
                  <li key={item.id} className="border-b border-line last:border-b-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="font-sans text-lg">{item.name}</p>
                        <p className="font-sans text-sm text-muted">
                          {formatMoney(item.priceCents)} per {item.unit}
                          {item.servingNote ? ` - ${item.servingNote}` : ''}
                        </p>
                        {item.dietaryTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.dietaryTags.map((tag) => (
                              <Pill key={tag} tone="neutral">
                                {tagLabel[tag]}
                              </Pill>
                            ))}
                          </div>
                        )}
                      </div>
                      <QuantityStepper
                        label={item.name}
                        value={quantity}
                        onChange={(value) => updateDraft({ lines: setQuantity(order.lines, item.id, value) })}
                      />
                    </div>
                    <details className="bg-ivory-deep px-6 py-3 text-sm">
                      <summary className="cursor-pointer font-sans">About this item</summary>
                      <div className="mt-2 grid gap-2">
                        {item.description && <p>{item.description}</p>}
                        <p className="text-muted">
                          Price, tags and serving size are as listed on our current ordering page and may not be
                          final. Tags are not allergy or nutrition claims.
                        </p>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </Panel>

          {suggestion && (
            <Panel tone="deep" className="p-6">
              <Eyebrow>Suggested for {summary.guestCount} guests</Eyebrow>
              {suggestion.recommendation.lines.length === 0 ? (
                <p className="mt-3 text-sm">{suggestion.recommendation.notes.join(' ')}</p>
              ) : (
                <>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {suggestion.recommendation.lines.map((line) => {
                      const item = catalog.menu.find((i) => i.id === line.itemId)
                      return (
                        <li key={line.itemId}>
                          <strong className="font-sans">
                            {item?.name} ({line.units})
                          </strong>
                          <span className="text-muted"> - {line.reason}</span>
                        </li>
                      )
                    })}
                  </ul>
                  {suggestion.recommendation.notes.map((note) => (
                    <p key={note} className="mt-2 text-sm text-muted">
                      {note}
                    </p>
                  ))}
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-sans">How was this chosen?</summary>
                    <p className="mt-2 text-muted">
                      Suggestions follow our serving guidelines for your guest count and a standard set of dishes.
                      Those guidelines are not final. You can change anything.
                    </p>
                  </details>
                </>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestion.recommendation.lines.length > 0 && !suggestion.applied && (
                  <Button size="sm" onClick={applySuggestion}>
                    Use these
                  </Button>
                )}
                {suggestion.applied && (
                  <Button size="sm" variant="secondary" onClick={undoSuggestion}>
                    Undo
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => setSuggestion(null)}>
                  {suggestion.applied ? 'Close' : 'No thanks'}
                </Button>
              </div>
            </Panel>
          )}
        </div>

        <div className="grid gap-6 self-start">
          <OrderSummaryPanel
            summary={summary}
            showCoverage
            footer={
              // One continue button. Wide screens: directly under the calculator. Phones: the same
              // button becomes a fixed bar with the running total, so both stay in reach.
              <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-panel px-6 py-3 md:static md:z-auto md:block md:border-0 md:bg-transparent md:p-0">
                <p aria-hidden className="font-sans text-2xl leading-none md:hidden">
                  {formatMoney(summary.estimate.subtotalCents)}
                </p>
                <Button className="md:w-full" disabled={!summary.hasFood} onClick={() => navigate(stagePath('supplies'))}>
                  Continue to supplies
                </Button>
              </div>
            }
          >
            <Button
              variant="secondary"
              onClick={() => setSuggestion({ recommendation: recommend(order.intent), undoLines: null, applied: false })}
            >
              Help me choose
            </Button>
          </OrderSummaryPanel>
          <AssistantPanel />
        </div>
      </div>

      <div className="mt-10">
        <Button variant="secondary" onClick={() => navigate(stagePath('event'))}>
          Back
        </Button>
      </div>

      {/* Room for the fixed continue bar on phones so it never covers the last content. */}
      <div aria-hidden className="h-20 md:hidden" />
    </Band>
  )
}
