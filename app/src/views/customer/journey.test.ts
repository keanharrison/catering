import { describe, expect, it } from 'vitest'
import { catalog } from '../../data'
import { recommend } from '../../engine'
import { createOrder, updateDraft, type Result } from '../../state/orderMachine'
import { canEnter, completedStages, firstIncompleteStage } from './journey'

const routine = catalog.scenarios[0]

function must(r: Result) {
  if (!r.ok) throw new Error(r.error)
  return r.order
}

describe('customer journey stages', () => {
  it('starts with the event basics done (prefilled) and nothing after', () => {
    const order = createOrder(routine)
    const done = completedStages(order, routine.now)
    expect(done).toMatchObject({ event: true, menu: false, supplies: false, review: false })
    expect(firstIncompleteStage(order, routine.now)).toBe('menu')
  })

  it('does not let the customer skip ahead', () => {
    const order = createOrder(routine)
    expect(canEnter('menu', order, routine.now)).toBe(true)
    expect(canEnter('supplies', order, routine.now)).toBe(false)
    expect(canEnter('review', order, routine.now)).toBe(false)
  })

  it('needs at least one food item, not just supplies', () => {
    const order = must(updateDraft(createOrder(routine), { lines: [{ itemId: 'serving-tongs', units: 1 }] }))
    expect(completedStages(order, routine.now).menu).toBe(false)
  })

  it('requires an explicit supplies choice, and a real selection when supplies are wanted', () => {
    const lines = recommend(routine.intent).lines.map(({ itemId, units }) => ({ itemId, units }))
    let order = must(updateDraft(createOrder(routine), { lines }))
    expect(completedStages(order, routine.now).supplies).toBe(false)
    order = must(updateDraft(order, { suppliesChoice: 'selected' }))
    expect(completedStages(order, routine.now).supplies).toBe(false)
    order = must(updateDraft(order, { suppliesChoice: 'none' }))
    expect(completedStages(order, routine.now).supplies).toBe(true)
  })

  it('opens review once everything before it is finished', () => {
    const lines = recommend(routine.intent).lines.map(({ itemId, units }) => ({ itemId, units }))
    const order = must(updateDraft(createOrder(routine), { lines, suppliesChoice: 'none' }))
    expect(canEnter('review', order, routine.now)).toBe(true)
    expect(firstIncompleteStage(order, routine.now)).toBe('review')
  })
})
