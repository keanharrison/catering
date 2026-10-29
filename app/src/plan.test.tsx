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

async function pickDate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(btn('Choose a date'))
  await user.click(await screen.findByRole('button', { name: /October 20th, 2026/ }))
}

describe('Plan with AI', () => {
  it('starts with a required choice between the two paths', async () => {
    renderAt('/customer')
    expect(screen.getAllByRole('button', { name: 'Plan with AI' })).toHaveLength(1)
    expect(btn('Enter details myself')).toBeTruthy()
    expect(screen.queryByLabelText('Guests')).toBeNull()
  })

  it('opens the unchanged request form on Enter details myself', async () => {
    renderAt('/customer')
    await userEvent.setup().click(btn('Enter details myself'))
    expect(screen.getByLabelText('Guests')).toBeTruthy()
    expect(screen.queryByText(/Filled in from your answers/)).toBeNull()
  })

  it('does not ask again once a path is chosen', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/customer')
    await user.click(btn('Enter details myself'))
    await user.type(screen.getByLabelText('Guests'), '12')
    unmount()
    renderAt('/customer')
    expect(screen.queryByRole('button', { name: 'Enter details myself' })).toBeNull()
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('12')
  })

  it('offers Switch to AI in the corner of the form and keeps what was typed', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await user.click(btn('Enter details myself'))
    await user.click(screen.getByRole('combobox', { name: 'Event type' }))
    await user.click(await screen.findByRole('option', { name: 'Wedding' }))
    await user.type(screen.getByLabelText('Guests'), '60')
    await user.click(btn('Switch to AI'))

    const log = screen.getByRole('log').textContent
    expect(log).toContain('Wedding')
    expect(log).toContain('60 guests')
    expect(btn('Switch to manual')).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Pickup' })).toBeTruthy() // resumes at the first open question
  })

  it('asks the six questions in a chat, then carries every answer into the editable form', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await user.click(btn('Plan with AI'))

    await user.click(radio('Corporate lunch'))
    await pickDate(user)
    await user.type(screen.getByLabelText('Number of guests'), 'about 40')
    await user.click(btn('Send guest count'))
    await user.click(radio('Delivery'))
    await user.click(screen.getByRole('checkbox', { name: 'Vegetarian' }))
    await user.click(btn('Done'))
    await user.type(screen.getByLabelText('Budget in dollars'), '$800')
    await user.click(btn('Send budget'))

    // Each reply stays in the conversation.
    const log = screen.getByRole('log')
    for (const text of ['Corporate lunch', '40 guests', 'Delivery', 'Vegetarian', '$800']) expect(log.textContent).toContain(text)

    await user.click(btn('Review your request'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('40')
    expect((screen.getByLabelText(/Budget/) as HTMLInputElement).value).toBe('800')
    expect(screen.getByText(/Filled in from your answers/)).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: /Vegetarian/ }).getAttribute('aria-checked') ?? (screen.getByRole('checkbox', { name: /Vegetarian/ }) as HTMLInputElement).checked).toBeTruthy()
  })

  it('refuses an answer it cannot use and says why', async () => {
    const user = userEvent.setup()
    renderAt('/customer/plan')
    await user.click(radio('Wedding'))
    await pickDate(user)
    await user.type(screen.getByLabelText('Number of guests'), 'lots')
    await user.click(btn('Send guest count'))
    expect(screen.getByRole('alert').textContent).toContain('at least 1')
  })

  it('lets dietary needs and budget be skipped', async () => {
    const user = userEvent.setup()
    renderAt('/customer/plan')
    await user.click(radio('Wedding'))
    await pickDate(user)
    await user.type(screen.getByLabelText('Number of guests'), '20')
    await user.click(btn('Send guest count'))
    await user.click(radio('Pickup'))
    await user.click(btn('No dietary needs'))
    await user.click(btn('Skip'))
    await user.click(btn('Review your request'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('20')
    expect((screen.getByLabelText(/Budget/) as HTMLInputElement).value).toBe('')
  })

  it('keeps the answers given so far when switching to manual', async () => {
    const user = userEvent.setup()
    renderAt('/customer/plan')
    await user.click(radio('Wedding'))
    await pickDate(user)
    await user.type(screen.getByLabelText('Number of guests'), '80')
    await user.click(btn('Send guest count'))
    await user.click(btn('Switch to manual'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('80')
    expect(screen.getByText(/Filled in from your answers/)).toBeTruthy()
  })

  it('picks the chat back up where it stopped after a refresh', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/customer/plan')
    await user.click(radio('Wedding'))
    unmount()
    renderAt('/customer/plan')
    expect(btn('Choose a date')).toBeTruthy()
    expect(screen.getByRole('log').textContent).toContain('Wedding')
  })
})
