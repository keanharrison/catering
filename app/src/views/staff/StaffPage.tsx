import { Link } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { catalog } from '../../data'
import { statusLabel, statusTone } from '../../lib/status'
import { routes } from '../../routes'
import { canAccept } from '../../state/orderMachine'
import { useDemoStore } from '../../state/store'
import { buildOrderSummary } from '../customer/orderSummary'

// Minimal, simulated staff view: one request, its flags, and an accept action.
export function StaffPage() {
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const accept = useDemoStore((state) => state.accept)

  if (order.status === 'draft') {
    return (
      <Band>
        <Eyebrow marker>Staff view &middot; simulated</Eyebrow>
        <h1 className="mt-6 text-5xl">No requests yet.</h1>
        <p className="mt-6 max-w-xl text-muted">
          Submit a request from the customer view and it will appear here.
        </p>
      </Band>
    )
  }

  const summary = buildOrderSummary(order, clock)
  const eventType = catalog.eventTypes.find((e) => e.id === order.intent.eventType)?.label ?? order.intent.eventType
  const check = canAccept(order, 'staff')

  return (
    <Band>
      <Eyebrow marker>Staff view &middot; simulated</Eyebrow>
      <h1 className="mt-6 text-5xl md:text-7xl">Requests needing attention.</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel corners className="self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-2xl">
                {eventType}, {order.intent.guestCount} guests
              </h2>
              <p className="mt-1 font-sans text-sm text-muted">
                {order.intent.contactName}
                {order.intent.organization ? `, ${order.intent.organization}` : ''}
              </p>
            </div>
            <Pill tone={statusTone[order.status]}>{statusLabel[order.status]}</Pill>
          </div>

          <div className="mt-6">
            <Eyebrow>Why it needs a look</Eyebrow>
            {order.flags.length === 0 ? (
              <p className="mt-2 text-sm">Nothing flagged. This request fits the standard rules.</p>
            ) : (
              <ul className="mt-2 grid gap-2 text-sm">
                {order.flags.map((flag) => (
                  <li key={flag.code}>{flag.reason}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button disabled={!check.allowed} onClick={() => accept('staff')}>
              Accept request
            </Button>
            {order.status === 'confirmed' && (
              <Link to={routes.handoff} className="font-sans underline underline-offset-4">
                View handoff summary
              </Link>
            )}
          </div>
          {lastError && (
            <p role="alert" className="mt-3 font-sans text-sm text-status-blocked">
              {lastError}
            </p>
          )}
          <p className="mt-4 text-sm text-muted">
            Simulated: accepting here does not create a real order or contact the customer.
          </p>
        </Panel>

        <div className="self-start">
          <OrderSummaryPanel summary={summary} />
        </div>
      </div>
    </Band>
  )
}
