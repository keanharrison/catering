import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDemoStore } from '../state/store'
import { canEnter, firstIncompleteStage, stagePath, type Stage } from '../views/customer/journey'

/**
 * Keeps the customer on a valid stage: no skipping ahead, and no editing once the
 * request has been submitted (the review page shows the result).
 */
export function StageGate({ stage, children }: { stage: Stage; children: ReactNode }) {
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)

  if (order.status !== 'draft' && stage !== 'review') {
    return <Navigate to={stagePath('review')} replace />
  }
  if (!canEnter(stage, order, clock)) {
    return <Navigate to={stagePath(firstIncompleteStage(order, clock))} replace />
  }
  return <>{children}</>
}
