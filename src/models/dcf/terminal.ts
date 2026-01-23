/**
 * Terminal Value Calculator
 * Supports Gordon Growth Model and Exit Multiple methods
 */

import {
  TerminalValueInputs,
  TerminalValueResult,
  ComparableCompany,
  TerminalValueComparison,
  TerminalValueBreakdown,
} from './types';
import { calculateDiscountFactor } from './npv';

/**
 * Default comparable companies for sports/consumer products sector
 * These provide benchmarks for exit multiple selection
 */
export const COMPARABLE_COMPANIES: ComparableCompany[] = [
  {
    name: 'Peloton Interactive',
    ticker: 'PTON',
    evEbitdaMultiple: 12.5,
    evRevenueMultiple: 1.8,
    sector: 'Connected Fitness',
    marketCap: 2500,
    description: 'Connected fitness equipment and subscription services',
  },
  {
    name: 'Callaway Golf (Topgolf)',
    ticker: 'MODG',
    evEbitdaMultiple: 10.2,
    evRevenueMultiple: 2.1,
    sector: 'Sports Equipment',
    marketCap: 6800,
    description: 'Golf equipment and entertainment venues',
  },
  {
    name: 'YETI Holdings',
    ticker: 'YETI',
    evEbitdaMultiple: 14.8,
    evRevenueMultiple: 3.2,
    sector: 'Outdoor/Consumer Products',
    marketCap: 4200,
    description: 'Premium coolers and outdoor products',
  },
  {
    name: 'Vista Outdoor',
    ticker: 'VSTO',
    evEbitdaMultiple: 6.5,
    evRevenueMultiple: 0.9,
    sector: 'Outdoor Products',
    marketCap: 2100,
    description: 'Outdoor sports and recreation products',
  },
  {
    name: 'Brunswick Corporation',
    ticker: 'BC',
    evEbitdaMultiple: 8.3,
    evRevenueMultiple: 1.4,
    sector: 'Marine/Recreation',
    marketCap: 5400,
    description: 'Marine engines, boats, and fitness equipment',
  },
  {
    name: 'Acushnet Holdings',
    ticker: 'GOLF',
    evEbitdaMultiple: 11.6,
    evRevenueMultiple: 2.4,
    sector: 'Golf Equipment',
    marketCap: 4100,
    description: 'Titleist and FootJoy brands',
  },
  {
    name: 'Clarus Corporation',
    ticker: 'CLAR',
    evEbitdaMultiple: 9.8,
    evRevenueMultiple: 1.6,
    sector: 'Outdoor Equipment',
    marketCap: 450,
    description: 'Black Diamond, Sierra, and other outdoor brands',
  },
  {
    name: 'Solo Brands',
    ticker: 'DTC',
    evEbitdaMultiple: 7.2,
    evRevenueMultiple: 1.1,
    sector: 'DTC Consumer Products',
    marketCap: 280,
    description: 'Solo Stove and outdoor lifestyle brands',
  },
];

/**
 * Calculate Terminal Value using Gordon Growth Model
 * TV = FCF_final * (1 + g) / (r - g)
 * 
 * Where:
 *   FCF_final = Final year free cash flow
 *   g = Terminal growth rate (perpetual growth)
 *   r = Discount rate (WACC)
 * 
 * @param finalYearFCF - Last projected year's free cash flow
 * @param growthRate - Terminal/perpetual growth rate (decimal)
 * @param discountRate - WACC/discount rate (decimal)
 * @returns Terminal value
 */
export function calculateGordonGrowthTV(
  finalYearFCF: number,
  growthRate: number,
  discountRate: number
): number {
  if (growthRate >= discountRate) {
    throw new Error(
      'Growth rate must be less than discount rate for Gordon Growth model'
    );
  }
  if (discountRate <= 0) {
    throw new Error('Discount rate must be positive');
  }

  // TV = FCF * (1 + g) / (r - g)
  return (finalYearFCF * (1 + growthRate)) / (discountRate - growthRate);
}

/**
 * Calculate Terminal Value using Exit Multiple method
 * TV = EBITDA_final * Multiple
 * 
 * @param finalYearEBITDA - Last projected year's EBITDA
 * @param exitMultiple - EBITDA multiple (e.g., 8x)
 * @returns Terminal value
 */
export function calculateExitMultipleTV(
  finalYearEBITDA: number,
  exitMultiple: number
): number {
  if (exitMultiple <= 0) {
    throw new Error('Exit multiple must be positive');
  }

  return finalYearEBITDA * exitMultiple;
}

