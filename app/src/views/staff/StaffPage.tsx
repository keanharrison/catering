import { useRef, useState } from 'react'
import { useDemoStore } from '../../state/store'
import { statusLabel, statusTone } from '../../lib/status'
import { canAccept } from '../../state/orderMachine'
import { buildOrderSummary } from '../customer/orderSummary'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Input } from '../../components/ui/input'
import { OptionSelect } from '../../components/OptionSelect'
import { ArrowUp, ChevronsUpDown, Search } from '../../components/icons'
import { catalog } from '../../data'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { destinationIcons } from '../../components/destinationIcons'
import { RequestDetails } from './RequestDetails'
import type { Order } from '../../data'
import { dateOnly, defaultSort, hasCriteria, matchesCriteria, matchesView, noCriteria, requestId, sortRequests, updatedLabel, viewLabel, type RequestCriteria, type RequestView, type SortKey, type SortState } from './requestFilters'

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
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span aria-hidden="true" className={`size-2 rounded-full ${tone}`} />
      {statusLabel[status]}
    </span>
  )
}

type SortHeadProps = { label: string; sortKey: SortKey; sort: SortState; onSort: (key: SortKey) => void; className?: string; align?: 'right' }

function SortHead({ label, sortKey, sort, onSort, className = '', align }: SortHeadProps) {
  const active = sort.key === sortKey
  return (
    <TableHead className={className} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${align === 'right' ? 'flex-row-reverse' : ''} ${active ? 'text-foreground' : ''}`}
      >
        {label}
        {active
          ? <ArrowUp aria-hidden="true" className={`size-3 ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
          : <ChevronsUpDown aria-hidden="true" className="size-3 opacity-50" />}
      </button>
    </TableHead>
  )
}

