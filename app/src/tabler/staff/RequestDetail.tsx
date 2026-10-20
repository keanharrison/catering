import type { ReactNode } from 'react'
import { IconAlertTriangle } from '../../components/icons'
import { catalog, type Order } from '../../data'
import { formatMoney } from '../../lib/format'
import { formatEventTime } from '../../lib/status'
import { routes } from '../../routes'
import type { OrderSummary } from '../../views/customer/orderSummary'
import { AskPanel, EditPanel } from './RequestPanels'
import { StatusBadge } from './StatusBadge'

type Panel = 'ask' | 'edit' | null

export type RequestDetailProps = {
  order: Order
  summary: OrderSummary
  acceptAllowed: boolean
  acceptReason?: string
  canAsk: boolean
  canEdit: boolean
  closed: boolean
  notice: string | null
  error: string | null
  panel: Panel
  onAccept: () => void
  onAsk: () => void
  onEdit: () => void
  onSaveQuestion: (text: string) => void
  onSaveProposal: (lines: Order['lines']) => void
  onCancelPanel: () => void
}

function Item({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="datagrid-item" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <div className="datagrid-title">{label}</div>
      <div className="datagrid-content text-break">{children}</div>
    </div>
  )
}

function Lines({ groups }: { groups: OrderSummary['groups'] }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.category} className="mb-3">
          <div className="subheader mb-1">{group.title}</div>
          <ul className="list-unstyled m-0 d-grid gap-1">
            {group.rows.map((row) => (
              <li key={row.itemId} className="d-flex justify-content-between gap-3">
                <span className="text-break">{row.name} <span className="text-secondary">({row.quantityLabel})</span></span>
                <span className="text-nowrap">{formatMoney(row.costCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

function eventTypeLabel(eventType: string) {
  return (catalog.eventTypes.find((type) => type.id === eventType)?.label ?? eventType) || 'Not provided'
}

export function RequestDetail(props: RequestDetailProps) {
  const { order, summary, acceptAllowed, acceptReason, canAsk, canEdit, closed, notice, error, panel } = props
  const foodGroups = summary.groups.filter((group) => group.category !== 'supply')
  const supplyGroups = summary.groups.filter((group) => group.category === 'supply')
  const sum = (groups: OrderSummary['groups']) => groups.flatMap((group) => group.rows).reduce((total, row) => total + row.costCents, 0)
  const address = [order.intent.deliveryAddress, order.intent.deliveryCity, order.intent.deliveryState, order.intent.deliveryZip].filter(Boolean).join(', ')
  const grid = { '--tblr-datagrid-item-width': '9rem', '--tblr-datagrid-padding': '1rem' } as React.CSSProperties

  return (
    <div className="d-grid gap-3 staff-detail">
      <div className="card">
        <div className="card-header">
          <div className="min-w-0">
            <h3 className="card-title text-break">{eventTypeLabel(order.intent.eventType)}</h3>
            <div className="card-subtitle text-break">
              {order.intent.contactName || 'Customer'}
              {order.intent.organization ? ` · ${order.intent.organization}` : ''}
            </div>
          </div>
          <div className="card-actions d-flex gap-2 align-items-center">
            {order.demoSample && <span className="badge badge-outline text-secondary">Sample</span>}
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="card-body">
          <section aria-labelledby="request-event-heading" className="mb-4">
            <h4 className="subheader mb-3" id="request-event-heading">Event</h4>
            <div className="datagrid" style={grid}>
              <Item label="Date and time" wide>{formatEventTime(order.intent.eventAt)}</Item>
              <Item label="Guests">{order.intent.guestCount ?? 'Not provided'}</Item>
              <Item label="Food budget">{order.intent.budgetCents === null ? 'Not provided' : formatMoney(order.intent.budgetCents)}</Item>
              <Item label="Fulfillment"><span className="text-capitalize">{order.intent.fulfillment}</span></Item>
              {order.intent.fulfillment === 'delivery' && <Item label="Delivery address">{address || 'Not provided'}</Item>}
            </div>
          </section>

          <hr />

          <section aria-labelledby="request-food-heading" className="mb-4">
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <h4 className="subheader m-0" id="request-food-heading">Food and supplies</h4>
              <span className="text-secondary small">Estimate only</span>
            </div>
            {foodGroups.length > 0 ? <Lines groups={foodGroups} /> : <p className="text-secondary">No food selections recorded.</p>}
            <div className="d-flex justify-content-between border-top pt-2 mb-3">
              <span className="text-secondary">Food subtotal</span>
              <span>{formatMoney(sum(foodGroups))}</span>
            </div>
            {supplyGroups.length > 0 ? (
              <Lines groups={supplyGroups} />
            ) : (
              <p className="text-secondary">{order.suppliesChoice === 'none' ? 'No supplies needed.' : 'No supply selection recorded.'}</p>
            )}
            <div className="border-top pt-2 d-grid gap-1">
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Supplies subtotal</span>
                <span>{formatMoney(sum(supplyGroups))}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Estimated total</span>
                <span>{formatMoney(summary.estimate.subtotalCents)}</span>
              </div>
            </div>
            {summary.coverage.guests !== null && (
              <p className="text-secondary small mt-2 mb-0">
                Entree coverage: {summary.coverage.servings} {summary.coverage.servings === 1 ? 'serving' : 'servings'} for {summary.coverage.guests} guests
                {summary.coverage.shortfall > 0 ? ` · ${summary.coverage.shortfall} not yet covered` : ' · everyone covered'}.
              </p>
            )}
          </section>

          <hr />

          <section aria-labelledby="request-contact-heading" className="mb-4">
            <h4 className="subheader mb-3" id="request-contact-heading">Contact and instructions</h4>
            <div className="datagrid" style={grid}>
              <Item label="Name">{order.intent.contactName || 'Not provided'}</Item>
              <Item label="Organization">{order.intent.organization || 'Not provided'}</Item>
              <Item label="Email">{order.intent.email || 'Not provided'}</Item>
              <Item label="Phone">{order.intent.phone || 'Not provided'}</Item>
              <Item label="Dietary needs" wide>{order.intent.dietary.length ? order.intent.dietary.join(', ') : 'None noted'}</Item>
              <Item label="Custom request" wide>{order.intent.customRequest || 'None provided'}</Item>
              <Item label="Additional notes" wide>{order.intent.notes || 'None provided'}</Item>
            </div>
          </section>

          {order.messages.length > 0 && (
            <>
              <hr />
              <section aria-labelledby="request-messages-heading" className="mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-baseline mb-3">
                  <h4 className="subheader m-0" id="request-messages-heading">Request messages</h4>
                  <span className="text-secondary small">Demo only · not delivered</span>
                </div>
                <ol className="list-unstyled m-0 d-grid gap-2">
                  {order.messages.map((message) => (
                    <li key={message.id} className="rounded bg-body-tertiary px-3 py-2">
                      <div className="fw-medium">{{ customer: 'Customer', staff: 'Pearl Island team', system: 'Request update' }[message.author]}</div>
                      <div className="text-secondary text-break">{message.text}</div>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}

          {summary.flags.length > 0 && (
            <div className="alert alert-warning" role="group" aria-labelledby="review-reasons-title">
              <div className="d-flex gap-2">
                <IconAlertTriangle className="icon alert-icon flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="alert-heading" id="review-reasons-title">Review reasons</h4>
                  <ul className="mb-0 ps-3">
                    {summary.flags.map((flag) => <li key={flag.code}>{flag.reason}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {notice && <div role="status" className="alert alert-success">{notice}</div>}
          {error && panel === null && <div role="alert" className="alert alert-danger">{error}</div>}
          {!closed && (
            <p className="text-secondary small mb-0">
              Staff actions are simulated and saved in this browser. This demo does not deliver messages or create a real order.
            </p>
          )}
        </div>
        <div className="card-footer">
          {order.status === 'confirmed' ? (
            <a className="btn btn-primary" href={routes.handoff}>View handoff</a>
          ) : !closed ? (
            <div className="btn-list">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!acceptAllowed}
                aria-describedby={!acceptAllowed && acceptReason ? 'accept-disabled-reason' : undefined}
                onClick={props.onAccept}
              >
                Accept request
              </button>
              <button type="button" className="btn" disabled={!canAsk} onClick={props.onAsk}>Ask for clarification</button>
              <button type="button" className="btn" disabled={!canEdit} onClick={props.onEdit}>Edit request</button>
            </div>
          ) : (
            <span className="text-secondary">This request is closed.</span>
          )}
          {!closed && !acceptAllowed && acceptReason && (
            <p className="text-secondary small mt-2 mb-0" id="accept-disabled-reason">{acceptReason}</p>
          )}
        </div>
      </div>

      {panel === 'ask' && <AskPanel onSave={props.onSaveQuestion} onCancel={props.onCancelPanel} error={error} />}
      {panel === 'edit' && (
        <EditPanel lines={order.lines} guestCount={order.intent.guestCount} onSave={props.onSaveProposal} onCancel={props.onCancelPanel} error={error} />
      )}
    </div>
  )
}
