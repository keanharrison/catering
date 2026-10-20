import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { format, parseISO } from 'date-fns'
import { catalog } from '../data'
import { scenarios } from '../data/scenarios'

/** The first page opens empty, so tests answer it with a scenario's own event details. */
export async function fillEventBasics(user: ReturnType<typeof userEvent.setup>, scenarioId = 'routine', { guests = true } = {}) {
  const { intent } = scenarios.find((scenario) => scenario.id === scenarioId)!
  const eventType = catalog.eventTypes.find((type) => type.id === intent.eventType)!.label
  const [date = ''] = intent.eventAt.split('T')

  await user.click(screen.getByRole('combobox', { name: 'Event type' }))
  await user.click(await screen.findByRole('option', { name: eventType }))
  if (guests) await user.type(screen.getByLabelText('Guests'), String(intent.guestCount))
  await user.click(screen.getByRole('button', { name: /Date/ }))
  await user.click(screen.getByRole('button', { name: new RegExp(format(parseISO(date), 'MMMM do, yyyy')) }))
  await user.click(screen.getByRole('combobox', { name: 'Pickup or delivery' }))
  await user.click(await screen.findByRole('option', { name: intent.fulfillment === 'delivery' ? 'Delivery' : 'Pickup' }))
  for (const tag of intent.dietary) {
    await user.click(screen.getByRole('checkbox', { name: new RegExp(tag.replace('-', '.'), 'i') }))
  }
  if (intent.budgetCents !== null) await user.type(screen.getByLabelText(/Budget/), String(intent.budgetCents / 100))
}
