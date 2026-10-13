import type { Scenario } from './types'

// Fixed clock so both scenarios behave the same on every run.
const NOW = '2026-10-13T09:00'

export const scenarios: Scenario[] = [
  {
    id: 'routine',
    label: 'Routine event',
    description: 'A standard corporate lunch that fits the known rules.',
    now: NOW,
    intent: {
      contactName: 'Jordan Lee',
      organization: 'Sample Co.',
      eventType: 'corporate-lunch',
      guestCount: 40,
      eventAt: '2026-10-19T12:00',
      fulfillment: 'pickup',
      dietary: ['vegetarian'],
      budgetCents: 120000,
      notes: '',
      customRequest: '',
    },
    expectedFlags: [],
    status: 'illustrative',
    assumption: 'Invented sample customer and event for the demo.',
  },
  {
    id: 'unusual',
    label: 'Unusual request',
    description: 'A large wedding drop-off on short notice with a custom request.',
    now: NOW,
    intent: {
      contactName: 'Sam Rivera',
      organization: 'Rivera Wedding',
      eventType: 'wedding',
      guestCount: 150,
      eventAt: '2026-10-15T17:00',
      fulfillment: 'delivery',
      dietary: ['vegan', 'gluten-free'],
      budgetCents: null,
      notes: 'Guests arrive from out of town; we would love a Caribbean-style spread.',
      customRequest: 'A late-night snack station with items not on the standard menu.',
    },
    expectedFlags: ['large_order', 'short_notice', 'dietary_complexity', 'unavailable_request'],
    status: 'illustrative',
    assumption: 'Invented sample customer and event for the demo.',
  },
]
