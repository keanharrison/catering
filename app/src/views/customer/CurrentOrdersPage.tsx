import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, CheckCircle2, ChevronRight, CircleAlert, MapPin, MessageSquareText, Utensils } from '../../components/icons'
import type { Order } from '../../data'
import { catalog } from '../../data'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Field, FieldDescription, FieldError, FieldLabel } from '../../components/ui/field'
import { Separator } from '../../components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { formatMoney } from '../../lib/format'
import { formatEventTime } from '../../lib/status'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { StaffStatusBadge } from '../staff/StaffStatusBadge'
import { buildOrderSummary } from './orderSummary'
import { isActive, latestMessage, needsCustomerAction } from './orderBuckets'

type OrderFilter = 'all' | 'action' | 'confirmed'

function InfoValue({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="type-small-label text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{children}</dd></div>
}

function SelectionTable({ title, rows }: { title: string; rows: ReturnType<typeof buildOrderSummary>['groups'][number]['rows'] }) {
  return (
    <section aria-label={title}>
      <h3 className="type-section-title mb-2">{title}</h3>
      {rows.length ? (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[22rem] sm:min-w-0">
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Quantity</TableHead><TableHead className="hidden text-right sm:table-cell">Unit price</TableHead><TableHead className="text-right">Line total</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row) => {
                const item = catalog.menu.find((entry) => entry.id === row.itemId)
                return <TableRow key={row.itemId}>
                  <TableCell className="min-w-28 whitespace-normal font-medium">{row.name}<span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:hidden">{item ? `${formatMoney(item.priceCents)} / ${item.unit}` : 'Unit price unavailable'}</span></TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{row.quantityLabel}</TableCell>
                  <TableCell className="hidden whitespace-nowrap text-right tabular-nums sm:table-cell">{item ? `${formatMoney(item.priceCents)} / ${item.unit}` : 'Unavailable'}</TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">{formatMoney(row.costCents)}</TableCell>
                </TableRow>
              })}
            </TableBody>
          </Table>
        </div>
      ) : <p className="text-sm text-muted-foreground">No {title.toLowerCase()} recorded.</p>}
    </section>
  )
}

