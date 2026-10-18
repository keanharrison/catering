import { describe, expect, it } from 'vitest'
import { catalog } from './index'
import type { Provenance } from './types'

function provenanceRecords(): Array<{ label: string; record: Provenance }> {
  return [
    ...catalog.menu.map((r) => ({ label: `menu:${r.id}`, record: r })),
    ...catalog.eventTypes.map((r) => ({ label: `eventType:${r.id}`, record: r })),
    ...catalog.portionRules.map((r) => ({ label: `portion:${r.id}`, record: r })),
    ...catalog.leadTimeRules.map((r) => ({ label: `leadTime:${r.leadTimeClass}`, record: r })),
    { label: 'changePolicy', record: catalog.changePolicy },
    { label: 'exceptionThresholds', record: catalog.exceptionThresholds },
    { label: 'recommendationDefaults', record: catalog.recommendationDefaults },
    ...catalog.scenarios.map((r) => ({ label: `scenario:${r.id}`, record: r })),
  ]
}

describe('catalog assumption labels', () => {
  it('gives every record a valid status', () => {
    for (const { label, record } of provenanceRecords()) {
      expect(['illustrative', 'approved'], label).toContain(record.status)
    }
  })

  it('explains every illustrative record with an assumption note', () => {
    for (const { label, record } of provenanceRecords()) {
      if (record.status === 'illustrative') {
        expect(record.assumption?.trim().length ?? 0, label).toBeGreaterThan(0)
      }
    }
  })
})

describe('menu', () => {
  it('has unique ids', () => {
    const ids = catalog.menu.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has valid quantities and prices', () => {
    for (const item of catalog.menu) {
      expect(item.priceCents, item.id).toBeGreaterThan(0)
      expect(item.servingsPerUnit, item.id).toBeGreaterThan(0)
      expect(item.minUnits, item.id).toBeGreaterThan(0)
    }
  })

  it('only includes sides that exist and are sides', () => {
    for (const item of catalog.menu) {
      for (const sideId of item.includedSideIds) {
        const side = catalog.menu.find((i) => i.id === sideId)
        expect(['side', 'salad'], `${item.id} -> ${sideId}`).toContain(side?.category)
      }
    }
  })

  it('has a portion rule for every food category and a lead time rule for every class', () => {
    for (const item of catalog.menu) {
      expect(
        item.category === 'supply' || catalog.portionRules.some((r) => r.category === item.category),
        item.id,
      ).toBe(true)
      expect(
        catalog.leadTimeRules.some((r) => r.leadTimeClass === item.leadTimeClass),
        item.id,
      ).toBe(true)
    }
  })
})

describe('menu source', () => {
  it('credits a source for every item', () => {
    for (const item of catalog.menu) {
      expect(item.source?.length ?? 0, item.id).toBeGreaterThan(0)
    }
  })

  it('has the observed categories', () => {
    expect([...new Set(catalog.menu.map((i) => i.category))].sort()).toEqual(['entree', 'salad', 'side', 'supply'])
  })
})

describe('scenarios', () => {
  it('has the routine and unusual scenarios with unique ids', () => {
    const ids = catalog.scenarios.map((s) => s.id)
    expect(ids).toEqual(['routine', 'unusual'])
  })

  it('references real event types and parseable dates', () => {
    const eventIds = catalog.eventTypes.map((e) => e.id)
    for (const s of catalog.scenarios) {
      expect(eventIds, s.id).toContain(s.intent.eventType)
      expect(Number.isNaN(Date.parse(s.now)), `${s.id} now`).toBe(false)
      expect(Number.isNaN(Date.parse(s.intent.eventAt)), `${s.id} eventAt`).toBe(false)
      expect(Date.parse(s.intent.eventAt), s.id).toBeGreaterThan(Date.parse(s.now))
    }
  })

  it('makes the unusual scenario exceed the large-order threshold and the routine one not', () => {
    const [routine, unusual] = catalog.scenarios
    expect(routine.intent.guestCount ?? 0).toBeLessThan(catalog.exceptionThresholds.largeOrderOverGuests + 1)
    expect(unusual.intent.guestCount ?? 0).toBeGreaterThan(
      catalog.exceptionThresholds.largeOrderOverGuests,
    )
    expect(routine.expectedFlags).toEqual([])
    expect(unusual.expectedFlags.length).toBeGreaterThan(0)
  })
})
