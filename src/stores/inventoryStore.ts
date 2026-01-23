import { create } from 'zustand';
import {
  InventoryConfig,
  InventoryState,
  PendingOrder,
  DEFAULT_INVENTORY_CONFIG,
  calculateDailySalesRate,
  calculateReorderPoint,
  calculateSafetyStock,
  calculateWorkingCapital,
  shouldReorder,
} from '../models/inventory';

// Scenario annual unit mappings
const SCENARIO_ANNUAL_UNITS: Record<string, number> = {
  conservative: 5000,
  moderate: 10000,
  aggressive: 20000,
};

interface InventoryStoreState {
  // Configuration
  config: InventoryConfig;
  
  // Current state
  state: InventoryState;
  
  // Selected scenario for calculations
  selectedScenario: string;
  
  // Computed values
  dailySalesRate: number;
  reorderPoint: number;
  safetyStock: number;
  workingCapital: number;
  needsReorder: boolean;
  
  // Actions
  setConfig: (config: Partial<InventoryConfig>) => void;
  resetConfig: () => void;
  setSelectedScenario: (scenario: string) => void;
  updateInventoryState: (state: Partial<InventoryState>) => void;
  addPendingOrder: (order: PendingOrder) => void;
  removePendingOrder: (orderDate: number) => void;
}

function computeDerivedValues(config: InventoryConfig, scenario: string, currentUnits: number) {
  const annualUnits = SCENARIO_ANNUAL_UNITS[scenario] || SCENARIO_ANNUAL_UNITS.moderate;
  const dailySalesRate = calculateDailySalesRate(annualUnits);
  const reorderPoint = calculateReorderPoint(dailySalesRate, config.leadTimeDays, config.safetyDays);
  const safetyStock = calculateSafetyStock(dailySalesRate, config.safetyDays);
  const workingCapital = calculateWorkingCapital(currentUnits, config.unitCost);
  const needsReorder = shouldReorder(currentUnits, reorderPoint);
  
  return {
    dailySalesRate,
    reorderPoint,
    safetyStock,
    workingCapital,
    needsReorder,
  };
}

export const useInventoryStore = create<InventoryStoreState>((set, get) => {
  const initialConfig = DEFAULT_INVENTORY_CONFIG;
  const initialScenario = 'moderate';
  const initialState: InventoryState = {
    currentUnits: 0,
    pendingOrders: [],
    totalInvested: 0,
  };
  const initialComputed = computeDerivedValues(initialConfig, initialScenario, initialState.currentUnits);
  
  return {
    config: initialConfig,
    state: initialState,
    selectedScenario: initialScenario,
    ...initialComputed,
    
    setConfig: (newConfig) => {
      const config = { ...get().config, ...newConfig };
      const computed = computeDerivedValues(config, get().selectedScenario, get().state.currentUnits);
      set({ config, ...computed });
    },
    
    resetConfig: () => {
      const computed = computeDerivedValues(
        DEFAULT_INVENTORY_CONFIG,
        get().selectedScenario,
        get().state.currentUnits
      );
      set({ config: DEFAULT_INVENTORY_CONFIG, ...computed });
    },
    
    setSelectedScenario: (scenario) => {
      const computed = computeDerivedValues(get().config, scenario, get().state.currentUnits);
      set({ selectedScenario: scenario, ...computed });
    },
    
    updateInventoryState: (newState) => {
      const state = { ...get().state, ...newState };
      const computed = computeDerivedValues(get().config, get().selectedScenario, state.currentUnits);
      set({ state, ...computed });
    },
    
    addPendingOrder: (order) => {
      const pendingOrders = [...get().state.pendingOrders, order];
      set({
        state: {
          ...get().state,
          pendingOrders,
          totalInvested: get().state.totalInvested + order.cost,
        },
      });
    },
    
    removePendingOrder: (orderDate) => {
      const pendingOrders = get().state.pendingOrders.filter((o) => o.orderDate !== orderDate);
      set({
        state: {
          ...get().state,
          pendingOrders,
        },
      });
    },
  };
});
