import { catalog, type Message, type Order, type OrderIntent, type OrderLine, type OrderStatus } from './index'
import { detectExceptions } from '../engine'
import { scenarios } from './scenarios'

const routine = scenarios.find((scenario) => scenario.id === 'routine')!
const unusual = scenarios.find((scenario) => scenario.id === 'unusual')!
const sampleNow = '2026-10-13T09:00'

function makeOrder(input: {
  id: string
  status: OrderStatus
  intent: OrderIntent
  lines: OrderLine[]
  messages?: Message[]
  revision?: Order['revision']
  at?: string
}): Order {
  const at = input.at ?? sampleNow
  const flags = detectExceptions({ intent: input.intent, lines: input.lines, now: sampleNow }, catalog)
  return {
    id: input.id,
    demoSample: true,
    status: input.status,
    intent: input.intent,
    lines: input.lines,
    suppliesChoice: 'none',
    flags,
    revision: input.revision ?? 'none',
    messages: input.messages ?? [],
    history: [
      { from: null, to: 'draft', actor: 'system', at: '2026-10-12T10:00' },
      { from: 'draft', to: input.status, actor: input.status === 'rejected' ? 'staff' : 'customer', at, note: 'Illustrative sample record' },
    ],
  }
}

export const sampleOrders: Order[] = [
  makeOrder({
    id: 'sample-submitted-routine',
    status: 'submitted',
    intent: { ...routine.intent, contactName: 'Jordan Lee', organization: 'Sample Co.', eventAt: '2026-10-19T12:00' },
    lines: [{ itemId: 'slow-roasted-pork', units: 40 }, { itemId: 'rice-pigeon-peas', units: 40 }, { itemId: 'kale-salad', units: 40 }],
  }),
  makeOrder({
    id: 'sample-needs-review',
    status: 'needs_review',
    intent: { ...unusual.intent, contactName: 'Sam Rivera', organization: 'Rivera Wedding' },
    lines: [{ itemId: 'curry-tofu', units: 38 }, { itemId: 'jerk-chicken', units: 112 }, { itemId: 'brown-rice-quinoa-lima', units: 150 }],
    messages: [{ id: 'sample-msg-1', author: 'customer', text: 'We have a few guests with dietary requirements. Please confirm ingredient details before the event.', at: '2026-10-13T09:04' }],
  }),
  makeOrder({
    id: 'sample-awaiting-approval',
    status: 'awaiting_customer_approval',
    revision: 'pending',
    intent: { ...routine.intent, contactName: 'Morgan Chen', organization: 'Northstar Studio', eventAt: '2026-10-22T13:00', dietary: [] },
    lines: [{ itemId: 'slow-roasted-pork', units: 24 }, { itemId: 'curry-tofu', units: 16 }, { itemId: 'tropical-fried-rice', units: 40 }],
    messages: [
      { id: 'sample-msg-2', author: 'staff', text: 'We adjusted the entree quantities to include a plant-based option. Please review the proposal.', at: '2026-10-13T09:05' },
      { id: 'sample-msg-3', author: 'customer', text: 'Thanks, I will review the updated quantities.', at: '2026-10-13T09:08' },
    ],
  }),
  makeOrder({
    id: 'sample-confirmed-past',
    status: 'confirmed',
    intent: { ...routine.intent, contactName: 'Taylor Brooks', organization: 'Harbor Group', eventAt: '2026-09-22T12:00' },
    lines: [{ itemId: 'sous-poulet', units: 30 }, { itemId: 'yellow-rice', units: 30 }, { itemId: 'kale-salad', units: 30 }],
    at: '2026-09-10T11:00',
  }),
  makeOrder({
    id: 'sample-declined',
    status: 'rejected',
    intent: { ...unusual.intent, contactName: 'Avery James', organization: 'Avery Celebration', eventAt: '2026-10-16T18:00' },
    lines: [{ itemId: 'jerk-chicken', units: 100 }, { itemId: 'curry-tofu', units: 50 }],
    messages: [{ id: 'sample-msg-4', author: 'staff', text: 'We could not accommodate the requested timing for this sample event.', at: '2026-10-13T09:10' }],
  }),
]
