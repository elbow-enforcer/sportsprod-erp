import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AllAssumptions,
  RevenueAssumptions,
  COGSAssumptions,
  MarketingAssumptions,
  GNAAssumptions,
  CapitalAssumptions,
  CorporateAssumptions,
} from '../models/assumptions';
import { DEFAULT_ASSUMPTIONS } from '../models/assumptions';

interface AssumptionsActions {
  updateRevenue: (updates: Partial<RevenueAssumptions>) => void;
  updateCOGS: (updates: Partial<COGSAssumptions>) => void;
  updateMarketing: (updates: Partial<MarketingAssumptions>) => void;
  updateGNA: (updates: Partial<GNAAssumptions>) => void;
  updateCapital: (updates: Partial<CapitalAssumptions>) => void;
  updateCorporate: (updates: Partial<CorporateAssumptions>) => void;
  resetRevenue: () => void;
  resetCOGS: () => void;
  resetMarketing: () => void;
  resetGNA: () => void;
  resetCapital: () => void;
  resetCorporate: () => void;
  resetToDefaults: () => void;
  exportAsJSON: () => string;
}

type AssumptionsStore = AllAssumptions & AssumptionsActions;

export const useAssumptionsStore = create<AssumptionsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ASSUMPTIONS,

      updateRevenue: (updates) =>
        set((state) => ({
          revenue: { ...state.revenue, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCOGS: (updates) =>
        set((state) => ({
          cogs: { ...state.cogs, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateMarketing: (updates) =>
        set((state) => ({
          marketing: { ...state.marketing, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateGNA: (updates) =>
        set((state) => ({
          gna: { ...state.gna, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCapital: (updates) =>
        set((state) => ({
          capital: { ...state.capital, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCorporate: (updates) =>
        set((state) => ({
          corporate: { ...state.corporate, ...updates },
          lastModified: new Date().toISOString(),
        })),

      resetRevenue: () =>
        set((state) => ({
          revenue: DEFAULT_ASSUMPTIONS.revenue,
          lastModified: new Date().toISOString(),
        })),

      resetCOGS: () =>
        set((state) => ({
          cogs: DEFAULT_ASSUMPTIONS.cogs,
          lastModified: new Date().toISOString(),
        })),

      resetMarketing: () =>
        set((state) => ({
          marketing: DEFAULT_ASSUMPTIONS.marketing,
          lastModified: new Date().toISOString(),
        })),

      resetGNA: () =>
        set((state) => ({
          gna: DEFAULT_ASSUMPTIONS.gna,
          lastModified: new Date().toISOString(),
        })),

      resetCapital: () =>
        set((state) => ({
          capital: DEFAULT_ASSUMPTIONS.capital,
          lastModified: new Date().toISOString(),
        })),

      resetCorporate: () =>
        set((state) => ({
          corporate: DEFAULT_ASSUMPTIONS.corporate,
          lastModified: new Date().toISOString(),
        })),

      resetToDefaults: () =>
        set({
          ...DEFAULT_ASSUMPTIONS,
          lastModified: new Date().toISOString(),
        }),

      exportAsJSON: () => {
        const state = get();
        const exportData = {
          revenue: state.revenue,
          cogs: state.cogs,
          marketing: state.marketing,
          gna: state.gna,
          capital: state.capital,
          corporate: state.corporate,
          version: state.version,
          lastModified: state.lastModified,
        };
        return JSON.stringify(exportData, null, 2);
      },
    }),
    {
      name: 'sportsprod-assumptions',
    }
  )
);
