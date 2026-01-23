/**
 * DCF Valuation Calculator
 *
 * Builds a complete DCF model using:
 * - Adoption model for unit projections
 * - Assumptions for all financial parameters
 * - Terminal value using Gordon Growth Model
 */

import { getAnnualProjections } from '../adoption/projections';
import type { AllAssumptions } from '../assumptions/types';
import { calculateDiscountFactor } from './npv';
import { calculateGordonGrowthTV } from './terminal';

/**
 * Yearly financial projection with all P&L and FCF components
 */
export interface YearlyProjection {
  year: number;
  units: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marketing: number;
  gna: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  taxes: number;
  nopat: number; // Net Operating Profit After Tax
  capex: number;
  workingCapital: number;
  workingCapitalChange: number;
  freeCashFlow: number;
  discountFactor: number;
  presentValue: number;
}

/**
 * Complete DCF valuation result
 */
export interface DCFResult {
  scenario: string;
  projections: YearlyProjection[];
  terminalValue: number;
  terminalValuePV: number;
  enterpriseValue: number;
  equityValue: number; // EV - debt (assume 0 debt for now)
  impliedMultiples: {
    evToRevenue: number;
    evToEbitda: number;
  };
  assumptions: AllAssumptions;
}

/**
 * Calculate COGS for a given year
 */
function calculateCOGS(
  units: number,
  unitCost: number,
  shippingPerUnit: number,
  costReductionPerYear: number,
  yearIndex: number
): number {
  // Apply cost reduction each year
  const effectiveUnitCost = unitCost * Math.pow(1 - costReductionPerYear, yearIndex);
  return units * (effectiveUnitCost + shippingPerUnit);
}

/**
 * Calculate Marketing spend for a given year
 */
function calculateMarketing(
  revenue: number,
  baseBudget: number,
  percentOfRevenue: number
): number {
  // Marketing = base budget + percent of revenue
  return baseBudget + revenue * percentOfRevenue;
}

/**
 * Calculate G&A for a given year
 */
function calculateGNA(
  baseHeadcount: number,
  avgSalary: number,
  salaryGrowthRate: number,
  benefitsMultiplier: number,
  officeAndOps: number,
  yearIndex: number
): number {
  // Salaries grow each year
  const effectiveSalary = avgSalary * Math.pow(1 + salaryGrowthRate, yearIndex);
  const personnelCost = baseHeadcount * effectiveSalary * benefitsMultiplier;
  return personnelCost + officeAndOps;
}

/**
 * Calculate CapEx for a given year
 */
function calculateCapex(
  capexYear1: number,
  capexGrowthRate: number,
  yearIndex: number
): number {
  return capexYear1 * Math.pow(1 + capexGrowthRate, yearIndex);
}

/**
 * Calculate DCF valuation for a scenario
 *
 * @param scenario - Scenario name (max, upside, base, downside, min)
 * @param assumptions - All financial assumptions
 * @returns Complete DCF result with projections and valuation
 *
 * @example
 * const result = calculateDCF('base', DEFAULT_ASSUMPTIONS);
 * console.log(`Enterprise Value: $${result.enterpriseValue.toLocaleString()}`);
 */
