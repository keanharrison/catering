import { useNavigate } from 'react-router-dom'
import { cx } from '../lib/cx'
import { useDemoStore } from '../state/store'
import { canEnter, completedStages, stagePath, stages, type Stage } from '../views/customer/journey'
import { Check } from './icons'

// One line of labeled steps: finished steps are checked, the current step is outlined, later steps are gray.
// The full journey stays visible at every size; future steps stay locked until ready.
export function JourneyNav({ active }: { active: Stage }) {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const done = completedStages(order, clock)
  const draft = order.status === 'draft'

  return (
    <nav aria-label="Request progress">
      <ol className="grid grid-cols-5">
        {stages.map((stage, index) => {
          const isActive = stage.id === active
          const isDone = !isActive && done[stage.id]
          const enabled = draft ? canEnter(stage.id, order, clock) : stage.id === 'review'
          const previousDone = index > 0 && done[stages[index - 1].id]

          return (
            <li key={stage.id} className="min-w-0">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                aria-describedby={isDone ? `journey-${stage.id}-done` : undefined}
                disabled={!enabled && !isActive}
                onClick={() => navigate(stagePath(stage.id))}
                className={cx(
                  'group flex w-full flex-col items-center gap-2 rounded-lg pb-1 pt-0.5 text-[14px] tracking-[0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive || isDone ? 'text-foreground' : 'text-muted-foreground',
                  !enabled && !isActive && 'cursor-not-allowed',
                )}
              >
                <span className="truncate">{stage.label}</span>
                <span className="relative flex h-5 w-full items-center justify-center">
                  {index > 0 && (
                    <span aria-hidden="true" className={cx('absolute left-0 right-1/2 h-0.5', previousDone ? 'bg-primary' : 'bg-border')} />
                  )}
                  {index < stages.length - 1 && (
                    <span aria-hidden="true" className={cx('absolute left-1/2 right-0 h-0.5', done[stage.id] ? 'bg-primary' : 'bg-border')} />
                  )}
                  <span
                    aria-hidden="true"
                    data-icon-surface
                    className={cx(
                      'relative flex size-5 items-center justify-center rounded-full',
                      isDone && 'bg-primary text-primary-foreground',
                      isActive && 'border-2 border-primary bg-card',
                      !isActive && !isDone && 'bg-border',
                    )}
                  >
                    {isDone && <Check className="size-3" />}
                  </span>
                </span>
              </button>
              {isDone && <span id={`journey-${stage.id}-done`} className="sr-only">Completed</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
