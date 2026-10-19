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
  const [feedback, setFeedback] = useState('')

  const summary = buildOrderSummary(order, clock)
  const entries = menuEntries(order, category, filters)
  const selectedRows = summary.groups.reduce((count, group) => count + group.rows.length, 0)

  function toggleFilter(tag: DietaryTag) {
    setFilters((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  function applySuggestion() {
    if (!suggestion) return
    const supplyLines = order.lines.filter((l) => isSupply(l.itemId))
    const suggested = suggestion.recommendation.lines.map(({ itemId, units }) => ({ itemId, units }))
    setSuggestion({ ...suggestion, undoLines: order.lines, applied: true })
    updateDraft({ lines: [...suggested, ...supplyLines] })
    setFeedback('Suggested quantities applied. You can restore your previous quantities with Undo.')
  }

  function undoSuggestion() {
    if (suggestion?.undoLines) updateDraft({ lines: suggestion.undoLines })
    setSuggestion(null)
    setFeedback('Previous quantities restored.')
  }

  return (
    <Band>
      <Eyebrow marker>Your Pearl Island menu</Eyebrow>
      <h1 className="type-page-title mt-6">Build your menu.</h1>
      <p className="mt-4 max-w-2xl font-sans text-sm leading-5 text-muted">
        Choose entrées, sides, and salads for your gathering. Your selections and estimated total update as you choose.
      </p>
      <div className="mt-10">
        <JourneyNav active="menu" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-6 self-start">
          <StepTabs
            label="Menu categories"
            items={browseCategories.map((c) => ({ id: c.category, label: c.title }))}
            activeId={category}
            onChange={(id) => setCategory(id as MenuCategory)}
            panelId="menu-panel"
          />

          <div role="group" aria-label="Show only" className="flex flex-wrap items-center gap-2">
            <span className="type-small-label uppercase text-muted">Show only</span>
            {filterTags.map(({ tag, label }) => (
              <button
                key={tag}
                type="button"
                aria-pressed={filters.includes(tag)}
                onClick={() => toggleFilter(tag)}
                className={`min-h-11 rounded-sm border px-3 py-2 font-sans text-sm ${
                  filters.includes(tag) ? 'border-action bg-action text-on-action' : 'border-control-line bg-panel'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p role="note" className="-mt-3 font-sans text-sm text-muted">
            Dietary tags are guides, not allergy or nutrition guarantees. If allergies or ingredient restrictions matter,
            confirm ingredients and preparation directly with Pearl Island.
          </p>

          <Panel className="p-0">
            <div
              aria-hidden="true"
              className="type-small-label hidden border-b border-line bg-ivory-deep px-6 py-3 uppercase text-muted xl:grid xl:grid-cols-[minmax(0,1fr)_7rem_8rem_11.5rem] xl:items-center xl:gap-4"
            >
              <span>Item</span>
              <span>Price</span>
              <span>Portion</span>
              <span className="text-right">Quantity</span>
            </div>
            <div role="tabpanel" id="menu-panel" aria-labelledby={`tab-${category}`}>
            {entries.length === 0 ? (
              <p className="px-6 py-6 text-sm text-muted">No items match these filters in this category.</p>
            ) : (
              <ul>
                {entries.map(({ item, quantity }) => (
                  <li
                    key={item.id}
                    className={`border-b border-line transition-colors duration-200 last:border-b-0 motion-reduce:transition-none ${
                      quantity > 0 ? 'bg-ivory-deep' : ''
                    }`}
                  >
                    <div className="grid gap-4 px-6 py-4 xl:grid-cols-[minmax(0,1fr)_7rem_8rem_11.5rem] xl:items-center xl:gap-4">
                      <div className="min-w-0">
                        <p className="font-sans text-base font-medium leading-6">{item.name}</p>
                        {item.dietaryTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.dietaryTags.map((tag) => (
                              <Pill key={tag} tone="neutral">
                                {tagLabel[tag]}
                              </Pill>
                            ))}
                          </div>
                        )}
                        <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-sans text-sm xl:hidden">
                          <dt className="type-small-label uppercase text-muted">Price</dt>
                          <dd className="tabular-nums">{formatMoney(item.priceCents)} per {item.unit}</dd>
                          <dt className="type-small-label uppercase text-muted">Portion</dt>
                          <dd className="text-muted">{item.servingNote ?? 'Not listed'}</dd>
                        </dl>
                      </div>
                      <p className="hidden font-sans text-sm tabular-nums xl:block">
                        {formatMoney(item.priceCents)}
                        <span className="mt-1 block text-xs text-muted">per {item.unit}</span>
                      </p>
                      <p className="hidden font-sans text-sm text-muted xl:block">
                        {item.servingNote ?? 'Not listed'}
                      </p>
                      <QuantityStepper
                        label={item.name}
                        value={quantity}
                        onChange={(value) => {
                          setFeedback('')
                          updateDraft({ lines: setQuantity(order.lines, item.id, value) })
                        }}
                      />
                    </div>
                    {item.description && (
                      <details className="bg-ivory-deep px-6 py-3 text-sm">
                        <summary className="cursor-pointer font-sans">About this item</summary>
                        <p className="mt-2">{item.description}</p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
            </div>
          </Panel>

          {suggestion && (
            <Panel tone="deep" className="p-5">
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
                      These suggestions use the portion assumptions for this demo. Review and adjust all quantities
                      before continuing.
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
          {feedback && (
            <p role="status" aria-live="polite" className="font-sans text-sm text-action">
              {feedback}
            </p>
          )}
        </div>

        <div className="hidden gap-6 self-start md:grid">
          <div className="md:sticky md:top-4">
            <OrderSummaryPanel
              summary={summary}
              showCoverage
              footer={
                <div>
                  <Button
                    className="w-full"
                    disabled={!summary.hasFood}
                    aria-describedby={!summary.hasFood ? 'menu-continue-hint-desktop' : undefined}
                    onClick={() => navigate(stagePath('supplies'))}
                  >
                    Continue to supplies
                  </Button>
                  {!summary.hasFood && (
                    <p id="menu-continue-hint-desktop" className="mt-2 font-sans text-sm text-muted">
                      Choose at least one menu item to continue.
                    </p>
                  )}
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
          </div>
          <AssistantPanel />
        </div>
      </div>

      <div className="mt-6 md:hidden">
        <AssistantPanel />
      </div>

      <div className="mt-10">
        <Button variant="secondary" onClick={() => navigate(stagePath('event'))}>
          Back
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel px-4 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-1 focus-visible:rounded-sm">
            <span className="min-w-0">
              <span className="block font-sans text-sm font-semibold">Order summary</span>
              <span className="block truncate font-sans text-xs text-muted">
                {selectedRows} {selectedRows === 1 ? 'item' : 'items'} · {summary.coverage.servings} /{' '}
                {summary.guestCount ?? '–'} entree servings
              </span>
              <span className="block font-sans text-xs text-action group-open:hidden">View items and coverage</span>
              <span className="hidden font-sans text-xs text-action group-open:block">Hide order details</span>
            </span>
            <span className="shrink-0 font-sans text-lg tabular-nums" aria-label="Estimated total">
              {formatMoney(summary.estimate.subtotalCents)}
            </span>
          </summary>
          <div className="absolute inset-x-0 bottom-full mb-2 max-h-[65dvh] overflow-y-auto bg-ivory">
            <OrderSummaryPanel
              summary={summary}
              showCoverage
              footer={null}
            >
              <Button
                variant="secondary"
                onClick={() => setSuggestion({ recommendation: recommend(order.intent), undoLines: null, applied: false })}
              >
                Help me choose
              </Button>
            </OrderSummaryPanel>
          </div>
        </details>
        <div className="flex justify-end pb-2 pt-1">
          <Button
            className="w-full"
            disabled={!summary.hasFood}
            aria-describedby={!summary.hasFood ? 'menu-continue-hint-mobile' : undefined}
            onClick={() => navigate(stagePath('supplies'))}
          >
            Continue to supplies
          </Button>
        </div>
        {!summary.hasFood && (
          <p id="menu-continue-hint-mobile" className="pb-2 text-right font-sans text-sm text-muted">
            Choose at least one menu item to continue.
          </p>
        )}
      </div>

      {/* Room for the fixed mobile summary and continue action so they never cover the last content. */}
      <div aria-hidden className="h-32 md:hidden" />
    </Band>
  )
}
