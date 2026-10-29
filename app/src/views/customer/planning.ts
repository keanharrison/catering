import type { PlanAnswers } from './planScript'

/** How this request is being started, and what the next screens should do about it. Tied to the draft's session so a new draft starts clean. */

export type PlanningMode = 'assisted' | 'manual'

export type PlanningState = {
  mode: PlanningMode | null
  /** The Event step was filled from the intake and should say so until the customer continues. */
  prefilled: boolean
}

const STATE_KEY = 'x-planning-state'
const ANSWERS_KEY = 'x-planning-answers'

export const emptyPlanningState: PlanningState = { mode: null, prefilled: false }

function read<T>(key: string, session: number): T | null {
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) return null
    const parsed = JSON.parse(stored) as { session?: number; value?: T }
    if (parsed.session === session && parsed.value !== undefined) return parsed.value
    sessionStorage.removeItem(key)
  } catch {
    // Storage can be unavailable in private browsing; the flow still works without it.
  }
  return null
}

function write(key: string, session: number, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ session, value }))
  } catch {
    // See above.
  }
}

export function loadPlanningState(session: number): PlanningState {
  return { ...emptyPlanningState, ...read<Partial<PlanningState>>(STATE_KEY, session) }
}

export function savePlanningState(session: number, state: PlanningState) {
  write(STATE_KEY, session, state)
}

export function loadPlanAnswers(session: number): PlanAnswers | null {
  return read<PlanAnswers>(ANSWERS_KEY, session)
}

export function savePlanAnswers(session: number, answers: PlanAnswers) {
  write(ANSWERS_KEY, session, answers)
}

export function clearPlanning() {
  try {
    sessionStorage.removeItem(STATE_KEY)
    sessionStorage.removeItem(ANSWERS_KEY)
  } catch {
    // See above.
  }
}
