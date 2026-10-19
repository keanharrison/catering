import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { IconChecks, IconClipboardList, IconEye, IconInbox, IconMessageQuestion } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import type { Order } from '../../data'
import { statusLabel } from '../../lib/status'
import { canAccept } from '../../state/orderMachine'
import { useDemoStore } from '../../state/store'
import { buildOrderSummary } from '../../views/customer/orderSummary'
import { dateOnly, filterLabel, matchesFilter, shortRequestId, type RequestFilter } from '../../views/staff/requestFilters'
import { Offcanvas } from './Offcanvas'
import { RequestDetail } from './RequestDetail'
import { StatusBadge } from './StatusBadge'

type ActionPanel = 'ask' | 'edit' | null

const filterIcon: Record<RequestFilter, { icon: Icon; color: string }> = {
  all: { icon: IconClipboardList, color: 'blue' },
  review: { icon: IconEye, color: 'orange' },
  awaiting: { icon: IconMessageQuestion, color: 'azure' },
  confirmed: { icon: IconChecks, color: 'green' },
}

// The detail pane sits beside the list on wide screens and opens as an offcanvas below that.
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

const who = (request: Order) => request.intent.contactName || 'Customer'

// Staff Requests in Tabler markup. State handling mirrors views/staff/StaffPage.tsx; every change still goes
// through the same store actions (accept, requestClarification, revise).
export function StaffRequests() {
  const order = useDemoStore((state) => state.order)
  const orders = useDemoStore((state) => state.orders)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const clearError = useDemoStore((state) => state.clearError)
  const accept = useDemoStore((state) => state.accept)
  const requestClarification = useDemoStore((state) => state.requestClarification)
  const revise = useDemoStore((state) => state.revise)
  const [filter, setFilter] = useState<RequestFilter>('all')
  const [panel, setPanel] = useState<ActionPanel>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const savingQuestionRef = useRef(false)
  const [selectedId, setSelectedId] = useState<string | null>(() => (order.status === 'draft' ? orders[0]?.id ?? null : order.id))
  const wide = useMediaQuery('(min-width: 1200px)')

  const filteredRequests = orders.filter((request) => matchesFilter(request, filter))
  const selectedOrder = filteredRequests.find((request) => request.id === selectedId) ?? null
  const counts = Object.fromEntries(
    (Object.keys(filterLabel) as RequestFilter[]).map((key) => [key, orders.filter((request) => matchesFilter(request, key)).length]),
  ) as Record<RequestFilter, number>
  const summary = selectedOrder ? buildOrderSummary(selectedOrder, clock) : null
  const acceptCheck = selectedOrder ? canAccept(selectedOrder, 'staff') : null
  const canAsk = selectedOrder?.status === 'submitted' || selectedOrder?.status === 'needs_review'
  const canEdit = canAsk || selectedOrder?.status === 'awaiting_customer_approval'
  const closed = selectedOrder?.status === 'confirmed' || selectedOrder?.status === 'rejected'

  useEffect(() => {
    if (selectedOrder && selectedOrder.id !== order.id) activateOrder(selectedOrder.id)
  }, [activateOrder, order.id, selectedOrder])

  // The offcanvas only exists below the wide breakpoint.
  useEffect(() => {
    if (wide) setDetailsOpen(false)
  }, [wide])

  function selectRequest(request: Order) {
    setSelectedId(request.id)
    activateOrder(request.id)
    setNotice(null)
    clearError()
    setPanel(null)
    if (!wide) setDetailsOpen(true)
  }

  function changeFilter(next: RequestFilter) {
    setFilter(next)
    setPanel(null)
    setNotice(null)
    clearError()
    setSelectedId(orders.find((request) => matchesFilter(request, next))?.id ?? null)
    setDetailsOpen(false)
  }

  function acceptRequest() {
    if (!selectedOrder) return
    setNotice(null)
    clearError()
    accept('staff')
    const state = useDemoStore.getState()
    if (state.lastError) return
    setNotice('Accepted in the demo. No real order was created.')
    setPanel(null)
    if (filter !== 'all') setFilter('confirmed')
    setSelectedId(state.order.id)
  }

  function saveQuestion(text: string) {
    if (savingQuestionRef.current) return
    savingQuestionRef.current = true
    requestClarification(text)
    if (useDemoStore.getState().lastError) {
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

  const detail =
    selectedOrder && summary && acceptCheck ? (
      <RequestDetail
        order={selectedOrder}
        summary={summary}
        acceptAllowed={acceptCheck.allowed}
        acceptReason={acceptCheck.reason}
        canAsk={canAsk}
        canEdit={canEdit}
        closed={closed}
        notice={notice}
        error={lastError}
        panel={panel}
        onAccept={acceptRequest}
        onAsk={() => { savingQuestionRef.current = false; setNotice(null); clearError(); setPanel('ask') }}
        onEdit={() => { setNotice(null); clearError(); setPanel('edit') }}
        onSaveQuestion={saveQuestion}
        onSaveProposal={saveProposal}
        onCancelPanel={() => { clearError(); setPanel(null) }}
      />
    ) : null

  return (
    <div className="row row-cards">
      <div className="col-12">
        <div className="row row-cards" role="group" aria-label="Filter requests by status">
          {(Object.keys(filterLabel) as RequestFilter[]).map((key) => {
            const { icon: Icon, color } = filterIcon[key]
            const active = filter === key
            return (
              <div className="col-6 col-lg-3" key={key}>
                <button type="button" className={`card card-sm w-100 text-start staff-filter${active ? ' card-active' : ''}`} aria-pressed={active} onClick={() => changeFilter(key)}>
                  <span className="card-body w-100">
                    <span className="row align-items-center">
                      <span className="col-auto">
                        <span className={`avatar avatar-square bg-${color} text-white`} aria-hidden="true">
                          <Icon className="icon" />
                        </span>
                      </span>
                      <span className="col">
                        <span className="d-block fw-medium">{counts[key]}</span>
                        <span className="d-block text-secondary">{filterLabel[key]}</span>
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {orders.length === 0 || filteredRequests.length === 0 ? (
        <div className="col-12">
          <div className="card">
            <div className="empty">
              <div className="empty-icon"><IconInbox className="icon icon-lg" aria-hidden="true" /></div>
              <p className="empty-title">{orders.length === 0 ? 'No requests yet' : 'No matching requests'}</p>
              <p className="empty-subtitle text-secondary">
                {orders.length === 0
                  ? 'A catering request will appear here after it is submitted from the customer ordering flow.'
                  : `There are no requests in “${filterLabel[filter]}” right now. Clear the filter to see all requests.`}
              </p>
              {orders.length > 0 && (
                <div className="empty-action">
                  <button type="button" className="btn btn-primary" onClick={() => changeFilter('all')}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="col-xl-7">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Request list</h2>
                  <div className="card-subtitle">Select a request to review its details and actions.</div>
                </div>
              </div>
              <div className="table-responsive d-none d-md-block">
                <table className="table card-table table-vcenter table-hover" aria-label="Catering requests">
                  <thead>
                    <tr>
                      <th scope="col">Request ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Event date</th>
                      <th scope="col" className="text-end">Guests</th>
                      <th scope="col">Fulfillment</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => {
                      const selected = selectedId === request.id
                      return (
                        <tr key={request.id} className={selected ? 'table-active' : undefined} onClick={() => selectRequest(request)} style={{ cursor: 'pointer' }}>
                          <td className="text-secondary font-monospace small" title={request.id}>{shortRequestId(request.id)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 border-0 text-reset fw-medium text-start text-decoration-none staff-row-link"
                              aria-pressed={selected}
                              aria-label={`${who(request)}, ${dateOnly(request.intent.eventAt)}, ${request.intent.guestCount ?? 'guest count not provided'} guests, ${request.intent.fulfillment}, ${statusLabel[request.status]}`}
                              onClick={(event) => { event.stopPropagation(); selectRequest(request) }}
                            >
                              {who(request)}
                            </button>
                          </td>
                          <td className="text-nowrap">{dateOnly(request.intent.eventAt)}</td>
                          <td className="text-end">{request.intent.guestCount ?? '—'}</td>
                          <td className="text-capitalize">{request.intent.fulfillment}</td>
                          <td><StatusBadge status={request.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <ul className="list-group list-group-flush list-unstyled m-0 d-md-none" aria-label="Catering requests">
                {filteredRequests.map((request) => (
                  <li key={request.id} className="list-group-item p-0">
                    <button
                      type="button"
                      className={`list-group-item-action border-0 bg-transparent w-100 d-flex justify-content-between align-items-center gap-3 text-start px-3 py-3${selectedId === request.id ? ' active-row' : ''}`}
                      aria-pressed={selectedId === request.id}
                      onClick={() => selectRequest(request)}
                    >
                      <span className="min-w-0">
                        <span className="d-block fw-medium text-truncate">
                          {who(request)} {request.demoSample && <span className="badge badge-outline text-secondary ms-1">Sample</span>}
                        </span>
                        <span className="d-block text-secondary small font-monospace" title={request.id}>{shortRequestId(request.id)}</span>
                        <span className="d-block text-secondary small">
                          {dateOnly(request.intent.eventAt)} · {request.intent.guestCount ?? '—'} guests · <span className="text-capitalize">{request.intent.fulfillment}</span>
                        </span>
                      </span>
                      <StatusBadge status={request.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-xl-5">
            {wide ? (
              detail ?? (
                <div className="card">
                  <div className="card-body text-center text-secondary py-6">Select a request to see its details.</div>
                </div>
              )
            ) : (
              <Offcanvas open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Request details">
                {detail}
              </Offcanvas>
            )}
          </div>
        </>
      )}
    </div>
  )
}
