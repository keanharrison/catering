import { useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { JourneyNav } from '../../components/JourneyNav'
import { OrderSummaryPanel } from '../../components/OrderSummaryPanel'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { StageGate } from '../../components/StageGate'
import { catalog } from '../../data'
import { formatEventTime, statusLabel, statusTone } from '../../lib/status'
import { useDemoStore } from '../../state/store'
import { stagePath, type Stage } from './journey'
import { buildOrderSummary } from './orderSummary'

export function ReviewPage() {
  return (
    <StageGate stage="review">
      <ReviewView />
    </StageGate>
  )
}

function ReviewView() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const lastError = useDemoStore((state) => state.lastError)
  const submit = useDemoStore((state) => state.submit)
  const reset = useDemoStore((state) => state.reset)

  const summary = buildOrderSummary(order, clock)
  const { intent } = order
  const eventType = catalog.eventTypes.find((e) => e.id === intent.eventType)?.label ?? intent.eventType
  const submitted = order.status !== 'draft'

  const details: Array<{ label: string; value: string; edit: Stage }> = [
    { label: 'Event', value: eventType, edit: 'event' },
    { label: 'Guests', value: String(intent.guestCount ?? ''), edit: 'event' },
    {
      label: intent.fulfillment === 'delivery' ? 'Delivery' : 'Pickup',
      value: formatEventTime(intent.eventAt),
      edit: 'details',
    },
    { label: 'Dietary needs', value: intent.dietary.length > 0 ? intent.dietary.join(', ') : 'None listed', edit: 'event' },
    { label: 'Budget', value: intent.budgetCents === null ? 'Not given' : `$${(intent.budgetCents / 100).toLocaleString('en-US')}`, edit: 'event' },
    { label: 'Contact', value: [intent.contactName, intent.organization].filter(Boolean).join(', '), edit: 'details' },
    { label: 'Custom request', value: intent.customRequest || 'None', edit: 'details' },
    { label: 'Notes', value: intent.notes || 'None', edit: 'details' },
  ]

  return (
    <Band>
      <Eyebrow marker>Review</Eyebrow>
      <h1 className="mt-6 text-4xl md:text-7xl">{submitted ? 'Request recorded.' : 'Review your request.'}</h1>
      <div className="mt-10">
        <JourneyNav active="review" />
      </div>

      {submitted && (
        <Panel corners className="mt-10" >
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Status</Eyebrow>
            <Pill tone={statusTone[order.status]}>{statusLabel[order.status]}</Pill>
          </div>
          <p className="mt-4 font-sans text-xl">
            This request was recorded in the demo. Nothing was sent to Pearl Island, and no payment was taken.
          </p>
          <p className="mt-3 text-sm text-muted">
            {order.status === 'submitted' && 'In the live flow, our team would review it and confirm the details with you.'}
            {order.status === 'needs_review' && 'In the live flow, our team would check the items listed and follow up with you.'}
            {order.status === 'confirmed' && 'Accepted in the staff demo view. No real order exists.'}
            {order.status === 'rejected' && 'Declined in the staff demo view.'}
          </p>
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                reset()
                navigate(stagePath('event'))
              }}
            >
              Start over
            </Button>
          </div>
        </Panel>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Panel className="self-start p-0">
          <dl>
            {details.map((row) => (
              <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-6 py-3 last:border-b-0">
                <dt className="font-mono text-xs uppercase tracking-eyebrow text-muted">{row.label}</dt>
                <dd className="flex items-baseline gap-4 font-sans">
                  <span>{row.value}</span>
                  {!submitted && (
                    <button type="button" className="text-sm underline underline-offset-2" onClick={() => navigate(stagePath(row.edit))}>
                      Edit
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="self-start">
          <OrderSummaryPanel summary={summary} showCoverage={!submitted}>
            {!submitted && (
              <div className="grid gap-2">
                <Button onClick={submit}>Submit request</Button>
                <p className="text-sm text-muted">
                  In this demo, submitting records your request on this device only. Nothing is sent to Pearl Island, it is not an accepted order, and no payment is taken.
                </p>
                {lastError && (
                  <p role="alert" className="font-sans text-sm text-status-blocked">
                    {lastError}
                  </p>
                )}
              </div>
            )}
          </OrderSummaryPanel>
        </div>
      </div>

      {!submitted && (
        <div className="mt-10">
          <Button variant="secondary" onClick={() => navigate(stagePath('details'))}>
            Back
          </Button>
        </div>
      )}
    </Band>
  )
}
