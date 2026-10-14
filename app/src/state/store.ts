import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { catalog, type Actor, type Order, type OrderIntent, type OrderLine, type Scenario } from '../data'
import { addMinutes } from '../engine'
import * as machine from './orderMachine'

/**
 * The live demo state: current scenario, a demo clock, and the order. Persisted in
 * the browser so a refresh keeps the walkthrough, and reset returns to a known start.
 */

const STORAGE_KEY = 'pi2go-demo'
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
  lastError: string | null

  loadScenario: (id: string) => void
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

function freshState(id: string, previousSession = 0) {
  const scenario = findScenario(id)
  return {
    scenarioId: id,
    session: previousSession + 1,
    clock: scenario.now,
    order: machine.createOrder(scenario),
    lastError: null,
  }
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => {
      // Runs one machine action at the demo clock; keeps the error if it is refused.
      const run = (action: (order: Order, at: string) => machine.Result) => {
        const { order, clock } = get()
        const result = action(order, clock)
        if (result.ok) set({ order: result.order, clock: addMinutes(clock, 1), lastError: null })
        else set({ lastError: result.error })
      }

      return {
        ...freshState(DEFAULT_SCENARIO),
        loadScenario: (id) => set(freshState(id, get().session)),
        reset: () => set(freshState(get().scenarioId, get().session)),
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
