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
