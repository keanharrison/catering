// Visible labels for unverified data and simulated integrations (PRD guardrails).
export function AssumptionTag({ label = 'Assumption' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-status-review/40 bg-status-review/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-eyebrow text-status-review">
      <span aria-hidden className="size-1.5 bg-status-review" />
      {label}
    </span>
  )
}

export function PreviewTag({ label = 'Preview - not a live integration' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-ivory-deep px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-eyebrow text-muted">
      <span aria-hidden className="size-1.5 bg-accent" />
      {label}
    </span>
  )
}
