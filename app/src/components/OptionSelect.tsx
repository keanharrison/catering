import { cn } from '@/lib/cn'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export type Option = { value: string; label: string }

/** The product's one dropdown: the same Select the event form uses, with an accessible name instead of a visible label. */
export function OptionSelect({ label, value, onValueChange, options, className }: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  className?: string
}) {
  return (
    <Select items={options} value={value} onValueChange={(next) => onValueChange(String(next ?? value))}>
      <SelectTrigger aria-label={label} className={cn('w-full', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
