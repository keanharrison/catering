import { inputClass } from './Field'

type QuantityStepperProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

const stepButton =
  'size-11 rounded-md md:size-9 border border-charcoal bg-transparent font-sans text-lg leading-none hover:bg-ivory-deep disabled:cursor-not-allowed disabled:opacity-40'

export function QuantityStepper({ label, value, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={stepButton}
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        -
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        aria-label={`Quantity of ${label}`}
        className={`${inputClass} w-20 text-center`}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
      <button
        type="button"
        className={stepButton}
        aria-label={`Increase quantity of ${label}`}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
