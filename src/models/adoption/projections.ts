/**
 * Projection functions for converting sigmoid values to unit forecasts
 */

import { sigmoid } from './sigmoid';
import { getScenarioParams } from './scenarios';

/**
 * Linear regression coefficients for unit projection
 * Units = slope × sigmoidValue + intercept
 */
const REGRESSION = {
  slope: 571.01,
  intercept: -695.89
};

/**
 * Convert sigmoid value to projected units using linear regression
 * Units = 571.01 × sigmoidValue - 695.89
 *
 * @param sigmoidValue - Output from sigmoid function
 * @returns Projected units (can be negative for low sigmoid values)
 */
export function projectUnits(sigmoidValue: number): number {
  return REGRESSION.slope * sigmoidValue + REGRESSION.intercept;
}

/**
 * Generate annual unit projections for a scenario
 *
 * @param scenario - Scenario name (max, upside, base, downside, min)
 * @param startYear - First year of projection
 * @param years - Number of years to project
 * @returns Array of projected units per year
 */
export function getAnnualProjections(
  scenario: string,
  startYear: number,
  years: number
): number[] {
  const params = getScenarioParams(scenario);
  const projections: number[] = [];

  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    const sigmoidValue = sigmoid(year, params.L, params.x0, params.k, params.b);
    const units = projectUnits(sigmoidValue);
    // Floor to 0 for negative projections (early years)
    projections.push(Math.max(0, units));
  }

  return projections;
}

/**
 * Distribute annual units into monthly projections with growth
 *
 * @param annualUnits - Total units for the year
 * @param growthRate - Monthly growth rate (e.g., 0.02 for 2% monthly growth)
 * @returns Array of 12 monthly unit values
 */
export function getMonthlyProjections(
  annualUnits: number,
  growthRate: number
): number[] {
  const months = 12;

  // If no growth, distribute evenly
  if (growthRate === 0) {
    const monthlyUnits = annualUnits / months;
    return Array(months).fill(monthlyUnits);
  }

  // Calculate base value so that sum equals annualUnits
  // Sum of geometric series: S = a * (r^n - 1) / (r - 1)
  // where a = base, r = 1 + growthRate, n = 12
  const r = 1 + growthRate;
  const geometricSum = (Math.pow(r, months) - 1) / (r - 1);
  const baseValue = annualUnits / geometricSum;

  const monthlyProjections: number[] = [];
  for (let m = 0; m < months; m++) {
    monthlyProjections.push(baseValue * Math.pow(r, m));
  }

  return monthlyProjections;
}

/**
 * Get sigmoid value for a specific year and scenario
 */
export function getSigmoidValue(scenario: string, year: number): number {
  const params = getScenarioParams(scenario);
  return sigmoid(year, params.L, params.x0, params.k, params.b);
}
