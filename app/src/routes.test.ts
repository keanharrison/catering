import { describe, expect, it } from 'vitest'
import { routes } from './routes'

describe('routes', () => {
  it('defines the PRD areas plus the component gallery', () => {
    expect(Object.keys(routes).sort()).toEqual(['customer', 'gallery', 'handoff', 'staff'])
  })
})
