import { NavLink } from 'react-router-dom'
import { cx } from '../lib/cx'
import { routes } from '../routes'
import { catalog } from '../data'
import { useDemoStore } from '../state/store'
import { Button } from './Button'

const roles = [
  { to: routes.customer, label: 'Customer' },
  { to: routes.staff, label: 'Staff' },
]

// Sits above every view: role switch, scenario loader, reset.
export function DemoBar() {
  const scenarioId = useDemoStore((state) => state.scenarioId)
  const loadScenario = useDemoStore((state) => state.loadScenario)
  const reset = useDemoStore((state) => state.reset)
  return (
    <div className="border-b border-line bg-ivory-deep">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2">
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div role="group" aria-label="View as" className="flex border border-control-line bg-panel">
            {roles.map((role) => (
              <NavLink
                key={role.to}
                to={role.to}
                className={({ isActive }) =>
                  cx(
                    'px-3 py-1 font-mono text-[11px] uppercase tracking-eyebrow',
                    isActive ? 'bg-action text-on-action' : 'text-charcoal hover:bg-ivory-deep',
                  )
                }
              >
                {role.label}
              </NavLink>
            ))}
          </div>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-eyebrow">
            Scenario
            <select
              value={scenarioId}
              onChange={(event) => loadScenario(event.target.value)}
              className="rounded-sm border border-line bg-panel px-2 py-1 font-sans text-sm normal-case tracking-normal"
            >
              {catalog.scenarios.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
