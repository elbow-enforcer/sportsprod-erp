/**
 * @file calculations.ts
 * @description Simple tooling amortization calculations
 * @related-issue Issue #9 - Re-tooling Cycle Planning
 */

import type { ToolingYearProjection, ToolingProjection } from './types';

/**
 * Calculate annual tooling amortization using straight-line method
 * 
 * @param toolingCost - Initial tooling investment
 * @param retoolingYears - Number of years before re-tooling (amortization period)
 * @returns Annual amortization expense
 */
export function calculateToolingAmortization(
  toolingCost: number,
  retoolingYears: number
): number {
  if (retoolingYears <= 0) return 0;
  return toolingCost / retoolingYears;
}

/**
 * Generate tooling cost projections over multiple years
 * 
 * @param toolingCost - Initial tooling investment
 * @param retoolingYears - Re-tooling cycle in years
 * @param projectionYears - Total years to project
 * @param startYear - Starting year (default: current year)
 * @returns Complete tooling projection with annual breakdown
 */
export function generateToolingProjections(
  toolingCost: number,
  retoolingYears: number,
  projectionYears: number,
  startYear: number = new Date().getFullYear()
): ToolingProjection {
  const annualAmortization = calculateToolingAmortization(toolingCost, retoolingYears);
  const years: ToolingYearProjection[] = [];
  
  let totalAmortization = 0;
  let totalRetoolingInvestments = 0;
  
  for (let i = 0; i < projectionYears; i++) {
    const year = startYear + i;
    // Re-tooling occurs at the end of each cycle (years 3, 6, 9, etc. for 3-year cycle)
    // Year 1 = i=0, so re-tooling at i = retoolingYears - 1, 2*retoolingYears - 1, etc.
    const yearInCycle = (i + 1) % retoolingYears;
    const isRetoolingYear = retoolingYears > 0 && yearInCycle === 0 && i > 0;
    
    // Re-tooling investment (assume same cost as initial tooling)
    const retoolingInvestment = isRetoolingYear ? toolingCost : 0;
    
    totalAmortization += annualAmortization;
    totalRetoolingInvestments += retoolingInvestment;
    
    years.push({
      year,
      amortizationExpense: annualAmortization,
      retoolingInvestment,
      isRetoolingYear,
    });
  }
  
  return {
    years,
    totalAmortization,
    totalRetoolingInvestments,
  };
}

/**
 * Calculate tooling cost per unit based on projected volume
 * 
 * @param annualAmortization - Annual tooling amortization expense
 * @param annualUnits - Expected unit production for the year
 * @returns Tooling cost per unit
 */
export function calculateToolingCostPerUnit(
  annualAmortization: number,
  annualUnits: number
): number {
  if (annualUnits <= 0) return 0;
  return annualAmortization / annualUnits;
}
