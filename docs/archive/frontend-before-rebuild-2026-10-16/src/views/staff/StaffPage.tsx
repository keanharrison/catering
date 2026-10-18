import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Band } from '../../components/Band'
import { AssistantPanel } from '../../components/AssistantPanel'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { catalog } from '../../data'
import { formatEventTime, statusLabel, statusTone } from '../../lib/status'
import { routes } from '../../routes'
import { canAccept } from '../../state/orderMachine'
import { useDemoStore } from '../../state/store'
import { buildOrderSummary } from '../customer/orderSummary'
import { AskCustomerPanel } from './AskCustomerPanel'
import { EditRequestPanel } from './EditRequestPanel'

const authorLabel = { staff: 'You (staff)', customer: 'Customer', system: 'System' } as const

// Minimal, simulated staff view: one request, its flags, and an accept action.
export function StaffPage() {
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const accept = useDemoStore((state) => state.accept)
  const requestClarification = useDemoStore((state) => state.requestClarification)
  const revise = useDemoStore((state) => state.revise)
  const [panel, setPanel] = useState<'ask' | 'edit' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (order.status === 'draft') {
    return (
      <Band>
        <Eyebrow marker>Staff view &middot; simulated</Eyebrow>
        <h1 className="mt-6 text-3xl md:text-5xl">No requests yet.</h1>
        <p className="mt-6 max-w-xl text-muted">
          Submit a request from the customer view and it will appear here.
        </p>
      </Band>
    )
  }

  const summary = buildOrderSummary(order, clock)
  const eventType = catalog.eventTypes.find((e) => e.id === order.intent.eventType)?.label ?? order.intent.eventType
  const check = canAccept(order, 'staff')
  const canAsk = order.status === 'submitted' || order.status === 'needs_review'
  const canEdit = canAsk || order.status === 'awaiting_customer_approval'
  const closed = order.status === 'confirmed' || order.status === 'rejected'
  const pageHeading =
    order.status === 'confirmed'
      ? 'Request accepted.'
      : order.status === 'rejected'
        ? 'Request declined.'
        : order.status === 'awaiting_customer_approval'
          ? 'Awaiting customer approval.'
          : 'Requests needing attention.'

  function simulateSend(text: string) {
    requestClarification(text)
    if (useDemoStore.getState().lastError === null) {
      setPanel(null)
      setNotice('Question saved in the demo only. Nothing was sent to the customer.')
    }
  }

  function saveEdit(lines: typeof order.lines) {
    revise(lines)
    if (useDemoStore.getState().lastError === null) {
      setPanel(null)
      setNotice(
        'Changes saved in the demo. The customer must approve them before this request can be accepted. Nothing was sent to the customer.',
      )
    }
  }

  return (
    <Band>
      <Eyebrow marker>Staff view &middot; simulated</Eyebrow>
      <h1 className="mt-6 text-3xl md:text-5xl">{pageHeading}</h1>
      {order.status === 'confirmed' && (
        <p role="status" className="mt-4 max-w-2xl text-muted">
          Accepted in the staff demo. View the handoff summary for preparation details; no real order was created.
        </p>
      )}
      {order.status === 'rejected' && (
        <p role="status" className="mt-4 max-w-2xl text-muted">
          Declined in the staff demo. This request is closed, and no further staff actions are available.
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel className="self-start p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-sans text-xl font-medium md:text-2xl [overflow-wrap:anywhere]">
                {eventType}, {order.intent.guestCount} guests
              </h2>
              <p className="mt-1 font-sans text-sm text-muted [overflow-wrap:anywhere]">
                {order.intent.contactName}
                {order.intent.organization ? `, ${order.intent.organization}` : ''}
              </p>
            </div>
            <Pill tone={statusTone[order.status]}>{statusLabel[order.status]}</Pill>
          </div>

          <dl className="mt-4 grid gap-3 border-y border-line py-3 font-sans sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Event date and time</dt>
              <dd className="mt-0.5 text-sm [overflow-wrap:anywhere]">{formatEventTime(order.intent.eventAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Fulfillment</dt>
              <dd className="mt-0.5 text-sm">{order.intent.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</dd>
            </div>
          </dl>

          {!closed && summary.flags.length > 0 && (
            <section aria-label="Items to review" className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-sans text-base font-medium">Items to review</h3>
                <Pill tone="review">
                  {summary.flags.length} {summary.flags.length === 1 ? 'flag' : 'flags'}
                </Pill>
              </div>
              <ul className="mt-2 grid gap-2 text-sm">
                {summary.flags.map((flag) => (
                  <li key={flag.code} className="[overflow-wrap:anywhere]">{flag.reason}</li>
                ))}
              </ul>
            </section>
          )}

          {order.status === 'confirmed' && (
            <div className="mt-6">
              <Link
                to={routes.handoff}
                className="inline-flex min-h-11 items-center rounded-lg border border-action bg-action px-4 py-2 font-sans text-on-action hover:border-action-hover hover:bg-action-hover"
              >
                View handoff summary
              </Link>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              disabled={!check.allowed}
              aria-describedby={!check.allowed ? 'staff-accept-hint' : undefined}
              onClick={() => {
                setNotice(null)
                accept('staff')
              }}
            >
              Accept request
            </Button>
            <Button
              variant="secondary"
              disabled={!canAsk}
              onClick={() => {
                setNotice(null)
                setPanel('ask')
              }}
            >
              Ask customer a question
            </Button>
            <Button
              variant="secondary"
              disabled={!canEdit}
              onClick={() => {
                setNotice(null)
                setPanel('edit')
              }}
            >
              Edit request
            </Button>
          </div>
          {!check.allowed && check.reason && (
            <p id="staff-accept-hint" className="mt-3 text-sm text-muted">
              {check.reason}
            </p>
          )}
          {panel === 'ask' && <AskCustomerPanel onSimulateSend={simulateSend} onCancel={() => setPanel(null)} />}
          {panel === 'edit' && (
            <EditRequestPanel
              lines={order.lines}
              guestCount={order.intent.guestCount}
              onSave={saveEdit}
              onCancel={() => setPanel(null)}
            />
          )}
          {notice && (
            <p role="status" className="mt-3 font-sans text-sm">
              {notice}
            </p>
          )}
          {lastError && (
            <p role="alert" className="mt-3 font-sans text-sm text-status-blocked">
              {lastError}
            </p>
          )}
          {order.messages.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <Eyebrow>Messages</Eyebrow>
              <p className="mt-1 text-sm text-muted">Recorded in the demo. Not delivered to the customer.</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {order.messages.map((message) => (
                  <li key={message.id} className="[overflow-wrap:anywhere]">
                    <strong className="font-sans">{authorLabel[message.author]}:</strong> {message.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!closed && (
            <p className="mt-4 text-sm text-muted">
              Simulated: accepting here does not create a real order or contact the customer.
            </p>
          )}
        </Panel>

        <div className="grid gap-6 self-start">
          <OrderSummaryPanel summary={summary} showFlags={false} />
          <AssistantPanel audience="staff" />
        </div>
      </div>
    </Band>
  )
}