export function StaffPage() {
  const orders = useDemoStore((state) => state.orders)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const clearError = useDemoStore((state) => state.clearError)
  const accept = useDemoStore((state) => state.accept)
  const deleteOrder = useDemoStore((state) => state.deleteRequest)
  const requestClarification = useDemoStore((state) => state.requestClarification)
  const revise = useDemoStore((state) => state.revise)
  const reject = useDemoStore((state) => state.reject)
  const [view, setView] = useState<RequestView>('all')
  const [criteria, setCriteria] = useState<RequestCriteria>(noCriteria)
  const [sort, setSort] = useState<SortState>(defaultSort)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [panel, setPanel] = useState<ActionPanel>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const requests = orders
  const visible = sortRequests(requests.filter((request) => matchesView(request, view, clock) && matchesCriteria(request, criteria)), sort)
  const checked = visible.filter((request) => checkedIds.has(request.id))
  const allChecked = visible.length > 0 && checked.length === visible.length
  const counts = Object.fromEntries((Object.keys(viewLabel) as RequestView[]).map((key) => [key, requests.filter((request) => matchesView(request, key, clock)).length])) as Record<RequestView, number>
  // The open request is looked up among all requests, so an action that moves it out of the current filters never closes the dialog.
  const openOrder = requests.find((request) => request.id === openId) ?? null
  const summary = openOrder ? buildOrderSummary(openOrder, clock) : null
  const acceptCheck = openOrder ? canAccept(openOrder, 'staff') : null
  const canAsk = openOrder?.status === 'submitted' || openOrder?.status === 'needs_review'
  const canEdit = canAsk || openOrder?.status === 'awaiting_customer_approval'
  const closed = openOrder?.status === 'confirmed' || openOrder?.status === 'rejected'

  function resetPanels() {
    setPanel(null)
    setNotice(null)
    clearError()
  }

  function openRequest(request: Order) {
    activateOrder(request.id)
    resetPanels()
    setOpenId(request.id)
  }

  function closeRequest() {
    resetPanels()
    setOpenId(null)
  }

  function toggleChecked(id: string, on: boolean) {
    setCheckedIds((previous) => {
      const next = new Set(previous)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(on: boolean) {
    setCheckedIds((previous) => {
      const next = new Set(previous)
      for (const request of visible) {
        if (on) next.add(request.id)
        else next.delete(request.id)
      }
      return next
    })
  }

  function changeSort(key: SortKey) {
    setSort((previous) => previous.key === key
      ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'updated' || key === 'eventDate' || key === 'guests' ? 'desc' : 'asc' })
  }

  function changeCriteria(patch: Partial<RequestCriteria>) {
    setCriteria({ ...criteria, ...patch })
  }

  function clearFilters() {
    setView('all')
    setCriteria(noCriteria)
  }

  function deleteRequest(id: string) {
    deleteOrder(id)
    toggleChecked(id, false)
    closeRequest()
    setNotice('Request deleted.')
  }

  function deleteChecked() {
    const ids = checked.map((request) => request.id)
    for (const id of ids) deleteOrder(id)
    setCheckedIds(new Set())
    setConfirmBulkDelete(false)
    setNotice(`${ids.length} ${ids.length === 1 ? 'request' : 'requests'} deleted.`)
  }

  function acceptRequest() {
    if (!openOrder) return
    setNotice(null)
    clearError()
    accept('staff')
    if (useDemoStore.getState().lastError) return
    setNotice('Request accepted.')
    setPanel(null)
  }

  function saveQuestion(text: string) {
    requestClarification(text)
    if (useDemoStore.getState().lastError) return
    setPanel(null)
    setNotice('Question recorded locally. Nothing was sent to the customer.')
  }

  function saveProposal(lines: Order['lines']) {
    revise(lines)
    if (useDemoStore.getState().lastError) return
    setPanel(null)
    setNotice('Proposal saved locally. The customer must approve the changes before acceptance; nothing was sent.')
  }

  function declineRequest(reason: string) {
    reject(reason)
    if (useDemoStore.getState().lastError) return
    setPanel(null)
    setNotice('Request declined.')
  }

  const hasRequests = requests.length > 0
  const allowRowKey = (event: React.KeyboardEvent<HTMLTableRowElement>, request: Order) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openRequest(request)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="type-page-title text-foreground">Catering requests</h1>
      </header>

      <Tabs value={view} onValueChange={(value) => setView(value as RequestView)} className="gap-4">
        <TabsList aria-label="Request views" className="overflow-x-auto pb-px [&_[data-slot=tabs-trigger]]:shrink-0">
          {(Object.keys(viewLabel) as RequestView[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {viewLabel[key]}
              <span className="tabular-nums text-muted-foreground" aria-label={`${counts[key]} ${counts[key] === 1 ? 'request' : 'requests'}`}>{counts[key]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {hasRequests && (
          <form role="search" aria-label="Filter requests" className="flex flex-wrap items-end gap-2" onSubmit={(event) => event.preventDefault()}>
            <label className="min-w-[14rem] flex-[2]">
              <span className="sr-only">Search by customer, organization, or request ID</span>
              <span className="relative block">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" value={criteria.query} onChange={(event) => changeCriteria({ query: event.target.value })} placeholder="Search customer, organization, or ID" className="h-9 pl-9" />
              </span>
            </label>
            <div className="min-w-[9rem] flex-1">
              <OptionSelect
                label="Status"
                value={criteria.status}
                onValueChange={(status) => changeCriteria({ status: status as RequestCriteria['status'] })}
                options={[{ value: 'all', label: 'All statuses' }, ...(['submitted', 'needs_review', 'awaiting_customer_approval', 'confirmed', 'rejected'] as const).map((status) => ({ value: status, label: statusLabel[status] }))]}
              />
            </div>
            <div className="min-w-[9rem] flex-1">
              <OptionSelect
                label="Event type"
                value={criteria.eventType}
                onValueChange={(eventType) => changeCriteria({ eventType })}
                options={[{ value: 'all', label: 'All event types' }, ...catalog.eventTypes.map((type) => ({ value: type.id, label: type.label }))]}
              />
            </div>
            <div className="min-w-[11rem] flex-1">
              <OptionSelect
                label="Pickup or delivery"
                value={criteria.fulfillment}
                onValueChange={(fulfillment) => changeCriteria({ fulfillment: fulfillment as RequestCriteria['fulfillment'] })}
                options={[{ value: 'all', label: 'Pickup or delivery' }, { value: 'pickup', label: 'Pickup' }, { value: 'delivery', label: 'Delivery' }]}
              />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:contents">
              <label className="grid gap-0.5 text-caption text-muted-foreground">
                Event from
                <Input type="date" value={criteria.from} max={criteria.to || undefined} onChange={(event) => changeCriteria({ from: event.target.value })} className="h-9 w-full text-ui text-foreground sm:w-40" />
              </label>
              <label className="grid gap-0.5 text-caption text-muted-foreground">
                Event to
                <Input type="date" value={criteria.to} min={criteria.from || undefined} onChange={(event) => changeCriteria({ to: event.target.value })} className="h-9 w-full text-ui text-foreground sm:w-40" />
              </label>
            </div>
            {hasCriteria(criteria) && <Button type="button" variant="ghost" onClick={() => changeCriteria(noCriteria)}>Clear filters</Button>}
          </form>
        )}

        {!openOrder && notice && <p role="status" className="text-ui text-muted-foreground">{notice}</p>}

        <TabsContent value={view} className="mt-0">
          {requests.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <Empty className="min-h-72 border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><destinationIcons.requests aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>No requests yet</EmptyTitle>
                  <EmptyDescription>
                    A catering request will appear here after it is submitted from the customer ordering flow.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <Empty className="min-h-72 border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><destinationIcons.requests aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>No matching requests</EmptyTitle>
                  <EmptyDescription>
                    Nothing in “{viewLabel[view]}” matches the current filters. Clear them to see every request.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="grid gap-2">
              <div role="status" className="flex min-h-8 items-center justify-between gap-3 text-ui">
                <span className={checked.length > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}>{checked.length} selected</span>
                <span className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" disabled={checked.length === 0} onClick={() => toggleAll(false)}>Clear selection</Button>
                  <Button size="sm" variant="ghost" disabled={checked.length === 0} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmBulkDelete(true)}>Delete selected</Button>
                </span>
              </div>

              <div className="overflow-hidden rounded-lg border bg-card">
                <Table className="staff-request-table [&_td:not(:last-child)]:border-r [&_th:not(:last-child)]:border-r">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 pr-0">
                        <Checkbox
                          aria-label="Select all shown requests"
                          checked={allChecked}
                          indeterminate={checked.length > 0 && !allChecked}
                          onCheckedChange={(on) => toggleAll(on)}
                        />
                      </TableHead>
                      <SortHead label="Request ID" sortKey="id" sort={sort} onSort={changeSort} className="hidden md:table-cell" />
                      <SortHead label="Customer" sortKey="customer" sort={sort} onSort={changeSort} />
                      <SortHead label="Event date" sortKey="eventDate" sort={sort} onSort={changeSort} className="hidden md:table-cell" />
                      <SortHead label="Guests" sortKey="guests" sort={sort} onSort={changeSort} align="right" className="hidden text-right md:table-cell" />
                      <SortHead label="Fulfillment" sortKey="fulfillment" sort={sort} onSort={changeSort} className="hidden md:table-cell" />
                      <SortHead label="Status" sortKey="status" sort={sort} onSort={changeSort} />
                      <SortHead label="Last updated" sortKey="updated" sort={sort} onSort={changeSort} className="hidden xl:table-cell" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((request) => {
                      const id = requestId(request.id)
                      const name = request.intent.contactName || 'Customer'
                      const isChecked = checkedIds.has(request.id)
                      return (
                        <TableRow
                          key={request.id}
                          data-request-row={request.id}
                          tabIndex={0}
                          aria-label={`${id}, ${name}. Open request`}
                          data-state={isChecked ? 'selected' : undefined}
                          className="cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=selected]:bg-accent/70"
                          onClick={() => openRequest(request)}
                          onKeyDown={(event) => allowRowKey(event, request)}
                        >
                          <TableCell className="w-10 pr-0 py-2" onClick={(event) => event.stopPropagation()}>
                            <Checkbox aria-label={`Select ${id}`} checked={isChecked} onCheckedChange={(on) => toggleChecked(request.id, on)} />
                          </TableCell>
                          <TableCell className="hidden py-2 text-xs tabular-nums text-muted-foreground md:table-cell">{id}</TableCell>
                          <TableCell className="max-w-0 w-full whitespace-normal py-2 md:max-w-80 md:w-auto md:whitespace-nowrap">
                            <span className="block truncate text-sm font-medium">
                              {name}
                              {request.intent.organization && <span className="hidden font-normal text-muted-foreground md:inline"> · {request.intent.organization}</span>}
                            </span>
                            <span className="block text-caption tabular-nums leading-snug text-muted-foreground md:hidden">
                              {id} · {dateOnly(request.intent.eventAt)} · {request.intent.guestCount ?? '—'} guests · <span className="capitalize">{request.intent.fulfillment}</span>
                            </span>
                          </TableCell>
                          <TableCell className="hidden py-2 md:table-cell">{dateOnly(request.intent.eventAt)}</TableCell>
                          <TableCell className="hidden py-2 text-right tabular-nums md:table-cell">{request.intent.guestCount ?? '—'}</TableCell>
                          <TableCell className="hidden py-2 capitalize md:table-cell">{request.intent.fulfillment}</TableCell>
                          <TableCell className="py-2"><RequestStatus status={request.status} /></TableCell>
                          <TableCell className="hidden py-2 text-sm tabular-nums text-muted-foreground xl:table-cell">{updatedLabel(request)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openOrder !== null} onOpenChange={(open) => { if (!open) closeRequest() }}>
        <DialogContent
          initialFocus={() => titleRef.current}
          finalFocus={() => document.querySelector<HTMLElement>(`[data-request-row="${openId}"]`)}
          className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        >
          {openOrder && summary && acceptCheck && (
            <>
              <DialogHeader className="sticky top-0 z-10 border-b bg-popover px-5 py-4 pr-12">
                <DialogTitle ref={titleRef} tabIndex={-1} className="text-base outline-none">
                  <span className="tabular-nums">{requestId(openOrder.id)}</span>
                  <span className="font-normal text-muted-foreground"> · {openOrder.intent.contactName || 'Customer'}</span>
                </DialogTitle>
                <DialogDescription>Last updated {updatedLabel(openOrder)}. Review the request and record a staff action.</DialogDescription>
              </DialogHeader>
              <RequestDetails
                embedded
                order={openOrder}
                summary={summary}
                acceptAllowed={acceptCheck.allowed}
                acceptReason={acceptCheck.reason}
                canAsk={canAsk}
                canEdit={canEdit}
                closed={closed}
                notice={notice}
                error={lastError}
                onAccept={acceptRequest}
                onAsk={() => { setNotice(null); clearError(); setPanel('ask') }}
                onEdit={() => { setNotice(null); clearError(); setPanel('edit') }}
                onDecline={() => { setNotice(null); clearError(); setPanel('decline') }}
                panel={panel}
                onSaveQuestion={saveQuestion}
                onSaveProposal={saveProposal}
                onSaveDecline={declineRequest}
                onDelete={() => deleteRequest(openOrder.id)}
                onCancelPanel={() => { clearError(); setPanel(null) }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {checked.length} {checked.length === 1 ? 'request' : 'requests'}?</DialogTitle>
            <DialogDescription>
              They will be removed from Admin and from the customers’ orders, along with their messages. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={deleteChecked}>Delete {checked.length === 1 ? 'request' : 'requests'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
