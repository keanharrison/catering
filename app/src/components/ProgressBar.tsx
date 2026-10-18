type ProgressBarProps = {
  value: number
  max: number
  label: string
}

// Thin hairline track with a turquoise fill; the value is also read out for screen readers.
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const progress = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-0.5 w-full overflow-hidden bg-line"
    >
      <div
        aria-hidden="true"
        className="progress-bar__fill h-full origin-left bg-accent"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