export function calculateDCF(
  scenario: string,
  assumptions: AllAssumptions
): DCFResult {
  const { revenue, cogs, marketing, gna, capital, corporate } = assumptions;
  const years = corporate.projectionYears;

  // 1. Get unit projections from adoption model
  const unitProjections = getAnnualProjections(scenario, 2025, years);

  const projections: YearlyProjection[] = [];
  let previousWorkingCapital = 0;
  let sumOfPVs = 0;

  for (let i = 0; i < years; i++) {
    const yearNumber = i + 1;
    const units = unitProjections[i];

    // 2. Calculate revenue = units × price (with annual increase)
    const effectivePrice =
      revenue.pricePerUnit * Math.pow(1 + revenue.annualPriceIncrease, i);
    const grossRevenue = units * effectivePrice;
    const netRevenue = grossRevenue * (1 - revenue.discountRate);

    // 3. Calculate COGS = units × (unit cost + shipping)
    const yearCOGS = calculateCOGS(
      units,
      cogs.unitCost,
      cogs.shippingPerUnit,
      cogs.costReductionPerYear,
      i
    );

    // 4. Calculate gross profit
    const grossProfit = netRevenue - yearCOGS;

    // 5. Calculate marketing spend
    const yearMarketing = calculateMarketing(
      netRevenue,
      marketing.baseBudget,
      marketing.percentOfRevenue
    );

    // 6. Calculate G&A
    const yearGNA = calculateGNA(
      gna.baseHeadcount,
      gna.avgSalary,
      gna.salaryGrowthRate,
      gna.benefitsMultiplier,
      gna.officeAndOps,
      i
    );

    // 7. Calculate EBITDA
    const ebitda = grossProfit - yearMarketing - yearGNA;

    // 8. Depreciation (assume 0 for this model - no fixed asset base)
    const depreciation = 0;

    // 9. Calculate EBIT
    const ebit = ebitda - depreciation;

    // 10. Calculate taxes (only if positive EBIT)
    const taxes = ebit > 0 ? ebit * corporate.taxRate : 0;

    // 11. Calculate NOPAT
    const nopat = ebit - taxes;

    // 12. Calculate CapEx
    const capex = calculateCapex(capital.capexYear1, capital.capexGrowthRate, i);

    // 13. Calculate working capital and change
    const workingCapital = netRevenue * capital.workingCapitalPercent;
    const workingCapitalChange = workingCapital - previousWorkingCapital;
    previousWorkingCapital = workingCapital;

    // 14. Calculate Free Cash Flow
    // FCF = NOPAT + Depreciation - CapEx - ΔWorking Capital
    const freeCashFlow = nopat + depreciation - capex - workingCapitalChange;

    // 15. Calculate discount factor
    const discountFactor = calculateDiscountFactor(
      corporate.discountRate,
      yearNumber
    );

    // 16. Calculate present value
    const presentValue = freeCashFlow * discountFactor;
    sumOfPVs += presentValue;

    projections.push({
      year: yearNumber,
      units,
      revenue: netRevenue,
      cogs: yearCOGS,
      grossProfit,
      marketing: yearMarketing,
      gna: yearGNA,
      ebitda,
      depreciation,
      ebit,
      taxes,
      nopat,
      capex,
      workingCapital,
      workingCapitalChange,
      freeCashFlow,
      discountFactor,
      presentValue,
    });
  }

  // 17. Calculate terminal value using Gordon Growth Model
  // TV = FCF_final × (1 + g) / (r - g)
  const finalYearFCF = projections[projections.length - 1].freeCashFlow;
  const terminalValue = calculateGordonGrowthTV(
    finalYearFCF,
    corporate.terminalGrowthRate,
    corporate.discountRate
  );

  // 18. Calculate terminal value PV
  const terminalDiscountFactor = calculateDiscountFactor(
    corporate.discountRate,
    years
  );
  const terminalValuePV = terminalValue * terminalDiscountFactor;

  // 19. Calculate Enterprise Value = Sum of PVs + Terminal Value PV
  const enterpriseValue = sumOfPVs + terminalValuePV;

  // Equity Value = EV - Net Debt (assume 0 debt)
  const equityValue = enterpriseValue;

  // Calculate implied multiples
  const finalYearRevenue = projections[projections.length - 1].revenue;
  const finalYearEbitda = projections[projections.length - 1].ebitda;

  const impliedMultiples = {
    evToRevenue: finalYearRevenue > 0 ? enterpriseValue / finalYearRevenue : 0,
    evToEbitda: finalYearEbitda > 0 ? enterpriseValue / finalYearEbitda : 0,
  };

  return {
    scenario,
    projections,
    terminalValue,
    terminalValuePV,
    enterpriseValue,
    equityValue,
    impliedMultiples,
    assumptions,
  };
}

/**
 * Calculate DCF for all scenarios
 *
 * @param assumptions - All financial assumptions
 * @returns Map of scenario name to DCF result
 */
export function calculateAllScenarios(
  assumptions: AllAssumptions
): Record<string, DCFResult> {
  const scenarios = ['min', 'downside', 'base', 'upside', 'max'];
  const results: Record<string, DCFResult> = {};

  for (const scenario of scenarios) {
    results[scenario] = calculateDCF(scenario, assumptions);
  }

  return results;
}

/**
 * Calculate IRR using Newton-Raphson method
 * 
 * @param cashFlows - Array of cash flows (period 0 = initial investment, typically negative)
 * @param maxIterations - Maximum iterations for convergence
 * @returns IRR as decimal (e.g., 0.15 for 15%)
 */
