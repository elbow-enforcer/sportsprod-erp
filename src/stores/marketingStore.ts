/**
 * Zustand store for marketing state management
 */

import { create } from 'zustand';
import type {
  MarketingChannel,
  MarketingSpend,
  ConversionData,
  RevenueAttribution,
  CACResult,
  ROASResult,
  BudgetAllocation,
  ChannelCategory,
} from '../models/marketing/types';
import {
  allChannels,
  defaultBudgetAllocation,
  calculateBlendedCAC,
  calculateCACByChannel,
  calculateBlendedROAS,
  calculateROASByChannel,
} from '../models/marketing';

interface MarketingState {
  // Channels
  channels: MarketingChannel[];
  setChannels: (channels: MarketingChannel[]) => void;
  toggleChannelActive: (channelId: string) => void;

  // Spend tracking
  spends: MarketingSpend[];
  addSpend: (spend: MarketingSpend) => void;
  updateSpend: (channelId: string, period: string, amount: number) => void;
  removeSpend: (channelId: string, period: string) => void;

  // Conversions
  conversions: ConversionData[];
  addConversion: (conversion: ConversionData) => void;
  updateConversion: (channelId: string, period: string, data: Partial<ConversionData>) => void;

  // Revenue attribution
  attributions: RevenueAttribution[];
  addAttribution: (attribution: RevenueAttribution) => void;
  updateAttribution: (channelId: string, period: string, revenue: number) => void;

  // Budget allocation
  totalBudget: number;
  setTotalBudget: (budget: number) => void;
  categoryAllocation: Record<ChannelCategory, number>;
  setCategoryAllocation: (category: ChannelCategory, percent: number) => void;

  // Current period for calculations
  currentPeriod: string;
  setCurrentPeriod: (period: string) => void;

  // Computed values
  getBlendedCAC: () => CACResult;
  getCACByChannel: () => Map<string, CACResult>;
  getBlendedROAS: () => ROASResult;
  getROASByChannel: () => Map<string, ROASResult>;
  getBudgetAllocations: () => BudgetAllocation[];
  getTotalSpend: (period?: string) => number;
  getTotalNewCustomers: (period?: string) => number;
  getTotalAttributedRevenue: (period?: string) => number;
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  // Channels - start with all predefined channels
  channels: allChannels,
  setChannels: (channels) => set({ channels }),
  toggleChannelActive: (channelId) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === channelId ? { ...ch, isActive: !ch.isActive } : ch
      ),
    })),

  // Spend tracking
  spends: [],
  addSpend: (spend) =>
    set((state) => ({ spends: [...state.spends, spend] })),
  updateSpend: (channelId, period, amount) =>
    set((state) => ({
      spends: state.spends.map((s) =>
        s.channelId === channelId && s.period === period
          ? { ...s, amount }
          : s
      ),
    })),
  removeSpend: (channelId, period) =>
    set((state) => ({
      spends: state.spends.filter(
        (s) => !(s.channelId === channelId && s.period === period)
      ),
    })),

  // Conversions
  conversions: [],
  addConversion: (conversion) =>
    set((state) => ({ conversions: [...state.conversions, conversion] })),
  updateConversion: (channelId, period, data) =>
    set((state) => ({
      conversions: state.conversions.map((c) =>
        c.channelId === channelId && c.period === period
          ? { ...c, ...data }
          : c
      ),
    })),

  // Revenue attribution
  attributions: [],
  addAttribution: (attribution) =>
    set((state) => ({ attributions: [...state.attributions, attribution] })),
  updateAttribution: (channelId, period, revenue) =>
    set((state) => ({
      attributions: state.attributions.map((a) =>
        a.channelId === channelId && a.period === period
          ? { ...a, revenue }
          : a
      ),
    })),

  // Budget allocation
  totalBudget: 0,
  setTotalBudget: (totalBudget) => set({ totalBudget }),
  categoryAllocation: { ...defaultBudgetAllocation },
  setCategoryAllocation: (category, percent) =>
    set((state) => ({
      categoryAllocation: {
        ...state.categoryAllocation,
        [category]: percent,
      },
    })),

  // Current period
  currentPeriod: new Date().toISOString().slice(0, 7),
  setCurrentPeriod: (currentPeriod) => set({ currentPeriod }),

  // Computed: Blended CAC for current period
  getBlendedCAC: () => {
    const { spends, conversions, currentPeriod } = get();
    return calculateBlendedCAC(spends, conversions, currentPeriod);
  },

  // Computed: CAC by channel for current period
  getCACByChannel: () => {
    const { spends, conversions, currentPeriod } = get();
    return calculateCACByChannel(spends, conversions, currentPeriod);
  },

  // Computed: Blended ROAS for current period
  getBlendedROAS: () => {
    const { spends, attributions, currentPeriod } = get();
    return calculateBlendedROAS(spends, attributions, currentPeriod);
  },

  // Computed: ROAS by channel for current period
  getROASByChannel: () => {
    const { spends, attributions, currentPeriod } = get();
    return calculateROASByChannel(spends, attributions, currentPeriod);
  },

  // Computed: Budget allocations based on total budget and category percentages
  getBudgetAllocations: () => {
    const { channels, totalBudget, categoryAllocation, currentPeriod } = get();
    const activeChannels = channels.filter((ch) => ch.isActive);

    const channelsByCategory = activeChannels.reduce((acc, ch) => {
      if (!acc[ch.category]) acc[ch.category] = [];
      acc[ch.category].push(ch);
      return acc;
    }, {} as Record<ChannelCategory, MarketingChannel[]>);

    const allocations: BudgetAllocation[] = [];

    for (const [category, categoryChannels] of Object.entries(channelsByCategory)) {
      const categoryBudget = totalBudget * (categoryAllocation[category as ChannelCategory] || 0);
      const perChannelBudget = categoryBudget / categoryChannels.length;
      const perChannelPercent = (categoryAllocation[category as ChannelCategory] || 0) / categoryChannels.length;

      for (const channel of categoryChannels) {
        allocations.push({
          channelId: channel.id,
          period: currentPeriod,
          allocatedBudget: perChannelBudget,
          percentOfTotal: perChannelPercent,
        });
      }
    }

    return allocations;
  },

  // Computed: Total spend for a period
  getTotalSpend: (period) => {
    const { spends, currentPeriod } = get();
    const targetPeriod = period || currentPeriod;
    return spends
      .filter((s) => s.period === targetPeriod)
      .reduce((sum, s) => sum + s.amount, 0);
  },

  // Computed: Total new customers for a period
  getTotalNewCustomers: (period) => {
    const { conversions, currentPeriod } = get();
    const targetPeriod = period || currentPeriod;
    return conversions
      .filter((c) => c.period === targetPeriod)
      .reduce((sum, c) => sum + c.newCustomers, 0);
  },

  // Computed: Total attributed revenue for a period
  getTotalAttributedRevenue: (period) => {
    const { attributions, currentPeriod } = get();
    const targetPeriod = period || currentPeriod;
    return attributions
      .filter((a) => a.period === targetPeriod)
      .reduce((sum, a) => sum + a.revenue, 0);
  },
}));
