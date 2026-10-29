import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TriangleAlert } from '../../components/icons'
import type { Order } from '../../data'
import type { OrderSummary } from '../customer/orderSummary'
import { catalog } from '../../data'
import { formatEventTime } from '../../lib/status'
import { formatMoney } from '../../lib/format'
import { routes } from '../../routes'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { AskCustomerPanel } from './AskCustomerPanel'
import { DeclineRequestPanel } from './DeclineRequestPanel'
import { EditRequestPanel } from './EditRequestPanel'
import { StaffStatusBadge } from './StaffStatusBadge'

type Panel = 'ask' | 'edit' | 'decline' | null

type RequestDetailsProps = {
  order: Order
  summary: OrderSummary
  acceptAllowed: boolean
  acceptReason?: string
  canAsk: boolean
  canEdit: boolean
  closed: boolean
  notice: string | null
  error: string | null
  onAccept: () => void
  onAsk: () => void
  onEdit: () => void
  onDecline: () => void
  panel: Panel
  onSaveQuestion: (text: string) => void
  onSaveProposal: (lines: Order['lines']) => void
  onSaveDecline: (reason: string) => void
  onCancelPanel: () => void
}

function Value({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="type-small-label text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm">{children}</dd>
    </div>
  )
}

function eventTypeLabel(eventType: string) {
  return (catalog.eventTypes.find((type) => type.id === eventType)?.label ?? eventType) || 'Not provided'
}

