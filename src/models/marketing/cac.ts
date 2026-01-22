/**
 * Customer Acquisition Cost (CAC) Calculations
 * CAC = Total Marketing Spend / New Customers Acquired
 */

import type {
  MarketingSpend,
  ConversionData,
  CACResult,
} from './types';

/**
 * Calculate CAC for a single channel/period
 */
export function calculateChannelCAC(
  spend: MarketingSpend,
  conversions: ConversionData
): CACResult {
  if (spend.channelId !== conversions.channelId) {
    throw new Error('Channel ID mismatch between spend and conversions');
  }
  if (spend.period !== conversions.period) {
    throw new Error('Period mismatch between spend and conversions');
  }

  const cac = conversions.newCustomers > 0
    ? spend.amount / conversions.newCustomers
    : 0;

  return {
    channelId: spend.channelId,
    period: spend.period,
    totalSpend: spend.amount,
    newCustomers: conversions.newCustomers,
    cac,
  };
}

/**
 * Calculate blended CAC across all channels for a period
 */
export function calculateBlendedCAC(
  spends: MarketingSpend[],
  conversions: ConversionData[],
  period: string
): CACResult {
  const periodSpends = spends.filter((s) => s.period === period);
  const periodConversions = conversions.filter((c) => c.period === period);

  const totalSpend = periodSpends.reduce((sum, s) => sum + s.amount, 0);
  const totalCustomers = periodConversions.reduce((sum, c) => sum + c.newCustomers, 0);

  const cac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;

  return {
    channelId: 'blended',
    period,
    totalSpend,
    newCustomers: totalCustomers,
    cac,
  };
}

/**
 * Calculate CAC trend over multiple periods
 */
export function calculateCACTrend(
  spends: MarketingSpend[],
  conversions: ConversionData[],
  periods: string[]
): CACResult[] {
  return periods.map((period) => calculateBlendedCAC(spends, conversions, period));
}

/**
 * Calculate CAC by channel for a period
 */
export function calculateCACByChannel(
  spends: MarketingSpend[],
  conversions: ConversionData[],
  period: string
): Map<string, CACResult> {
  const results = new Map<string, CACResult>();
  const periodSpends = spends.filter((s) => s.period === period);

  for (const spend of periodSpends) {
    const conversion = conversions.find(
      (c) => c.channelId === spend.channelId && c.period === period
    );

    if (conversion) {
      results.set(spend.channelId, calculateChannelCAC(spend, conversion));
    } else {
      results.set(spend.channelId, {
        channelId: spend.channelId,
        period,
        totalSpend: spend.amount,
        newCustomers: 0,
        cac: 0,
      });
    }
  }

  return results;
}

/**
 * Calculate CAC payback period in months
 * CAC Payback = CAC / (ARPU * Gross Margin)
 */
export function calculateCACPayback(
  cac: number,
  monthlyARPU: number,
  grossMargin: number
): number {
  if (monthlyARPU <= 0 || grossMargin <= 0) {
    return Infinity;
  }
  return cac / (monthlyARPU * grossMargin);
}

/**
 * Calculate LTV:CAC ratio
 */
export function calculateLTVtoCACRatio(ltv: number, cac: number): number {
  if (cac <= 0) {
    return Infinity;
  }
  return ltv / cac;
}

/**
 * Evaluate CAC health based on common benchmarks
 */
export function evaluateCACHealth(
  cac: number,
  ltv: number,
  paybackMonths: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  const ltvCacRatio = calculateLTVtoCACRatio(ltv, cac);

  if (ltvCacRatio >= 3 && paybackMonths <= 12) {
    return 'excellent';
  }
  if (ltvCacRatio >= 2 && paybackMonths <= 18) {
    return 'good';
  }
  if (ltvCacRatio >= 1 && paybackMonths <= 24) {
    return 'fair';
  }
  return 'poor';
}
