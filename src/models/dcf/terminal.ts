/**
 * Terminal Value Calculator
 * Supports Gordon Growth Model and Exit Multiple methods
 */

import { TerminalValueInputs, TerminalValueResult } from './types';
import { calculateDiscountFactor } from './npv';

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
