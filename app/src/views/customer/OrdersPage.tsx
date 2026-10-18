import { CurrentOrdersPage } from './CurrentOrdersPage'
import { PastOrdersPage } from './PastOrdersPage'

type OrdersPageProps = { kind: 'current' | 'past' }

export function OrdersPage({ kind }: OrdersPageProps) {
  return kind === 'current' ? <CurrentOrdersPage /> : <PastOrdersPage />
}