export function calculateIRRSimple(cashFlows: number[], maxIterations = 100): number {
  if (cashFlows.length < 2) return NaN;
  
  let rate = 0.1; // Initial guess 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      if (t > 0) {
        derivative -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
    }
    
    if (Math.abs(derivative) < 1e-15) break;
    
    const newRate = rate - npv / derivative;
    if (Math.abs(newRate - rate) < 0.0001) return newRate;
    
    // Bound rate to reasonable values
    rate = Math.max(-0.99, Math.min(10, newRate));
  }
  
  return rate;
}

/**
 * Calculate NPV as of an effective date
 * Allows calculating value at a point in time different from period 0
 * 
 * @param cashFlows - Array of cash flows (index = period)
 * @param discountRate - Annual discount rate (decimal)
 * @param effectiveDate - Date to calculate NPV as of
 * @param startDate - Date of period 0 cash flow
 * @returns NPV as of the effective date
 */
export function calculateNPVWithEffectiveDate(
  cashFlows: number[],
  discountRate: number,
  effectiveDate: Date,
  startDate: Date
): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsOffset = (effectiveDate.getTime() - startDate.getTime()) / msPerYear;
  
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate, t - yearsOffset);
  }
  
  return npv;
}

/**
 * Calculate payback period (time to recover initial investment)
 * 
 * @param cashFlows - Array of cash flows (index 0 = initial investment, typically negative)
 * @returns Payback period in years, or null if investment is never recovered
 */
export function calculatePaybackPeriod(cashFlows: number[]): number | null {
  if (cashFlows.length === 0) return null;
  
  let cumulativeCashFlow = 0;
  
  for (let t = 0; t < cashFlows.length; t++) {
    const previousCumulative = cumulativeCashFlow;
    cumulativeCashFlow += cashFlows[t];
    
    // Check if we've crossed from negative to positive (or zero)
    if (previousCumulative < 0 && cumulativeCashFlow >= 0) {
      // Linear interpolation for fractional year
      if (cashFlows[t] !== 0) {
        const fractionOfYear = -previousCumulative / cashFlows[t];
        return (t - 1) + fractionOfYear;
      }
      return t;
    }
  }
  
  // Investment never recovered
  return null;
}

/**
 * Calculate discounted payback period
 * 
 * @param cashFlows - Array of cash flows (index 0 = initial investment)
 * @param discountRate - Annual discount rate (decimal)
 * @returns Discounted payback period in years, or null if never recovered
 */
export function calculateDiscountedPaybackPeriod(
  cashFlows: number[],
  discountRate: number
): number | null {
  if (cashFlows.length === 0) return null;
  
  let cumulativePV = 0;
  
  for (let t = 0; t < cashFlows.length; t++) {
    const previousCumulativePV = cumulativePV;
    const pv = cashFlows[t] / Math.pow(1 + discountRate, t);
    cumulativePV += pv;
    
    if (previousCumulativePV < 0 && cumulativePV >= 0) {
      if (pv !== 0) {
        const fractionOfYear = -previousCumulativePV / pv;
        return (t - 1) + fractionOfYear;
      }
      return t;
    }
  }
  
  return null;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get valuation summary for a DCF result
 */
export function getValuationSummary(result: DCFResult): string {
  const lines = [
    `DCF Valuation Summary - ${result.scenario.toUpperCase()} Scenario`,
    '='.repeat(50),
    `Enterprise Value: ${formatCurrency(result.enterpriseValue)}`,
    `Equity Value: ${formatCurrency(result.equityValue)}`,
    '',
    'Terminal Value Analysis:',
    `  Terminal Value: ${formatCurrency(result.terminalValue)}`,
    `  Terminal Value PV: ${formatCurrency(result.terminalValuePV)}`,
    `  TV as % of EV: ${((result.terminalValuePV / result.enterpriseValue) * 100).toFixed(1)}%`,
    '',
    'Implied Multiples:',
    `  EV/Revenue: ${result.impliedMultiples.evToRevenue.toFixed(1)}x`,
    `  EV/EBITDA: ${result.impliedMultiples.evToEbitda.toFixed(1)}x`,
    '',
    'Key Assumptions:',
    `  WACC: ${(result.assumptions.corporate.discountRate * 100).toFixed(1)}%`,
    `  Terminal Growth: ${(result.assumptions.corporate.terminalGrowthRate * 100).toFixed(1)}%`,
    `  Tax Rate: ${(result.assumptions.corporate.taxRate * 100).toFixed(1)}%`,
  ];

  return lines.join('\n');
}
