import type { ReactNode } from 'react'

export function Choices({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-sans text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">{children}</div>
    </fieldset>
  )
}
