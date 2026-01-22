/**
 * Marketing Module Tests
 * Tests for CAC, ROAS, and channel management
 */

import { describe, it, expect } from 'vitest';
import {
  // Channels
  allChannels,
  digitalChannels,
  fieldChannels,
  influencerChannels,
  contentChannels,
  getChannelsByCategory,
  getChannelById,
  getActiveChannels,
  defaultBudgetAllocation,
  // CAC
  calculateChannelCAC,
  calculateBlendedCAC,
  calculateCACTrend,
  calculateCACByChannel,
  calculateCACPayback,
  calculateLTVtoCACRatio,
  evaluateCACHealth,
  // ROAS
  calculateChannelROAS,
  calculateBlendedROAS,
  calculateROASTrend,
  calculateROASByChannel,
  evaluateROASHealth,
  calculateBreakEvenROAS,
  calculateIncrementalROAS,
  rankChannelsByROAS,
} from '../index';
import type { MarketingSpend, ConversionData, RevenueAttribution } from '../types';

describe('Marketing Channels', () => {
  it('should have all channel categories defined', () => {
    expect(digitalChannels.length).toBeGreaterThan(0);
    expect(fieldChannels.length).toBeGreaterThan(0);
    expect(influencerChannels.length).toBeGreaterThan(0);
    expect(contentChannels.length).toBeGreaterThan(0);
  });

  it('should combine all channels', () => {
    const totalExpected =
      digitalChannels.length +
      fieldChannels.length +
      influencerChannels.length +
      contentChannels.length;
    expect(allChannels.length).toBe(totalExpected);
  });

  it('should get channels by category', () => {
    const digital = getChannelsByCategory('digital');
    expect(digital.length).toBe(digitalChannels.length);
    expect(digital.every((ch) => ch.category === 'digital')).toBe(true);
  });

  it('should get channel by ID', () => {
    const channel = getChannelById('paid-search');
    expect(channel).toBeDefined();
    expect(channel?.name).toBe('Paid Search (SEM)');
    expect(channel?.category).toBe('digital');
  });

  it('should return undefined for unknown channel ID', () => {
    const channel = getChannelById('nonexistent');
    expect(channel).toBeUndefined();
  });

  it('should get only active channels', () => {
    const active = getActiveChannels();
    expect(active.every((ch) => ch.isActive)).toBe(true);
  });

  it('should have default budget allocation summing to 100%', () => {
    const total = Object.values(defaultBudgetAllocation).reduce((sum, pct) => sum + pct, 0);
    expect(total).toBeCloseTo(1.0);
  });
});

