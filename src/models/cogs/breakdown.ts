/**
 * COGS Breakdown Calculator
 *
 * Calculates detailed COGS breakdown with separate line items for:
 * - Manufacturing cost
 * - Overseas freight
 * - Packaging (box, inserts, materials)
 * - Import duties
 */

import type { COGSBreakdownConfig, COGSBreakdownResult, COGSLineItem } from './types';

/** Default COGS breakdown configuration (sums to $200) */
export const DEFAULT_COGS_BREAKDOWN: COGSBreakdownConfig = {
  manufacturingCost: 140,  // 70%
  freightCost: 35,         // 17.5%
  packagingCost: 15,       // 7.5%
  dutiesCost: 10,          // 5%
};

/**
 * Calculate the COGS breakdown for a given volume
 */
export function calculateCOGSBreakdown(
  volume: number,
  config: Partial<COGSBreakdownConfig> = {}
): COGSBreakdownResult {
  if (volume <= 0) {
    throw new Error('Volume must be greater than 0');
  }

  const fullConfig: COGSBreakdownConfig = {
    ...DEFAULT_COGS_BREAKDOWN,
    ...config,
  };

  const totalPerUnit =
    fullConfig.manufacturingCost +
    fullConfig.freightCost +
    fullConfig.packagingCost +
    fullConfig.dutiesCost;

  const totalCost = volume * totalPerUnit;

  // Calculate line items with percentages
  const lineItems: COGSLineItem[] = [
    {
      category: 'manufacturing',
      name: 'Manufacturing Cost',
      perUnit: fullConfig.manufacturingCost,
      total: volume * fullConfig.manufacturingCost,
      percentage: totalPerUnit > 0 ? (fullConfig.manufacturingCost / totalPerUnit) * 100 : 0,
    },
    {
      category: 'freight',
      name: 'Overseas Freight',
      perUnit: fullConfig.freightCost,
      total: volume * fullConfig.freightCost,
      percentage: totalPerUnit > 0 ? (fullConfig.freightCost / totalPerUnit) * 100 : 0,
    },
    {
      category: 'packaging',
      name: 'Packaging & Materials',
      perUnit: fullConfig.packagingCost,
      total: volume * fullConfig.packagingCost,
      percentage: totalPerUnit > 0 ? (fullConfig.packagingCost / totalPerUnit) * 100 : 0,
    },
    {
      category: 'duties',
      name: 'Import Duties',
      perUnit: fullConfig.dutiesCost,
      total: volume * fullConfig.dutiesCost,
      percentage: totalPerUnit > 0 ? (fullConfig.dutiesCost / totalPerUnit) * 100 : 0,
    },
  ];

  return {
    volume,
    lineItems,
    totalPerUnit,
    totalCost,
    summary: {
      manufacturing: volume * fullConfig.manufacturingCost,
      freight: volume * fullConfig.freightCost,
      packaging: volume * fullConfig.packagingCost,
      duties: volume * fullConfig.dutiesCost,
    },
  };
}

/**
 * Create a breakdown calculator with fixed configuration
 */
export function createBreakdownCalculator(config: Partial<COGSBreakdownConfig> = {}) {
  const fullConfig: COGSBreakdownConfig = {
    ...DEFAULT_COGS_BREAKDOWN,
    ...config,
  };

  return (volume: number) => calculateCOGSBreakdown(volume, fullConfig);
}

/**
 * Apply cost reduction to COGS breakdown config
 * Used for year-over-year scale economy calculations
 */
export function applyCostReduction(
  config: COGSBreakdownConfig,
  reductionRate: number
): COGSBreakdownConfig {
  const factor = 1 - reductionRate;
  return {
    manufacturingCost: Math.round(config.manufacturingCost * factor * 100) / 100,
    freightCost: Math.round(config.freightCost * factor * 100) / 100,
    packagingCost: Math.round(config.packagingCost * factor * 100) / 100,
    dutiesCost: config.dutiesCost, // Duties typically don't benefit from scale
  };
}

/**
 * Calculate multi-year COGS projection with cost reduction
 */
export function projectCOGSBreakdown(
  volumeByYear: number[],
  baseConfig: Partial<COGSBreakdownConfig> = {},
  annualCostReduction: number = 0.05
): COGSBreakdownResult[] {
  let currentConfig: COGSBreakdownConfig = {
    ...DEFAULT_COGS_BREAKDOWN,
    ...baseConfig,
  };

  return volumeByYear.map((volume, yearIndex) => {
    if (yearIndex > 0) {
      currentConfig = applyCostReduction(currentConfig, annualCostReduction);
    }
    return calculateCOGSBreakdown(volume, currentConfig);
  });
}
