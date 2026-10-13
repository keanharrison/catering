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
    id: 'boxed-per-guest',
    category: 'boxed',
    servingsPerGuest: 1,
    explanation: 'One box per guest.',
    status: 'illustrative',
    assumption: 'Placeholder portion rule; Sober to supply the real one.',
  },
]

export const leadTimeRules: LeadTimeRule[] = [
  {
    leadTimeClass: 'standard',
    businessHours: 48,
    explanation: 'Standard menu orders need 48 business hours of notice.',
    status: 'illustrative',
    assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
    source: TERMS_SOURCE,
  },
  {
    leadTimeClass: 'custom',
    businessHours: 72,
    explanation: 'Custom items, appetizers and box lunches need 72 business hours of notice.',
    status: 'illustrative',
    assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
    source: TERMS_SOURCE,
  },
]

export const changePolicy: ChangePolicy = {
  changeCutoffHours: 24,
  explanation: 'Changes may be refused within 24 hours of the event.',
  status: 'illustrative',
  assumption: 'Based on public Spoonfed terms; not confirmed by Pearl Island.',
  source: TERMS_SOURCE,
}

export const exceptionThresholds: ExceptionThresholds = {
  largeOrderGuests: 100,
  dietaryComplexityCount: 2,
  status: 'illustrative',
  assumption: 'Placeholder triggers for staff review until Sober defines the real ones.',
}

export const recommendationDefaults: RecommendationDefaults = {
  defaultEntreeIds: ['sous-poulet', 'curry-chicken'],
  plantBasedEntreeId: 'curry-tofu',
  plantBasedShare: 0.25,
  status: 'illustrative',
  assumption:
    'Placeholder starting menu and an assumed 25% plant-based share; Sober to supply real recommendation logic.',
}
