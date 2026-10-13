import { describe, expect, it } from 'vitest'
import { routes } from './routes'

describe('routes', () => {
  it('defines the three PRD areas', () => {
    expect(Object.keys(routes).sort()).toEqual(['customer', 'handoff', 'staff'])
  })
})
