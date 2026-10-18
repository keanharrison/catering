import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QuantityStepper } from '../../components/QuantityStepper'
import { StageGate } from '../../components/StageGate'
import { catalog } from '../../data'
import { setQuantity } from '../../engine'
import { formatMoney } from '../../lib/format'
import { useDemoStore } from '../../state/store'
import { MenuOrderSummary } from './MenuOrderSummary'
import { buildOrderSummary } from './orderSummary'
import { completedStages, stagePath } from './journey'

export function SuppliesPage() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)

  const supplyItems = catalog.menu.filter((item) => item.category === 'supply')
  const supplyItemIds = new Set(supplyItems.map((item) => item.id))
  const foodLines = order.lines.filter((line) => !supplyItemIds.has(line.itemId))
  const selectedSupplyCount = order.lines.filter((line) => supplyItemIds.has(line.itemId) && line.units > 0).length
  const guestCount = order.intent.guestCount
  const summary = buildOrderSummary(order, clock)
  const canContinue = completedStages(order, clock).supplies
  const continueHelp = order.suppliesChoice === null
    ? 'Choose whether you need supplies to continue.'
    : order.suppliesChoice === 'selected' && selectedSupplyCount === 0
      ? 'Add at least one supply, or choose “No supplies needed.”'
      : undefined
  const choiceHelp = order.suppliesChoice === 'none'
    ? 'No supply charges will be added to your estimate.'
    : order.suppliesChoice === 'selected' && selectedSupplyCount === 0
      ? 'Select at least one supply to continue, or choose “No supplies needed.”'
      : order.suppliesChoice === 'selected'
        ? 'Per-person options are priced for all guests. Adjust sets and individual utensils with their quantity controls.'
        : 'Choose one option. If you need supplies, select at least one item below.'

  return (
    <StageGate stage="supplies">
      <div className="w-full px-4 py-8 pb-28 text-foreground sm:px-8 sm:py-10 lg:pb-10">
        <section className="mx-auto w-full max-w-7xl">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Catering supplies
              </CardTitle>
              <CardDescription className="text-sm leading-6 sm:text-base">
                Next, choose whether your event needs disposable catering supplies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet className="gap-3">
                <FieldLegend id="supplies-choice-legend" variant="label">
                  Do you need catering supplies? (required)
                </FieldLegend>
                <RadioGroup
                  name="supplies-choice"
                  value={order.suppliesChoice ?? ''}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      updateDraft({ suppliesChoice: 'none', lines: foodLines })
                    } else if (value === 'selected') {
                      updateDraft({ suppliesChoice: 'selected' })
                    }
                  }}
                  aria-labelledby="supplies-choice-legend"
                  aria-required="true"
                  className="gap-0"
                >
                  <Field orientation="horizontal" className="min-h-9">
                    <RadioGroupItem
                      id="supplies-needed"
                      value="selected"
                      className="after:-inset-x-4 after:-inset-y-4"
                    />
                    <FieldLabel htmlFor="supplies-needed">I need supplies</FieldLabel>
                  </Field>
                  <Field orientation="horizontal" className="min-h-9">
                    <RadioGroupItem
                      id="supplies-not-needed"
                      value="none"
                      className="after:-inset-x-4 after:-inset-y-4"
                    />
                    <FieldLabel htmlFor="supplies-not-needed">No supplies needed</FieldLabel>
                  </Field>
                </RadioGroup>
                <FieldDescription>{choiceHelp}</FieldDescription>
              </FieldSet>
              {order.suppliesChoice === 'selected' && (
                <FieldSet className="mt-8 gap-3 border-t pt-6">
                  <FieldLegend variant="label">Choose the supplies you need</FieldLegend>
                  <FieldGroup className="gap-2">
                    {supplyItems.map((item) => {
                      const selected = order.lines.some(
                        (line) => line.itemId === item.id && line.units > 0,
                      )
                      const quantity = order.lines.find((line) => line.itemId === item.id)?.units ?? 0
                      const priceUnit = item.unit === 'each' ? 'each' : `per ${item.unit}`
                      const checkboxId = `supply-${item.id}`

                      return (
                        <Field
                          key={item.id}
                          orientation="horizontal"
                          className="items-center gap-3 rounded-lg border p-3"
                        >
                          <Checkbox
                            id={checkboxId}
                            name="supplies"
                            value={item.id}
                            checked={selected}
                            onCheckedChange={(checked) => {
                              updateDraft({
                                lines: setQuantity(order.lines, item.id, checked === true ? 1 : 0),
                              })
                            }}
                            className="after:-inset-x-4 after:-inset-y-4"
                          />
                          <FieldContent className="min-w-0 gap-1">
                            <FieldLabel htmlFor={checkboxId}>{item.name}</FieldLabel>
                            <FieldDescription>
                              {formatMoney(item.priceCents)} {priceUnit}
                              {item.unit === 'person' && ` · for all ${guestCount ?? 'event'} guests`}
                            </FieldDescription>
                          </FieldContent>
                          {selected && item.unit !== 'person' && (
                            <QuantityStepper
                              label={item.name}
                              value={quantity}
                              onChange={(value) => {
                                updateDraft({ lines: setQuantity(order.lines, item.id, value) })
                              }}
                            />
                          )}
                        </Field>
                      )
                    })}
                  </FieldGroup>
                </FieldSet>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => navigate(stagePath('menu'))}
              >
                Back to menu
              </Button>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                {continueHelp && (
                  <p id="supplies-continue-help" className="text-sm text-muted-foreground sm:text-right">
                    {continueHelp}
                  </p>
                )}
                <Button
                  type="button"
                  className="min-h-11"
                  disabled={!canContinue}
                  aria-describedby={!canContinue ? 'supplies-continue-help' : undefined}
                  onClick={() => navigate(stagePath('details'))}
                >
                  Continue to details
                </Button>
              </div>
            </CardFooter>
          </Card>
          <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Order summary">
            <MenuOrderSummary summary={summary} />
          </aside>
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl">
          <MenuOrderSummary summary={summary} mobile />
        </div>
      </div>
      <div aria-hidden="true" className="h-20 lg:hidden" />
    </StageGate>
  )
}
