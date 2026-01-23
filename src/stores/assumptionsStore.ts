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
  resetToDefaults: () => void;
}

type AssumptionsStore = AllAssumptions & AssumptionsActions;

export const useAssumptionsStore = create<AssumptionsStore>()(
  persist(
    (set) => ({
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

      resetToDefaults: () =>
        set({
          ...DEFAULT_ASSUMPTIONS,
          lastModified: new Date().toISOString(),
        }),
    }),
    {
      name: 'sportsprod-assumptions',
    }
  )
);
