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
  return (
    <>
      {summary.groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing chosen yet. Select menu items to build your order.</p>
      ) : (
        <div className="space-y-4">
          {summary.groups.map((group, index) => (
            <section key={group.category} aria-label={group.title}>
              {index > 0 && <Separator className="mb-4" />}
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</h3>
              <ul className="space-y-2">
                {group.rows.map((row) => (
                  <li key={row.itemId} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">{row.name}<span className="block text-xs text-muted-foreground">{row.quantityLabel}</span></span>
                    <span className="shrink-0 tabular-nums">{formatMoney(row.costCents)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Separator className="my-4" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">Estimated total</span>
        <span className="text-xl font-semibold tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span>
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
      <CardHeader className={mobile ? 'pb-1' : undefined}>
        <CardTitle>{mobile ? 'Order details' : 'Your order'}</CardTitle>
      </CardHeader>
      <CardContent>
        <SummaryDetails summary={summary} />
      </CardContent>
      {!mobile && showNavigation && (
        <CardFooter className="flex-col items-stretch gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="min-h-11 px-4" onClick={onBack}>Back</Button>
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
            <Button type="button" variant="secondary" className="min-h-11 flex-1" onClick={onBack}>Back</Button>
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
