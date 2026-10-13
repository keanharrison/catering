import { Link, useNavigate } from 'react-router-dom'
import { Band } from '../../components/Band'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { StatLine } from '../../components/StatLine'
import { formatMoney } from '../../lib/format'
import { customerRoutes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { buildRecommendationView } from './recommendationView'

export function RecommendationPage() {
  const navigate = useNavigate()
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const view = buildRecommendationView(order, clock)

  if (view.guestCount === null || view.groups.length === 0) {
    return (
      <Band>
        <Eyebrow marker>Your menu</Eyebrow>
        <h1 className="mt-6 text-5xl">We need your guest count first.</h1>
        <p className="mt-6 max-w-xl text-muted">
          Add the number of guests and we will suggest a menu and quantities.
        </p>
        <div className="mt-8">
          <Link to={customerRoutes.intake}>
            <Button>Back to event details</Button>
          </Link>
        </div>
      </Band>
    )
  }

  return (
    <Band>
      <Eyebrow marker>Recommended for {view.guestCount} guests</Eyebrow>
      <h1 className="mt-6 text-5xl md:text-7xl">Your suggested menu.</h1>
      <p className="mt-6 max-w-xl text-muted">
        Quantities come from your guest count and our serving guidelines. Open any item to see why.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          {view.groups.map((group) => (
            <Panel key={group.category} className="p-0">
              <div className="border-b border-line px-6 py-4">
                <Eyebrow>{group.title}</Eyebrow>
              </div>
              <ul>
                {group.rows.map((row) => (
                  <li key={row.itemId} className="border-b border-line last:border-b-0">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-4">
                        <span className="font-sans text-lg">{row.name}</span>
                        <span className="flex items-center gap-6 font-sans text-sm">
                          <span>{row.unitLabel}</span>
                          <span className="text-muted">{row.servings} servings</span>
                          <span className="w-16 text-right">{formatMoney(row.costCents)}</span>
                        </span>
                      </summary>
                      <div className="grid gap-3 bg-ivory-deep px-6 py-4 text-sm">
                        <p>{row.reason}</p>
                        {row.assumptions.length > 0 && (
                          <p className="text-muted">
                            Price, tray size and portion guidance for this item are placeholders until
                            confirmed by Pearl Island.
                          </p>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <div className="grid gap-6 self-start">
          <Panel corners>
            <Eyebrow>Estimated total</Eyebrow>
            <p className="mt-4 font-sans text-6xl tracking-tight">
              {formatMoney(view.estimate.subtotalCents)}
            </p>
            <div className="mt-3">
              <StatLine
                items={[
                  { label: 'Guests', value: String(view.guestCount) },
                  {
                    label: 'Per guest',
                    value: view.estimate.costPerGuestCents === null ? '-' : formatMoney(view.estimate.costPerGuestCents),
                  },
                ]}
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              Estimate for food only, before tax and fees. Our team confirms the final price.
            </p>
          </Panel>

          {(view.flags.length > 0 || view.notes.length > 0) && (
            <Panel tone="deep" className="p-6">
              {view.flags.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <Eyebrow>Our team will check</Eyebrow>
                    <Pill tone="review">Needs review</Pill>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {view.flags.map((flag) => (
                      <li key={flag.code}>{flag.reason}</li>
                    ))}
                  </ul>
                </>
              )}
              {view.notes.length > 0 && (
                <ul className={`grid gap-2 text-sm text-muted ${view.flags.length > 0 ? 'mt-4' : ''}`}>
                  {view.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate(customerRoutes.intake)}>
          Back
        </Button>
        <Button onClick={() => navigate(customerRoutes.review)}>Review order</Button>
      </div>
    </Band>
  )
}
