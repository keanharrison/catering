// Shared data model. Every record carries a status so unverified business data is
// always visible (PRD guardrail): 'approved' means Pearl Island confirmed it;
// 'illustrative' means a placeholder that must show an assumption label.

export type DataStatus = 'illustrative' | 'approved'

export const MAX_MESSAGE_LENGTH = 2000

export type Provenance = {
  status: DataStatus
  /** Required when status is 'illustrative': what is assumed and why. */
  assumption?: string
  /** Public source the value was based on, if any (unverified by Pearl Island). */
  source?: string
}

// Dietary tags are descriptive and illustrative. They are NOT allergy safety claims.
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'spicy'

export type MenuCategory = 'entree' | 'side' | 'salad' | 'supply'
export type ServiceStyle = 'buffet' | 'boxed' | 'family'
/** What one unit of the item is: a 6oz serving, a bottle, a per-person charge, a set, or one piece. */
export type MenuUnit = 'serving' | 'bottle' | 'person' | 'set' | 'each'
export type LeadTimeClass = 'standard' | 'custom' | 'large'

export type MenuItem = Provenance & {
  id: string
  name: string
  category: MenuCategory
  serviceStyles: ServiceStyle[]
  unit: MenuUnit
  servingsPerUnit: number
  /** Price per unit in cents. */
  priceCents: number
  minUnits: number
  dietaryTags: DietaryTag[]
  /** For entrees: sides included by default with a buffet order. */
  includedSideIds: string[]
  leadTimeClass: LeadTimeClass
  /** Description as observed on the ordering page, when one was shown. */
  description?: string
  /** Serving note as observed, e.g. portion size. */
  servingNote?: string
}

export type EventType = Provenance & {
  id: string
  label: string
}

/** Servings needed per guest for a menu category. */
export type PortionRule = Provenance & {
  id: string
  category: MenuCategory
  servingsPerGuest: number
  explanation: string
}

export type LeadTimeRule = Provenance & {
  leadTimeClass: LeadTimeClass
  businessHours: number
  explanation: string
}

export type ChangePolicy = Provenance & {
  /** Hours before the event after which changes may be refused. */
  changeCutoffHours: number
  explanation: string
}

/** Illustrative triggers for staff review until Sober defines the real ones. */
export type ExceptionThresholds = Provenance & {
  /** Orders with more guests than this need staff review and longer notice. */
  largeOrderOverGuests: number
  /** Number of distinct dietary requirements that counts as complex. */
  dietaryComplexityCount: number
}

/** Defaults the recommendation builder starts from. All illustrative until Sober defines them. */
export type RecommendationDefaults = Provenance & {
  /** Entrees proposed for every order; servings are split evenly between them. */
  defaultEntreeIds: string[]
  /** Entree used for vegetarian and vegan guests. */
  plantBasedEntreeId: string
  /** Share of guests assumed to need a plant-based entree when any dietary need is listed. */
  plantBasedShare: number
}

export type FlagCode =
  | 'large_order'
  | 'short_notice'
  | 'unclear_headcount'
  | 'dietary_complexity'
  | 'unavailable_request'
  | 'budget_mismatch'

export type ExceptionFlag = {
  code: FlagCode
  reason: string
}

export type Fulfillment = 'pickup' | 'delivery'

/** What the customer tells us at intake. */
export type OrderIntent = {
  contactName: string
  email: string
  phone: string
  organization: string
  /** Who receives the order at pickup or delivery, when that is not the person placing it. */
  onsiteContactName?: string
  onsiteContactPhone?: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZip: string
  eventType: string
  /** null means unknown or unanswered. */
  guestCount: number | null
  /** ISO local date-time, e.g. 2026-10-19T12:00 */
  eventAt: string
  fulfillment: Fulfillment
  dietary: DietaryTag[]
  budgetCents: number | null
  notes: string
  /** Free-text request that may not be on the menu. */
  customRequest: string
}

export type OrderLine = {
  itemId: string
  units: number
}

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'needs_review'
  | 'awaiting_customer_approval'
  | 'confirmed'
  | 'rejected'

export type MessageAuthor = 'customer' | 'staff' | 'system'

export type Message = {
  id: string
  author: MessageAuthor
  text: string
  at: string
}

export type Actor = 'customer' | 'staff'

/** Whether staff changed the proposal and whether the customer has approved the change. */
export type RevisionState = 'none' | 'pending' | 'approved'

export type StatusChange = {
  from: OrderStatus | null
  to: OrderStatus
  actor: Actor | 'system'
  at: string
  note?: string
}

export type Order = {
  id: string
  /** Explicit fixture marker for locally seeded demo records. */
  demoSample?: true
  status: OrderStatus
  intent: OrderIntent
  lines: OrderLine[]
  /** null until the customer decides; supplies are a required choice. */
  suppliesChoice: 'none' | 'selected' | null
  /** Raised at submission and kept through review, revision and handoff. */
  flags: ExceptionFlag[]
  revision: RevisionState
  messages: Message[]
  history: StatusChange[]
}

export type Scenario = Provenance & {
  id: string
  label: string
  description: string
  /** Fixed clock so lead-time and short-notice checks are repeatable. */
  now: string
  intent: OrderIntent
  /** Flags the rule engine should raise for this scenario (checked in tests). */
  expectedFlags: FlagCode[]
}
