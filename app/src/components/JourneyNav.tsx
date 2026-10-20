import { useNavigate } from 'react-router-dom'
import { cx } from '../lib/cx'
import { useDemoStore } from '../state/store'
import { canEnter, stagePath, stages, type Stage } from '../views/customer/journey'
import { Progress } from './ui/progress'

// Keep the complete journey visible at every size; future steps stay locked until ready.
export function JourneyNav({ active }: { active: Stage }) {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const index = stages.findIndex((stage) => stage.id === active)
  const progress = ((index + 1) / stages.length) * 100
  const draft = order.status === 'draft'

  return (
    <nav aria-label="Request progress" className="space-y-3">
      <ol className="grid grid-cols-5 gap-1 sm:gap-2">
        {stages.map((stage, stageIndex) => {
          const isActive = stage.id === active
          const enabled = draft ? canEnter(stage.id, order, clock) : stage.id === 'review'

          return (
            <li key={stage.id} className="min-w-0">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                disabled={!enabled && !isActive}
                onClick={() => navigate(stagePath(stage.id))}
                className={cx(
                  'flex min-h-10 w-full items-center justify-center rounded-md px-1 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:justify-start sm:px-2',
                  isActive ? 'bg-secondary text-secondary-foreground' : enabled ? 'text-foreground hover:bg-muted' : 'cursor-not-allowed text-muted-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'mr-1.5 hidden size-5 shrink-0 items-center justify-center rounded-full text-[11px] sm:inline-flex',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {stageIndex + 1}
                </span>
                <span className="truncate">{stage.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="flex items-center gap-3">
        <Progress
          value={progress}
          aria-label="Request progress"
          className="w-full gap-0 [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-muted [&_[data-slot=progress-indicator]]:bg-primary"
        />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          Step {index + 1} of {stages.length}
        </span>
      </div>
    </nav>
  )
}
