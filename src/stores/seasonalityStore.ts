/**
 * Seasonality Store
 * 
 * Manages baseball calendar settings for revenue/demand seasonality.
 * Hooks into projections via getSeasonalRevenue().
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarType, MonthlySeasonality } from '../models/seasonality';
import {
  getMonthlySeasonality,
  distributeAnnually,
  getAverageMultiplier,
  getPeakTroughMonths,
  getRevenueMultiplier,
} from '../models/seasonality';

interface SeasonalityState {
  enabled: boolean;
  calendarType: CalendarType;
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setCalendarType: (type: CalendarType) => void;
  reset: () => void;
  
  // Computed helpers
  getMonthly: () => MonthlySeasonality[];
  distributeRevenue: (annual: number) => number[];
  getMultiplier: (month: number) => number;
  getAverage: () => number;
  getPeakTrough: () => { peak: number; trough: number };
  
  // Integration hook for projections
  getSeasonalRevenue: (monthlyBase: number, month: number) => number;
}

const DEFAULT_STATE = {
  enabled: true,
  calendarType: 'pro' as CalendarType,
};

export const useSeasonalityStore = create<SeasonalityState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      
      setEnabled: (enabled) => set({ enabled }),
      
      setCalendarType: (calendarType) => set({ calendarType }),
      
      reset: () => set(DEFAULT_STATE),
      
      getMonthly: () => {
        const { calendarType } = get();
        return getMonthlySeasonality(calendarType);
      },
      
      distributeRevenue: (annual) => {
        const { enabled, calendarType } = get();
        if (!enabled) {
          // Flat distribution when disabled
          return Array(12).fill(annual / 12);
        }
        return distributeAnnually(annual, calendarType, 'revenue');
      },
      
      getMultiplier: (month) => {
        const { enabled, calendarType } = get();
        if (!enabled) return 1.0;
        return getRevenueMultiplier(month, calendarType);
      },
      
      getAverage: () => {
        const { enabled, calendarType } = get();
        if (!enabled) return 1.0;
        return getAverageMultiplier(calendarType);
      },
      
      getPeakTrough: () => {
        const { calendarType } = get();
        return getPeakTroughMonths(calendarType);
      },
      
      // Hook for projections store integration
      getSeasonalRevenue: (monthlyBase, month) => {
        const { enabled, calendarType } = get();
        if (!enabled) return monthlyBase;
        
        const multiplier = getRevenueMultiplier(month, calendarType);
        const average = getAverageMultiplier(calendarType);
        
        // Normalize: multiply by (multiplier / average) so annual totals stay same
        return monthlyBase * (multiplier / average);
      },
    }),
    {
      name: 'seasonality-storage',
      partialize: (state) => ({
        enabled: state.enabled,
        calendarType: state.calendarType,
      }),
    }
  )
);

export default useSeasonalityStore;
