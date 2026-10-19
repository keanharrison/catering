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
  /** Show review flags beside this summary. Staff can place them beside request actions instead. */
  showFlags?: boolean
  children?: ReactNode
  /** Rendered directly below the calculator panel, above any review notes (e.g. the continue button). */
  footer?: ReactNode
}

// "Your order" panel: chosen items, estimate, and the reasons our team may review the request.
export function OrderSummaryPanel({ summary, showCoverage = false, showFlags = true, children, footer }: OrderSummaryPanelProps) {
  const { estimate, coverage, flags, groups, guestCount } = summary
  return (
    <div className="grid gap-6">
      <Panel className="p-5">
        <Eyebrow>Your order</Eyebrow>
        {groups.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing chosen yet. Pick items from the menu to build your order.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="type-small-label uppercase text-muted">{group.title}</p>
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
          <p className="font-sans text-2xl font-semibold leading-8 tabular-nums" aria-label="Estimated total">
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
        </div>

        {showCoverage && coverage.guests !== null && (
          <div className="mt-4 grid gap-2 font-sans text-sm" data-testid="coverage">
            <p>
              Entree servings: <strong>{coverage.servings}</strong> of {coverage.guests} guests
              {coverage.shortfall > 0 ? ` (${coverage.shortfall} more to cover everyone)` : ' (everyone covered)'}
            </p>
            <p className="text-muted">
              For this demo, coverage counts one entree serving per guest; side quantities are separate. Adjust
              quantities to suit how you plan to serve the meal.
            </p>
          </div>
        )}
        {children && <div className="mt-6">{children}</div>}
      </Panel>

      {footer}

      {showFlags && flags.length > 0 && (
        <Panel tone="deep" className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Our team will check</Eyebrow>
            <Pill tone="review">Needs review</Pill>
          </div>
          <ul className="mt-4 grid gap-2 text-sm">
            {flags.map((flag) => (
              <li key={flag.code} className="[overflow-wrap:anywhere]">{flag.reason}</li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}
