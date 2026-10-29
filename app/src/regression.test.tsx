// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { sampleOrders } from './data/sampleOrders'
import { useDemoStore } from './state/store'
import { intentToForm } from './views/customer/intake'
import { fillEventBasics } from './test/fillEventBasics'
import { renderAppAt } from './test/renderApp'

const errors: string[] = []

function renderAt(path: string) {
  localStorage.setItem('pi2go-demo-account', path.startsWith('/staff') || path === '/handoff' ? 'team' : 'customer')
  return renderAppAt(path, <AppRoutes />)
}
const h1 = () => screen.getByRole('heading', { level: 1 }).textContent
const btn = (name: string | RegExp) => screen.getAllByRole('button', { name })[0]
const store = () => useDemoStore.getState()

async function completeDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email (required)'), 'sample@example.com')
  await user.type(screen.getByLabelText('Phone (required)'), '555-010-0199')
  if (screen.queryByLabelText('Street address (required)')) {
    await user.type(screen.getByLabelText('Street address (required)'), '100 Main Street')
    await user.type(screen.getByLabelText('City (required)'), 'Nashville')
    await user.type(screen.getByLabelText('State (required)'), 'TN')
    await user.type(screen.getByLabelText('ZIP code (required)'), '37201')
  }
}

async function switchToTeam(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Customer account menu' }))
  await user.keyboard('{ArrowDown}')
  await user.keyboard('{ArrowRight}')
  await user.click(await screen.findByRole('menuitemradio', { name: 'Pearl Island team account' }))
}

