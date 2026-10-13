import { create } from 'zustand'

// Placeholder demo controls. Step 4 replaces this with the persisted order store
// and a real scenario loader and reset.
export const scenarios = [
  { id: 'routine', label: 'Routine event' },
  { id: 'unusual', label: 'Unusual request' },
] as const

export type ScenarioId = (typeof scenarios)[number]['id']

type DemoControls = {
  scenario: ScenarioId
  resetCount: number
  setScenario: (id: ScenarioId) => void
  reset: () => void
}

export const useDemoControls = create<DemoControls>((set) => ({
  scenario: 'routine',
  resetCount: 0,
  setScenario: (scenario) => set({ scenario }),
  reset: () => set((state) => ({ scenario: 'routine', resetCount: state.resetCount + 1 })),
}))
