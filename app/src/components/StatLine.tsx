type StatLineProps = {
  items: Array<{ label: string; value: string }>
}

// Compact "Label: value • Label: value" line from Fin's Guidance card.
export function StatLine({ items }: StatLineProps) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 font-sans text-xs text-muted">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>&bull;</span>}
          <span>
            {item.label}: <strong className="font-semibold text-charcoal">{item.value}</strong>
          </span>
        </span>
      ))}
    </p>
  )
}