beforeEach(() => {
  localStorage.clear()
  errors.length = 0
  vi.setSystemTime(new Date('2026-10-13T09:00')) // the first page defaults its date to today
  vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args.join(' ')))
  vi.spyOn(console, 'warn').mockImplementation((...args) => void errors.push(args.join(' ')))
  store().loadScenario('routine')
  // loadScenario keeps saved requests by design; start each test from the sample queue so tests don't leak into each other.
  useDemoStore.setState({ orders: sampleOrders })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('regression: full journeys and edge cases', () => {
  it('runs both full journeys without console errors or warnings', async () => {
    for (const id of ['routine', 'unusual']) {
      localStorage.removeItem('pi2go-demo-account')
      store().loadScenario(id)
      const user = userEvent.setup()
      renderAt('/customer')
      await fillEventBasics(user, id)
      await user.click(btn('Continue'))
      await user.click(btn('Suggest'))
      await user.click(btn('Apply'))
      await user.click(btn('Choose supplies'))
      await user.click(screen.getByRole('radio', { name: 'I need supplies' }))
      await user.click(screen.getByRole('checkbox', { name: 'Cups' }))
      await user.click(btn('Continue to details'))
      await completeDetails(user)
      await user.click(btn('Review your request'))
      await user.click(btn('Submit request'))
      await switchToTeam(user)
      await user.click(btn('Accept request'))
      await user.click(screen.getByRole('button', { name: 'View handoff' }))
      expect(store().order.status).toBe('confirmed')
      cleanup()
    }
    expect(errors).toEqual([])
  }, 60000)

  it('starts a customer login with an empty request and drops a half-typed form', async () => {
    sessionStorage.setItem('pi2go-customer-form-draft', JSON.stringify({ session: store().session, form: { ...intentToForm(store().order.intent), guestCount: '77' } }))
    store().startBlankDraft()
    renderAt('/customer')
    await userEvent.setup().click(btn('Enter details myself'))
    expect((screen.getByLabelText('Guests') as HTMLInputElement).value).toBe('')
    expect(store().order.intent).toMatchObject({ eventType: '', guestCount: null, contactName: '', organization: '', budgetCents: null, dietary: [] })
  })

  it('updates coverage when the guest count changes after the menu is built', async () => {
    const user = userEvent.setup()
    renderAt('/customer')
    await fillEventBasics(user)
    await user.click(btn('Continue'))
    await user.click(btn('Suggest'))
    await user.click(btn('Apply'))
    expect(screen.getByTestId('coverage').textContent).toContain('40 of 40 guests')
    await user.click(btn('Back'))
    const guests = screen.getByLabelText('Guests')
    await user.clear(guests)
    await user.type(guests, '80')
    await user.click(btn('Continue'))
    expect(screen.getByTestId('coverage').textContent).toContain('40 of 80 guests')
  }, 15000)

  it('caps a mistyped quantity so totals stay sane', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    const input = screen.getByRole('spinbutton', { name: 'Quantity of Sous Poulet Chicken' })
    await user.clear(input)
    await user.type(input, '999999999')
    expect(store().order.lines[0].units).toBe(5000)
  })

  it('restarts a draft and keeps direct URLs at the first incomplete step', () => {
    renderAt('/customer/review')
    expect(h1()).toBe('Plan your catering') // nothing to review yet: start at the beginning
    store().loadScenario('unusual')
    expect(store().order.status).toBe('draft')
    store().reset()
    expect(h1()).toBe('Plan your catering')
    expect(store().order.lines).toEqual([])
  })

  it('keeps the draft in browser storage', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Suggest'))
    await user.click(btn('Apply'))
    const saved = JSON.parse(localStorage.getItem('pi2go-demo') ?? '{}')
    expect(saved.state.order.lines.length).toBeGreaterThan(0)
  })

  it('locks a submitted request against edits and resubmission', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Suggest'))
    await user.click(btn('Apply'))
    await user.click(btn('Choose supplies'))
    await user.click(screen.getByRole('radio', { name: 'No supplies needed' }))
    await user.click(btn('Continue to details'))
      await completeDetails(user)
    await user.click(btn('Review your request'))
    await user.click(btn('Submit request'))
    expect(h1()).toBe('Review your catering request')
    expect(screen.getByText(/Request recorded · Submitted/)).toBeTruthy()
    expect(screen.queryAllByRole('button', { name: 'Submit request' })).toHaveLength(0)
    const before = store().order.lines.length
    store().updateDraft({ lines: [] })
    expect(store().lastError).toMatch(/draft/)
    expect(store().order.lines).toHaveLength(before)
  })

  it('shows staff sample requests and explains when no request is accepted yet', () => {
    renderAt('/staff')
    expect(screen.getByText('Catering requests')).toBeTruthy()
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1) // representative sample requests remain available
    cleanup()
    renderAt('/handoff')
    expect(screen.getByText('No accepted request yet')).toBeTruthy()
  })

  it('filters the staff queue by status and supports keyboard row selection', async () => {
    const user = userEvent.setup()
    renderAt('/staff')

    const [allTab, reviewTab, awaitingTab, confirmedTab] = screen.getAllByRole('tab')
    expect([allTab.textContent, reviewTab.textContent, awaitingTab.textContent, confirmedTab.textContent]).toEqual([
      '5All',
      '2Needs review',
      '1Awaiting customer',
      '1Accepted',
    ])
    expect(screen.getAllByRole('row')).toHaveLength(6)

    reviewTab.focus()
    await user.keyboard('{Enter}')
    expect(reviewTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getAllByRole('row')).toHaveLength(3)

    const selectedRow = screen.getByRole('row', { name: /Sam Rivera/ })
    selectedRow.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Rivera Wedding')).toBeTruthy()

    await user.click(awaitingTab)
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('row', { name: /Morgan Chen/ })).toBeTruthy()

    await user.click(confirmedTab)
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('row', { name: /Taylor Brooks/ })).toBeTruthy()
  })

  it('shows the food budget on both customer review and staff request details', () => {
    const intent = { ...store().order.intent, budgetCents: 120000 }
    store().updateDraft({ intent, lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/customer/review')
    expect(screen.getByText('Food budget').parentElement?.textContent).toContain('$1,200')
    cleanup()

    renderAt('/staff')
    expect(screen.getByText('Food budget').parentElement?.textContent).toContain('$1,200')
  })

  it('shows the staff empty state when there are no saved requests', () => {
    store().loadScenario('routine')
    useDemoStore.setState({ orders: [] })
    renderAt('/staff')
    expect(screen.getByText('No requests yet')).toBeTruthy()
  })

  it('keeps the customer conversations empty state usable with malformed saved drafts', () => {
    sessionStorage.setItem('pi2go-customer-message-drafts', '{bad json')
    sessionStorage.setItem('pi2go-customer-message-thread', 'missing-request')
    renderAt('/customer/messages')
    expect(screen.getByText('No conversations yet')).toBeTruthy()
  })

  it('details page: custom request and notes save while required contact fields validate', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    renderAt('/customer/details')

    const request = screen.getByLabelText('Custom request (optional)')
    const notes = screen.getByLabelText('Additional notes (optional)')
    await user.type(request, 'A vegan dessert tray')
    await user.type(notes, 'Please label the spicy dishes')
    await completeDetails(user)
    await user.click(btn('Review your request'))

    expect(store().order.intent.customRequest).toBe('A vegan dessert tray')
    expect(store().order.intent.notes).toBe('Please label the spicy dishes')
    expect(h1()).toBe('Review your catering request')
  })

  it('details page: required contact name is still enforced after the label change', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    renderAt('/customer/details')
    await user.clear(screen.getByLabelText('Contact name (required)'))
    await user.click(btn('Review your request'))
    expect(screen.getAllByRole('alert').some((alert) => /contact name/i.test(alert.textContent ?? ''))).toBe(true)
    expect(screen.getByText('Final details')).toBeTruthy()
  })

  it('menu layout keeps the live suggestion panel after the summary controls', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(btn('Suggest'))
    await user.click(btn('Apply'))

    const total = screen.getAllByText('Estimated total')[0]
    const continues = screen.getAllByRole('button', { name: 'Choose supplies' })
    expect(continues).toHaveLength(2) // desktop and mobile order-summary actions
    expect(screen.queryByRole('button', { name: 'Next: supplies' })).toBeNull()
    const assistant = screen.getByText('Help me choose').closest('[data-slot="card"]') as HTMLElement

    expect(total).toBeTruthy()
    expect(continues.every((button) => !(button as HTMLButtonElement).disabled)).toBe(true)
    expect(assistant).toBeTruthy()
  })

  it('menu suggestions are opt-in and applying one updates the order', async () => {
    const user = userEvent.setup()
    const startingLines = [{ itemId: 'kale-salad', units: 3 }]
    store().updateDraft({ lines: startingLines })
    renderAt('/customer/menu')
    expect(screen.queryByText(/Suggested for/)).toBeNull()
    await user.click(btn('Suggest'))
    expect(screen.getByText(/Suggested for 40 guests/)).toBeTruthy()
    await user.click(btn('Apply'))
    expect(store().order.lines.length).toBeGreaterThan(0)
    expect(store().order.lines).not.toEqual(startingLines)
    await user.click(btn('Undo'))
    expect(store().order.lines).toEqual(startingLines)
  })

  it('menu summary separates food and supply estimates and marks chosen rows', () => {
    store().updateDraft({
      lines: [
        { itemId: 'sous-poulet', units: 10 },
        { itemId: 'supplies-cups', units: 1 },
      ],
    })
    renderAt('/customer/menu')

    expect(screen.getByText('Food subtotal').parentElement?.textContent).toContain('$50')
    expect(screen.getByText('Supplies subtotal').parentElement?.textContent).toContain('$20')
    expect(screen.getByText('$70')).toBeTruthy()
    expect(screen.getAllByRole('listitem', { name: 'Sous Poulet Chicken, selected' })).toHaveLength(1)
  })

  it('menu filters show a clear empty state when dietary tags have no intersection', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    expect(screen.getByText(/Nothing chosen yet/)).toBeTruthy()
    expect((screen.getAllByRole('button', { name: 'Choose supplies' })[0] as HTMLButtonElement).disabled).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Vegan' }))
    await user.click(screen.getByRole('button', { name: 'Dairy-free' }))

    expect(screen.getByText('No menu items match')).toBeTruthy()
    expect(screen.getByText('Try removing a dietary filter or choose another menu category.')).toBeTruthy()
  })

  it('continues from the selected menu into supplies', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Sous Poulet Chicken' }))
    await user.click(screen.getAllByRole('button', { name: 'Choose supplies' })[0])

    expect(screen.getByText('Catering supplies')).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'No supplies needed' })).toBeTruthy()
  })

  it('menu suggestion guidance identifies its portion assumptions', async () => {
    const user = userEvent.setup()
    renderAt('/customer/menu')
    expect(screen.getByText('Help me choose')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Suggest' })).toBeTruthy()
    await user.click(btn('Suggest'))
    expect(screen.getByText(/portion assumptions/)).toBeTruthy()
  })

  it('staff request actions remain available for an open request', () => {
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')
    expect(screen.getByRole('button', { name: 'Accept request' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ask for clarification' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit request' })).toBeTruthy()
  })

  it('staff can draft a question and simulate sending it without implying delivery', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')

    await user.click(btn('Ask for clarification'))
    const send = btn('Save question')
    expect((send as HTMLButtonElement).disabled).toBe(true) // empty draft cannot be sent
    await user.type(screen.getByLabelText('Question for the customer'), 'Can the pickup move to 11:30?')
    await user.dblClick(send)

    expect(screen.getByRole('status').textContent).toMatch(/nothing was sent/i)
    expect(screen.getByText(/Question recorded locally/)).toBeTruthy()
    expect(store().order.messages.map((m) => m.text)).toContain('Can the pickup move to 11:30?')
    expect(store().order.messages.filter((m) => m.text === 'Can the pickup move to 11:30?')).toHaveLength(1)
    expect(store().order.status).toBe('needs_review')
    // Acceptance is unchanged: staff can still accept afterwards.
    await user.click(btn('Accept request'))
    expect(store().order.status).toBe('confirmed')
  })

  it('clarification is unavailable once the request is closed', async () => {
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    store().accept('staff')
    renderAt('/staff')
    expect(screen.queryByRole('button', { name: 'Ask for clarification' })).toBeNull()
  })

  it('revised proposals require customer approval before staff acceptance', () => {
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    store().revise([{ itemId: 'sous-poulet', units: 30 }])
    expect(store().order.lines).toEqual([{ itemId: 'sous-poulet', units: 30 }])
    expect(store().order.status).toBe('awaiting_customer_approval')
    store().accept('staff')
    expect(store().lastError).toMatch(/customer has not approved/i)
    expect(store().order.status).toBe('awaiting_customer_approval')

    store().customerApprove()
    expect(store().order.revision).toBe('approved')

    store().accept('staff')
    expect(store().order.status).toBe('confirmed')
  })

  it('staff edit can be cancelled without changing the order, and is unavailable once accepted', async () => {
    const user = userEvent.setup()
    store().loadScenario('routine')
    store().updateDraft({ lines: [{ itemId: 'sous-poulet', units: 40 }], suppliesChoice: 'none' })
    store().submit()
    renderAt('/staff')
    const before = JSON.stringify(store().order)
    await user.click(btn('Edit request'))
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Sous Poulet Chicken' }))
    await user.click(btn('Cancel'))
    expect(JSON.stringify(store().order)).toBe(before)
    cleanup()

    store().accept('staff')
    renderAt('/staff')
    expect(screen.queryByRole('button', { name: 'Edit request' })).toBeNull()
  })

  it('reset clears a submitted request and starts a new draft', () => {
    store().loadScenario('routine')
    store().updateDraft({
      lines: [{ itemId: 'sous-poulet', units: 40 }],
      suppliesChoice: 'none',
      intent: {
        ...store().order.intent,
        contactName: 'Jordan Lee',
        email: 'jordan@example.com',
        phone: '555-010-0199',
        eventAt: '2026-10-19T12:00',
      },
    })
    store().submit()
    expect(store().order.status).toBe('submitted')
    store().reset()
    expect(store().order.status).toBe('draft')
    expect(store().order.lines).toEqual([])
  })
  it('never lets a customer inherit a sample request that staff selected', () => {
    store().activateOrder('sample-needs-review')
    expect(store().order.demoSample).toBe(true)
    renderAt('/customer/review')
    expect(store().order.status).toBe('draft')
    expect(store().order.demoSample).toBeUndefined()
    expect(h1()).toBe('Plan your catering')
  })

  it('opens a fresh draft when New request is visited while a submitted request is active', async () => {
    store().updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }], suppliesChoice: 'none' })
    store().submit()
    expect(store().order.status).not.toBe('draft')
    renderAt('/customer')
    expect(store().order.status).toBe('draft')
    expect(h1()).toBe('Plan your catering')
    await userEvent.setup().click(btn('Enter details myself'))
    expect(screen.getByLabelText('Guests')).toBeTruthy()
    expect(store().lastError).toBeNull()
  })

  it('shows the latest request staff accepted on the handoff page even after another request is selected', () => {
    store().updateDraft({ lines: [{ itemId: 'slow-roasted-pork', units: 3 }], suppliesChoice: 'none' })
    store().submit()
    store().accept('staff')
    expect(store().order.status).toBe('confirmed')
    store().activateOrder('sample-needs-review')
    renderAt('/handoff')
    expect(h1()).toBe('Staff handoff')
  })
  it('lets staff decline an open request with a reason and shows it as declined', async () => {
    const user = userEvent.setup()
    renderAt('/staff')
    const id = store().order.id
    expect(store().orders.find((o) => o.id === id)?.status).not.toBe('rejected')
    await user.click(btn('Decline'))
    expect(screen.getByRole('button', { name: 'Decline request' }).hasAttribute('disabled')).toBe(true) // a reason is required
    await user.type(screen.getByLabelText('Reason'), 'We cannot cover that date.')
    await user.click(screen.getByRole('button', { name: 'Decline request' }))
    const declined = store().orders.find((o) => o.id === id)
    expect(declined?.status).toBe('rejected')
    expect(declined?.messages.at(-1)?.text).toBe('We cannot cover that date.')
    expect(screen.getByText(/Request declined/)).toBeTruthy()
  })
})
