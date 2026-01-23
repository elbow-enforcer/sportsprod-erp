/**
 * Raise Scenario Calculator
 * 
 * Functions for calculating capital raise scenarios, dilution,
 * runway projections, and optimal raise recommendations.
 */

import type {
  RaiseScenarioInput,
  RaiseScenarioResult,
  RaiseScenarioMatrix,
  BurnRateComponents,
} from './types';
import {
  DEFAULT_RAISE_AMOUNTS,
  DEFAULT_PRE_MONEY_VALUATION,
  FOUNDER_STARTING_OWNERSHIP,
} from './types';

/**
 * Calculate dilution percentage for an equity raise
 * 
 * Dilution = Raise Amount / Post-Money Valuation
 * Post-Money = Pre-Money + Raise Amount
 */
export function calculateDilution(
  raiseAmount: number,
  preMoneyValuation: number
): { dilutionPercent: number; postMoneyValuation: number } {
  if (preMoneyValuation <= 0) {
    throw new Error('Pre-money valuation must be positive');
  }
  if (raiseAmount < 0) {
    throw new Error('Raise amount cannot be negative');
  }
  
  const postMoneyValuation = preMoneyValuation + raiseAmount;
  const dilutionPercent = raiseAmount / postMoneyValuation;
  
  return { dilutionPercent, postMoneyValuation };
}

/**
 * Calculate runway in months given cash and burn rate
 */
export function calculateRunway(
  totalCash: number,
  monthlyBurn: number
): number {
  if (monthlyBurn <= 0) {
    // If no burn (profitable or no expenses), infinite runway
    return Infinity;
  }
  
  return Math.floor(totalCash / monthlyBurn);
}

/**
 * Assess runway risk level based on months of runway
 */
export function assessRunwayRisk(
  runwayMonths: number
): 'critical' | 'low' | 'moderate' | 'comfortable' | 'extended' {
  if (runwayMonths < 6) return 'critical';
  if (runwayMonths < 12) return 'low';
  if (runwayMonths < 18) return 'moderate';
  if (runwayMonths < 24) return 'comfortable';
  return 'extended';
}

/**
 * Calculate burn rate from component assumptions
 */
export function calculateBurnRate(
  headcount: number,
  avgSalary: number,
  benefitsMultiplier: number,
  monthlyMarketing: number,
  monthlyOperations: number,
  monthlyCOGS: number = 0
): BurnRateComponents {
  const payroll = (headcount * avgSalary * benefitsMultiplier) / 12;
  
  return {
    payroll,
    marketing: monthlyMarketing,
    operations: monthlyOperations,
    cogs: monthlyCOGS,
    total: payroll + monthlyMarketing + monthlyOperations + monthlyCOGS,
  };
}

/**
 * Calculate a single raise scenario result
 */
export function calculateRaiseScenario(
  input: RaiseScenarioInput,
  burnRate: BurnRateComponents,
  currentCash: number,
  founderCurrentOwnership: number = FOUNDER_STARTING_OWNERSHIP
): RaiseScenarioResult {
  const { raiseAmount, instrument, preMoneyValuation } = input;
  
  // Calculate dilution and post-money
  const { dilutionPercent, postMoneyValuation } = calculateDilution(
    raiseAmount,
    preMoneyValuation
  );
  
  // Adjust for SAFE/Convertible (may have additional dilution)
  let effectiveDilution = dilutionPercent;
  if (instrument === 'safe' && input.safeTerms?.discountRate) {
    // SAFE discount means more shares at conversion
    effectiveDilution = dilutionPercent * (1 + input.safeTerms.discountRate * 0.5);
  }
  if (instrument === 'convertible_debt' && input.convertibleTerms?.discountRate) {
    effectiveDilution = dilutionPercent * (1 + input.convertibleTerms.discountRate * 0.5);
  }
  
  // Calculate runway with new cash
  const totalCashAfterRaise = currentCash + raiseAmount;
  const runwayMonths = calculateRunway(totalCashAfterRaise, burnRate.total);
  
  // Ownership calculations
  const founderOwnershipPost = founderCurrentOwnership * (1 - effectiveDilution);
  const investorOwnershipPost = effectiveDilution;
  
  // Per-dollar metrics (per $100k)
  const dilutionPerDollar = (effectiveDilution / raiseAmount) * 100_000;
  const monthsPerDollar = (runwayMonths / raiseAmount) * 100_000;
  
  return {
    raiseAmount,
    instrument,
    preMoneyValuation,
    postMoneyValuation,
    dilutionPercent: effectiveDilution,
    runwayMonths,
    founderOwnershipPost,
    investorOwnershipPost,
    dilutionPerDollar,
    monthsPerDollar,
    runwayRiskLevel: assessRunwayRisk(runwayMonths),
  };
}

