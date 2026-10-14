import { beforeAll, describe, expect, it } from 'vitest'
import { recommend } from '../engine'

// The store persists to localStorage, which does not exist in the node test runner.
beforeAll(() => {
  const data = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  } as Storage
})

async function loadStore() {
  const { useDemoStore } = await import('./store')
  return useDemoStore
}

describe('demo store', () => {
  it('starts at the routine scenario in draft', async () => {
    const store = await loadStore()
    store.getState().loadScenario('routine')
    expect(store.getState().order.status).toBe('draft')
  })

  it('walks the unusual scenario and reset restores the known start', async () => {
    const store = await loadStore()
    const s = () => store.getState()
    s().loadScenario('unusual')
    const lines = recommend(s().order.intent).lines.map(({ itemId, units }) => ({ itemId, units }))
    s().updateDraft({ lines, suppliesChoice: 'none' })
    s().submit()
    expect(s().order.status).toBe('needs_review')
    s().accept('customer')
    expect(s().lastError).toMatch(/staff/)
    s().revise(s().order.lines)
    s().accept('staff')
    expect(s().order.status).toBe('awaiting_customer_approval')
    s().customerApprove()
    s().accept('staff')
    expect(s().order.status).toBe('confirmed')

    s().reset()
    expect(s().scenarioId).toBe('unusual')
    expect(s().order.status).toBe('draft')
    expect(s().order.history).toHaveLength(1)
    expect(s().lastError).toBeNull()
  })

  it('switching scenarios gives a fresh draft', async () => {
    const store = await loadStore()
    store.getState().loadScenario('routine')
    expect(store.getState().order.intent.guestCount).toBe(40)
  })
})
