import { Badge } from '../../components/ui/badge'
import { statusLabel, statusTone } from '../../lib/status'
import type { Order } from '../../data'

export function StaffStatusBadge({ status }: { status: Order['status'] }) {
  const style = {
    neutral: 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    review: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    confirmed: 'border-teal-300 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200',
    blocked: 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  }[statusTone[status]]

  return <Badge variant="outline" className={style}>{statusLabel[status]}</Badge>
}
