/**
 * Zustand store for revenue state management
 */

import { create } from 'zustand';
import type { PricingConfig, DiscountTier, PromoCode } from '../models/revenue';
import {
  defaultPricing,
  discountRates,
  projectRevenue,
} from '../models/revenue';
import { useSeasonalityStore } from './seasonalityStore';

interface RevenueState {
  // Pricing
  pricing: PricingConfig;
  setPricing: (pricing: PricingConfig) => void;
  
  // Unit projections by year
  unitsByYear: number[];
  setUnitsByYear: (units: number[]) => void;
  
  // Active discount tier
  activeTier: DiscountTier;
  setActiveTier: (tier: DiscountTier) => void;
  
  // Promo codes
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  removePromoCode: (code: string) => void;
  
  // Computed values
  getAverageDiscount: () => number;
  getProjectedRevenue: () => number[];
  getTotalRevenue: () => number;
  getMonthlyProjections: (yearIndex: number) => number[];
}

export const useRevenueStore = create<RevenueState>((set, get) => ({
  // Pricing state
  pricing: defaultPricing,
  setPricing: (pricing) => set({ pricing }),
  
  // Unit projections (5-year default)
  unitsByYear: [0, 0, 0, 0, 0],
  setUnitsByYear: (unitsByYear) => set({ unitsByYear }),
  
  // Discount tier
  activeTier: 'individual',
  setActiveTier: (activeTier) => set({ activeTier }),
  
  // Promo codes
  promoCodes: [],
  addPromoCode: (promo) =>
    set((state) => ({ promoCodes: [...state.promoCodes, promo] })),
  removePromoCode: (code) =>
    set((state) => ({
      promoCodes: state.promoCodes.filter((p) => p.code !== code),
    })),
  
  // Computed: average discount based on active tier
  getAverageDiscount: () => {
    const { activeTier } = get();
    const range = discountRates[activeTier];
    return (range.min + range.max) / 2;
  },
  
  // Computed: projected revenue per year
  getProjectedRevenue: () => {
    const { unitsByYear, pricing } = get();
    const avgDiscount = get().getAverageDiscount();
    return projectRevenue(unitsByYear, pricing, avgDiscount);
  },
  
  // Computed: total revenue across all years
  getTotalRevenue: () => {
    const projections = get().getProjectedRevenue();
    return projections.reduce((sum, rev) => sum + rev, 0);
  },
  
  // Computed: monthly projection for a year with seasonality applied
  getMonthlyProjections: (yearIndex: number) => {
    const annual = get().getProjectedRevenue()[yearIndex] ?? 0;
    const { distributeRevenue } = useSeasonalityStore.getState();
    return distributeRevenue(annual);
  },
}));
