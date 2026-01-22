/**
 * Net Present Value (NPV) Calculator
 * NPV = Σ(FCF_t / (1+r)^t)
 */

import { NPVResult, PeriodCashFlow } from './types';

/**
 * Calculate discount factor for a given period
 * 
 * @param rate - Discount rate (decimal)
 * @param period - Period number (1-indexed)
 * @returns Discount factor
 */
export function calculateDiscountFactor(rate: number, period: number): number {
  if (rate < -1) {
    throw new Error('Discount rate cannot be less than -100%');
  }
  if (period < 0) {
    throw new Error('Period must be non-negative');
  }
  return 1 / Math.pow(1 + rate, period);
}

/**
 * Calculate present value of a single cash flow
 * 
 * @param cashFlow - Future cash flow value
 * @param rate - Discount rate (decimal)
 * @param period - Period number
 * @returns Present value
 */
export function calculatePresentValue(
  cashFlow: number,
  rate: number,
  period: number
): number {
  return cashFlow * calculateDiscountFactor(rate, period);
}

/**
 * Calculate Net Present Value of a series of cash flows
 * 
 * @param cashFlows - Array of cash flows (index = period, starting at period 1)
 * @param discountRate - Discount rate / WACC (decimal, e.g., 0.10 for 10%)
 * @param initialInvestment - Optional initial investment (period 0, negative value)
 * @returns NPV result with breakdown
 * 
 * @example
 * const result = calculateNPV([100, 150, 200], 0.10);
 * // Calculates PV of cash flows at periods 1, 2, 3
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number,
  initialInvestment: number = 0
): NPVResult {
  if (discountRate < -1) {
    throw new Error('Discount rate cannot be less than -100%');
  }

  const periodCashFlows: PeriodCashFlow[] = [];
  let npv = -initialInvestment; // Initial investment is typically negative

  // Add initial investment as period 0 if provided
  if (initialInvestment !== 0) {
    periodCashFlows.push({
      period: 0,
      fcf: -initialInvestment,
      discountFactor: 1,
      presentValue: -initialInvestment,
    });
  }

  // Calculate PV for each cash flow
  cashFlows.forEach((cf, index) => {
    const period = index + 1;
    const discountFactor = calculateDiscountFactor(discountRate, period);
    const presentValue = cf * discountFactor;

    periodCashFlows.push({
      period,
      fcf: cf,
      discountFactor,
      presentValue,
    });

    npv += presentValue;
  });

  return {
    npv,
    cashFlows: periodCashFlows,
    discountRate,
  };
}

/**
 * Calculate NPV with explicit period timing
 * Useful when cash flows don't occur at regular intervals
 * 
 * @param cashFlowsWithPeriods - Array of {fcf, period} objects
 * @param discountRate - Discount rate (decimal)
 * @returns NPV result
 */
export function calculateNPVWithPeriods(
  cashFlowsWithPeriods: Array<{ fcf: number; period: number }>,
  discountRate: number
): NPVResult {
  if (discountRate < -1) {
    throw new Error('Discount rate cannot be less than -100%');
  }

  const periodCashFlows: PeriodCashFlow[] = [];
  let npv = 0;

  cashFlowsWithPeriods.forEach(({ fcf, period }) => {
    const discountFactor = calculateDiscountFactor(discountRate, period);
    const presentValue = fcf * discountFactor;

    periodCashFlows.push({
      period,
      fcf,
      discountFactor,
      presentValue,
    });

    npv += presentValue;
  });

  // Sort by period for clarity
  periodCashFlows.sort((a, b) => a.period - b.period);

  return {
    npv,
    cashFlows: periodCashFlows,
    discountRate,
  };
}