describe('CAC Calculations', () => {
  const testSpend: MarketingSpend = {
    channelId: 'paid-search',
    period: '2024-Q1',
    amount: 10000,
    budget: 12000,
  };

  const testConversion: ConversionData = {
    channelId: 'paid-search',
    period: '2024-Q1',
    newCustomers: 50,
    leads: 500,
    conversionRate: 0.1,
  };

  it('should calculate channel CAC correctly', () => {
    const result = calculateChannelCAC(testSpend, testConversion);
    expect(result.channelId).toBe('paid-search');
    expect(result.period).toBe('2024-Q1');
    expect(result.totalSpend).toBe(10000);
    expect(result.newCustomers).toBe(50);
    expect(result.cac).toBe(200); // 10000 / 50
  });

  it('should handle zero customers gracefully', () => {
    const zeroConversion = { ...testConversion, newCustomers: 0 };
    const result = calculateChannelCAC(testSpend, zeroConversion);
    expect(result.cac).toBe(0);
  });

  it('should throw on channel ID mismatch', () => {
    const mismatchSpend = { ...testSpend, channelId: 'other' };
    expect(() => calculateChannelCAC(mismatchSpend, testConversion)).toThrow(
      'Channel ID mismatch'
    );
  });

  it('should throw on period mismatch', () => {
    const mismatchSpend = { ...testSpend, period: '2024-Q2' };
    expect(() => calculateChannelCAC(mismatchSpend, testConversion)).toThrow(
      'Period mismatch'
    );
  });

  it('should calculate blended CAC across channels', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-social', period: '2024-Q1', amount: 5000, budget: 5000 },
    ];
    const conversions: ConversionData[] = [
      { channelId: 'paid-search', period: '2024-Q1', newCustomers: 50, leads: 500, conversionRate: 0.1 },
      { channelId: 'paid-social', period: '2024-Q1', newCustomers: 25, leads: 250, conversionRate: 0.1 },
    ];

    const result = calculateBlendedCAC(spends, conversions, '2024-Q1');
    expect(result.channelId).toBe('blended');
    expect(result.totalSpend).toBe(15000);
    expect(result.newCustomers).toBe(75);
    expect(result.cac).toBe(200); // 15000 / 75
  });

  it('should calculate CAC trend over periods', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-search', period: '2024-Q2', amount: 12000, budget: 12000 },
    ];
    const conversions: ConversionData[] = [
      { channelId: 'paid-search', period: '2024-Q1', newCustomers: 50, leads: 500, conversionRate: 0.1 },
      { channelId: 'paid-search', period: '2024-Q2', newCustomers: 60, leads: 600, conversionRate: 0.1 },
    ];

    const trend = calculateCACTrend(spends, conversions, ['2024-Q1', '2024-Q2']);
    expect(trend.length).toBe(2);
    expect(trend[0].cac).toBe(200);
    expect(trend[1].cac).toBe(200);
  });

  it('should calculate CAC by channel', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-social', period: '2024-Q1', amount: 5000, budget: 5000 },
    ];
    const conversions: ConversionData[] = [
      { channelId: 'paid-search', period: '2024-Q1', newCustomers: 50, leads: 500, conversionRate: 0.1 },
      { channelId: 'paid-social', period: '2024-Q1', newCustomers: 20, leads: 200, conversionRate: 0.1 },
    ];

    const byChannel = calculateCACByChannel(spends, conversions, '2024-Q1');
    expect(byChannel.get('paid-search')?.cac).toBe(200);
    expect(byChannel.get('paid-social')?.cac).toBe(250);
  });

  it('should calculate CAC payback period', () => {
    const payback = calculateCACPayback(200, 50, 0.7);
    expect(payback).toBeCloseTo(5.71, 1); // 200 / (50 * 0.7) ≈ 5.71 months
  });

  it('should handle zero ARPU in payback calculation', () => {
    const payback = calculateCACPayback(200, 0, 0.7);
    expect(payback).toBe(Infinity);
  });

  it('should calculate LTV:CAC ratio', () => {
    const ratio = calculateLTVtoCACRatio(1000, 200);
    expect(ratio).toBe(5);
  });

  it('should handle zero CAC in LTV:CAC', () => {
    const ratio = calculateLTVtoCACRatio(1000, 0);
    expect(ratio).toBe(Infinity);
  });

  it('should evaluate CAC health correctly', () => {
    expect(evaluateCACHealth(200, 1000, 10)).toBe('excellent'); // 5:1 ratio, 10 mo payback
    expect(evaluateCACHealth(400, 1000, 15)).toBe('good'); // 2.5:1 ratio, 15 mo payback
    expect(evaluateCACHealth(600, 1000, 20)).toBe('fair'); // 1.67:1 ratio, 20 mo payback
    expect(evaluateCACHealth(1500, 1000, 30)).toBe('poor'); // 0.67:1 ratio, 30 mo payback
  });
});

