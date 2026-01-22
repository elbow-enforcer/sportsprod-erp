/**
 * Free Cash Flow (FCF) Calculator
 * FCF = EBITDA - CapEx - ΔWorkingCapital - Taxes
 */

import { FCFInputs, FCFResult } from './types';

/**
 * Calculate Free Cash Flow
 * 
 * @param inputs - FCF input components
 * @returns FCF result with calculated value and inputs
 * 
 * @example
 * const result = calculateFCF({
 *   ebitda: 1000000,
 *   capex: 200000,
 *   workingCapitalChange: 50000,
 *   taxes: 150000
 * });
 * // result.fcf = 600000
 */
export function calculateFCF(inputs: FCFInputs): FCFResult {
  const { ebitda, capex, workingCapitalChange, taxes } = inputs;

  // Validate inputs
  if (typeof ebitda !== 'number' || isNaN(ebitda)) {
    throw new Error('EBITDA must be a valid number');
  }
  if (typeof capex !== 'number' || isNaN(capex)) {
    throw new Error('CapEx must be a valid number');
  }
  if (typeof workingCapitalChange !== 'number' || isNaN(workingCapitalChange)) {
    throw new Error('Working capital change must be a valid number');
  }
  if (typeof taxes !== 'number' || isNaN(taxes)) {
    throw new Error('Taxes must be a valid number');
  }

  // FCF = EBITDA - CapEx - ΔWorkingCapital - Taxes
  const fcf = ebitda - capex - workingCapitalChange - taxes;

  return {
    fcf,
    inputs,
  };
}

/**
 * Calculate FCF for multiple periods
 * 
 * @param periodsInputs - Array of FCF inputs for each period
 * @returns Array of FCF results
 */
export function calculateFCFSeries(periodsInputs: FCFInputs[]): FCFResult[] {
  return periodsInputs.map((inputs) => calculateFCF(inputs));
}

/**
 * Project FCF with growth rate
 * 
 * @param baseFCF - Starting FCF value
 * @param growthRate - Annual growth rate (decimal)
 * @param years - Number of years to project
 * @returns Array of projected FCF values
 */
export function projectFCF(
  baseFCF: number,
  growthRate: number,
  years: number
): number[] {
  if (years < 1) {
    throw new Error('Years must be at least 1');
  }
  if (growthRate < -1) {
    throw new Error('Growth rate cannot be less than -100%');
  }

  const projections: number[] = [];
  let currentFCF = baseFCF;

  for (let i = 0; i < years; i++) {
    currentFCF = currentFCF * (1 + growthRate);
    projections.push(currentFCF);
  }

  return projections;
}
