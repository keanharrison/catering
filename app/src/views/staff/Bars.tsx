import type { Share } from './analytics'

/** A ranked list with a proportional bar behind each row. The numbers are real text, so the bars are decoration for sighted readers. */
export function Bars({ rows, color, total, unit }: { rows: Share[]; color: string; total?: number; unit?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-ui">
            <span className="min-w-0 truncate text-foreground">{row.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {row.value}{unit ? ` ${unit}` : ''}{total ? ` · ${Math.round((row.value / total) * 100)}%` : ''}
            </span>
          </div>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
