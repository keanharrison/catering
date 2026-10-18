import type { ReactNode } from 'react'
import { FieldLegend, FieldSet } from './ui/field'

export function Choices({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <FieldSet className="gap-2">
      <FieldLegend className="mb-1 text-sm">{legend}</FieldLegend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>
    </FieldSet>
  )
}
