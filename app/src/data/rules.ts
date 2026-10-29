import type {
  ChangePolicy,
  EventType,
  ExceptionThresholds,
  LeadTimeRule,
  PortionRule,
  RecommendationDefaults,
} from './types'

const TERMS_SOURCE = 'https://api.getspoonfed.com/1438/pearl-island/terms/'

export const eventTypes: EventType[] = [
  'Corporate lunch',
  'Recurring office catering',
  'Wedding',
  'Birthday or special occasion',
].map((label) => ({
  id: label.toLowerCase().replace(/[^a-z]+/g, '-'),
  label,
  status: 'illustrative' as const,
  assumption: 'Assumed event types from public descriptions; confirm the real list with Sober.',
}))

export const portionRules: PortionRule[] = [
  {
    id: 'entree-per-guest',
    category: 'entree',
    servingsPerGuest: 1,
    explanation: 'One entree serving per guest.',
    status: 'illustrative',
    assumption: 'Placeholder portion rule; Sober to supply the real one.',
  },
  {
    id: 'side-per-guest',
    category: 'side',
    servingsPerGuest: 1,
    explanation: 'One serving of each side per guest.',
    status: 'illustrative',
    assumption: 'Placeholder portion rule; Sober to supply the real one.',
  },
  {
    id: 'salad-per-guest',
    category: 'salad',
    servingsPerGuest: 1,
    explanation: 'One serving of each salad per guest.',
    status: 'illustrative',
    assumption: 'Placeholder portion rule; Sober to supply the real one.',
  },
]

export const leadTimeRules: LeadTimeRule[] = [
  {
    leadTimeClass: 'standard',
    businessHours: 48,
    explanation: 'Standard menu orders need 2 business days of notice.',
    status: 'illustrative',
    assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
    source: TERMS_SOURCE,
  },
  {
    leadTimeClass: 'custom',
    businessHours: 72,
    explanation: 'Custom requests need 3 business days of notice.',
    status: 'illustrative',
    assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
    source: TERMS_SOURCE,
  },
]


const FLOW_SOURCE = 'workflow.md (Spoonfed ordering flow observed October 13, 2026)'

leadTimeRules.push({
  leadTimeClass: 'large',
  businessHours: 120,
  explanation: 'Orders over 50 guests need 5 business days of notice and should go through the restaurant.',
  status: 'illustrative',
  assumption:
    'Observed on the Spoonfed ordering page; not confirmed by Sober. Five business days is modeled as 120 weekday hours.',
  source: FLOW_SOURCE,
})

export const changePolicy: ChangePolicy = {
  changeCutoffHours: 24,
  explanation: 'Changes may be refused within 24 hours of the event.',
  status: 'illustrative',
  assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
  source: TERMS_SOURCE,
}

export const exceptionThresholds: ExceptionThresholds = {
  largeOrderOverGuests: 50,
  dietaryComplexityCount: 2,
  status: 'illustrative',
  assumption:
    'The 50-guest limit was observed on the Spoonfed ordering page; the dietary trigger is a placeholder. Sober to confirm both.',
  source: FLOW_SOURCE,
}

export const recommendationDefaults: RecommendationDefaults = {
  defaultEntreeIds: ['sous-poulet', 'curry-chicken'],
  plantBasedEntreeId: 'curry-tofu',
  plantBasedShare: 0.25,
  status: 'illustrative',
  assumption:
    'Placeholder starting menu and an assumed 25% plant-based share; Sober to supply real recommendation logic.',
}
