import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, MapPin, Search, Utensils } from '../../components/icons'
import type { Order, OrderLine } from '../../data'
import { catalog } from '../../data'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Input } from '../../components/ui/input'
import { Separator } from '../../components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatEventTime } from '../../lib/status'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { StaffStatusBadge } from '../staff/StaffStatusBadge'
import { isHistorical } from './orderBuckets'

function eventTypeLabel(order: Order) {
  return catalog.eventTypes.find((event) => event.id === order.intent.eventType)?.label ?? order.intent.eventType
}

function quantityLabel(line: OrderLine) {
  const item = catalog.menu.find((menuItem) => menuItem.id === line.itemId)
  if (!item) return `${line.units} units`
  const unit = item.unit
  return `${line.units} ${unit === 'each' || unit === 'person' ? unit : `${unit}${line.units === 1 ? '' : 's'}`}`
}

function HistoryTable({ title, rows }: { title: string; rows: OrderLine[] }) {
  return <section aria-label={title}>
    <h3 className="type-section-title mb-2">{title}</h3>
    {rows.length ? <div className="overflow-x-auto rounded-md border">
      <Table className="w-full min-w-0 sm:min-w-[28rem]">
        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Quantity</TableHead><TableHead className="hidden text-right sm:table-cell">Unit price</TableHead><TableHead className="hidden text-right sm:table-cell">Line total</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((line) => {
          const item = catalog.menu.find((menuItem) => menuItem.id === line.itemId)
          return <TableRow key={line.itemId}>
            <TableCell className="min-w-28 whitespace-normal font-medium">{item?.name ?? line.itemId}</TableCell>
            <TableCell className="whitespace-nowrap">{quantityLabel(line)}</TableCell>
            <TableCell className="hidden whitespace-nowrap text-right text-muted-foreground sm:table-cell">Not recorded</TableCell>
            <TableCell className="hidden whitespace-nowrap text-right text-muted-foreground sm:table-cell">Not recorded</TableCell>
          </TableRow>
        })}</TableBody>
      </Table>
    </div> : <p className="text-sm text-muted-foreground">No {title.toLowerCase()} recorded.</p>}
  </section>
}

function HistoricalOrderDetails({ order }: { order: Order }) {
  const food = order.lines.filter((line) => catalog.menu.find((item) => item.id === line.itemId)?.category !== 'supply')
  const supplies = order.lines.filter((line) => catalog.menu.find((item) => item.id === line.itemId)?.category === 'supply')
  const address = [order.intent.deliveryAddress, order.intent.deliveryCity, order.intent.deliveryState, order.intent.deliveryZip].filter(Boolean).join(', ')

  return <div className="grid gap-5 px-4 pb-6">
    <section aria-labelledby={`history-event-${order.id}`}>
      <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" /><h3 id={`history-event-${order.id}`} className="type-section-title">Event and fulfillment</h3></div>
      <dl className="mt-3 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <div><dt className="type-small-label text-muted-foreground">Event type</dt><dd className="mt-1 text-sm">{eventTypeLabel(order)}</dd></div>
        <div><dt className="type-small-label text-muted-foreground">Date and time</dt><dd className="mt-1 text-sm">{formatEventTime(order.intent.eventAt)}</dd></div>
        <div><dt className="type-small-label text-muted-foreground">Guest count</dt><dd className="mt-1 text-sm">{order.intent.guestCount ?? 'Not provided'}</dd></div>
        <div><dt className="type-small-label text-muted-foreground">Pickup or delivery</dt><dd className="mt-1 capitalize text-sm">{order.intent.fulfillment}</dd></div>
        {order.intent.fulfillment === 'delivery' && <div className="sm:col-span-2"><dt className="type-small-label text-muted-foreground">Delivery address</dt><dd className="mt-1 flex items-start gap-1 break-words text-sm"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{address || 'Not provided'}</dd></div>}
      </dl>
    </section>

    <Separator />

    <section aria-labelledby={`history-contact-${order.id}`}>
      <h3 id={`history-contact-${order.id}`} className="type-section-title">Contact</h3>
      <dl className="mt-3 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {([['Name', order.intent.contactName], ['Organization', order.intent.organization], ['Email', order.intent.email], ['Phone', order.intent.phone]] as const).map(([label, value]) => <div key={label}><dt className="type-small-label text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value || 'Not provided'}</dd></div>)}
      </dl>
    </section>

    <Separator />

    <section className="grid gap-5" aria-label="Historical selections">
      <div className="flex items-center gap-2"><Utensils className="size-4 text-muted-foreground" aria-hidden="true" /><h3 className="type-section-title">Food and supplies</h3></div>
      <HistoryTable title="Food" rows={food} />
      <HistoryTable title="Supplies" rows={supplies} />
    </section>

    <section className="grid gap-2 rounded-lg bg-muted/50 p-4" aria-label="Recorded total">
      <h3 className="type-section-title">Recorded total</h3>
      <p className="text-sm text-muted-foreground">Total not recorded.</p>
    </section>

    {(order.intent.dietary.length > 0 || order.intent.customRequest || order.intent.notes || order.messages.length > 0) && <section className="grid gap-3" aria-label="Notes and updates">
      <h3 className="type-section-title">Notes and updates</h3>
      {order.intent.dietary.length > 0 && <p className="text-sm"><span className="font-medium">Dietary preferences:</span> {order.intent.dietary.join(', ')}. These are preferences, not allergy or nutrition guarantees.</p>}
      {order.intent.customRequest && <p className="whitespace-pre-wrap text-sm"><span className="font-medium">Custom request:</span> {order.intent.customRequest}</p>}
      {order.intent.notes && <p className="whitespace-pre-wrap text-sm"><span className="font-medium">Event instructions:</span> {order.intent.notes}</p>}
      {order.messages.length > 0 && <div className="grid gap-2 border-t pt-3">
        {order.messages.map((message) => <div key={message.id} className="rounded-md bg-muted/50 p-3 text-sm"><p className="font-medium">{{ customer: 'You', staff: 'Pearl Island team', system: 'Request update' }[message.author]}</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{message.text}</p></div>)}
      </div>}
    </section>}
  </div>
}

