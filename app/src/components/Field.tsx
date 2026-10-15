import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}

export const inputClass =
  'min-h-11 w-full rounded-lg border border-control-line bg-panel px-3 py-2 font-sans text-base text-charcoal placeholder:text-muted'

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-sans text-sm">
        {label}
      </label>
      {children}
      {hint && !error && <p className="font-sans text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="font-sans text-xs text-status-blocked">
          {error}
        </p>
      )}
    </div>
  )
}
