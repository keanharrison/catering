import { describe, expect, it } from 'vitest'
import { formatMoney, pluralize } from './format'

describe('format', () => {
  it('formats cents as dollars', () => {
    expect(formatMoney(106_400)).toBe('$1,064')
    expect(formatMoney(120_050)).toBe('$1,200.50')
  })

  it('pluralizes by count', () => {
    expect(pluralize(1, 'tray')).toBe('1 tray')
    expect(pluralize(3, 'tray')).toBe('3 trays')
  })
})
