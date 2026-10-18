import { catalog } from '../data'
import { useDemoStore } from '../state/store'
import { Button } from './ui/button'

// Scenario and reset controls stay available to presenters; account changes live in the profile menu.
export function DemoBar() {
  const scenarioId = useDemoStore((state) => state.scenarioId)
  const loadScenario = useDemoStore((state) => state.loadScenario)
  const reset = useDemoStore((state) => state.reset)
  return (
    <section aria-label="Demo controls" className="border-b border-border bg-muted">
      <details className="group mx-auto max-w-6xl px-6">
        <summary className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-xs font-medium text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span>Demo controls</span>
          <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Show</span>
          <span className="ml-auto hidden text-xs font-normal text-muted-foreground group-open:inline">Hide</span>
        </summary>
        <div className="flex flex-wrap items-center gap-3 border-t border-border py-3">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
            Scenario
            <select
              value={scenarioId}
              onChange={(event) => loadScenario(event.target.value)}
              className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
