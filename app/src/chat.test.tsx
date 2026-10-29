// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

beforeEach(() => {
  localStorage.clear()
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.getState().startBlankDraft()
})
afterEach(cleanup)

describe('chat page', () => {
  it('opens on a headline, the composer and suggestions, with a Preview label in the bar', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(screen.getByRole('heading', { level: 1, name: 'What can I help you with?' })).toBeTruthy()
    expect(screen.getByLabelText('Ask a question')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Suggestions' })).toBeTruthy()
    expect(screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label')?.endsWith('?'))).toHaveLength(4)
    expect(within(document.querySelector('[data-slot="site-header"]') as HTMLElement).getByText('Preview')).toBeTruthy()
  })

  it('turns into a thread when a suggestion is chosen and keeps the composer available', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    await user.click(screen.getByRole('button', { name: 'Do I have any drafts?' }))
    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(within(log).getByText(/You have no draft right now/)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Suggestions' })).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Chat' })).toBeTruthy()
    expect((screen.getByLabelText('Ask a question') as HTMLInputElement).value).toBe('')
  })

  it('sends a typed question and keeps Send disabled while the field is empty', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const send = screen.getByRole('button', { name: 'Send question' }) as HTMLButtonElement
    expect(send.disabled).toBe(true)
    await user.type(screen.getByLabelText('Ask a question'), 'When is my next event?')
    expect(send.disabled).toBe(false)
    await user.click(send)
    expect(within(screen.getByRole('log')).getByText(/no upcoming event/)).toBeTruthy()
  })

  it('offers + to attach files, lists them, and says plainly that attachments are not read yet', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(screen.getByRole('button', { name: 'Attach files' })).toBeTruthy()
    const picker = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(picker, new File(['x'], 'menu-ideas.pdf', { type: 'application/pdf' }))
    const attached = screen.getByRole('list', { name: 'Attached files' })
    expect(within(attached).getByText('menu-ideas.pdf')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Send question' }) as HTMLButtonElement).disabled).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Send question' }))
    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(within(log).getByText(/can't open attachments in this preview/)).toBeTruthy()
    expect(within(log).getByText(/Attached: menu-ideas\.pdf/)).toBeTruthy()
  })

  it('lets an attachment be removed before sending', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const picker = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(picker, new File(['x'], 'a.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: 'Remove a.png' }))
    expect(screen.queryByRole('list', { name: 'Attached files' })).toBeNull()
  })

  it('puts the cursor in the question field on arrival', () => {
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    expect(document.activeElement).toBe(screen.getByLabelText('Ask a question'))
  })

  it('rotates three example questions in the empty field and hides them once typing starts', async () => {
    const user = userEvent.setup()
    renderAppAt('/customer/ask-pearl', <AppRoutes />)
    const hint = () => document.querySelector('.chat-hint') as HTMLElement
    // jsdom has no CSS animation support, so React listens for the prefixed event name; send whichever it is waiting for.
    const end = () => { fireEvent.animationEnd(hint()); fireEvent(hint(), new Event('webkitAnimationEnd', { bubbles: true })) }
    expect(hint().textContent).toBe('What’s the status of my request?')
    end()
    expect(hint().textContent).toBe('When is my next event?')
    end()
    expect(hint().textContent).toBe('Do I have any drafts in progress?')
    end()
    expect(hint().textContent).toBe('What’s the status of my request?')
    expect(hint().getAttribute('aria-hidden')).toBe('true')
    await user.type(screen.getByLabelText('Ask a question'), 'x')
    expect((screen.getByLabelText('Ask a question') as HTMLInputElement).value).toBe('x')
  })
})
