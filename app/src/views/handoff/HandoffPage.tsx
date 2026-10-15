import { Link } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Eyebrow } from '../../components/Eyebrow'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { PreviewTag } from '../../components/Tags'
import { catalog } from '../../data'
import { formatEventTime } from '../../lib/status'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { buildOrderSummary } from '../customer/orderSummary'

// Minimal, simulated handoff: a read-only order summary once staff accept the request.
export function HandoffPage() {
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)

  if (order.status !== 'confirmed') {
    return (
      <Band>
        <Eyebrow marker>Order handoff &middot; simulated</Eyebrow>
        <h1 className="mt-6 text-5xl">Nothing to hand off yet.</h1>
        <p className="mt-6 max-w-xl text-muted">
          A summary appears here after staff accept a request in the{' '}
          <Link to={routes.staff} className="underline underline-offset-4">
            staff view
          </Link>
          .
        </p>
      </Band>
    )
  }

  const { intent } = order
  const eventType = catalog.eventTypes.find((e) => e.id === intent.eventType)?.label ?? intent.eventType

  return (
    <Band>
      <Eyebrow marker>Order handoff &middot; simulated</Eyebrow>
      <h1 className="mt-6 text-4xl md:text-7xl">Order summary.</h1>
      <div className="mt-4">
        <PreviewTag label="Simulated - no real order exists" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel className="self-start p-6 md:p-8">
          <h2 className="font-sans text-2xl">
            {eventType}, {intent.guestCount} guests
          </h2>
          <p className="mt-2 font-sans text-sm text-muted">
            {intent.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}: {formatEventTime(intent.eventAt)}
          </p>
          <p className="mt-2 font-sans text-sm">
            {intent.contactName}
            {intent.organization ? `, ${intent.organization}` : ''}
          </p>
          {intent.customRequest && <p className="mt-4 text-sm">Custom request: {intent.customRequest}</p>}
          {intent.notes && <p className="mt-2 text-sm">Notes: {intent.notes}</p>}
        </Panel>
        <div className="self-start">
          <OrderSummaryPanel summary={buildOrderSummary(order, clock)} />
        </div>
      </div>
    </Band>
  )
}
