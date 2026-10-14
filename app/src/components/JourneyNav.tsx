import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../state/store'
import { canEnter, stagePath, stages, type Stage } from '../views/customer/journey'
import { ProgressBar } from './ProgressBar'
import { StepTabs } from './StepTabs'

// Progress across the whole customer journey. Earlier stages can be revisited; later ones cannot be skipped to.
export function JourneyNav({ active }: { active: Stage }) {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const index = stages.findIndex((s) => s.id === active)

  return (
    <div>
      <StepTabs
        label="Your request"
        items={stages.map((s) => ({ id: s.id, label: s.label }))}
        activeId={active}
        onChange={(id) => {
          const target = id as Stage
          if (order.status === 'draft' && canEnter(target, order, clock)) navigate(stagePath(target))
          else if (order.status !== 'draft') navigate(stagePath('review'))
        }}
      />
      <div className="mt-3 flex items-center gap-4">
        <ProgressBar value={index + 1} max={stages.length} label="Request progress" />
        <span className="shrink-0 font-mono text-xs uppercase tracking-eyebrow text-muted">
          Step {index + 1} of {stages.length}
        </span>
      </div>
    </div>
  )
}
