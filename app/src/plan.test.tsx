// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { sampleOrders } from './data/sampleOrders'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

function renderAt(path: string) {
  localStorage.setItem('pi2go-demo-account', 'customer')
  return renderAppAt(path, <AppRoutes />)
}
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const radio = (name: string) => screen.getByRole('radio', { name })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.setSystemTime(new Date('2026-10-13T09:00'))
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.setState({ orders: sampleOrders })
  useDemoStore.getState().startBlankDraft()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('AI-assisted start of a request', () => {
  it('offers the choice on an empty draft and goes to the plain form on manual', async () => {
    renderAt('/customer')
    expect(btn('Start with questions')).toBeTruthy()
    await userEvent.setup().click(btn('Fill it in myself'))
    expect(screen.getByLabelText('Guests')).toBeTruthy()
  })

  it('skips the choice once a draft is in progress', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/customer')
    await user.click(btn('Fill it in myself'))
    await user.type(screen.getByLabelText('Guests'), '12')
    unmount()
    renderAt('/customer')
    expect(screen.queryByRole('button', { name: 'Start with questions' })).toBeNull()
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('12')
  })

  it('runs the five questions, prefills the form, then suggests a menu with Undo', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await user.click(btn('Start with questions'))

    await user.click(radio('Corporate lunch'))
    await user.click(btn('Next'))
    await user.type(screen.getByLabelText('Number of guests'), 'about 40')
    await user.click(btn('Next'))
    await user.click(radio('Pickup'))
    await user.click(btn('Next'))
    await user.click(screen.getByRole('checkbox', { name: 'Vegetarian' }))
    await user.click(btn('Next'))
    await user.click(radio('Hearty'))
    await user.click(btn('Fill in my request'))

    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('40')
    expect(screen.getByText(/Filled in from your answers/)).toBeTruthy()

    await user.click(btn('Continue'))
    expect(await screen.findByText(/Filled in from your answers. You can restore/)).toBeTruthy()
    expect(btn('Undo')).toBeTruthy()
    // Notes belong to the Details step, so they wait in the saved form draft until then.
    expect(JSON.stringify({ ...sessionStorage })).toContain('Meal size: Hearty')
  })

  it('holds the next step back until a required question is answered', async () => {
    const user = userEvent.setup()
    renderAt('/customer/plan')
    await user.click(btn('Next'))
    expect(screen.getByRole('alert').textContent).toBe('Choose an event type.')
  })

  it('carries answers into the form when switching to manual', async () => {
    const user = userEvent.setup()
    renderAt('/customer/plan')
    await user.click(radio('Wedding'))
    await user.click(btn('Next'))
    await user.type(screen.getByLabelText('Number of guests'), '80')
    await user.click(btn('Switch to manual'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('80')
    expect(screen.getByText(/Filled in from your answers/)).toBeTruthy()
  })
})
