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
import { statusLabel, statusTone } from '../../lib/status'
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
  const canAsk = order.status === 'submitted' || order.status === 'needs_review'
  const canEdit = canAsk || order.status === 'awaiting_customer_approval'

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
      <h1 className="mt-6 text-4xl md:text-7xl">Requests needing attention.</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel className="self-start p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-sans text-2xl [overflow-wrap:anywhere]">
                {eventType}, {order.intent.guestCount} guests
              </h2>
              <p className="mt-1 font-sans text-sm text-muted [overflow-wrap:anywhere]">
                {order.intent.contactName}
                {order.intent.organization ? `, ${order.intent.organization}` : ''}
              </p>
            </div>
            <Pill tone={statusTone[order.status]}>{statusLabel[order.status]}</Pill>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              disabled={!check.allowed}
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
            {order.status === 'confirmed' && (
              <Link to={routes.handoff} className="font-sans underline underline-offset-4">
                View handoff summary
              </Link>
            )}
          </div>
          {order.status === 'awaiting_customer_approval' && order.revision === 'pending' && (
            <p className="mt-3 text-sm text-muted">Waiting for the customer to approve the changes.</p>
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
          <p className="mt-4 text-sm text-muted">
            Simulated: accepting here does not create a real order or contact the customer.
          </p>
        </Panel>

        <div className="grid gap-6 self-start">
          <OrderSummaryPanel summary={summary} />
          <AssistantPanel audience="staff" />
        </div>
      </div>
    </Band>
  )
}