describe('ROAS Calculations', () => {
  const testSpend: MarketingSpend = {
    channelId: 'paid-search',
    period: '2024-Q1',
    amount: 10000,
    budget: 12000,
  };

  const testAttribution: RevenueAttribution = {
    channelId: 'paid-search',
    period: '2024-Q1',
    revenue: 35000,
  };

  it('should calculate channel ROAS correctly', () => {
    const result = calculateChannelROAS(testSpend, testAttribution);
    expect(result.channelId).toBe('paid-search');
    expect(result.period).toBe('2024-Q1');
    expect(result.adSpend).toBe(10000);
    expect(result.revenue).toBe(35000);
    expect(result.roas).toBe(3.5); // 35000 / 10000
    expect(result.roasPercent).toBe(350);
  });

  it('should handle zero spend gracefully', () => {
    const zeroSpend = { ...testSpend, amount: 0 };
    const result = calculateChannelROAS(zeroSpend, testAttribution);
    expect(result.roas).toBe(0);
  });

  it('should throw on channel ID mismatch', () => {
    const mismatchAttribution = { ...testAttribution, channelId: 'other' };
    expect(() => calculateChannelROAS(testSpend, mismatchAttribution)).toThrow(
      'Channel ID mismatch'
    );
  });

  it('should calculate blended ROAS across channels', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-social', period: '2024-Q1', amount: 5000, budget: 5000 },
    ];
    const attributions: RevenueAttribution[] = [
      { channelId: 'paid-search', period: '2024-Q1', revenue: 35000 },
      { channelId: 'paid-social', period: '2024-Q1', revenue: 15000 },
    ];

    const result = calculateBlendedROAS(spends, attributions, '2024-Q1');
    expect(result.channelId).toBe('blended');
    expect(result.adSpend).toBe(15000);
    expect(result.revenue).toBe(50000);
    expect(result.roas).toBeCloseTo(3.33, 1); // 50000 / 15000
  });

  it('should calculate ROAS trend over periods', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-search', period: '2024-Q2', amount: 10000, budget: 10000 },
    ];
    const attributions: RevenueAttribution[] = [
      { channelId: 'paid-search', period: '2024-Q1', revenue: 30000 },
      { channelId: 'paid-search', period: '2024-Q2', revenue: 40000 },
    ];

    const trend = calculateROASTrend(spends, attributions, ['2024-Q1', '2024-Q2']);
    expect(trend.length).toBe(2);
    expect(trend[0].roas).toBe(3);
    expect(trend[1].roas).toBe(4);
  });

  it('should calculate ROAS by channel', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-social', period: '2024-Q1', amount: 5000, budget: 5000 },
    ];
    const attributions: RevenueAttribution[] = [
      { channelId: 'paid-search', period: '2024-Q1', revenue: 35000 },
      { channelId: 'paid-social', period: '2024-Q1', revenue: 10000 },
    ];

    const byChannel = calculateROASByChannel(spends, attributions, '2024-Q1');
    expect(byChannel.get('paid-search')?.roas).toBe(3.5);
    expect(byChannel.get('paid-social')?.roas).toBe(2);
  });

  it('should evaluate ROAS health correctly', () => {
    expect(evaluateROASHealth(5)).toBe('excellent');
    expect(evaluateROASHealth(3)).toBe('good');
    expect(evaluateROASHealth(1.5)).toBe('fair');
    expect(evaluateROASHealth(0.5)).toBe('poor');
  });

  it('should calculate break-even ROAS', () => {
    const breakEven = calculateBreakEvenROAS(0.7);
    expect(breakEven).toBeCloseTo(1.43, 2); // 1 / 0.7
  });

  it('should handle zero margin in break-even calculation', () => {
    expect(calculateBreakEvenROAS(0)).toBe(Infinity);
  });

  it('should calculate incremental ROAS', () => {
    const incremental = calculateIncrementalROAS(10000, 30000, 5000, 20000);
    expect(incremental).toBe(4); // 20000 / 5000
  });

  it('should rank channels by ROAS', () => {
    const spends: MarketingSpend[] = [
      { channelId: 'paid-search', period: '2024-Q1', amount: 10000, budget: 10000 },
      { channelId: 'paid-social', period: '2024-Q1', amount: 5000, budget: 5000 },
      { channelId: 'email', period: '2024-Q1', amount: 2000, budget: 2000 },
    ];
    const attributions: RevenueAttribution[] = [
      { channelId: 'paid-search', period: '2024-Q1', revenue: 35000 }, // 3.5x
      { channelId: 'paid-social', period: '2024-Q1', revenue: 10000 }, // 2x
      { channelId: 'email', period: '2024-Q1', revenue: 12000 }, // 6x
    ];

    const roasResults = calculateROASByChannel(spends, attributions, '2024-Q1');
    const ranked = rankChannelsByROAS(roasResults);

    expect(ranked[0]).toBe('email'); // 6x - highest
    expect(ranked[1]).toBe('paid-search'); // 3.5x
    expect(ranked[2]).toBe('paid-social'); // 2x - lowest
  });
});