/**
 * Calculate Terminal Value with present value
 * Unified function supporting both methods
 * 
 * @param inputs - Terminal value calculation inputs
 * @param projectionYears - Number of projection years (for discounting)
 * @returns Terminal value result with present value
 * 
 * @example
 * // Gordon Growth method
 * const result = calculateTerminalValue({
 *   method: 'gordon-growth',
 *   finalYearFCF: 500000,
 *   growthRate: 0.02,
 *   discountRate: 0.10,
 * }, 5);
 * 
 * @example
 * // Exit Multiple method
 * const result = calculateTerminalValue({
 *   method: 'exit-multiple',
 *   finalYearEBITDA: 1000000,
 *   exitMultiple: 8,
 *   discountRate: 0.10,
 * }, 5);
 */
export function calculateTerminalValue(
  inputs: TerminalValueInputs,
  projectionYears: number
): TerminalValueResult {
  let terminalValue: number;

  if (inputs.method === 'gordon-growth') {
    if (inputs.finalYearFCF === undefined) {
      throw new Error('finalYearFCF required for Gordon Growth method');
    }
    if (inputs.growthRate === undefined) {
      throw new Error('growthRate required for Gordon Growth method');
    }

    terminalValue = calculateGordonGrowthTV(
      inputs.finalYearFCF,
      inputs.growthRate,
      inputs.discountRate
    );
  } else if (inputs.method === 'exit-multiple') {
    if (inputs.finalYearEBITDA === undefined) {
      throw new Error('finalYearEBITDA required for Exit Multiple method');
    }
    if (inputs.exitMultiple === undefined) {
      throw new Error('exitMultiple required for Exit Multiple method');
    }

    terminalValue = calculateExitMultipleTV(
      inputs.finalYearEBITDA,
      inputs.exitMultiple
    );
  } else {
    throw new Error(`Unknown terminal value method: ${inputs.method}`);
  }

  // Discount terminal value back to present
  const discountFactor = calculateDiscountFactor(
    inputs.discountRate,
    projectionYears
  );
  const presentValue = terminalValue * discountFactor;

  return {
    terminalValue,
    presentValue,
    method: inputs.method,
  };
}

/**
 * Calculate implied exit multiple from Gordon Growth terminal value
 * Useful for sanity-checking assumptions
 * 
 * @param gordonTV - Terminal value from Gordon Growth
 * @param finalYearEBITDA - Final year EBITDA
 * @returns Implied EBITDA multiple
 */
export function calculateImpliedMultiple(
  gordonTV: number,
  finalYearEBITDA: number
): number {
  if (finalYearEBITDA <= 0) {
    throw new Error('EBITDA must be positive');
  }
  return gordonTV / finalYearEBITDA;
}

/**
 * Calculate implied growth rate from exit multiple
 * 
 * @param exitMultipleTV - Terminal value from exit multiple
 * @param finalYearFCF - Final year FCF
 * @param discountRate - Discount rate
 * @returns Implied perpetual growth rate
 */
export function calculateImpliedGrowthRate(
  exitMultipleTV: number,
  finalYearFCF: number,
  discountRate: number
): number {
  // From TV = FCF * (1 + g) / (r - g)
  // Solving for g: g = (TV * r - FCF) / (TV + FCF)
  return (exitMultipleTV * discountRate - finalYearFCF) / (exitMultipleTV + finalYearFCF);
}

/**
 * Compare terminal values from both methods
 * Useful for sanity-checking and understanding valuation sensitivities
 * 
 * @param finalYearFCF - Final year free cash flow
 * @param finalYearEBITDA - Final year EBITDA
 * @param growthRate - Terminal growth rate for Gordon Growth
 * @param discountRate - Discount rate (WACC)
 * @param exitMultiple - EBITDA multiple for Exit Multiple method
 * @param projectionYears - Number of projection years (for discounting)
 * @returns Comparison of both methods with implied cross-metrics
 */
export function compareTerminalValueMethods(
  finalYearFCF: number,
  finalYearEBITDA: number,
  growthRate: number,
  discountRate: number,
  exitMultiple: number,
  projectionYears: number
): TerminalValueComparison {
  // Calculate Gordon Growth terminal value
  const gordonTV = calculateGordonGrowthTV(finalYearFCF, growthRate, discountRate);
  const gordonPV = gordonTV * calculateDiscountFactor(discountRate, projectionYears);
  const gordonImpliedMultiple = calculateImpliedMultiple(gordonTV, finalYearEBITDA);

  // Calculate Exit Multiple terminal value
  const exitTV = calculateExitMultipleTV(finalYearEBITDA, exitMultiple);
  const exitPV = exitTV * calculateDiscountFactor(discountRate, projectionYears);
  const exitImpliedGrowth = calculateImpliedGrowthRate(exitTV, finalYearFCF, discountRate);

  // Calculate difference
  const tvDiff = exitTV - gordonTV;
  const pvDiff = exitPV - gordonPV;
  const percentDiff = gordonTV !== 0 ? (tvDiff / gordonTV) * 100 : 0;

  return {
    gordonGrowth: {
      terminalValue: gordonTV,
      presentValue: gordonPV,
      impliedEbitdaMultiple: gordonImpliedMultiple,
      assumptions: {
        finalYearFCF,
        growthRate,
        discountRate,
      },
    },
    exitMultiple: {
      terminalValue: exitTV,
      presentValue: exitPV,
      impliedGrowthRate: exitImpliedGrowth,
      assumptions: {
        finalYearEBITDA,
        exitMultiple,
        discountRate,
      },
    },
    difference: {
      terminalValue: tvDiff,
      presentValue: pvDiff,
      percentDifference: percentDiff,
    },
  };
}