function OrderDetails({ order, clock, needsReply, replyText, replyError, onReplyText, onReply, onReviewProposal }: {
  order: Order
  clock: string
  needsReply: boolean
  replyText: string
  replyError: string
  onReplyText: (text: string) => void
  onReply: (event: FormEvent<HTMLFormElement>) => void
  onReviewProposal: () => void
}) {
  const summary = buildOrderSummary(order, clock)
  const eventType = catalog.eventTypes.find((event) => event.id === order.intent.eventType)?.label ?? order.intent.eventType
  const food = summary.groups.filter((group) => group.category !== 'supply').flatMap((group) => group.rows)
  const supplies = summary.groups.filter((group) => group.category === 'supply').flatMap((group) => group.rows)
  const foodSubtotal = food.reduce((total, row) => total + row.costCents, 0)
  const supplySubtotal = supplies.reduce((total, row) => total + row.costCents, 0)
  const address = [order.intent.deliveryAddress, order.intent.deliveryCity, order.intent.deliveryState, order.intent.deliveryZip].filter(Boolean).join(', ')
  const pendingProposal = order.status === 'awaiting_customer_approval' && order.revision === 'pending'
  const last = latestMessage(order)

  return (
    <div className="grid gap-5 px-4 pb-6">
      {pendingProposal && <Alert>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>Review the revised proposal</AlertTitle>
        <AlertDescription className="mt-2 grid justify-items-start gap-3">
          <span>{last?.text || 'Pearl Island proposed changes to your selections. Review them before approving.'}</span>
          <Button onClick={onReviewProposal}>Review proposal</Button>
        </AlertDescription>
      </Alert>}

      {needsReply && <Alert>
        <MessageSquareText aria-hidden="true" />
        <AlertTitle>Pearl Island needs a response</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{last?.text}</p>
          <form className="mt-4 grid gap-3" onSubmit={onReply}>
            <Field data-invalid={Boolean(replyError)}>
              <FieldLabel htmlFor={`order-reply-${order.id}`}>Your response</FieldLabel>
              <Textarea id={`order-reply-${order.id}`} value={replyText} onChange={(event) => onReplyText(event.target.value)} aria-invalid={Boolean(replyError)} aria-describedby={`order-reply-hint-${order.id}${replyError ? ` order-reply-error-${order.id}` : ''}`} placeholder="Type your response" rows={3} />
              <FieldDescription id={`order-reply-hint-${order.id}`}>Required.</FieldDescription>
              {replyError && <FieldError id={`order-reply-error-${order.id}`}>{replyError}</FieldError>}
            </Field>
            <Button type="submit" className="justify-self-start">Save response</Button>
          </form>
        </AlertDescription>
      </Alert>}

      <section aria-labelledby={`event-heading-${order.id}`}>
        <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" /><h3 id={`event-heading-${order.id}`} className="type-section-title">Event and fulfillment</h3></div>
        <dl className="mt-3 grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <InfoValue label="Event type">{eventType}</InfoValue>
          <InfoValue label="Date and time">{formatEventTime(order.intent.eventAt)}</InfoValue>
          <InfoValue label="Guest count">{order.intent.guestCount ?? 'Not provided'}</InfoValue>
          <InfoValue label="Pickup or delivery"><span className="capitalize">{order.intent.fulfillment}</span></InfoValue>
          {order.intent.fulfillment === 'delivery' && <InfoValue label="Delivery address"><span className="inline-flex items-start gap-1"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{address || 'Not provided'}</span></InfoValue>}
        </dl>
      </section>

      <Separator />

      <section aria-labelledby={`contact-heading-${order.id}`}>
        <h3 id={`contact-heading-${order.id}`} className="type-section-title">Contact</h3>
        <dl className="mt-3 grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <InfoValue label="Name">{order.intent.contactName || 'Not provided'}</InfoValue>
          <InfoValue label="Organization">{order.intent.organization || 'Not provided'}</InfoValue>
          <InfoValue label="Email">{order.intent.email || 'Not provided'}</InfoValue>
          <InfoValue label="Phone">{order.intent.phone || 'Not provided'}</InfoValue>
        </dl>
      </section>

      <Separator />

      <section className="grid gap-5" aria-labelledby={`selections-heading-${order.id}`}>
        <div className="flex items-center gap-2"><Utensils className="size-4 text-muted-foreground" aria-hidden="true" /><h3 id={`selections-heading-${order.id}`} className="type-section-title">Food and supplies</h3></div>
        <SelectionTable title="Food" rows={food} />
        <SelectionTable title="Supplies" rows={supplies} />
      </section>

      <section className="grid gap-2 rounded-lg bg-muted/50 p-4" aria-label="Estimated cost summary">
        <h3 className="type-section-title">Estimated total</h3>
        <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Food subtotal</span><span className="tabular-nums">{formatMoney(foodSubtotal)}</span></div>
        <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Supplies subtotal</span><span className="tabular-nums">{formatMoney(supplySubtotal)}</span></div>
        <Separator className="my-1" />
        <div className="flex justify-between gap-4 font-semibold"><span>Estimated total</span><span className="tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span></div>
        <p className="text-xs text-muted-foreground">Estimate only; final charges may differ.</p>
      </section>

      {(order.intent.dietary.length > 0 || order.intent.customRequest || order.intent.notes || order.messages.length > 0) && <section className="grid gap-3" aria-labelledby={`notes-heading-${order.id}`}>
        <h3 id={`notes-heading-${order.id}`} className="type-section-title">Notes and updates</h3>
        {order.intent.dietary.length > 0 && <p className="text-sm"><span className="font-medium">Dietary preferences:</span> {order.intent.dietary.join(', ')}. These are preferences, not allergy or nutrition guarantees.</p>}
        {order.intent.customRequest && <p className="whitespace-pre-wrap text-sm"><span className="font-medium">Custom request:</span> {order.intent.customRequest}</p>}
        {order.intent.notes && <p className="whitespace-pre-wrap text-sm"><span className="font-medium">Event instructions:</span> {order.intent.notes}</p>}
        {order.messages.length > 0 && <div className="grid gap-2 border-t pt-3">
          {order.messages.map((message) => <div key={message.id} className="rounded-md bg-muted/50 p-3 text-sm"><p className="font-medium">{{ customer: 'You', staff: 'Pearl Island team', system: 'Request update' }[message.author]}</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{message.text}</p></div>)}
        </div>}
      </section>}
    </div>
  )
}