export function PastOrdersPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const orderIdFromLink = searchParams.get('order')

  // Sample fixtures are illustrative records for other customers and stay outside this account's history.
  const customerHistory = useMemo(() => orders
    .filter((order) => !order.demoSample && isHistorical(order, clock))
    .sort((a, b) => new Date(b.intent.eventAt).getTime() - new Date(a.intent.eventAt).getTime()), [orders, clock])
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visible = customerHistory.filter((order) => {
    if (!normalizedQuery) return true
    const eventType = eventTypeLabel(order)
    return `${order.id} ${order.intent.eventType} ${eventType}`.toLocaleLowerCase().includes(normalizedQuery)
  })
  const selected = customerHistory.find((order) => order.id === selectedId) ?? null
  const newRequestButton = <Button nativeButton={false} render={<Link to={routes.customer} />}>New catering request</Button>

  useEffect(() => {
    if (!orderIdFromLink) return
    const linkedOrder = customerHistory.find((order) => order.id === orderIdFromLink)
    if (!linkedOrder) return
    setSelectedId(linkedOrder.id)
    setDetailOpen(true)
  }, [orderIdFromLink, customerHistory])

  return <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="type-page-title">Past orders</h1></div>
      {newRequestButton}
    </header>


    <div className="mb-4 max-w-sm">
      <label htmlFor="past-order-search" className="sr-only">Search by request ID or event type</label>
      <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="past-order-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search request ID or event type" className="pl-9" /></div>
    </div>

    {customerHistory.length === 0 ? <Card><CardContent className="p-0"><Empty className="min-h-72">
      <EmptyHeader><EmptyMedia variant="tile" tone={destinationTones.pastOrders}><destinationIcons.pastOrders /></EmptyMedia><EmptyTitle>No past orders</EmptyTitle><EmptyDescription>Historical requests will appear here after they reach a final status or a confirmed event date has passed.</EmptyDescription></EmptyHeader>
      <EmptyContent>{newRequestButton}</EmptyContent>
    </Empty></CardContent></Card> : visible.length === 0 ? <Card><CardContent className="p-0"><Empty className="min-h-64">
      <EmptyHeader><EmptyMedia variant="tile"><Search /></EmptyMedia><EmptyTitle>No matching orders</EmptyTitle><EmptyDescription>Try another request ID or event type.</EmptyDescription></EmptyHeader>
      <EmptyContent><Button variant="outline" onClick={() => setQuery('')}>Clear search</Button></EmptyContent>
    </Empty></CardContent></Card> : <div className="grid gap-3 md:grid-cols-2">
      {visible.map((order) => <Card key={order.id} className="min-w-0">
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><CardTitle className="text-base">Request {order.id}</CardTitle><CardDescription className="mt-1">{formatEventTime(order.intent.eventAt)}</CardDescription></div>
          <StaffStatusBadge status={order.status} />
        </div></CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{eventTypeLabel(order)}</p>
          {order.status === 'confirmed' && <Badge variant="outline" className="w-fit">Event completion not recorded</Badge>}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="type-small-label text-muted-foreground">Guests</dt><dd className="mt-1">{order.intent.guestCount ?? 'Not provided'}</dd></div>
            <div><dt className="type-small-label text-muted-foreground">Pickup or delivery</dt><dd className="mt-1 capitalize">{order.intent.fulfillment}</dd></div>
          </dl>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div><p className="text-xs text-muted-foreground">Recorded total</p><p className="mt-0.5 text-sm font-medium">Not recorded</p></div>
            <Button variant="outline" size="sm" onClick={() => { setSelectedId(order.id); setDetailOpen(true) }}>View order</Button>
          </div>
        </CardContent>
      </Card>)}
    </div>}

    <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
      <SheetContent side="right" className="data-[side=right]:w-full overflow-y-auto sm:max-w-2xl" aria-label="Past order details">
        {selected && <>
          <SheetHeader className="border-b px-5 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pr-8"><div className="min-w-0"><SheetTitle>Request {selected.id}</SheetTitle><SheetDescription className="mt-1">{formatEventTime(selected.intent.eventAt)} · {eventTypeLabel(selected)}</SheetDescription></div><StaffStatusBadge status={selected.status} /></div>
          </SheetHeader>
          <HistoricalOrderDetails order={selected} />
        </>}
      </SheetContent>
    </Sheet>
  </section>
}
