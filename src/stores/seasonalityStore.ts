/**
 * Seasonality Store - Issue #15
 * 
 * Simple toggle with monthly multipliers for revenue projections.
 * Default: OFF
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SeasonalityPreset = 'sports-retail' | 'flat' | 'custom';
export type SeasonCategory = 'holiday' | 'peak' | 'shoulder' | 'off';

export interface MonthlyMultiplier {
  month: number;
  name: string;
  multiplier: number;
  category: SeasonCategory;
}

// Default multipliers per Issue #15: 
// Q4 holiday bump (Nov-Dec), Late summer peak (Aug-Sep), 
// Early season high (Mar-May), Off-season low (Oct, Jan-Feb)
const DEFAULT_MULTIPLIERS: MonthlyMultiplier[] = [
  { month: 1, name: 'January', multiplier: 0.80, category: 'off' },
  { month: 2, name: 'February', multiplier: 0.70, category: 'off' },
  { month: 3, name: 'March', multiplier: 1.10, category: 'shoulder' },
  { month: 4, name: 'April', multiplier: 1.15, category: 'shoulder' },
  { month: 5, name: 'May', multiplier: 1.10, category: 'shoulder' },
  { month: 6, name: 'June', multiplier: 0.95, category: 'shoulder' },
  { month: 7, name: 'July', multiplier: 0.90, category: 'off' },
  { month: 8, name: 'August', multiplier: 1.15, category: 'peak' },
  { month: 9, name: 'September', multiplier: 1.20, category: 'peak' },
  { month: 10, name: 'October', multiplier: 0.85, category: 'off' },
  { month: 11, name: 'November', multiplier: 1.20, category: 'holiday' },
  { month: 12, name: 'December', multiplier: 1.30, category: 'holiday' },
];

const FLAT_MULTIPLIERS: MonthlyMultiplier[] = [
  { month: 1, name: 'January', multiplier: 1.0, category: 'shoulder' },
  { month: 2, name: 'February', multiplier: 1.0, category: 'shoulder' },
  { month: 3, name: 'March', multiplier: 1.0, category: 'shoulder' },
  { month: 4, name: 'April', multiplier: 1.0, category: 'shoulder' },
  { month: 5, name: 'May', multiplier: 1.0, category: 'shoulder' },
  { month: 6, name: 'June', multiplier: 1.0, category: 'shoulder' },
  { month: 7, name: 'July', multiplier: 1.0, category: 'shoulder' },
  { month: 8, name: 'August', multiplier: 1.0, category: 'shoulder' },
  { month: 9, name: 'September', multiplier: 1.0, category: 'shoulder' },
  { month: 10, name: 'October', multiplier: 1.0, category: 'shoulder' },
  { month: 11, name: 'November', multiplier: 1.0, category: 'shoulder' },
  { month: 12, name: 'December', multiplier: 1.0, category: 'shoulder' },
];

export interface CategoryDescription {
  label: string;
  color: string;
  bgColor: string;
}

export const CATEGORY_DESCRIPTIONS: Record<SeasonCategory, CategoryDescription> = {
  holiday: { label: 'Holiday', color: 'text-red-700', bgColor: 'bg-red-100' },
  peak: { label: 'Peak', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  shoulder: { label: 'Shoulder', color: 'text-green-700', bgColor: 'bg-green-100' },
  off: { label: 'Off-Season', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

interface MonthlyProjection {
  month: number;
  monthName: string;
  flatRevenue: number;
  adjustedRevenue: number;
  multiplier: number;
  difference: number;
  differencePercent: number;
  category: SeasonCategory;
}

interface AnnualComparison {
  year: number;
  flatTotal: number;
  seasonalTotal: number;
  monthlyProjections: MonthlyProjection[];
}

interface SeasonalityState {
  enabled: boolean;
  presetId: SeasonalityPreset;
  multipliers: MonthlyMultiplier[];
}

interface SeasonalityActions {
  toggleSeasonality: () => void;
  setEnabled: (enabled: boolean) => void;
  applyPreset: (preset: SeasonalityPreset) => void;
  updateMultiplier: (month: number, value: number) => void;
  resetMultipliers: () => void;
  getValidationStatus: () => { valid: boolean; message: string };
  getAdjustmentFactor: () => number;
  getMultiplierForMonth: (month: number) => number;
  getAnnualComparison: (year: number, annualRevenue: number) => AnnualComparison;
  getSeasonalRevenue: (monthlyBase: number, month: number) => number;
}

type SeasonalityStore = SeasonalityState & SeasonalityActions;

export const useSeasonalityStore = create<SeasonalityStore>()(
  persist(
    (set, get) => ({
      // Initial state - disabled by default per Issue #15
      enabled: false,
      presetId: 'sports-retail',
      multipliers: [...DEFAULT_MULTIPLIERS],

      toggleSeasonality: () =>
        set((state) => ({ enabled: !state.enabled })),

      setEnabled: (enabled) =>
        set({ enabled }),

      applyPreset: (preset) => {
        const multipliers = preset === 'flat' 
          ? [...FLAT_MULTIPLIERS] 
          : [...DEFAULT_MULTIPLIERS];
        set({ 
          presetId: preset,
          multipliers,
        });
      },

      updateMultiplier: (month, value) =>
        set((state) => ({
          presetId: 'custom',
          multipliers: state.multipliers.map((m) =>
            m.month === month ? { ...m, multiplier: Math.max(0.1, Math.min(3.0, value)) } : m
          ),
        })),

      resetMultipliers: () =>
        set({
          presetId: 'sports-retail',
          multipliers: [...DEFAULT_MULTIPLIERS],
        }),

      getValidationStatus: () => {
        const { multipliers } = get();
        const avg = multipliers.reduce((sum, m) => sum + m.multiplier, 0) / 12;
        const valid = avg >= 0.95 && avg <= 1.05;
        return {
          valid,
          message: valid
            ? 'Multipliers are balanced'
            : `Average multiplier is ${(avg * 100).toFixed(0)}% (target: ~100%)`,
        };
      },

      getAdjustmentFactor: () => {
        const { multipliers } = get();
        return multipliers.reduce((sum, m) => sum + m.multiplier, 0) / 12;
      },

      getMultiplierForMonth: (month) => {
        const { enabled, multipliers } = get();
        if (!enabled) return 1.0;
        return multipliers.find((m) => m.month === month)?.multiplier ?? 1.0;
      },

      getAnnualComparison: (year, annualRevenue) => {
        const { enabled, multipliers } = get();
        const monthlyFlat = annualRevenue / 12;

        const monthlyProjections: MonthlyProjection[] = multipliers.map((m) => {
          const flatRevenue = monthlyFlat;
          const adjustedRevenue = enabled ? monthlyFlat * m.multiplier : monthlyFlat;
          const difference = adjustedRevenue - flatRevenue;
          const differencePercent = ((adjustedRevenue / flatRevenue) - 1) * 100;

          return {
            month: m.month,
            monthName: m.name,
            flatRevenue,
            adjustedRevenue,
            multiplier: m.multiplier,
            difference,
            differencePercent,
            category: m.category,
          };
        });

        return {
          year,
          flatTotal: annualRevenue,
          seasonalTotal: monthlyProjections.reduce((sum, p) => sum + p.adjustedRevenue, 0),
          monthlyProjections,
        };
      },

      // Legacy compatibility
      getSeasonalRevenue: (monthlyBase, month) => {
        const { enabled, multipliers } = get();
        if (!enabled) return monthlyBase;
        
        const multiplier = multipliers.find((m) => m.month === month)?.multiplier ?? 1.0;
        const average = get().getAdjustmentFactor();
        
        return monthlyBase * (multiplier / average);
      },
    }),
    {
      name: 'sportsprod-seasonality',
      partialize: (state) => ({
        enabled: state.enabled,
        presetId: state.presetId,
        multipliers: state.multipliers,
      }),
    }
  )
);

export default useSeasonalityStore;
