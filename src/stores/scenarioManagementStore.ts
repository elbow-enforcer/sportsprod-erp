/**
 * Scenario Management Store
 * Save, recall, and compare assumption scenarios
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AllAssumptions } from '../models/assumptions';
import { DEFAULT_ASSUMPTIONS } from '../models/assumptions';

export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  assumptions: AllAssumptions;
  createdAt: string;
  updatedAt: string;
}

interface ScenarioManagementState {
  scenarios: SavedScenario[];
  activeScenarioId: string | null;
}

interface ScenarioManagementActions {
  saveScenario: (name: string, assumptions: AllAssumptions, description?: string) => string;
  updateScenario: (id: string, assumptions: AllAssumptions) => void;
  deleteScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  getScenario: (id: string) => SavedScenario | undefined;
  setActiveScenario: (id: string | null) => void;
  duplicateScenario: (id: string, newName: string) => string;
}

type ScenarioManagementStore = ScenarioManagementState & ScenarioManagementActions;

function generateId(): string {
  return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default scenarios
const DEFAULT_SCENARIOS: SavedScenario[] = [
  {
    id: 'default_base',
    name: 'Base Case',
    description: 'Default assumptions - moderate growth',
    assumptions: DEFAULT_ASSUMPTIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useScenarioManagementStore = create<ScenarioManagementStore>()(
  persist(
    (set, get) => ({
      scenarios: DEFAULT_SCENARIOS,
      activeScenarioId: null,

      saveScenario: (name, assumptions, description) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newScenario: SavedScenario = {
          id,
          name,
          description,
          assumptions: { ...assumptions },
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
        }));

        return id;
      },

      updateScenario: (id, assumptions) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id
              ? { ...s, assumptions: { ...assumptions }, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      deleteScenario: (id) => {
        // Don't delete default scenarios
        if (id.startsWith('default_')) return;
        
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
        }));
      },

      renameScenario: (id, name) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      getScenario: (id) => {
        return get().scenarios.find((s) => s.id === id);
      },

      setActiveScenario: (id) => {
        set({ activeScenarioId: id });
      },

      duplicateScenario: (id, newName) => {
        const original = get().scenarios.find((s) => s.id === id);
        if (!original) return '';

        const newId = generateId();
        const now = new Date().toISOString();

        const duplicated: SavedScenario = {
          id: newId,
          name: newName,
          description: `Copy of ${original.name}`,
          assumptions: { ...original.assumptions },
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          scenarios: [...state.scenarios, duplicated],
        }));

        return newId;
      },
    }),
    {
      name: 'sportsprod-scenarios',
    }
  )
);
