import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import type { OrderSummary } from './orderSummary'
import { formatMoney } from '../../lib/format'

type MenuOrderSummaryProps = {
  summary: OrderSummary
  onBack?: () => void
  onContinue?: () => void
  mobile?: boolean
}

function SummaryDetails({ summary }: { summary: OrderSummary }) {
  const foodSubtotal = summary.groups
    .filter((group) => group.category !== 'supply')
    .flatMap((group) => group.rows)
    .reduce((total, row) => total + row.costCents, 0)
  const suppliesSubtotal = summary.groups
    .filter((group) => group.category === 'supply')
    .flatMap((group) => group.rows)
    .reduce((total, row) => total + row.costCents, 0)

  return (
    <>
      {summary.groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing chosen yet. Select menu items to build your order.</p>
      ) : (
        <div className="space-y-3">
          {summary.groups.map((group, index) => (
            <section key={group.category} aria-label={group.title} className={index > 0 ? 'border-t border-border pt-3' : ''}>
              <h3 className="type-small-label mb-2 uppercase text-muted-foreground">{group.title}</h3>
              <ul className="space-y-2">
                {group.rows.map((row) => (
                  <li key={row.itemId} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 text-sm">
                    <span className="min-w-0 break-words font-medium leading-5">{row.name}</span>
                    <span className="shrink-0 text-right font-medium tabular-nums">{formatMoney(row.costCents)}</span>
                    <span className="col-start-1 row-start-2 text-xs leading-4 text-muted-foreground">{row.quantityLabel}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Separator className="my-4" />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Food subtotal</span>
          <span className="tabular-nums">{formatMoney(foodSubtotal)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Supplies subtotal</span>
          <span className="tabular-nums">{formatMoney(suppliesSubtotal)}</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">Estimated total</span>
        <span className="text-2xl font-semibold leading-8 tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span>
      </div>
      <div className="mt-2 flex justify-between gap-3 text-sm text-muted-foreground">
        <span>Guests</span><span>{summary.guestCount ?? '—'}</span>
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm text-muted-foreground">
        <span>Per guest</span><span>{summary.estimate.costPerGuestCents === null ? '—' : formatMoney(summary.estimate.costPerGuestCents)}</span>
      </div>
      {summary.guestCount !== null && (
        <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm" data-testid="coverage">
          <p>Entree servings: <strong>{summary.coverage.servings}</strong> of {summary.guestCount} guests</p>
          <p className="mt-1 text-xs text-muted-foreground">
            For this demo, coverage counts one entree serving per guest. Side quantities are separate.
          </p>
        </div>
      )}
    </>
  )
}

export function MenuOrderSummary({ summary, onBack, onContinue, mobile = false }: MenuOrderSummaryProps) {
  const selectedCount = summary.groups.reduce((count, group) => count + group.rows.length, 0)
  const continueHelpId = mobile ? 'menu-continue-help-mobile' : 'menu-continue-help'
  const showNavigation = Boolean(onBack && onContinue)
  const card = (
    <Card>
      <CardHeader>
        <CardTitle>{mobile ? 'Order details' : 'Your order'}</CardTitle>
      </CardHeader>
      <CardContent>
        <SummaryDetails summary={summary} />
      </CardContent>
      {!mobile && showNavigation && (
        <CardFooter className="flex-col items-stretch gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-h-11 px-4" onClick={onBack}>Back</Button>
            <Button
              className="min-h-11 flex-1"
              disabled={!summary.hasFood}
              aria-describedby={!summary.hasFood ? continueHelpId : undefined}
              onClick={onContinue}
            >
              Choose supplies
            </Button>
          </div>
          {!summary.hasFood && <p id={continueHelpId} className="text-sm text-muted-foreground">Choose at least one menu item to continue.</p>}
        </CardFooter>
      )}
    </Card>
  )

  if (!mobile) return card

  return (
    <Collapsible className="w-full">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Your order</p>
          <p className="truncate text-xs text-muted-foreground">
            {selectedCount} selected {selectedCount === 1 ? 'item' : 'items'} · {formatMoney(summary.estimate.subtotalCents)}
          </p>
        </div>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Toggle order summary"><ChevronsUpDown /><span className="sr-only">Toggle order summary</span></Button>} />
      </div>
      <CollapsibleContent className="max-h-[min(65svh,34rem)] overflow-y-auto pb-2">
        {card}
      </CollapsibleContent>
      {showNavigation && (
        <>
          <div className="flex gap-2 py-2">
            <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={onBack}>Back</Button>
            <Button
              className="min-h-11 flex-1"
              disabled={!summary.hasFood}
              aria-describedby={!summary.hasFood ? continueHelpId : undefined}
              onClick={onContinue}
            >
              Choose supplies
            </Button>
          </div>
          {!summary.hasFood && <p id={continueHelpId} className="pb-2 text-right text-sm text-muted-foreground">Choose at least one menu item to continue.</p>}
        </>
      )}
    </Collapsible>
  )
}
