import { Badge } from '../../components/ui/badge'
import { statusLabel, statusTone } from '../../lib/status'
import type { Order } from '../../data'

export function StaffStatusBadge({ status }: { status: Order['status'] }) {
  const style = {
    neutral: 'border-border bg-secondary text-foreground',
    review: 'border-transparent bg-warning-soft text-warning',
    info: 'border-transparent bg-info-soft text-info',
    confirmed: 'border-transparent bg-success-soft text-success',
    blocked: 'border-transparent bg-destructive/10 text-destructive',
  }[statusTone[status]]

  return <Badge variant="outline" className={style}>{statusLabel[status]}</Badge>
}
