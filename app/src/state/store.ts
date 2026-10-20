import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { catalog, type Actor, type Order, type OrderIntent, type OrderLine, type Scenario } from '../data'
import { addMinutes } from '../engine'
import * as machine from './orderMachine'
import { isValidDemoState } from './validate'
import { sampleOrders } from '../data/sampleOrders'
import { prefillMissingContact } from './customerProfile'

/**
 * The live demo state: current scenario, a demo clock, and the order. Persisted in
 * the browser so a refresh keeps the walkthrough, and reset returns to a known start.
 */

export const STORAGE_KEY = 'pi2go-demo'
const DEFAULT_SCENARIO = 'routine'

function findScenario(id: string): Scenario {
  const scenario = catalog.scenarios.find((s) => s.id === id)
  if (!scenario) throw new Error(`Unknown scenario: ${id}`)
  return scenario
}

type DemoState = {
  scenarioId: string
  /** Bumps whenever a scenario loads or resets, so screens can drop stale local form state. */
  session: number
  /** Demo clock; starts at the scenario's fixed time and moves a minute per action. */
  clock: string
  order: Order
  draftOrder: Order
  orders: Order[]
  lastError: string | null
  clearError: () => void

  loadScenario: (id: string) => void
  activateOrder: (id: string) => void
  activateDraft: () => void
  /** Logging in as a customer: replace the sample draft with an empty one and drop any half-typed form. */
  startBlankDraft: () => void
  reset: () => void
  updateDraft: (patch: {
    intent?: OrderIntent
    lines?: OrderLine[]
    suppliesChoice?: Order['suppliesChoice']
  }) => void
  submit: () => void
  requestClarification: (text: string) => void
  customerReply: (text: string) => void
  revise: (lines: OrderLine[]) => void
  customerApprove: () => void
  accept: (actor: Actor) => void
  reject: (reason: string) => void
}

/** A customer's new request starts with no answers; only their saved account profile fills the contact fields. */
function blankDraft(scenario: Scenario) {
  const intent = prefillMissingContact({
    contactName: '', email: '', phone: '', organization: '',
    deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '',
    eventType: '', guestCount: null, eventAt: '', fulfillment: 'pickup' as const,
    dietary: [], budgetCents: null, notes: '', customRequest: '',
  })
  return machine.createOrder({ ...scenario, intent })
}

function freshState(id: string, previousSession = 0) {
  const scenario = findScenario(id)
  const order = machine.createOrder({ ...scenario, intent: prefillMissingContact(scenario.intent) })
  return {
    scenarioId: id,
    session: previousSession + 1,
    clock: scenario.now,
    order,
    draftOrder: order,
    orders: sampleOrders,
    lastError: null,
  }
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => {
      // Runs one machine action at the demo clock; keeps the error if it is refused.
      const run = (action: (order: Order, at: string) => machine.Result) => {
        const { order, clock, orders, scenarioId } = get()
        const result = action(order, clock)
        if (result.ok) {
          let nextOrder = result.order
          if (order.status === 'draft' && nextOrder.status !== 'draft' && orders.some((item) => item.id === nextOrder.id)) {
            const ordinal = orders.filter((item) => item.id.startsWith(nextOrder.id)).length + 1
            nextOrder = { ...nextOrder, id: `${nextOrder.id}-${ordinal}` }
          }
          const nextDraft = order.status !== 'draft'
            ? get().draftOrder
            : nextOrder.status === 'draft'
              ? nextOrder
              : machine.createOrder({ ...findScenario(scenarioId), intent: prefillMissingContact(findScenario(scenarioId).intent) })
          const nextOrders = nextOrder.status === 'draft'
            ? orders
            : [...orders.filter((item) => item.id !== nextOrder.id), nextOrder]
          set({ order: nextOrder, draftOrder: nextDraft, orders: nextOrders, clock: addMinutes(clock, 1), lastError: null })
        }
        else set({ lastError: result.error })
      }

      return {
        ...freshState(DEFAULT_SCENARIO),
        clearError: () => set({ lastError: null }),
        loadScenario: (id) => {
          const previous = get()
          set({ ...freshState(id, previous.session), orders: previous.orders })
        },
        activateOrder: (id) => {
          const order = get().orders.find((item) => item.id === id)
          if (order) set({ order, lastError: null })
        },
        activateDraft: () => set({ order: get().draftOrder, lastError: null }),
        startBlankDraft: () => {
          const draft = blankDraft(findScenario(get().scenarioId))
          set({ order: draft, draftOrder: draft, session: get().session + 1, lastError: null })
        },
        reset: () => set({ ...freshState(get().scenarioId, get().session), orders: get().orders }),
        updateDraft: (patch) => run((order) => machine.updateDraft(order, patch)),
        submit: () => run((order, at) => machine.submit(order, at)),
        requestClarification: (text) => run((order, at) => machine.requestClarification(order, text, at)),
        customerReply: (text) => run((order, at) => machine.customerReply(order, text, at)),
        revise: (lines) => run((order, at) => machine.revise(order, lines, at)),
        customerApprove: () => run((order, at) => machine.customerApprove(order, at)),
        accept: (actor) => run((order, at) => machine.accept(order, actor, at)),
        reject: (reason) => run((order, at) => machine.reject(order, reason, at)),
      }
    },
    {
      name: STORAGE_KEY,
      version: 5,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        if (version < 5 && persisted && typeof persisted === 'object') {
          const state = persisted as { order?: Order & { intent?: Record<string, unknown> }; orders?: Order[]; draftOrder?: Order }
          if (state.order?.intent) {
            state.order.intent.email ??= ''
            state.order.intent.phone ??= ''
            state.order.intent.deliveryAddress ??= ''
            state.order.intent.deliveryCity ??= ''
            state.order.intent.deliveryState ??= ''
            state.order.intent.deliveryZip ??= ''
          }
        }
        if (persisted && typeof persisted === 'object') {
          const state = persisted as { orders?: Order[]; order?: Order; draftOrder?: Order }
          state.draftOrder ??= state.order?.status === 'draft' ? state.order : undefined
          const savedOrders = state.orders ?? (state.order && state.order.status !== 'draft' ? [state.order] : [])
          state.orders = [...sampleOrders, ...savedOrders.filter((order) => !sampleOrders.some((sample) => sample.id === order.id))]
        }
        return persisted as DemoState
      },
      // Ignore saved data that fails validation and start from the fresh state instead.
      merge: (persisted, current) => {
        if (!isValidDemoState(persisted)) return current
        const saved = persisted as Partial<DemoState>
        return {
          ...current,
          ...saved,
          draftOrder: saved.draftOrder ?? (saved.order?.status === 'draft' ? saved.order : current.draftOrder),
          orders: saved.orders?.length ? saved.orders : current.orders,
        }
      },
    },
  ),
)
