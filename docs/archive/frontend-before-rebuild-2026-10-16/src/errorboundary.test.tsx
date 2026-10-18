// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './components/ErrorBoundary'
import { STORAGE_KEY } from './state/store'

function Broken(): never {
  throw new Error('boom')
}

afterEach(cleanup)

describe('error boundary', () => {
  it('shows a way out instead of a blank page, and clearing saved data calls onReset', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, 'something')
    const onReset = vi.fn()
    render(
      <ErrorBoundary onReset={onReset}>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('heading', { name: 'Something went wrong.' })).toBeTruthy()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Start over' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(onReset).toHaveBeenCalledOnce()
    vi.restoreAllMocks()
  })

  it('renders children normally when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeTruthy()
  })
})
