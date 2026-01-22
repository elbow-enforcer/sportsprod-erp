/**
 * Internal Rate of Return (IRR) Calculator
 * Uses Newton-Raphson method for numerical approximation
 */

import { IRRResult } from './types';

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-10;
const INITIAL_GUESS = 0.1;

/**
 * Calculate NPV for IRR iteration
 * NPV = Σ(CF_t / (1+r)^t)
 */
function npvForIRR(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((npv, cf, t) => {
    return npv + cf / Math.pow(1 + rate, t);
  }, 0);
}

/**
 * Calculate derivative of NPV with respect to rate
 * d(NPV)/dr = Σ(-t * CF_t / (1+r)^(t+1))
 */
function npvDerivative(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((derivative, cf, t) => {
    if (t === 0) return derivative;
    return derivative - (t * cf) / Math.pow(1 + rate, t + 1);
  }, 0);
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 * 
 * IRR is the discount rate that makes NPV = 0
 * 
 * @param cashFlows - Array of cash flows starting at period 0
 *                    (typically negative initial investment followed by positive returns)
 * @param initialGuess - Starting point for iteration (default: 0.1 = 10%)
 * @returns IRR result with convergence info
 * 
 * @example
 * // Initial investment of -1000, returns of 400, 400, 400, 400
 * const result = calculateIRR([-1000, 400, 400, 400, 400]);
 * // result.irr ≈ 0.2186 (21.86%)
 */
export function calculateIRR(
  cashFlows: number[],
  initialGuess: number = INITIAL_GUESS
): IRRResult {
  if (cashFlows.length < 2) {
    throw new Error('At least 2 cash flows required to calculate IRR');
  }

  // Check if there's at least one sign change (necessary for IRR to exist)
  const hasPositive = cashFlows.some((cf) => cf > 0);
  const hasNegative = cashFlows.some((cf) => cf < 0);
  
  if (!hasPositive || !hasNegative) {
    return {
      irr: NaN,
      converged: false,
      iterations: 0,
    };
  }

  let rate = initialGuess;
  let iterations = 0;

  // Newton-Raphson iteration
  // r_new = r_old - f(r) / f'(r)
  // where f(r) = NPV(r) and we want to find r where NPV = 0
  for (iterations = 0; iterations < MAX_ITERATIONS; iterations++) {
    const npv = npvForIRR(cashFlows, rate);
    const derivative = npvDerivative(cashFlows, rate);

    // Check for convergence
    if (Math.abs(npv) < TOLERANCE) {
      return {
        irr: rate,
        converged: true,
        iterations: iterations + 1,
      };
    }

    // Avoid division by zero
    if (Math.abs(derivative) < 1e-15) {
      // Try a different approach - bisection fallback
      break;
    }

    const newRate = rate - npv / derivative;

    // Bound the rate to reasonable values
    if (newRate < -0.99) {
      rate = -0.99;
    } else if (newRate > 10) {
      rate = 10; // 1000% upper bound
    } else {
      rate = newRate;
    }
  }

  // If Newton-Raphson didn't converge, try bisection method
  return bisectionIRR(cashFlows);
}

/**
 * Bisection method fallback for IRR calculation
 * More robust but slower than Newton-Raphson
 */
function bisectionIRR(cashFlows: number[]): IRRResult {
  let low = -0.99;
  let high = 10;
  let iterations = 0;

  // Find brackets where NPV changes sign
  let npvLow = npvForIRR(cashFlows, low);
  let npvHigh = npvForIRR(cashFlows, high);

  if (npvLow * npvHigh > 0) {
    // No sign change found, IRR may not exist in this range
    return {
      irr: NaN,
      converged: false,
      iterations: 0,
    };
  }

  for (iterations = 0; iterations < MAX_ITERATIONS; iterations++) {
    const mid = (low + high) / 2;
    const npvMid = npvForIRR(cashFlows, mid);

    if (Math.abs(npvMid) < TOLERANCE || (high - low) / 2 < TOLERANCE) {
      return {
        irr: mid,
        converged: true,
        iterations: iterations + 1,
      };
    }

    if (npvMid * npvLow < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return {
    irr: (low + high) / 2,
    converged: false,
    iterations,
  };
}

/**
 * Calculate Modified IRR (MIRR)
 * Accounts for reinvestment rate different from financing rate
 * 
 * @param cashFlows - Array of cash flows starting at period 0
 * @param financeRate - Cost of capital for negative cash flows
 * @param reinvestRate - Rate earned on positive cash flows
 * @returns MIRR as decimal
 */
export function calculateMIRR(
  cashFlows: number[],
  financeRate: number,
  reinvestRate: number
): number {
  const n = cashFlows.length - 1;
  
  // Present value of negative cash flows at finance rate
  let pvNegative = 0;
  // Future value of positive cash flows at reinvestment rate
  let fvPositive = 0;

  cashFlows.forEach((cf, t) => {
    if (cf < 0) {
      pvNegative += cf / Math.pow(1 + financeRate, t);
    } else {
      fvPositive += cf * Math.pow(1 + reinvestRate, n - t);
    }
  });

  if (pvNegative >= 0) {
    throw new Error('No negative cash flows found');
  }

  // MIRR = (FV_positive / |PV_negative|)^(1/n) - 1
  return Math.pow(fvPositive / Math.abs(pvNegative), 1 / n) - 1;
}
