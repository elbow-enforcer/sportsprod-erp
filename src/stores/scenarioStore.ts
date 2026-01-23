import { create } from 'zustand';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  x0Shift: number;
  kMultiplier: number;
}

interface ScenarioState {
  scenarios: Scenario[];
  selectedScenarioId: string;
  selectScenario: (id: string) => void;
}

const defaultScenarios: Scenario[] = [
  { id: 'max', name: 'Max', description: '4 years early, 2x faster adoption (viral)', x0Shift: -4, kMultiplier: 2.0 },
  { id: 'upside', name: 'Upside', description: '2 years early, 20% faster adoption', x0Shift: -2, kMultiplier: 1.2 },
  { id: 'base', name: 'Base', description: 'Expected trajectory', x0Shift: 0, kMultiplier: 1.0 },
  { id: 'downside', name: 'Downside', description: '2 years late, 20% slower adoption', x0Shift: 2, kMultiplier: 0.8 },
  { id: 'min', name: 'Min', description: '2 years late, 75% slower adoption (limited traction)', x0Shift: 2, kMultiplier: 0.25 },
];

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: defaultScenarios,
  selectedScenarioId: 'base',
  selectScenario: (id) => set({ selectedScenarioId: id }),
}));
