import { Minus, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import { Input } from './ui/input'

type QuantityStepperProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

export function QuantityStepper({ label, value, onChange }: QuantityStepperProps) {
  return (
    <ButtonGroup aria-label={`${label} quantity`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 sm:size-9"
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        aria-label={`Quantity of ${label}`}
        className="h-11 w-16 rounded-none border-x-0 px-1 text-center tabular-nums sm:h-9 sm:w-16"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 sm:size-9"
        aria-label={`Increase quantity of ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden="true" />
      </Button>
    </ButtonGroup>
  )
}
