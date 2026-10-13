import { menu } from './menu'
import {
  changePolicy,
  eventTypes,
  exceptionThresholds,
  leadTimeRules,
  portionRules,
  recommendationDefaults,
} from './rules'
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
  recommendationDefaults,
  scenarios,
}

export type Catalog = typeof catalog