export function RequestDetails({
  order,
  summary,
  acceptAllowed,
  acceptReason,
  canAsk,
  canEdit,
  closed,
  notice,
  error,
  onAccept,
  onAsk,
  onEdit,
  onDecline,
  panel,
  onSaveQuestion,
  onSaveProposal,
  onSaveDecline,
  onCancelPanel,
}: RequestDetailsProps) {
  const foodGroups = summary.groups.filter((group) => group.category !== 'supply')
  const supplyGroups = summary.groups.filter((group) => group.category === 'supply')
  const foodSubtotal = foodGroups.flatMap((group) => group.rows).reduce((total, row) => total + row.costCents, 0)
  const supplySubtotal = supplyGroups.flatMap((group) => group.rows).reduce((total, row) => total + row.costCents, 0)
  const address = [order.intent.deliveryAddress, order.intent.deliveryCity, order.intent.deliveryState, order.intent.deliveryZip]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="grid min-w-0 gap-4">
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="break-words">{eventTypeLabel(order.intent.eventType)}</CardTitle>
              <CardDescription className="mt-1 break-words">{order.intent.contactName || 'Customer'}{order.intent.organization ? ` · ${order.intent.organization}` : ''}</CardDescription>
            </div>
            
              <StaffStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <section aria-labelledby="request-event-heading">
            <h3 id="request-event-heading" className="type-section-title">Event</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <Value label="Date and time" className="col-span-2">{formatEventTime(order.intent.eventAt)}</Value>
              <Value label="Guests">{order.intent.guestCount ?? 'Not provided'}</Value>
              <Value label="Food budget">{order.intent.budgetCents === null ? 'Not provided' : formatMoney(order.intent.budgetCents)}</Value>
              <Value label="Fulfillment" ><span className="capitalize">{order.intent.fulfillment}</span></Value>
              {order.intent.fulfillment === 'delivery' && <Value label="Delivery address">{address || 'Not provided'}</Value>}
            </dl>
          </section>

          <Separator />

          <section aria-labelledby="request-food-heading">
            <div className="flex items-center justify-between gap-3">
              <h3 id="request-food-heading" className="type-section-title">Food and supplies</h3>
              <span className="text-xs text-muted-foreground">Estimate only</span>
            </div>
            {foodGroups.length > 0 ? (
              <div className="mt-3 grid gap-3">
                    {foodGroups.map((group) => (
                  <div key={group.category}>
                    <h4 className="type-small-label uppercase text-muted-foreground">{group.title}</h4>
                    <ul className="mt-1 grid gap-1.5">
                      {group.rows.map((row) => (
                        <li key={row.itemId} className="flex min-w-0 justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words">{row.name} <span className="text-muted-foreground">({row.quantityLabel})</span></span>
                          <span className="shrink-0 tabular-nums">{formatMoney(row.costCents)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : <p className="mt-2 text-sm text-muted-foreground">No food selections recorded.</p>}
            <div className="mt-3 border-t border-border pt-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Food subtotal</span><span className="tabular-nums">{formatMoney(foodSubtotal)}</span></div>
            </div>
            {supplyGroups.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {supplyGroups.map((group) => (
                  <div key={group.category}>
                    <h4 className="type-small-label uppercase text-muted-foreground">{group.title}</h4>
                    <ul className="mt-1 grid gap-1.5">
                      {group.rows.map((row) => (
                        <li key={row.itemId} className="flex min-w-0 justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words">{row.name} <span className="text-muted-foreground">({row.quantityLabel})</span></span>
                          <span className="shrink-0 tabular-nums">{formatMoney(row.costCents)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {order.suppliesChoice === 'none' ? 'No supplies needed.' : 'No supply selection recorded.'}
              </p>
            )}
            <div className="mt-3 grid gap-1 border-t border-border pt-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Supplies subtotal</span><span className="tabular-nums">{formatMoney(supplySubtotal)}</span></div>
              <div className="flex justify-between gap-3 font-semibold"><span>Estimated total</span><span className="tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span></div>
            </div>
            {summary.coverage.guests !== null && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Entree coverage: {summary.coverage.servings} {summary.coverage.servings === 1 ? 'serving' : 'servings'} for {summary.coverage.guests} guests
                {summary.coverage.shortfall > 0 ? ` · ${summary.coverage.shortfall} not yet covered` : ' · everyone covered'}.
              </p>
            )}
          </section>

          <Separator />

          <section aria-labelledby="request-contact-heading">
            <h3 id="request-contact-heading" className="type-section-title">Contact and instructions</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <Value label="Name">{order.intent.contactName || 'Not provided'}</Value>
              <Value label="Organization">{order.intent.organization || 'Not provided'}</Value>
              <Value label="Email">{order.intent.email || 'Not provided'}</Value>
              <Value label="Phone">{order.intent.phone || 'Not provided'}</Value>
              <Value label="Dietary needs" >{order.intent.dietary.length ? order.intent.dietary.join(', ') : 'None noted'}</Value>
            </dl>
            <div className="mt-3 grid gap-3">
              <Value label="Custom request">{order.intent.customRequest || 'None provided'}</Value>
              <Value label="Additional notes">{order.intent.notes || 'None provided'}</Value>
            </div>
          </section>

          {order.messages.length > 0 && (
            <>
              <Separator />
              <section aria-labelledby="request-messages-heading">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 id="request-messages-heading" className="type-section-title">Request messages</h3>
                </div>
                <ol className="mt-3 grid gap-3">
                  {order.messages.map((message) => (
                    <li key={message.id} className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                      <p className="font-medium">{{ customer: 'Customer', staff: 'Pearl Island team', system: 'Request update' }[message.author]}</p>
                      <p className="mt-1 break-words text-muted-foreground">{message.text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}

          {summary.flags.length > 0 && (
            <Alert className="border-warning/30 bg-warning-soft text-warning">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Review reasons</AlertTitle>
              <AlertDescription className="text-warning/90">
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {summary.flags.map((flag) => <li key={flag.code}>{flag.reason}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {notice && <p role="status" className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-950 dark:bg-teal-950/40 dark:text-teal-100">{notice}</p>}
          {error && panel === null && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-wrap items-start gap-2">
          {order.status === 'confirmed' ? (
            <Button nativeButton={false} render={<Link to={routes.handoff} />}>View handoff</Button>
          ) : !closed ? (
            <>
              <Button
                disabled={!acceptAllowed}
                aria-describedby={!acceptAllowed && acceptReason ? 'accept-disabled-reason' : undefined}
                onClick={onAccept}
              >
                Accept request
              </Button>
              <Button variant="outline" disabled={!canAsk} onClick={onAsk}>Ask for clarification</Button>
              <Button variant="outline" disabled={!canEdit} onClick={onEdit}>Edit request</Button>
              <Button variant="outline" disabled={!canEdit} onClick={onDecline}>Decline</Button>
            </>
          ) : <span className="text-sm text-muted-foreground">This request is closed.</span>}
        </CardFooter>
        {!closed && !acceptAllowed && acceptReason && (
          <p className="px-4 pb-4 text-xs text-muted-foreground sm:px-6" id="accept-disabled-reason">{acceptReason}</p>
        )}
      </Card>

      {panel === 'ask' && (
        <AskCustomerPanel onSimulateSend={onSaveQuestion} onCancel={onCancelPanel} error={error} />
      )}
      {panel === 'decline' && (
        <DeclineRequestPanel onDecline={onSaveDecline} onCancel={onCancelPanel} error={error} />
      )}
      {panel === 'edit' && (
        <EditRequestPanel
          lines={order.lines}
          guestCount={order.intent.guestCount}
          onSave={onSaveProposal}
          onCancel={onCancelPanel}
          error={error}
        />
      )}
    </div>
  )
}
