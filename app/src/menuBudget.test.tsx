// @vitest-environment jsdom
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.setSystemTime(new Date('2026-10-13T09:00'))
  localStorage.setItem('pi2go-demo-account', 'customer')
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.getState().startBlankDraft()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function planFor(guests: number, budgetDollars: number | null) {
  const store = useDemoStore.getState()
  store.updateDraft({
    intent: { ...store.order.intent, eventType: 'wedding', guestCount: guests, eventAt: '2026-10-20T12:00', fulfillment: 'pickup', budgetCents: budgetDollars === null ? null : budgetDollars * 100 },
  })
}

async function suggest() {
  const user = userEvent.setup()
  renderAppAt('/customer/menu', <AppRoutes />)
  await user.click(screen.getByRole('button', { name: 'Suggest' }))
  return { user, panel: within(screen.getByText('Help me choose').closest('[data-slot="card"]') as HTMLElement) }
}

describe('Help me choose and the food budget', () => {
  it('shows the estimated total, the budget and what is left, with a one-line explanation', async () => {
    planFor(40, 1200)
    const { panel } = await suggest()
    const budget = within(panel.getByLabelText('Budget'))
    expect(budget.getByText('Estimated food total')).toBeTruthy()
    expect(budget.getByText('$1,200.00')).toBeTruthy()
    expect(budget.getByText('Remaining')).toBeTruthy()
    expect(panel.getByText(/under your \$1,200\.00 food budget|Fits your \$1,200\.00 food budget/)).toBeTruthy()
  })

  it('trims the menu to fit a tight budget and says what it left out', async () => {
    planFor(40, 450)
    const { panel } = await suggest()
    expect(panel.getByText(/Left out/)).toBeTruthy()
    expect(panel.queryByText('Over budget by')).toBeNull()
  })

  it('says so when the budget cannot be met', async () => {
    planFor(40, 100)
    const { panel } = await suggest()
    expect(panel.getByText('Over budget by')).toBeTruthy()
    expect(panel.getByText(/lowest-cost order we can suggest/)).toBeTruthy()
  })

  it('offers add-ons only when there is room, and an added one reduces what is left', async () => {
    planFor(40, 2000)
    const { user, panel } = await suggest()
    const before = panel.getByText('Remaining').nextSibling?.textContent
    const add = panel.getAllByRole('button', { name: /^Add / })[0]
    await user.click(add)
    expect(panel.getByText('Remaining').nextSibling?.textContent).not.toBe(before)
    expect(panel.getByText('Optional add-on you chose.')).toBeTruthy()
  })

  it('changes nothing in the order until the customer applies a suggestion', async () => {
    planFor(40, 5000)
    await suggest()
    const lines = useDemoStore.getState().order.lines
    expect(lines).toEqual([]) // nothing is added to the order until the customer applies
  })

  it('keeps the food the customer already chose when the suggestion is applied', async () => {
    planFor(40, 1500)
    useDemoStore.getState().updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 40 }, { itemId: 'supplies-cups', units: 40 }] })
    const { user, panel } = await suggest()
    await user.click(panel.getByRole('button', { name: 'Apply' }))
    const lines = useDemoStore.getState().order.lines
    expect(lines.find((l) => l.itemId === 'slow-roasted-pork')?.units).toBe(40)
    expect(lines.some((l) => l.itemId === 'supplies-cups')).toBe(true)
  })
})
