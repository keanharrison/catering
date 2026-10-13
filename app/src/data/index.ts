import { menu } from './menu'
import { changePolicy, eventTypes, exceptionThresholds, leadTimeRules, portionRules } from './rules'
import { scenarios } from './scenarios'

export * from './types'

// Single source of truth. No view, rule or chatbot defines its own mock data.
export const catalog = {
  menu,
  eventTypes,
  portionRules,
  leadTimeRules,
  changePolicy,
  exceptionThresholds,
  scenarios,
}

export type Catalog = typeof catalog
