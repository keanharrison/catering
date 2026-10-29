// @vitest-environment jsdom
import { act, cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'team')
  vi.setSystemTime(new Date('2026-10-13T09:00'))
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.setState({ orders: [] })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Admin Analytics', () => {
  it('is in the Admin sidebar and labels sample data when there are no requests', () => {
    renderAppAt('/staff/analytics', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Admin account menu' })).toBeTruthy()
    expect(screen.getByText('Sample data')).toBeTruthy()
    expect(screen.getByText(/made-up numbers/)).toBeTruthy()
    expect(screen.getByRole('group', { name: /Requests received and accepted per day/ })).toBeTruthy()
  })

  it('shows real counts, without the sample label, once a request exists', () => {
    const store = useDemoStore.getState()
    store.updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }], suppliesChoice: 'none' })
    store.submit()
    renderAppAt('/staff/analytics', <AppRoutes />)
    expect(screen.queryByText('Sample data')).toBeNull()
    expect(screen.getByText(/Counted from each request/)).toBeTruthy()
  })

  it('reads a day aloud on focus and moves with the arrow keys', async () => {
    const user = userEvent.setup()
    renderAppAt('/staff/analytics', <AppRoutes />)
    const chart = screen.getByRole('group', { name: /Requests received and accepted per day/ })
    act(() => chart.focus())
    expect(screen.getByRole('status').textContent).toMatch(/Received:\s*\d+/)
    const before = screen.getByRole('status').textContent
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('status').textContent).not.toBe(before)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('keeps customers out', () => {
    localStorage.setItem('pi2go-demo-account', 'customer')
    renderAppAt('/staff/analytics', <AppRoutes />)
    expect(screen.queryByRole('heading', { name: 'Analytics' })).toBeNull()
  })
})
