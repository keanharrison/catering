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

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const choice = (name: string) => screen.getByRole('radio', { name })

describe('New request assistant', () => {
  it('opens beside the form without leaving the page, starting at question 1 of 8', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    expect(screen.queryByRole('complementary', { name: 'AI assistant' })).toBeNull()
    await user.click(btn('Continue with AI'))
    const panel = within(screen.getByRole('complementary', { name: 'AI assistant' }))
    expect(panel.getByText('Question 1 of 8')).toBeTruthy()
    expect(panel.getByRole('heading', { name: 'What kind of event is it?' })).toBeTruthy()
    expect(screen.getByLabelText('Guests')).toBeTruthy() // the form is still there
    expect(btn('Hide assistant').getAttribute('aria-expanded')).toBe('true')
  })

  it('skips what the form already has', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await user.click(screen.getByRole('combobox', { name: 'Event type' }))
    await user.click(await screen.findByRole('option', { name: 'Wedding' }))
    await user.type(screen.getByLabelText('Guests'), '40')
    await user.click(btn('Continue with AI'))
    const panel = within(screen.getByRole('complementary', { name: 'AI assistant' }))
    expect(panel.getByText('Question 1 of 6')).toBeTruthy()
    expect(panel.getByRole('heading', { name: 'What date is the event?' })).toBeTruthy()
  })

  it('fills the form as it goes, proposes an editable order from the menu, and hands it to the manual flow', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await user.click(btn('Continue with AI'))
    await user.click(choice('Corporate lunch'))
    await user.click(choice('Tomorrow'))
    await user.click(choice('25'))
    await user.click(choice('Delivery'))
    await user.click(btn('No dietary needs'))
    await user.click(btn('Skip'))
    await user.click(choice('Chicken'))
    await user.click(choice('Plates and cutlery'))

    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('25') // answers land in the form
    const panel = within(screen.getByRole('complementary', { name: 'AI assistant' }))
    expect(panel.getByRole('heading', { name: 'Suggested order' })).toBeTruthy()
    const qty = panel.getByLabelText('Quantity of Jerk Chicken') as HTMLInputElement
    await user.clear(qty)
    await user.type(qty, '20')
    await user.click(panel.getByRole('button', { name: 'Remove Curry Chicken' }))
    await user.click(panel.getByRole('button', { name: 'Use this order' }))

    const order = useDemoStore.getState().order
    expect(order.lines.find((line) => line.itemId === 'jerk-chicken')?.units).toBe(20)
    expect(order.lines.some((line) => line.itemId === 'curry-chicken')).toBe(false)
    expect(order.lines.some((line) => line.itemId === 'supplies-plates-cutlery')).toBe(true)
    expect(order.suppliesChoice).toBe('selected')
    expect(order.intent.guestCount).toBe(25)
    expect(screen.getByRole('heading', { level: 1, name: /menu/i })).toBeTruthy() // the existing manual flow continues
  })

  it('keeps answers when switching to manual and back', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await user.click(btn('Continue with AI'))
    await user.click(choice('Wedding'))
    await user.click(btn('Switch to manual'))
    expect(screen.queryByRole('complementary', { name: 'AI assistant' })).toBeNull()
    await user.type(screen.getByLabelText('Guests'), '60')
    await user.click(btn('Continue with AI'))
    const panel = within(screen.getByRole('complementary', { name: 'AI assistant' }))
    expect(panel.getByText('Question 2 of 8')).toBeTruthy() // picks up where it left off
    expect(panel.getByRole('heading', { name: 'What date is the event?' })).toBeTruthy()
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('60')
  })

  it('explains a bad answer instead of moving on', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer', <AppRoutes />)
    await user.click(btn('Continue with AI'))
    await user.click(choice('Wedding'))
    await user.click(choice('Tomorrow'))
    await user.type(screen.getByLabelText('Or type a number'), 'lots')
    await user.click(btn('Next'))
    expect(screen.getByRole('alert').textContent).toMatch(/number of guests/)
  })
})