export function CurrentOrdersPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const customerReply = useDemoStore((state) => state.customerReply)
  const customerApprove = useDemoStore((state) => state.customerApprove)
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchParams] = useSearchParams()
  const orderIdFromLink = searchParams.get('order')

  // Sample fixtures belong to other illustrative customers; the customer account only sees requests created in this demo.
  const currentOrders = orders.filter((item) => !item.demoSample && isActive(item, clock))
  const counts: Record<OrderFilter, number> = {
    all: currentOrders.length,
    action: currentOrders.filter(needsCustomerAction).length,
    confirmed: currentOrders.filter((item) => item.status === 'confirmed').length,
  }
  const visible = currentOrders.filter((item) => {
    if (filter === 'action') return needsCustomerAction(item)
    if (filter === 'confirmed') return item.status === 'confirmed'
    return true
  }).sort((a, b) => new Date(a.intent.eventAt).getTime() - new Date(b.intent.eventAt).getTime())
  const selected = visible.find((item) => item.id === selectedId) ?? currentOrders.find((item) => item.id === selectedId) ?? null
  const summary = useMemo(() => selected ? buildOrderSummary(selected, clock) : null, [selected, clock])
  const needsReply = Boolean(selected && selected.status === 'needs_review' && latestMessage(selected)?.author === 'staff')
  const pendingApproval = Boolean(selected && selected.status === 'awaiting_customer_approval' && selected.revision === 'pending')

  useEffect(() => {
    if (!orderIdFromLink) return
    const linkedOrder = orders.find((item) => item.id === orderIdFromLink && !item.demoSample && isActive(item, clock))
    if (!linkedOrder) return
    setSelectedId(linkedOrder.id)
    setDetailOpen(true)
  }, [orderIdFromLink, orders, clock])

  function openOrder(item: Order) {
    setSelectedId(item.id)
    setDetailOpen(true)
    setReplyText('')
    setReplyError('')
    setActionError('')
    setNotice('')
  }

  function saveReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    if (!replyText.trim()) {
      setReplyError('Enter a response before saving.')
      return
    }
    activateOrder(selected.id)
    customerReply(replyText.trim())
    const error = useDemoStore.getState().lastError
    if (error) {
      setReplyError(error)
      return
    }
    setReplyText('')
    setReplyError('')
    setNotice('Your response was saved locally. The Pearl Island team was not notified.')
  }

  function approveProposal() {
    if (!selected) return
    activateOrder(selected.id)
    customerApprove()
    const error = useDemoStore.getState().lastError
    if (error) {
      setActionError(error)
      return
    }
    setApprovalOpen(false)
    setActionError('')
    setNotice('Proposal approval was saved locally. The Pearl Island team was not notified.')
  }

  const newRequestButton = <Button nativeButton={false} render={<Link to={routes.customer} />}>New catering request</Button>

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="type-page-title">Current orders</h1></div>
        {newRequestButton}
      </header>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as OrderFilter)}>
        <TabsList className="grid h-auto w-full grid-cols-3 sm:max-w-lg">
          <TabsTrigger value="all">All active <span className="text-xs text-muted-foreground">{counts.all}</span></TabsTrigger>
          <TabsTrigger value="action">Needs your action <span className="text-xs text-muted-foreground">{counts.action}</span></TabsTrigger>
          <TabsTrigger value="confirmed">Accepted <span className="text-xs text-muted-foreground">{counts.confirmed}</span></TabsTrigger>
        </TabsList>
      </Tabs>

      {currentOrders.length === 0 ? (
        <Card className="mt-4"><CardContent className="p-0">
          <Empty className="min-h-72">
            <EmptyHeader><EmptyMedia variant="tile" tone={destinationTones.currentOrders}><destinationIcons.currentOrders /></EmptyMedia><EmptyTitle>No active orders yet</EmptyTitle><EmptyDescription>Requests you submit will appear here with their current status.</EmptyDescription></EmptyHeader>
            <EmptyContent>{newRequestButton}</EmptyContent>
          </Empty>
        </CardContent></Card>
      ) : visible.length === 0 ? (
        <Card className="mt-4"><CardContent className="p-0">
          <Empty className="min-h-64">
            <EmptyHeader><EmptyMedia variant="tile" tone={destinationTones.currentOrders}><destinationIcons.currentOrders /></EmptyMedia><EmptyTitle>No orders in this view</EmptyTitle><EmptyDescription>Your active requests are in other statuses. Switch to All active to see them.</EmptyDescription></EmptyHeader>
            <EmptyContent><Button variant="outline" onClick={() => setFilter('all')}>Show all active orders</Button></EmptyContent>
          </Empty>
        </CardContent></Card>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visible.map((item) => {
            const orderSummary = buildOrderSummary(item, clock)
            const action = needsCustomerAction(item)
            return <Card key={item.id} className="min-w-0">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><CardTitle className="text-base">Request {item.id}</CardTitle><CardDescription className="mt-1">{formatEventTime(item.intent.eventAt)}</CardDescription></div>
                  <StaffStatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {action && <div className="flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning"><CircleAlert className="size-4 shrink-0" aria-hidden="true" /><span>{pendingApproval && selected?.id === item.id ? 'Revised proposal needs your approval' : item.status === 'awaiting_customer_approval' ? 'Revised proposal needs your approval' : 'Pearl Island requested a response'}</span></div>}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <InfoValue label="Guests">{item.intent.guestCount ?? 'Not provided'}</InfoValue>
                  <InfoValue label="Pickup or delivery"><span className="capitalize">{item.intent.fulfillment}</span></InfoValue>
                </dl>
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                  <div><p className="text-xs text-muted-foreground">Estimated total</p><p className="mt-0.5 font-semibold tabular-nums">{formatMoney(orderSummary.estimate.subtotalCents)}</p></div>
                  <Button variant="outline" size="sm" onClick={() => openOrder(item)}>View order<ChevronRight aria-hidden="true" /></Button>
                </div>
              </CardContent>
            </Card>
          })}
        </div>
      )}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="data-[side=right]:w-full overflow-y-auto sm:max-w-2xl" aria-label="Order details">
          {selected && <>
            <SheetHeader className="border-b px-5 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
                <div className="min-w-0"><SheetTitle>Request {selected.id}</SheetTitle><SheetDescription className="mt-1">{formatEventTime(selected.intent.eventAt)}</SheetDescription></div>
                <StaffStatusBadge status={selected.status} />
              </div>
            </SheetHeader>
            {notice && <Alert className="mx-4 mt-4"><CheckCircle2 aria-hidden="true" /><AlertTitle>Update saved</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
            {actionError && <Alert variant="destructive" className="mx-4 mt-4"><CircleAlert aria-hidden="true" /><AlertTitle>Could not save approval</AlertTitle><AlertDescription>{actionError}</AlertDescription></Alert>}
            <OrderDetails order={selected} clock={clock} needsReply={needsReply} replyText={replyText} replyError={replyError} onReplyText={setReplyText} onReply={saveReply} onReviewProposal={() => { setActionError(''); setApprovalOpen(true) }} />
          </>}
        </SheetContent>
      </Sheet>

      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Approve revised proposal?</DialogTitle><DialogDescription>Review the proposed selections and updated estimate.</DialogDescription></DialogHeader>
          {summary && <div className="max-h-[55vh] overflow-y-auto px-1">
            <div className="mb-4 flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Request {selected?.id}</span><Badge variant="outline">Proposed by Pearl Island</Badge></div>
            <div className="grid gap-5">{summary.groups.filter((group) => group.category !== 'supply').map((group) => <SelectionTable key={group.category} title={group.title} rows={group.rows} />)}<SelectionTable title="Supplies" rows={summary.groups.filter((group) => group.category === 'supply').flatMap((group) => group.rows)} /></div>
            <div className="mt-4 flex justify-between border-t pt-3 font-semibold"><span>Updated estimated total</span><span className="tabular-nums">{formatMoney(summary.estimate.subtotalCents)}</span></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setApprovalOpen(false)}>Cancel</Button><Button onClick={approveProposal}>Approve proposal</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
