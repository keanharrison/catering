import { useEffect, useRef, useState } from 'react'
import { useDemoStore } from '../../state/store'
import { statusLabel, statusTone } from '../../lib/status'
import { canAccept } from '../../state/orderMachine'
import { buildOrderSummary } from '../customer/orderSummary'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { destinationIcons } from '../../components/destinationIcons'
import { RequestDetails } from './RequestDetails'
import type { Order } from '../../data'
import { dateOnly, filterLabel, matchesFilter, shortRequestId, type RequestFilter } from './requestFilters'

type ActionPanel = 'ask' | 'edit' | 'decline' | null

function RequestStatus({ status }: { status: Order['status'] }) {
  const tone = {
    neutral: 'bg-muted-foreground',
    review: 'bg-warning',
    info: 'bg-info',
    confirmed: 'bg-success',
    blocked: 'bg-destructive',
  }[statusTone[status]]

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm" aria-label={statusLabel[status]}>
      <span aria-hidden="true" className={`size-2 rounded-full ${tone}`} />
      {statusLabel[status]}
    </span>
  )
}

export function StaffPage() {
  const order = useDemoStore((state) => state.order)
  const orders = useDemoStore((state) => state.orders)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const clearError = useDemoStore((state) => state.clearError)
  const accept = useDemoStore((state) => state.accept)
  const requestClarification = useDemoStore((state) => state.requestClarification)
  const revise = useDemoStore((state) => state.revise)
  const reject = useDemoStore((state) => state.reject)
  const [filter, setFilter] = useState<RequestFilter>('all')
  const [panel, setPanel] = useState<ActionPanel>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const sheetTitleRef = useRef<HTMLHeadingElement>(null)
  const savingQuestionRef = useRef(false)
  const [selectedId, setSelectedId] = useState<string | null>(() => order.status === 'draft' ? orders[0]?.id ?? null : order.id)

  const requests = orders
  const filteredRequests = requests.filter((request) => matchesFilter(request, filter))
  const selectedOrder = filteredRequests.find((request) => request.id === selectedId) ?? null
  const counts: Record<RequestFilter, number> = {
    all: requests.length,
    review: requests.filter((request) => matchesFilter(request, 'review')).length,
    awaiting: requests.filter((request) => matchesFilter(request, 'awaiting')).length,
    confirmed: requests.filter((request) => matchesFilter(request, 'confirmed')).length,
  }
  const summary = selectedOrder ? buildOrderSummary(selectedOrder, clock) : null
  const acceptCheck = selectedOrder ? canAccept(selectedOrder, 'staff') : null
  const canAsk = selectedOrder?.status === 'submitted' || selectedOrder?.status === 'needs_review'
  const canEdit = canAsk || selectedOrder?.status === 'awaiting_customer_approval'
  const closed = selectedOrder?.status === 'confirmed' || selectedOrder?.status === 'rejected'

  useEffect(() => {
    if (selectedOrder && selectedOrder.id !== order.id) activateOrder(selectedOrder.id)
  }, [activateOrder, order.id, selectedOrder])

  function selectRequest(request: Order) {
    setSelectedId(request.id)
    activateOrder(request.id)
    setNotice(null)
    clearError()
    setPanel(null)
    if (window.matchMedia('(max-width: 767px)').matches) setDetailsOpen(true)
  }

  function changeFilter(value: string) {
    const next = value as RequestFilter
    setFilter(next)
    setPanel(null)
    setNotice(null)
    clearError()
    const nextRequest = requests.find((request) => matchesFilter(request, next))
    setSelectedId(nextRequest?.id ?? null)
    setDetailsOpen(false)
  }

  function acceptRequest() {
    if (!selectedOrder) return
    setNotice(null)
    clearError()
    accept('staff')
    const state = useDemoStore.getState()
    if (state.lastError) return
    setNotice('Request accepted.')
    setPanel(null)
    if (filter !== 'all') setFilter('confirmed')
    setSelectedId(state.order.id)
  }

  function saveQuestion(text: string) {
    if (savingQuestionRef.current) return
    savingQuestionRef.current = true
    requestClarification(text)
    const state = useDemoStore.getState()
    if (state.lastError) {
      savingQuestionRef.current = false
      return
    }
    setPanel(null)
    setNotice('Question recorded locally. Nothing was sent to the customer.')
  }

  function saveProposal(lines: Order['lines']) {
    revise(lines)
    const state = useDemoStore.getState()
    if (state.lastError) return
    setPanel(null)
    setNotice('Proposal saved locally. The customer must approve the changes before acceptance; nothing was sent.')
    if (filter !== 'all') setFilter('awaiting')
    setSelectedId(state.order.id)
  }

  function declineRequest(reason: string) {
    reject(reason)
    const state = useDemoStore.getState()
    if (state.lastError) return
    setPanel(null)
    setNotice('Request declined.')
    // Declined requests only show under All.
    if (filter !== 'all') setFilter('all')
    setSelectedId(state.order.id)
  }

  function clearFilters() {
    setFilter('all')
    setSelectedId(requests[0]?.id ?? null)
  }

  const detailContent = selectedOrder && summary && acceptCheck ? (
    <RequestDetails
      order={selectedOrder}
      summary={summary}
      acceptAllowed={acceptCheck.allowed}
      acceptReason={acceptCheck.reason}
      canAsk={canAsk}
      canEdit={canEdit}
      closed={closed}
      notice={notice}
      error={lastError}
      onAccept={acceptRequest}
      onAsk={() => { savingQuestionRef.current = false; setNotice(null); clearError(); setPanel('ask') }}
      onEdit={() => { setNotice(null); clearError(); setPanel('edit') }}
      onDecline={() => { setNotice(null); clearError(); setPanel('decline') }}
      panel={panel}
      onSaveQuestion={saveQuestion}
      onSaveProposal={saveProposal}
      onSaveDecline={declineRequest}
      onCancelPanel={() => { clearError(); setPanel(null) }}
    />
  ) : null

  return (
    <section className="staff-requests-container mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="type-page-title text-foreground">Catering requests</h1>
      </header>

      <Tabs value={filter} onValueChange={changeFilter} className="gap-4">
        <TabsList aria-label="Filter requests by status" className="overflow-x-auto pb-px [&_[data-slot=tabs-trigger]]:shrink-0">
          {(Object.keys(filterLabel) as RequestFilter[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {filterLabel[key]}
              <span className="tabular-nums text-muted-foreground" aria-label={`${counts[key]} ${counts[key] === 1 ? 'request' : 'requests'}`}>{counts[key]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-0">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <Empty className="min-h-72 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><destinationIcons.requests aria-hidden="true" /></EmptyMedia>
                    <EmptyTitle>No requests yet</EmptyTitle>
                    <EmptyDescription>
                      A catering request will appear here after it is submitted from the customer ordering flow.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <Empty className="min-h-72 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><destinationIcons.requests aria-hidden="true" /></EmptyMedia>
                    <EmptyTitle>No matching requests</EmptyTitle>
                    <EmptyDescription>
                      There are no requests in “{filterLabel[filter]}” right now. Clear the filter to see all requests.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="staff-requests-layout grid min-w-0 items-start gap-5">
              <Card className="min-w-0">
                <CardHeader>
                  <CardTitle>Request list</CardTitle>
                  <CardDescription>Select a request to review its details and actions.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="hidden md:block">
                    <Table className="min-w-[700px] staff-request-table">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Request ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Event date</TableHead>
                          <TableHead className="text-right">Guests</TableHead>
                          <TableHead>Fulfillment</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            tabIndex={0}
                            aria-label={`${request.intent.contactName || 'Customer'}, ${dateOnly(request.intent.eventAt)}, ${request.intent.guestCount ?? 'Guest count not provided'} guests, ${request.intent.fulfillment}, ${statusLabel[request.status]}`}
                            aria-selected={selectedId === request.id}
                            data-state={selectedId === request.id ? 'selected' : undefined}
                            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=selected]:bg-accent/70 hover:bg-muted/60"
                            onClick={() => selectRequest(request)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectRequest(request)
                              }
                            }}
                          >
                            <TableCell className="text-xs tabular-nums text-muted-foreground" title={request.id}>{shortRequestId(request.id)}</TableCell>
                            <TableCell className="max-w-48 whitespace-normal break-words font-medium">{request.intent.contactName || 'Customer'}</TableCell>
                            <TableCell>{dateOnly(request.intent.eventAt)}</TableCell>
                            <TableCell className="text-right tabular-nums">{request.intent.guestCount ?? '—'}</TableCell>
                            <TableCell className="capitalize">{request.intent.fulfillment}</TableCell>
                            <TableCell><RequestStatus status={request.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ul className="divide-y md:hidden" aria-label="Catering requests">
                    {filteredRequests.map((request) => (
                      <li key={request.id}>
                        <button
                          type="button"
                          onClick={() => selectRequest(request)}
                          aria-pressed={selectedId === request.id}
                          className="flex min-h-20 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-pressed:bg-muted/70"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{request.intent.contactName || 'Customer'} </span>
                            <span className="mt-1 block truncate text-caption tabular-nums text-muted-foreground" title={request.id}>{shortRequestId(request.id)}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {dateOnly(request.intent.eventAt)} · {request.intent.guestCount ?? '—'} guests · {request.intent.fulfillment}
                            </span>
                          </span>
                          <RequestStatus status={request.status} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="hidden min-w-0 md:block">
                {detailContent ?? (
                  <Card className="min-h-72">
                    <CardContent className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
                      Select a request to see its details.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" initialFocus={() => sheetTitleRef.current} className="max-h-[92svh] min-h-[75svh] gap-0 overflow-y-auto rounded-t-2xl px-4 pb-5 sm:px-6 md:hidden">
          <SheetHeader className="px-0 pb-4 pr-10 text-left">
            <SheetTitle ref={sheetTitleRef} tabIndex={-1}>Request details</SheetTitle>
            <SheetDescription>Review the event and record a staff action.</SheetDescription>
          </SheetHeader>
          {detailContent}
        </SheetContent>
      </Sheet>
    </section>
  )
}
