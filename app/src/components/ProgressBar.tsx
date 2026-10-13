type ProgressBarProps = {
  value: number
  max: number
  label: string
}

// Thin hairline track with an orange fill; the value is also read out for screen readers.
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-0.5 w-full bg-line"
    >
      <div className="h-full bg-accent" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}
