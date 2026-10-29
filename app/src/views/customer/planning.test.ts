import { beforeEach, describe, expect, it } from 'vitest'
import { emptyAnswers } from './planScript'
import { clearPlanning, loadPlanAnswers, loadPlanningState, savePlanAnswers, savePlanningState } from './planning'

beforeEach(() => sessionStorage.clear())

describe('planning state', () => {
  it('starts empty and remembers the choice for the same draft', () => {
    expect(loadPlanningState(1)).toEqual({ mode: null, prefilled: false })
    savePlanningState(1, { mode: 'assisted', prefilled: true })
    expect(loadPlanningState(1)).toEqual({ mode: 'assisted', prefilled: true })
  })

  it('forgets everything when a new draft begins', () => {
    savePlanningState(1, { mode: 'manual', prefilled: false })
    savePlanAnswers(1, { ...emptyAnswers(), guests: '40' })
    expect(loadPlanningState(2).mode).toBeNull()
    expect(loadPlanAnswers(2)).toBeNull()
  })

  it('keeps intake answers across a refresh and can be cleared', () => {
    savePlanAnswers(3, { ...emptyAnswers(), step: 2, guests: '25' })
    expect(loadPlanAnswers(3)).toMatchObject({ step: 2, guests: '25' })
    clearPlanning()
    expect(loadPlanAnswers(3)).toBeNull()
  })
})
