import { Link } from 'react-router-dom'
import { Printer, TriangleAlert } from '../../components/icons'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { catalog } from '../../data'
import { formatMoney } from '../../lib/format'
import { formatEventTime } from '../../lib/status'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { buildOrderSummary } from '../customer/orderSummary'

function LabeledValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="type-small-label text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm">{children}</dd>
    </div>
  )
}

function HandoffTable({ title, rows }: { title: string; rows: ReturnType<typeof buildOrderSummary>['groups'][number]['rows'] }) {
  return (
    <section className="handoff-keep-together" aria-label={title}>
      <h3 className="type-section-title mb-2">{title}</h3>
      {rows.length ? (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[21rem] sm:min-w-0">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const item = catalog.menu.find((entry) => entry.id === row.itemId)
                return (
                  <TableRow key={row.itemId}>
                    <TableCell className="min-w-32 font-medium">
                      {row.name}
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:hidden">
                        {item ? `${formatMoney(item.priceCents)} / ${item.unit}` : 'Unit price unavailable'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.quantityLabel}</TableCell>
                    <TableCell className="hidden whitespace-nowrap text-right tabular-nums sm:table-cell">
                      {item ? `${formatMoney(item.priceCents)} / ${item.unit}` : 'Unavailable'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">{formatMoney(row.costCents)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} recorded.</p>
      )}
    </section>
  )
}

export function HandoffPage() {
  const activeOrder = useDemoStore((state) => state.order)
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)
  // Show the selected request when it is accepted; otherwise the most recent request this session accepted.
  const order = activeOrder.status === 'confirmed'
    ? activeOrder
    : [...orders].reverse().find((item) => item.status === 'confirmed' && !item.demoSample) ?? activeOrder
  const backButton = <Button variant="outline" nativeButton={false} render={<Link to={routes.staff} />}>Back to requests</Button>

  if (order.status !== 'confirmed') {
    return (
      <section className="handoff-page mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <Card>
          <CardHeader>
            <CardTitle>No accepted request yet</CardTitle>
            <CardDescription>
              Accept a request from Staff Requests to prepare a read-only handoff summary.
            </CardDescription>
          </CardHeader>
          <CardFooter className="print:hidden">{backButton}</CardFooter>
        </Card>
      </section>
    )
  }

  const { intent } = order
  const summary = buildOrderSummary(order, clock)
  const eventType = catalog.eventTypes.find((item) => item.id === intent.eventType)?.label ?? intent.eventType
  const food = summary.groups.filter((group) => group.category !== 'supply').flatMap((group) => group.rows)
  const supplies = summary.groups.filter((group) => group.category === 'supply').flatMap((group) => group.rows)
  const foodSubtotal = food.reduce((sum, row) => sum + row.costCents, 0)
  const suppliesSubtotal = supplies.reduce((sum, row) => sum + row.costCents, 0)
  const address = [intent.deliveryAddress, intent.deliveryCity, intent.deliveryState, intent.deliveryZip].filter(Boolean).join(', ')

  return (
    <section className="handoff-page mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <div className="handoff-print-content">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="type-page-title">Staff handoff</h1>
            <p className="mt-2 text-sm text-muted-foreground">Accepted order · Request {order.id}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">Accepted</Badge>
        </header>

        {summary.flags.length > 0 || intent.dietary.length > 0 || intent.customRequest ? (
          <Alert className="handoff-keep-together mb-5">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>Preparation warnings</AlertTitle>
            <AlertDescription className="space-y-2">
              {summary.flags.map((flag) => <p key={flag.code}><span className="font-medium">Review:</span> {flag.reason}</p>)}
              {intent.dietary.length > 0 && <p><span className="font-medium">Dietary preferences:</span> {intent.dietary.join(', ')}. These are customer-noted preferences, not verified allergy or nutrition information.</p>}
              {intent.customRequest && <p><span className="font-medium">Custom request for staff review:</span> {intent.customRequest}</p>}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-5">
          <Card className="handoff-keep-together">
            <CardHeader>
              <CardTitle>Event and fulfillment</CardTitle>
              <CardDescription>{eventType}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <LabeledValue label="Event date and time">{formatEventTime(intent.eventAt)}</LabeledValue>
                <LabeledValue label="Guest count">{intent.guestCount ?? 'Not provided'}</LabeledValue>
                <LabeledValue label="Fulfillment"><span className="capitalize">{intent.fulfillment}</span></LabeledValue>
                {intent.fulfillment === 'delivery' && <LabeledValue label="Delivery address">{address || 'Not provided'}</LabeledValue>}
              </dl>
            </CardContent>
          </Card>

          <Card className="handoff-keep-together">
            <CardHeader><CardTitle>Customer contact</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <LabeledValue label="Name">{intent.contactName || 'Not provided'}</LabeledValue>
                <LabeledValue label="Organization">{intent.organization || 'Not provided'}</LabeledValue>
                <LabeledValue label="Email">{intent.email || 'Not provided'}</LabeledValue>
                <LabeledValue label="Phone">{intent.phone || 'Not provided'}</LabeledValue>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Food and supplies</CardTitle>
              <CardDescription>Accepted quantities and estimated prices</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <HandoffTable title="Food" rows={food} />
              <Separator />
              <HandoffTable title="Supplies" rows={supplies} />
            </CardContent>
          </Card>

          <Card className="handoff-keep-together">
            <CardHeader><CardTitle>Cost summary</CardTitle><CardDescription>Estimate based on the accepted selections</CardDescription></CardHeader>
            <CardContent>
              <dl className="ml-auto grid max-w-sm gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Food subtotal</dt><dd className="tabular-nums">{formatMoney(foodSubtotal)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Supplies subtotal</dt><dd className="tabular-nums">{formatMoney(suppliesSubtotal)}</dd></div>
                <Separator />
                <div className="flex justify-between gap-4 text-base font-semibold"><dt>Estimated total</dt><dd className="tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</dd></div>
              </dl>
            </CardContent>
          </Card>

          {intent.customRequest || intent.notes ? (
            <Card className="handoff-keep-together">
              <CardHeader><CardTitle>Customer notes</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {intent.customRequest && <div><h3 className="type-section-title">Custom request</h3><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{intent.customRequest}</p></div>}
                {intent.notes && <div><h3 className="type-section-title">{intent.fulfillment === 'delivery' ? 'Delivery instructions and notes' : 'Pickup instructions and notes'}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{intent.notes}</p></div>}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2 print:hidden">
        {backButton}
        <Button variant="outline" onClick={() => window.print()}><Printer aria-hidden="true" />Print handoff</Button>
      </div>
    </section>
  )
}
