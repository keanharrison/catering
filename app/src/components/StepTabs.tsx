import { cx } from '../lib/cx'

export type StepTab = { id: string; label: string; description?: string }

type StepTabsProps = {
  items: StepTab[]
  activeId: string
  onChange: (id: string) => void
  variant?: 'row' | 'list'
  label: string
}

// Row: mono uppercase tabs with an orange bar on the active tab (fin_ref_1).
// List: stacked items with orange square bullets (fin_ref_5).
export function StepTabs({ items, activeId, onChange, variant = 'row', label }: StepTabsProps) {
  const isRow = variant === 'row'
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={isRow ? 'horizontal' : 'vertical'}
      className={cx(isRow ? 'flex border border-line bg-panel' : 'flex flex-col')}
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cx(
              'relative text-left transition-colors',
              isRow ? 'flex-1 border-r border-line px-6 py-4 last:border-r-0' : 'px-8 py-6',
              active ? 'bg-ivory-deep' : 'hover:bg-ivory-deep/60',
            )}
          >
            {active && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
            {isRow ? (
              <span className="font-mono text-xs uppercase tracking-eyebrow">{item.label}</span>
            ) : (
              <span className="flex gap-4">
                <span aria-hidden className="mt-2 size-2 shrink-0 bg-accent" />
                <span className={cx(!active && 'text-muted')}>
                  <span className="block font-sans text-xl">{item.label}</span>
                  {item.description && <span className="mt-2 block">{item.description}</span>}
                </span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
