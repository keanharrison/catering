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
  it('shows a neutral empty state, with no sample numbers or cards, before any request exists', () => {
    renderAppAt('/staff/analytics', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Admin account menu' })).toBeTruthy()
    expect(screen.getByText('No analytics yet')).toBeTruthy()
    expect(screen.queryByText(/sample/i)).toBeNull()
    expect(screen.queryByText('Needs review')).toBeNull()
    expect(screen.queryByRole('group', { name: /Requests received/ })).toBeNull()
  })

  it('shows counted widgets once a request exists', () => {
    const store = useDemoStore.getState()
    store.updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }], suppliesChoice: 'none' })
    store.submit()
    renderAppAt('/staff/analytics', <AppRoutes />)
    expect(screen.queryByText('No analytics yet')).toBeNull()
    expect(screen.queryByText(/sample/i)).toBeNull()
    for (const title of ['Requests received', 'Event types', 'Pickup or delivery', 'Menu demand', 'Accepted events']) {
      expect(screen.getByText(title)).toBeTruthy()
    }
    expect(screen.getByText('Slow Roasted Pork')).toBeTruthy()
  })

  it('reads a day aloud on focus and moves with the arrow keys', async () => {
    const user = userEvent.setup()
    const store = useDemoStore.getState()
    store.updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }], suppliesChoice: 'none' })
    store.submit()
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
