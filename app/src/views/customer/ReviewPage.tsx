import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { catalog } from '@/data'
import { formatMoney, pluralize } from '@/lib/format'
import { statusLabel } from '@/lib/status'
import { useDemoStore } from '@/state/store'
import { StageGate } from '@/components/StageGate'
import { buildOrderSummary, type SummaryRow } from './orderSummary'
import { stagePath, type Stage } from './journey'

function EditLink({ stage, onClick }: { stage: Stage; onClick: (stage: Stage) => void }) {
  const labels: Partial<Record<Stage, string>> = {
    event: 'Edit event',
    menu: 'Edit menu',
    supplies: 'Edit supplies',
    details: 'Edit details',
  }
  return (
    <Button type="button" variant="link" className="h-auto px-0" onClick={() => onClick(stage)}>
      {labels[stage]}
    </Button>
  )
}

function SelectionTable({ caption, rows }: { caption: string; rows: SummaryRow[] }) {
  const itemById = new Map(catalog.menu.map((item) => [item.id, item]))
  return (
    <Table>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-0">Item</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead className="text-right pr-0">Line total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const item = itemById.get(row.itemId)
          const unit = item?.unit ?? 'unit'
          const quantity = Number(row.quantityLabel.match(/\d+/)?.[0] ?? 0)
          const unitLabel = unit === 'person'
            ? (quantity === 1 ? 'guest' : 'guests')
            : pluralize(quantity, unit).replace(/^\d+\s*/, '')
          return (
            <TableRow key={row.itemId}>
              <TableCell className="max-w-[15rem] whitespace-normal pl-0 font-medium">{row.name}</TableCell>
              <TableCell className="text-right tabular-nums">{quantity}</TableCell>
              <TableCell className="text-muted-foreground">{unitLabel}</TableCell>
              <TableCell className="pr-0 text-right tabular-nums">{formatMoney(row.costCents)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function ReviewPage() {
  return (
    <StageGate stage="review">
      <ReviewView />
    </StageGate>
  )
}

function ReviewView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const submit = useDemoStore((state) => state.submit)
  const reset = useDemoStore((state) => state.reset)
  const customerApprove = useDemoStore((state) => state.customerApprove)
  const submittingRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  const summary = buildOrderSummary(order, clock)
  const { intent } = order
  const eventType = (catalog.eventTypes.find((eventType) => eventType.id === intent.eventType)?.label ?? intent.eventType) || 'Not provided'
  const foodRows = summary.groups.filter((group) => group.category !== 'supply').flatMap((group) => group.rows)
  const supplyGroup = summary.groups.find((group) => group.category === 'supply')
  const foodSubtotal = summary.estimate.lines.reduce((total, line) => {
    const item = catalog.menu.find((candidate) => candidate.id === line.itemId)
    return item && item.category !== 'supply' ? total + line.costCents : total
  }, 0)
  const supplySubtotal = summary.estimate.subtotalCents - foodSubtotal
  const submitted = order.status !== 'draft'
  const deliveryAddress = [intent.deliveryAddress, [intent.deliveryCity, intent.deliveryState, intent.deliveryZip].filter(Boolean).join(', ')].filter(Boolean).join(', ')

  function goToStage(stage: Stage) {
    navigate(stagePath(stage))
  }

  function submitRequest() {
    if (submitted || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    submit()
    if (useDemoStore.getState().order.status === 'draft') {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const details = [
    { label: 'Event type', value: eventType },
    { label: 'Guests', value: String(intent.guestCount ?? '—') },
    { label: 'Food budget', value: intent.budgetCents === null ? 'Not provided' : formatMoney(intent.budgetCents) },
    { label: 'Event date', value: formatDate(intent.eventAt) },
    { label: intent.fulfillment === 'delivery' ? 'Delivery time' : 'Pickup time', value: formatTime(intent.eventAt) },
    { label: 'Fulfillment', value: intent.fulfillment === 'delivery' ? 'Delivery' : 'Pickup' },
  ]

  return (
    <div className="w-full px-4 py-8 pb-12 text-foreground sm:px-8 sm:py-10">
      <section className="mx-auto w-full max-w-7xl">
        <header className="mb-6 max-w-3xl">
          <h1 className="type-page-title">Review your catering request</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {submitted
              ? 'Your request is recorded in this demo. The restaurant has not received it.'
              : 'Check your event, selections, and contact details before asking Pearl Island to review your request.'}
          </p>
        </header>

        {submitted && (
          <Alert className="mb-6">
            <CheckCircle2 />
            <AlertTitle>Request recorded · {statusLabel[order.status]}</AlertTitle>
            <AlertDescription>
              <p>Nothing was sent to Pearl Island, and no payment was taken.</p>
              <p className="mt-2">
                {order.status === 'submitted' && 'Next step in this demo: switch to the Pearl Island team account to review the request.'}
                {order.status === 'needs_review' && 'Next step in this demo: the Pearl Island team account can review the flagged items.'}
                {order.status === 'confirmed' && 'The team accepted this request in the demo. No real order exists.'}
                {order.status === 'rejected' && 'The team declined this request in the demo.'}
                {order.status === 'awaiting_customer_approval' && 'The team proposed changes. Review the updated selections below and approve them if they work for you.'}
              </p>
              {order.status === 'awaiting_customer_approval' && order.revision === 'pending' && (
                <Button type="button" variant="outline" className="mt-3" onClick={customerApprove}>Approve changes</Button>
              )}
              {order.status === 'awaiting_customer_approval' && order.revision === 'approved' && (
                <p className="mt-2">You approved the changes. They are waiting for the team to accept.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {summary.flags.length > 0 && (
          <Alert className="mb-6">
            <CircleAlert />
            <AlertTitle>Items for the catering team to review</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc space-y-1">
                {summary.flags.map((flag) => <li key={flag.code}>{flag.reason}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Request details</CardTitle>
                <CardDescription className="mt-1">
                  {submitted ? 'Current event, selections, and contact details for this request.' : 'Review each section and edit it before submission.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section aria-labelledby="review-event-heading">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 id="review-event-heading" className="type-section-title">Event</h2>
                  {!submitted && <EditLink stage="event" onClick={goToStage} />}
                </div>
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {details.map((detail) => (
                  <div key={detail.label} className="min-w-0">
                      <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                    <dd className="mt-0.5 break-words font-medium">{detail.value || 'Not provided'}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <Separator />

              <section aria-labelledby="review-food-heading">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <h2 id="review-food-heading" className="type-section-title">Food selections</h2>
                  {!submitted && <EditLink stage="menu" onClick={goToStage} />}
                </div>
                <SelectionTable caption="Selected food and quantities" rows={foodRows} />
              </section>

              <Separator />

              <section aria-labelledby="review-supplies-heading">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <h2 id="review-supplies-heading" className="type-section-title">Supplies</h2>
                  {!submitted && <EditLink stage="supplies" onClick={goToStage} />}
                </div>
                {supplyGroup
                  ? <SelectionTable caption="Selected supplies and quantities" rows={supplyGroup.rows} />
                  : <p className="text-sm text-muted-foreground">No supplies needed.</p>}
              </section>

              <Separator />

              <section aria-labelledby="review-contact-heading">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 id="review-contact-heading" className="type-section-title">Contact and instructions</h2>
                  {!submitted && <EditLink stage="details" onClick={goToStage} />}
                </div>
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div className="min-w-0"><dt className="text-sm text-muted-foreground">Contact</dt><dd className="mt-0.5 break-words font-medium">{intent.contactName || 'Not provided'}</dd></div>
                  <div className="min-w-0"><dt className="text-sm text-muted-foreground">Email</dt><dd className="mt-0.5 break-all font-medium">{intent.email || 'Not provided'}</dd></div>
                  <div className="min-w-0"><dt className="text-sm text-muted-foreground">Phone</dt><dd className="mt-0.5 break-words font-medium">{intent.phone || 'Not provided'}</dd></div>
                  {intent.organization && <div className="min-w-0"><dt className="text-sm text-muted-foreground">Company or organization</dt><dd className="mt-0.5 break-words font-medium">{intent.organization}</dd></div>}
                  {intent.fulfillment === 'delivery' && <div className="min-w-0 sm:col-span-2"><dt className="text-sm text-muted-foreground">Delivery address</dt><dd className="mt-0.5 break-words font-medium">{deliveryAddress || 'Not provided'}</dd></div>}
                  <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Dietary needs</dt><dd className="mt-0.5 font-medium">{intent.dietary.length ? intent.dietary.join(', ') : 'None listed'}</dd></div>
                  <div className="min-w-0 sm:col-span-2"><dt className="text-sm text-muted-foreground">Custom request</dt><dd className="mt-0.5 break-words whitespace-pre-wrap">{intent.customRequest || 'None'}</dd></div>
                  <div className="min-w-0 sm:col-span-2"><dt className="text-sm text-muted-foreground">Additional notes</dt><dd className="mt-0.5 break-words whitespace-pre-wrap">{intent.notes || 'None'}</dd></div>
                </dl>
              </section>
            </CardContent>
          </Card>

          <aside className="lg:sticky lg:top-6" aria-label="Estimated total">
            <Card>
              <CardHeader>
                <CardTitle>Estimated total</CardTitle>
                <CardDescription>Food and supplies estimate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Food</span><span className="tabular-nums">{formatMoney(foodSubtotal)}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Supplies</span><span className="tabular-nums">{formatMoney(supplySubtotal)}</span></div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">Estimated total</span>
                  <span className="text-xl font-semibold tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">No tax, fees, or tip included.</p>
                <Separator className="my-4" />
                <div className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Guests</span><span>{intent.guestCount ?? '—'}</span></div>
                <div className="mt-2 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Entree servings</span><span>{summary.coverage.servings}{intent.guestCount !== null ? ` of ${intent.guestCount}` : ''}</span></div>
                {summary.coverage.shortfall > 0 && <p className="mt-2 text-sm text-muted-foreground">The current menu has {summary.coverage.shortfall} fewer entree servings than guests.</p>}
                <p className="mt-4 text-xs leading-5 text-muted-foreground">This is an estimate for review. Pearl Island has not confirmed the menu or final pricing.</p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
          {!submitted ? (
            <>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => navigate(stagePath('details'))}>Back to details</Button>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <Button type="button" className="min-h-11" disabled={submitting} onClick={submitRequest}>
                  {submitting ? 'Submitting…' : 'Submit request'}
                </Button>
                <p className="max-w-md text-sm text-muted-foreground sm:text-right">Submitting records this request in the demo on this device. Nothing is sent, and no payment is taken.</p>
                {lastError && (
                  <Alert variant="destructive" className="mt-1 max-w-md">
                    <CircleAlert />
                    <AlertTitle>We couldn’t record this request</AlertTitle>
                    <AlertDescription className="flex flex-col items-start gap-2">
                      <span>{lastError}</span>
                      <Button type="button" variant="outline" size="sm" onClick={submitRequest}>Try again</Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          ) : (
            <Button type="button" variant="outline" className="min-h-11" onClick={() => { navigate(stagePath('event')); reset() }}>Start a new request</Button>
          )}
        </div>
      </section>
    </div>
  )
}
