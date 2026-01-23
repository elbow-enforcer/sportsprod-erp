/**
 * @file types.ts
 * @description Types for capital module, including deposit impact modeling.
 * @related-issue Issue #18 - Pre-order Deposit Impact
 */

// ============================================================================
// Deposit Impact Types
// ============================================================================

export interface DepositImpactInputs {
  depositAmount: number;      // $ per pre-order (default $200)
  conversionRate: number;     // % of leads who convert (0-100)
  volume: number;             // Number of pre-orders
}

export interface DepositImpactResult {
  depositsCollected: number;  // volume × deposit × (conversionRate/100)
  capitalReduction: number;   // Same as depositsCollected (capital offset)
  effectiveCapitalNeeded: number; // Original need minus deposits
}

// ============================================================================
// Calculation Functions
// ============================================================================

export function calculateDepositImpact(
  inputs: DepositImpactInputs,
  baseCapitalNeeded: number
): DepositImpactResult {
  const { depositAmount, conversionRate, volume } = inputs;
  
  const depositsCollected = volume * depositAmount * (conversionRate / 100);
  const capitalReduction = depositsCollected;
  const effectiveCapitalNeeded = Math.max(0, baseCapitalNeeded - capitalReduction);
  
  return {
    depositsCollected,
    capitalReduction,
    effectiveCapitalNeeded,
  };
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_DEPOSIT_IMPACT_INPUTS: DepositImpactInputs = {
  depositAmount: 200,
  conversionRate: 60,
  volume: 500,
};

export const DEFAULT_BASE_CAPITAL_NEEDED = 250000; // $250k baseline capital need
