import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('keeps a text color when a type-scale size is added after it', () => {
    expect(cn('bg-primary text-primary-foreground', 'min-h-11 text-body')).toBe('bg-primary text-primary-foreground min-h-11 text-body')
  })

  it('keeps a type-scale size when a text color comes after it', () => {
    expect(cn('text-ui leading-[1.45] text-muted-foreground')).toBe('text-ui leading-[1.45] text-muted-foreground')
  })

  it('still lets a later size replace an earlier one', () => {
    expect(cn('text-sm', 'text-body')).toBe('text-body')
    expect(cn('text-ui', 'text-heading')).toBe('text-heading')
  })
})
