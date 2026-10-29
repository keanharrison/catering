import { catalog } from '../data'

// Guards the saved demo state. Anything malformed (hand-edited, from an older shape, or partly
// written) is rejected so the app starts from a fresh draft instead of crashing.

const STATUSES = ['draft', 'submitted', 'needs_review', 'awaiting_customer_approval', 'confirmed', 'rejected']
const REVISIONS = ['none', 'pending', 'approved']

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const isText = (x: unknown): x is string => typeof x === 'string'
const isNumberOrNull = (x: unknown) => x === null || (typeof x === 'number' && Number.isFinite(x))

function isValidIntent(x: unknown): boolean {
  if (!isRecord(x)) return false
  return (
    isText(x.contactName) &&
    isText(x.email) &&
    isText(x.phone) &&
    isText(x.organization) &&
    isText(x.deliveryAddress) &&
    isText(x.deliveryCity) &&
    isText(x.deliveryState) &&
    isText(x.deliveryZip) &&
    isText(x.eventType) &&
    isNumberOrNull(x.guestCount) &&
    isText(x.eventAt) &&
    (x.eventAt === '' || !Number.isNaN(Date.parse(x.eventAt))) && // a new request has no date yet
    (x.fulfillment === 'pickup' || x.fulfillment === 'delivery') &&
    Array.isArray(x.dietary) &&
    x.dietary.every(isText) &&
    isNumberOrNull(x.budgetCents) &&
    isText(x.notes) &&
    isText(x.customRequest)
  )
}

function isValidOrder(x: unknown): boolean {
  if (!isRecord(x)) return false
  const knownItem = (id: unknown) => catalog.menu.some((i) => i.id === id)
  return (
    isText(x.id) &&
    isText(x.status) &&
    STATUSES.includes(x.status) &&
    isValidIntent(x.intent) &&
    Array.isArray(x.lines) &&
    x.lines.every((l) => isRecord(l) && knownItem(l.itemId) && typeof l.units === 'number' && Number.isFinite(l.units) && l.units >= 0) &&
    (x.suppliesChoice === null || x.suppliesChoice === 'none' || x.suppliesChoice === 'selected') &&
    Array.isArray(x.flags) &&
    x.flags.every((f) => isRecord(f) && isText(f.code) && isText(f.reason)) &&
    isText(x.revision) &&
    REVISIONS.includes(x.revision) &&
    Array.isArray(x.messages) &&
    x.messages.every((m) => isRecord(m) && isText(m.text)) &&
    Array.isArray(x.history) &&
    x.history.every(isRecord)
  )
}

export function isValidDemoState(x: unknown): boolean {
  if (!isRecord(x)) return false
  return (
    isText(x.scenarioId) &&
    catalog.scenarios.some((s) => s.id === x.scenarioId) &&
    typeof x.session === 'number' &&
    isText(x.clock) &&
    !Number.isNaN(Date.parse(x.clock)) &&
    isValidOrder(x.order) &&
    (x.draftOrder === undefined || isValidOrder(x.draftOrder)) &&
    (x.orders === undefined || (Array.isArray(x.orders) && x.orders.every(isValidOrder))) &&
    (x.savedDrafts === undefined || (Array.isArray(x.savedDrafts) && x.savedDrafts.every(isValidOrder)))
  )
}
