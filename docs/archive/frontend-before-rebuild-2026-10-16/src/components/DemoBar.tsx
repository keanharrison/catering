import { NavLink } from 'react-router-dom'
import { cx } from '../lib/cx'
import { routes } from '../routes'
import { catalog } from '../data'
import { useDemoStore } from '../state/store'
import { Button } from './Button'

const roles = [
  { to: routes.customer, label: 'Customer' },
  { to: routes.staff, label: 'Staff' },
  { to: routes.handoff, label: 'Handoff' },
  { to: routes.gallery, label: 'Gallery' },
]

// Demo-only role, scenario, and reset controls are grouped away from the customer journey.
export function DemoBar() {
  const scenarioId = useDemoStore((state) => state.scenarioId)
  const loadScenario = useDemoStore((state) => state.loadScenario)
  const reset = useDemoStore((state) => state.reset)
  return (
    <section aria-label="Presenter toolbar" className="border-b border-line bg-ivory-deep">
      <details className="group mx-auto max-w-6xl px-6">
        <summary className="flex min-h-11 cursor-pointer items-center gap-3 py-2 font-mono text-[11px] uppercase tracking-eyebrow text-muted focus-visible:rounded-sm">
          <span>Presenter toolbar</span>
          <span className="ml-auto font-sans text-xs normal-case tracking-normal text-action group-open:hidden">Show</span>
          <span className="ml-auto hidden font-sans text-xs normal-case tracking-normal text-action group-open:inline">Hide</span>
        </summary>
        <div className="flex flex-wrap items-center gap-3 border-t border-line py-3">
          <nav aria-label="Presenter navigation" className="flex flex-wrap border border-control-line bg-panel">
            {roles.map((role) => (
              <NavLink
                key={role.to}
                to={role.to}
                className={({ isActive }) =>
                  cx(
                    'inline-flex min-h-11 items-center px-3 font-mono text-[11px] uppercase tracking-eyebrow',
                    isActive ? 'bg-action text-on-action' : 'text-charcoal hover:bg-ivory-deep',
                  )
                }
              >
                {role.label}
              </NavLink>
            ))}
          </nav>
          <label className="flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-eyebrow">
            Scenario
            <select
              value={scenarioId}
              onChange={(event) => loadScenario(event.target.value)}
              className="min-h-11 rounded-sm border border-control-line bg-panel px-3 py-2 font-sans text-sm normal-case tracking-normal"
            >
              {catalog.scenarios.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" variant="secondary" className="min-h-11 px-4 py-2" onClick={reset}>
            Reset
          </Button>
        </div>
      </details>
    </section>
  )
}
