import { useRef } from 'react'
import { cx } from '../lib/cx'

export type StepTab = { id: string; label: string; description?: string }

type StepTabsProps = {
  items: StepTab[]
  activeId: string
  onChange: (id: string) => void
  variant?: 'row' | 'list'
  label: string
  /** Id of the panel these tabs control (for assistive technology). */
  panelId?: string
}

// Row: mono uppercase tabs with an orange bar on the active tab (fin_ref_1).
// List: stacked items with orange square bullets (fin_ref_5).
// Keyboard: arrow keys move between tabs; only the active tab is in the tab order.
export function StepTabs({ items, activeId, onChange, variant = 'row', label, panelId }: StepTabsProps) {
  const isRow = variant === 'row'
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const forward = isRow ? 'ArrowRight' : 'ArrowDown'
    const back = isRow ? 'ArrowLeft' : 'ArrowUp'
    let next = -1
    if (event.key === forward) next = (index + 1) % items.length
    else if (event.key === back) next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    if (next === -1) return
    event.preventDefault()
    onChange(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={isRow ? 'horizontal' : 'vertical'}
      className={cx(isRow ? 'flex border border-line bg-panel' : 'flex flex-col')}
    >
      {items.map((item, index) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              'relative min-h-11 text-left transition-colors',
              isRow ? 'flex-1 border-r border-line px-4 py-4 last:border-r-0 md:px-6' : 'px-8 py-6',
              active ? 'bg-ivory-deep' : 'hover:bg-ivory-deep/60',
            )}
          >
            {active && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
            {isRow ? (
              <span className="type-small-label uppercase">{item.label}</span>
            ) : (
              <span className="flex gap-4">
                <span aria-hidden className="mt-2 size-2 shrink-0 bg-accent" />
                <span className={cx(!active && 'text-muted')}>
                  <span className="type-section-title block">{item.label}</span>
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
