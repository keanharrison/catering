import type { ReactNode } from 'react'
import { formatMoney } from '../lib/format'
import type { OrderSummary } from '../views/customer/orderSummary'
import { Eyebrow } from './Eyebrow'
import { Panel } from './Panel'
import { Pill } from './Pill'
import { StatLine } from './StatLine'

type OrderSummaryPanelProps = {
  summary: OrderSummary
  /** Show the "entree servings vs guests" line (menu stage). */
  showCoverage?: boolean
  children?: ReactNode
}

// "Your order" panel: chosen items, estimate, and the reasons our team may review the request.
export function OrderSummaryPanel({ summary, showCoverage = false, children }: OrderSummaryPanelProps) {
  const { estimate, coverage, flags, groups, guestCount } = summary
  return (
    <div className="grid gap-6">
      <Panel corners>
        <Eyebrow>Your order</Eyebrow>
        {groups.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing chosen yet. Pick items from the menu to build your order.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="font-mono text-[11px] uppercase tracking-eyebrow text-muted">{group.title}</p>
                <ul className="mt-1 grid gap-1">
                  {group.rows.map((row) => (
                    <li key={row.itemId} className="flex justify-between gap-3 font-sans text-sm">
                      <span>
                        {row.name} <span className="text-muted">({row.quantityLabel})</span>
                      </span>
                      <span>{formatMoney(row.costCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-line pt-4">
          <p className="font-sans text-5xl tracking-tight" aria-label="Estimated total">
            {formatMoney(estimate.subtotalCents)}
          </p>
          <div className="mt-2">
            <StatLine
              items={[
                { label: 'Guests', value: String(guestCount ?? '-') },
                {
                  label: 'Per guest',
                  value: estimate.costPerGuestCents === null ? '-' : formatMoney(estimate.costPerGuestCents),
                },
              ]}
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            Estimate for the items above, before tax and fees. Our team confirms the final price.
          </p>
        </div>

        {showCoverage && coverage.guests !== null && (
          <p className="mt-4 font-sans text-sm" data-testid="coverage">
            Entree servings: <strong>{coverage.servings}</strong> of {coverage.guests} guests
            {coverage.shortfall > 0 ? ` (${coverage.shortfall} more to cover everyone)` : ' (everyone covered)'}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </Panel>

      {flags.length > 0 && (
        <Panel tone="deep" className="p-6">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Our team will check</Eyebrow>
            <Pill tone="review">Needs review</Pill>
          </div>
          <ul className="mt-4 grid gap-2 text-sm">
            {flags.map((flag) => (
              <li key={flag.code}>{flag.reason}</li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}
