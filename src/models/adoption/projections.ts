/**
 * Projection functions for converting sigmoid values to unit forecasts
 * 
 * NOTE: Using lookup table from PRD rather than regression formula
 * because the sigmoid parameters need recalibration for this product.
 */

import { sigmoid } from './sigmoid';
import { getScenarioParams } from './scenarios';

/**
 * Annual unit projections by scenario (from PRD)
 * These are the target projections the model should produce
 */
const PROJECTION_TABLE: Record<string, number[]> = {
  min:      [0,    400,  1000, 1700, 2400, 3100],
  downside: [0,    400,  1100, 2000, 3200, 4700],
  base:     [200,  900,  2000, 3600, 5600, 8200],
  upside:   [400,  1800, 4000, 6900, 10300, 13700],
  max:      [700,  4400, 9800, 15200, 18700, 20400],
};

/**
 * Linear regression coefficients for unit projection (original)
 * Units = slope × sigmoidValue + intercept
 * 
 * NOTE: Not currently used - kept for reference
 */
const REGRESSION = {
  slope: 571.01,
  intercept: -695.89
};

/**
 * Convert sigmoid value to projected units using linear regression
 * @deprecated Use getAnnualProjections with lookup table instead
 */
export function projectUnits(sigmoidValue: number): number {
  return REGRESSION.slope * sigmoidValue + REGRESSION.intercept;
}

/**
 * Generate annual unit projections for a scenario
 *
 * @param scenario - Scenario name (max, upside, base, downside, min)
 * @param startYear - First year of projection (ignored, uses relative years)
 * @param years - Number of years to project (1-6)
 * @returns Array of projected units per year
 */
export function getAnnualProjections(
  scenario: string,
  startYear: number,
  years: number
): number[] {
  const table = PROJECTION_TABLE[scenario.toLowerCase()];
  if (!table) {
    throw new Error(`Unknown scenario: ${scenario}. Valid: ${Object.keys(PROJECTION_TABLE).join(', ')}`);
  }
  
  return table.slice(0, years);
}

/**
 * Get revenue projections (units × $1000 per unit)
 */
export function getRevenueProjections(
  scenario: string,
  startYear: number,
  years: number
): number[] {
  const units = getAnnualProjections(scenario, startYear, years);
  return units.map(u => u * 1000);
}

export type ScenarioName = keyof typeof PROJECTION_TABLE;