/**
 * Score a scenario for recommendation
 * Higher score = better scenario
 */
function scoreScenario(scenario: RaiseScenarioResult): number {
  let score = 0;
  
  // Runway scoring (prefer 18-24 months)
  if (scenario.runwayMonths >= 18 && scenario.runwayMonths <= 24) {
    score += 50; // Optimal range
  } else if (scenario.runwayMonths >= 12 && scenario.runwayMonths < 18) {
    score += 30;
  } else if (scenario.runwayMonths > 24) {
    score += 25; // Over-capitalized penalty
  } else if (scenario.runwayMonths >= 6) {
    score += 10;
  }
  
  // Dilution scoring (lower is better)
  if (scenario.dilutionPercent <= 0.10) {
    score += 40;
  } else if (scenario.dilutionPercent <= 0.15) {
    score += 30;
  } else if (scenario.dilutionPercent <= 0.20) {
    score += 20;
  } else if (scenario.dilutionPercent <= 0.25) {
    score += 10;
  }
  
  // Founder ownership protection
  if (scenario.founderOwnershipPost >= 0.80) {
    score += 15;
  } else if (scenario.founderOwnershipPost >= 0.70) {
    score += 10;
  }
  
  return score;
}

/**
 * Generate recommendation reason based on scenario
 */
function generateRecommendation(
  scenario: RaiseScenarioResult
): string {
  const reasons: string[] = [];
  
  // Runway analysis
  if (scenario.runwayMonths >= 18 && scenario.runwayMonths <= 24) {
    reasons.push('provides optimal 18-24 month runway');
  } else if (scenario.runwayMonths > 24) {
    reasons.push(`provides ${scenario.runwayMonths} months runway (may be over-capitalized)`);
  } else {
    reasons.push(`provides ${scenario.runwayMonths} months runway`);
  }
  
  // Dilution analysis
  if (scenario.dilutionPercent <= 0.15) {
    reasons.push(`minimal dilution at ${(scenario.dilutionPercent * 100).toFixed(1)}%`);
  } else if (scenario.dilutionPercent <= 0.25) {
    reasons.push(`moderate dilution at ${(scenario.dilutionPercent * 100).toFixed(1)}%`);
  } else {
    reasons.push(`significant dilution at ${(scenario.dilutionPercent * 100).toFixed(1)}%`);
  }
  
  // Valuation context
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  reasons.push(`post-money valuation of ${formatter.format(scenario.postMoneyValuation)}`);
  
  return `Recommended: $${(scenario.raiseAmount / 1000).toFixed(0)}K raise - ${reasons.join(', ')}.`;
}

/**
 * Build complete raise scenario comparison matrix
 */
export function buildRaiseScenarioMatrix(
  burnRate: BurnRateComponents,
  currentCash: number,
  preMoneyValuation: number = DEFAULT_PRE_MONEY_VALUATION,
  raiseAmounts: number[] = DEFAULT_RAISE_AMOUNTS,
  instrument: RaiseScenarioInput['instrument'] = 'equity',
  founderCurrentOwnership: number = FOUNDER_STARTING_OWNERSHIP
): RaiseScenarioMatrix {
  // Calculate all scenarios
  const scenarios = raiseAmounts.map((amount) =>
    calculateRaiseScenario(
      {
        raiseAmount: amount,
        instrument,
        preMoneyValuation,
      },
      burnRate,
      currentCash,
      founderCurrentOwnership
    )
  );
  
  // Find best scenario based on scoring
  const scoredScenarios = scenarios.map((s) => ({
    scenario: s,
    score: scoreScenario(s),
  }));
  
  const bestScored = scoredScenarios.reduce((best, current) =>
    current.score > best.score ? current : best
  );
  
  const recommendedScenario = bestScored.scenario;
  const recommendationReason = generateRecommendation(recommendedScenario);
  
  return {
    scenarios,
    burnRate,
    currentCash,
    recommendedScenario,
    recommendationReason,
  };
}

/**
 * Format currency for display
 */
export function formatRaiseCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format percentage for display
 */
export function formatRaisePercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
