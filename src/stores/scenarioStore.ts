import { create } from 'zustand'

export interface Scenario {
  id: string
  name: string
  description: string
}

interface ScenarioState {
  scenarios: Scenario[]
  selectedScenarioId: string | null
  selectScenario: (id: string) => void
  addScenario: (scenario: Scenario) => void
}

const defaultScenarios: Scenario[] = [
  { id: 'base', name: 'Base Case', description: 'Conservative growth estimates' },
  { id: 'optimistic', name: 'Optimistic', description: 'High growth scenario' },
  { id: 'pessimistic', name: 'Pessimistic', description: 'Low growth scenario' },
]

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: defaultScenarios,
  selectedScenarioId: 'base',
  selectScenario: (id) => set({ selectedScenarioId: id }),
  addScenario: (scenario) =>
    set((state) => ({ scenarios: [...state.scenarios, scenario] })),
}))
