import { OptionSelect } from './OptionSelect'

/**
 * Time of day as three of the product's dropdowns: hour, minute, AM or PM. The value stays a 24-hour "HH:mm" string,
 * so saving, validation and display elsewhere in the request flow are unchanged.
 * Hours run 00 to 11, so 00 PM is the noon hour and 00 AM the midnight hour.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const hourOptions = Array.from({ length: 12 }, (_, hour) => ({ value: pad(hour), label: pad(hour) }))
const meridiemOptions = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]

export function parseTime(value: string): { hour: number; minute: number; meridiem: 'AM' | 'PM' } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const [hours, minute] = [Number(match[1]), Number(match[2])]
  if (hours > 23 || minute > 59) return null
  return { hour: hours % 12, minute, meridiem: hours >= 12 ? 'PM' : 'AM' }
}

export function joinTime(hour: number, minute: number, meridiem: 'AM' | 'PM'): string {
  return `${pad(hour + (meridiem === 'PM' ? 12 : 0))}:${pad(minute)}`
}

/** "00:30 PM" for display in the control's own terms; empty for anything that is not a valid time. */
export function timeLabel(value: string): string {
  const parts = parseTime(value)
  return parts ? `${pad(parts.hour)}:${pad(parts.minute)} ${parts.meridiem}` : ''
}

export function TimeSelect({ id, labelledBy, value, onChange, invalid, describedBy }: {
  /** Goes on the hour dropdown, so a label's `htmlFor` and error focus land on the first control. */
  id: string
  labelledBy: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  const parts = parseTime(value) ?? { hour: 0, minute: 0, meridiem: 'PM' as const }
  // Every five minutes, plus the stored minute if it falls between, so an existing time is never altered.
  const minutes = [...new Set([...Array.from({ length: 12 }, (_, i) => i * 5), parts.minute])].sort((a, b) => a - b)
  const minuteOptions = minutes.map((minute) => ({ value: pad(minute), label: pad(minute) }))

  return (
    <div role="group" aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex items-center gap-2">
      <div className="w-[4.5rem]">
        <OptionSelect id={id} label="Hour" invalid={invalid} value={pad(parts.hour)} onValueChange={(next) => onChange(joinTime(Number(next), parts.minute, parts.meridiem))} options={hourOptions} />
      </div>
      <span aria-hidden="true" className="text-muted-foreground">:</span>
      <div className="w-[4.5rem]">
        <OptionSelect label="Minute" invalid={invalid} value={pad(parts.minute)} onValueChange={(next) => onChange(joinTime(parts.hour, Number(next), parts.meridiem))} options={minuteOptions} />
      </div>
      <div className="w-[4.75rem]">
        <OptionSelect label="AM or PM" invalid={invalid} value={parts.meridiem} onValueChange={(next) => onChange(joinTime(parts.hour, parts.minute, next as 'AM' | 'PM'))} options={meridiemOptions} />
      </div>
    </div>
  )
}