/**
 * Get terminal value breakdown with all details for display
 * 
 * @param method - Terminal value method
 * @param terminalValue - Calculated terminal value
 * @param presentValue - Present value of terminal value
 * @param enterpriseValue - Total enterprise value (for percentage)
 * @param finalYearFCF - Final year FCF
 * @param finalYearEBITDA - Final year EBITDA
 * @param growthRate - Terminal growth rate
 * @param discountRate - Discount rate
 * @param exitMultiple - Exit EBITDA multiple
 * @returns Detailed breakdown for display
 */
export function getTerminalValueBreakdown(
  method: 'gordon-growth' | 'exit-multiple',
  terminalValue: number,
  presentValue: number,
  enterpriseValue: number,
  finalYearFCF: number,
  finalYearEBITDA: number,
  growthRate: number,
  discountRate: number,
  exitMultiple: number
): TerminalValueBreakdown {
  const percentOfEV = enterpriseValue > 0 ? (presentValue / enterpriseValue) * 100 : 0;

  const breakdown: TerminalValueBreakdown = {
    method,
    terminalValue,
    presentValue,
    percentOfEnterpriseValue: percentOfEV,
  };

  if (method === 'gordon-growth') {
    breakdown.gordonDetails = {
      finalYearFCF,
      growthRate,
      discountRate,
      formula: `FCF × (1 + g) / (r - g) = ${finalYearFCF.toLocaleString()} × (1 + ${(growthRate * 100).toFixed(1)}%) / (${(discountRate * 100).toFixed(1)}% - ${(growthRate * 100).toFixed(1)}%)`,
      impliedMultiple: calculateImpliedMultiple(terminalValue, finalYearEBITDA),
    };
  } else {
    const impliedGrowth = calculateImpliedGrowthRate(terminalValue, finalYearFCF, discountRate);
    breakdown.exitMultipleDetails = {
      finalYearEBITDA,
      exitMultiple,
      formula: `EBITDA × Multiple = ${finalYearEBITDA.toLocaleString()} × ${exitMultiple}x`,
      impliedGrowthRate: impliedGrowth,
      comparableCompanies: COMPARABLE_COMPANIES,
    };
  }

  return breakdown;
}

/**
 * Get comparable companies filtered by sector or multiple range
 * 
 * @param sector - Optional sector filter
 * @param minMultiple - Optional minimum EBITDA multiple
 * @param maxMultiple - Optional maximum EBITDA multiple
 * @returns Filtered comparable companies
 */
export function getComparableCompanies(
  sector?: string,
  minMultiple?: number,
  maxMultiple?: number
): ComparableCompany[] {
  let filtered = [...COMPARABLE_COMPANIES];

  if (sector) {
    filtered = filtered.filter((c) =>
      c.sector.toLowerCase().includes(sector.toLowerCase())
    );
  }

  if (minMultiple !== undefined) {
    filtered = filtered.filter((c) => c.evEbitdaMultiple >= minMultiple);
  }

  if (maxMultiple !== undefined) {
    filtered = filtered.filter((c) => c.evEbitdaMultiple <= maxMultiple);
  }

  return filtered;
}

/**
 * Calculate statistics for comparable company multiples
 * 
 * @param companies - Array of comparable companies
 * @returns Statistics (mean, median, min, max)
 */
export function getComparableMultipleStats(
  companies: ComparableCompany[] = COMPARABLE_COMPANIES
): {
  ebitdaMultiple: { mean: number; median: number; min: number; max: number };
  revenueMultiple: { mean: number; median: number; min: number; max: number };
} {
  if (companies.length === 0) {
    return {
      ebitdaMultiple: { mean: 0, median: 0, min: 0, max: 0 },
      revenueMultiple: { mean: 0, median: 0, min: 0, max: 0 },
    };
  }

  const ebitdaMultiples = companies.map((c) => c.evEbitdaMultiple).sort((a, b) => a - b);
  const revenueMultiples = companies.map((c) => c.evRevenueMultiple).sort((a, b) => a - b);

  const calcStats = (arr: number[]) => {
    const mean = arr.reduce((sum, v) => sum + v, 0) / arr.length;
    const mid = Math.floor(arr.length / 2);
    const median = arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    return {
      mean,
      median,
      min: arr[0],
      max: arr[arr.length - 1],
    };
  };

  return {
    ebitdaMultiple: calcStats(ebitdaMultiples),
    revenueMultiple: calcStats(revenueMultiples),
  };
}
