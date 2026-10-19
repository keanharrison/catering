import type { Order } from '../../data'
import { statusLabel, statusTone } from '../../lib/status'

const tone = { neutral: 'secondary', review: 'orange', confirmed: 'green', blocked: 'red' } as const

// Text always carries the meaning; the color is a reinforcement.
export function StatusBadge({ status }: { status: Order['status'] }) {
  return <span className={`badge bg-${tone[statusTone[status]]}-lt text-nowrap`}>{statusLabel[status]}</span>
}
