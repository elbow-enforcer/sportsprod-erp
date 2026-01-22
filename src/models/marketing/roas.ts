/**
 * Return on Ad Spend (ROAS) Calculations
 * ROAS = Revenue Generated / Ad Spend
 */

import type {
  MarketingSpend,
  RevenueAttribution,
  ROASResult,
} from './types';

/**
 * Calculate ROAS for a single channel/period
 */
export function calculateChannelROAS(
  spend: MarketingSpend,
  attribution: RevenueAttribution
): ROASResult {
  if (spend.channelId !== attribution.channelId) {
    throw new Error('Channel ID mismatch between spend and attribution');
  }
  if (spend.period !== attribution.period) {
    throw new Error('Period mismatch between spend and attribution');
  }

  const roas = spend.amount > 0 ? attribution.revenue / spend.amount : 0;

  return {
    channelId: spend.channelId,
    period: spend.period,
    adSpend: spend.amount,
    revenue: attribution.revenue,
    roas,
    roasPercent: roas * 100,
  };
}

/**
 * Calculate blended ROAS across all channels for a period
 */
export function calculateBlendedROAS(
  spends: MarketingSpend[],
  attributions: RevenueAttribution[],
  period: string
): ROASResult {
  const periodSpends = spends.filter((s) => s.period === period);
  const periodAttributions = attributions.filter((a) => a.period === period);

  const totalSpend = periodSpends.reduce((sum, s) => sum + s.amount, 0);
  const totalRevenue = periodAttributions.reduce((sum, a) => sum + a.revenue, 0);

  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return {
    channelId: 'blended',
    period,
    adSpend: totalSpend,
    revenue: totalRevenue,
    roas,
    roasPercent: roas * 100,
  };
}

/**
 * Calculate ROAS trend over multiple periods
 */
export function calculateROASTrend(
  spends: MarketingSpend[],
  attributions: RevenueAttribution[],
  periods: string[]
): ROASResult[] {
  return periods.map((period) => calculateBlendedROAS(spends, attributions, period));
}

/**
 * Calculate ROAS by channel for a period
 */
export function calculateROASByChannel(
  spends: MarketingSpend[],
  attributions: RevenueAttribution[],
  period: string
): Map<string, ROASResult> {
  const results = new Map<string, ROASResult>();
  const periodSpends = spends.filter((s) => s.period === period);

  for (const spend of periodSpends) {
    const attribution = attributions.find(
      (a) => a.channelId === spend.channelId && a.period === period
    );

    if (attribution) {
      results.set(spend.channelId, calculateChannelROAS(spend, attribution));
    } else {
      results.set(spend.channelId, {
        channelId: spend.channelId,
        period,
        adSpend: spend.amount,
        revenue: 0,
        roas: 0,
        roasPercent: 0,
      });
    }
  }

  return results;
}

/**
 * Evaluate ROAS health based on common benchmarks
 */
export function evaluateROASHealth(
  roas: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (roas >= 4) {
    return 'excellent';
  }
  if (roas >= 2) {
    return 'good';
  }
  if (roas >= 1) {
    return 'fair';
  }
  return 'poor';
}

/**
 * Calculate break-even ROAS given gross margin
 */
export function calculateBreakEvenROAS(grossMargin: number): number {
  if (grossMargin <= 0) {
    return Infinity;
  }
  return 1 / grossMargin;
}

/**
 * Calculate incremental ROAS for budget decisions
 */
export function calculateIncrementalROAS(
  currentSpend: number,
  currentRevenue: number,
  additionalSpend: number,
  projectedAdditionalRevenue: number
): number {
  if (additionalSpend <= 0) {
    return 0;
  }
  return projectedAdditionalRevenue / additionalSpend;
}

/**
 * Rank channels by ROAS efficiency
 */
export function rankChannelsByROAS(
  roasResults: Map<string, ROASResult>
): string[] {
  return Array.from(roasResults.entries())
    .sort(([, a], [, b]) => b.roas - a.roas)
    .map(([channelId]) => channelId);
}
