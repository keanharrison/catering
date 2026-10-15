import { useNavigate } from 'react-router-dom'
import { cx } from '../lib/cx'
import { useDemoStore } from '../state/store'
import { canEnter, stagePath, stages, type Stage } from '../views/customer/journey'
import { ProgressBar } from './ProgressBar'

// Progress across the customer journey. Wide screens show every stage; phones show the current
// stage and a progress bar (Fin collapses its tab list on mobile). Later stages cannot be skipped to.
export function JourneyNav({ active }: { active: Stage }) {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const index = stages.findIndex((s) => s.id === active)
  const draft = order.status === 'draft'

  return (
    <nav aria-label="Your request">
      <ol className="hidden border border-line bg-panel md:flex">
        {stages.map((stage) => {
          const isActive = stage.id === active
          const enabled = draft ? canEnter(stage.id, order, clock) : stage.id === 'review'
          return (
            <li key={stage.id} className="flex-1 border-r border-line last:border-r-0">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                disabled={!enabled && !isActive}
                onClick={() => navigate(stagePath(stage.id))}
                className={cx(
                  'relative min-h-11 w-full px-6 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:text-muted',
                  isActive ? 'bg-ivory-deep' : 'hover:bg-ivory-deep/60 disabled:hover:bg-transparent',
                )}
              >
                {isActive && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
                <span className="font-mono text-xs uppercase tracking-eyebrow">{stage.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="font-mono text-xs uppercase tracking-eyebrow md:hidden">{stages[index].label}</p>
      <div className="mt-3 flex items-center gap-4">
        <ProgressBar value={index + 1} max={stages.length} label="Request progress" />
        <span className="shrink-0 font-mono text-xs uppercase tracking-eyebrow text-muted">
          Step {index + 1} of {stages.length}
        </span>
      </div>
    </nav>
  )
}
