import { useMemo, useState } from 'react'
import { IconChecks, IconClipboardList, IconEye, IconMessageQuestion, IconSearch } from '../components/icons'
import type { Icon } from '../components/icons'
import type { Order, OrderStatus } from '../data'
import { formatMoney } from '../lib/format'
import { statusLabel } from '../lib/status'
import { routes } from '../routes'
import { useDemoStore } from '../state/store'
import { buildOrderSummary } from '../views/customer/orderSummary'
import { Dropdown } from './Dropdown'

// Read-only styling examples built from the existing sample requests. Nothing here changes an order.

const dotColor: Record<OrderStatus, string> = {
  draft: 'secondary',
  submitted: 'secondary',
  needs_review: 'orange',
  awaiting_customer_approval: 'azure',
  confirmed: 'green',
  rejected: 'red',
}

function StatCard({ icon: Icon, color, title, description }: { icon: Icon; color: string; title: string; description: string }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className={`avatar avatar-square bg-${color} text-white`}>
                <Icon className="icon" aria-hidden="true" />
              </span>
            </div>
            <div className="col">
              <div className="fw-medium">{title}</div>
              <div className="text-secondary">{description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function requestName(order: Order) {
  return order.intent.organization || order.intent.contactName || 'Catering request'
}

function eventDate(order: Order) {
  const date = new Date(order.intent.eventAt)
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PreviewContent() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const count = (status: OrderStatus) => orders.filter((order) => order.status === status).length
    return { all: orders.length, review: count('needs_review'), awaiting: count('awaiting_customer_approval'), confirmed: count('confirmed') }
  }, [orders])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return orders.filter((order) => !needle || `${requestName(order)} ${order.intent.contactName} ${statusLabel[order.status]}`.toLowerCase().includes(needle))
  }, [orders, query])

  return (
    <div className="row row-deck row-cards">
      <StatCard icon={IconClipboardList} color="blue" title={`${counts.all} Requests`} description="All saved requests" />
      <StatCard icon={IconEye} color="orange" title={`${counts.review} Needs review`} description="Flagged for the team" />
      <StatCard icon={IconMessageQuestion} color="azure" title={`${counts.awaiting} Awaiting customer`} description="Revisions to approve" />
      <StatCard icon={IconChecks} color="green" title={`${counts.confirmed} Accepted`} description="Ready for handoff" />

      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Requests</h2>
          </div>
          <div className="card-body border-bottom py-3">
            <div className="d-flex">
              <div className="ms-auto text-secondary">
                <label className="d-flex align-items-center">
                  Search:
                  <span className="ms-2 d-inline-block">
                    <input
                      type="search"
                      className="form-control form-control-sm"
                      aria-label="Search requests"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table card-table table-vcenter text-nowrap datatable">
              <thead>
                <tr>
                  <th scope="col">Request</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Guests</th>
                  <th scope="col">Event date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Estimate</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="text-reset">{requestName(order)}</span>
                    </td>
                    <td className="text-secondary">{order.intent.contactName || 'Not provided'}</td>
                    <td>{order.intent.guestCount ?? '—'}</td>
                    <td>{eventDate(order)}</td>
                    <td>
                      <span className={`badge bg-${dotColor[order.status]} me-1`} aria-hidden="true" /> {statusLabel[order.status]}
                    </td>
                    <td>{formatMoney(buildOrderSummary(order, clock).estimate.subtotalCents)}</td>
                    <td className="text-end">
                      <Dropdown className="dropdown" menuClassName="dropdown-menu-end" fixed>
                        {({ triggerProps, menuProps }) => (
                          <>
                            <button type="button" className="btn dropdown-toggle align-text-top" aria-label={`Actions for ${requestName(order)}`} {...triggerProps}>
                              Actions
                            </button>
                            <div {...menuProps}>
                              <a role="menuitem" className="dropdown-item" href={routes.staff}>
                                Open in Requests
                              </a>
                            </div>
                          </>
                        )}
                      </Dropdown>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-4">
                      <IconSearch className="icon me-1" aria-hidden="true" /> No requests match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <p className="m-0 text-secondary">
              Showing <strong>{rows.length}</strong> of <strong>{orders.length}</strong> requests
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
