/**
 * FCF Projection Engine
 * 
 * Projects Free Cash Flow by scenario for 5-10 years with component breakdown.
 * 
 * Formula: FCF = EBIT(1-t) + D&A - CapEx - ΔWorkingCapital
 *          or  FCF = EBITDA - Taxes - CapEx - ΔWorkingCapital
 */

import { getAnnualProjections } from '../adoption/projections';
import type { AllAssumptions } from '../assumptions/types';
import { calculateDiscountFactor } from './npv';

/**
 * FCF component breakdown for a single year
 */
export interface FCFYearComponents {
  year: number;
  yearLabel: string;
  
  // P&L components
  units: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  
  marketing: number;
  gna: number;
  
  ebitda: number;
  ebitdaMarginPct: number;
  
  depreciation: number;
  ebit: number;
  ebitMarginPct: number;
  
  // FCF components
  taxes: number;
  taxRate: number;
  nopat: number; // EBIT * (1 - tax rate)
  
  capex: number;
  workingCapital: number;
  workingCapitalChange: number;
  
  // Final FCF
  fcf: number;
  fcfMarginPct: number;
  
  // Discounted values
  discountFactor: number;
  presentValue: number;
  
  // Cumulative
  cumulativeFCF: number;
  cumulativePV: number;
}

/**
 * Complete FCF projection result for a scenario
 */
export interface FCFProjectionResult {
  scenario: string;
  scenarioLabel: string;
  years: FCFYearComponents[];
  
  // Summary metrics
  totalFCF: number;
  totalPV: number;
  avgFCFMargin: number;
  fcfCAGR: number; // Compound annual growth rate
  
  // Component totals
  totalRevenue: number;
  totalEBITDA: number;
  totalCapex: number;
  totalWCChange: number;
  totalTaxes: number;
  
  // Year-over-year growth rates
  fcfGrowthRates: number[];
  
  // First positive FCF year
  breakEvenYear: number | null;
}

/**
 * All scenarios comparison
 */
export interface FCFScenarioComparison {
  scenarios: Record<string, FCFProjectionResult>;
  scenarioOrder: string[];
  
  // Cross-scenario metrics
  bestCase: {
    scenario: string;
    totalFCF: number;
    totalPV: number;
  };
  worstCase: {
    scenario: string;
    totalFCF: number;
    totalPV: number;
  };
  baseCase: {
    scenario: string;
    totalFCF: number;
    totalPV: number;
  };
}

const SCENARIO_LABELS: Record<string, string> = {
  max: 'Maximum',
  upside: 'Upside',
  base: 'Base',
  downside: 'Downside',
  min: 'Minimum',
};

/**
 * Calculate COGS for a given year with cost reduction
 */
function calculateCOGS(
  units: number,
  unitCost: number,
  shippingPerUnit: number,
  costReductionPerYear: number,
  yearIndex: number
): number {
  const effectiveUnitCost = unitCost * Math.pow(1 - costReductionPerYear, yearIndex);
  return units * (effectiveUnitCost + shippingPerUnit);
}

/**
 * Calculate Marketing spend
 */
function calculateMarketing(
  revenue: number,
  baseBudget: number,
  percentOfRevenue: number
): number {
  return baseBudget + revenue * percentOfRevenue;
}

/**
 * Calculate G&A with salary growth
 */
function calculateGNA(
  baseHeadcount: number,
  avgSalary: number,
  salaryGrowthRate: number,
  benefitsMultiplier: number,
  officeAndOps: number,
  yearIndex: number
): number {
  const effectiveSalary = avgSalary * Math.pow(1 + salaryGrowthRate, yearIndex);
  const personnelCost = baseHeadcount * effectiveSalary * benefitsMultiplier;
  return personnelCost + officeAndOps;
}

/**
 * Calculate CapEx with growth
 */
function calculateCapex(
  capexYear1: number,
  capexGrowthRate: number,
  yearIndex: number
): number {
  return capexYear1 * Math.pow(1 + capexGrowthRate, yearIndex);
}

/**
 * Project FCF for a single scenario
 */
export function projectFCFByScenario(
  scenario: string,
  assumptions: AllAssumptions,
  projectionYears?: number
): FCFProjectionResult {
  const { revenue, cogs, marketing, gna, capital, corporate } = assumptions;
  const years = projectionYears ?? corporate.projectionYears;
  const baseYear = 2025;

  // Get unit projections from adoption model
  const unitProjections = getAnnualProjections(scenario, baseYear, years);

  const yearComponents: FCFYearComponents[] = [];
  let previousWorkingCapital = 0;
  let cumulativeFCF = 0;
  let cumulativePV = 0;

  // Totals
  let totalRevenue = 0;
  let totalEBITDA = 0;
  let totalCapex = 0;
  let totalWCChange = 0;
  let totalTaxes = 0;
  let totalFCF = 0;

  const fcfGrowthRates: number[] = [];
  let breakEvenYear: number | null = null;

  for (let i = 0; i < years; i++) {
    const yearNumber = i + 1;
    const units = unitProjections[i];

    // Revenue calculation
    const effectivePrice = revenue.pricePerUnit * Math.pow(1 + revenue.annualPriceIncrease, i);
    const grossRevenue = units * effectivePrice;
    const netRevenue = grossRevenue * (1 - revenue.discountRate);

    // COGS
    const yearCOGS = calculateCOGS(
      units,
      cogs.unitCost,
      cogs.shippingPerUnit,
      cogs.costReductionPerYear,
      i
    );

    // Gross profit
    const grossProfit = netRevenue - yearCOGS;
    const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // Operating expenses
    const yearMarketing = calculateMarketing(
      netRevenue,
      marketing.baseBudget,
      marketing.percentOfRevenue
    );

    const yearGNA = calculateGNA(
      gna.baseHeadcount,
      gna.avgSalary,
      gna.salaryGrowthRate,
      gna.benefitsMultiplier,
      gna.officeAndOps,
      i
    );

    // EBITDA
    const ebitda = grossProfit - yearMarketing - yearGNA;
    const ebitdaMarginPct = netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0;

    // Depreciation (simplified - could be enhanced)
    const depreciation = 0;

    // EBIT
    const ebit = ebitda - depreciation;
    const ebitMarginPct = netRevenue > 0 ? (ebit / netRevenue) * 100 : 0;

    // Taxes (only on positive EBIT)
    const taxes = ebit > 0 ? ebit * corporate.taxRate : 0;

    // NOPAT = EBIT * (1 - t)
    const nopat = ebit - taxes;

    // CapEx
    const capex = calculateCapex(capital.capexYear1, capital.capexGrowthRate, i);

    // Working capital
    const workingCapital = netRevenue * capital.workingCapitalPercent;
    const workingCapitalChange = workingCapital - previousWorkingCapital;
    previousWorkingCapital = workingCapital;

    // FCF = NOPAT + D&A - CapEx - ΔWC
    // Equivalent to: EBITDA - Taxes - CapEx - ΔWC (when D&A = 0)
    const fcf = nopat + depreciation - capex - workingCapitalChange;
    const fcfMarginPct = netRevenue > 0 ? (fcf / netRevenue) * 100 : 0;

    // Discount factor and PV
    const discountFactor = calculateDiscountFactor(corporate.discountRate, yearNumber);
    const presentValue = fcf * discountFactor;

    // Cumulatives
    cumulativeFCF += fcf;
    cumulativePV += presentValue;

    // Track break-even
    if (breakEvenYear === null && cumulativeFCF > 0) {
      breakEvenYear = yearNumber;
    }

    // Growth rate
    if (i > 0 && yearComponents[i - 1].fcf !== 0) {
      const growthRate = (fcf - yearComponents[i - 1].fcf) / Math.abs(yearComponents[i - 1].fcf);
      fcfGrowthRates.push(growthRate);
    }

    // Totals
    totalRevenue += netRevenue;
    totalEBITDA += ebitda;
    totalCapex += capex;
    totalWCChange += workingCapitalChange;
    totalTaxes += taxes;
    totalFCF += fcf;

    yearComponents.push({
      year: yearNumber,
      yearLabel: `Year ${yearNumber}`,
      units,
      revenue: netRevenue,
      cogs: yearCOGS,
      grossProfit,
      grossMarginPct,
      marketing: yearMarketing,
      gna: yearGNA,
      ebitda,
      ebitdaMarginPct,
      depreciation,
      ebit,
      ebitMarginPct,
      taxes,
      taxRate: corporate.taxRate,
      nopat,
      capex,
      workingCapital,
      workingCapitalChange,
      fcf,
      fcfMarginPct,
      discountFactor,
      presentValue,
      cumulativeFCF,
      cumulativePV,
    });
  }

  // Calculate CAGR
  const firstFCF = yearComponents[0]?.fcf || 0;
  const lastFCF = yearComponents[yearComponents.length - 1]?.fcf || 0;
  let fcfCAGR = 0;
  if (firstFCF > 0 && lastFCF > 0 && years > 1) {
    fcfCAGR = Math.pow(lastFCF / firstFCF, 1 / (years - 1)) - 1;
  }

  // Average FCF margin
  const avgFCFMargin = totalRevenue > 0 ? (totalFCF / totalRevenue) * 100 : 0;

  return {
    scenario,
    scenarioLabel: SCENARIO_LABELS[scenario] || scenario,
    years: yearComponents,
    totalFCF,
    totalPV: cumulativePV,
    avgFCFMargin,
    fcfCAGR,
    totalRevenue,
    totalEBITDA,
    totalCapex,
    totalWCChange,
    totalTaxes,
    fcfGrowthRates,
    breakEvenYear,
  };
}

/**
 * Project FCF for all scenarios
 */
export function projectFCFAllScenarios(
  assumptions: AllAssumptions,
  projectionYears?: number
): FCFScenarioComparison {
  const scenarioOrder = ['max', 'upside', 'base', 'downside', 'min'];
  const scenarios: Record<string, FCFProjectionResult> = {};

  for (const scenario of scenarioOrder) {
    scenarios[scenario] = projectFCFByScenario(scenario, assumptions, projectionYears);
  }

  // Find best, worst, base cases
  const sortedByFCF = scenarioOrder
    .map((s) => ({ scenario: s, totalFCF: scenarios[s].totalFCF, totalPV: scenarios[s].totalPV }))
    .sort((a, b) => b.totalFCF - a.totalFCF);

  return {
    scenarios,
    scenarioOrder,
    bestCase: sortedByFCF[0],
    worstCase: sortedByFCF[sortedByFCF.length - 1],
    baseCase: {
      scenario: 'base',
      totalFCF: scenarios['base'].totalFCF,
      totalPV: scenarios['base'].totalPV,
    },
  };
}

/**
 * Get FCF component breakdown for visualization
 */
export interface FCFComponentBreakdown {
  year: number;
  yearLabel: string;
  ebitda: number;
  taxes: number;
  capex: number;
  wcChange: number;
  fcf: number;
}

export function getFCFComponentBreakdown(result: FCFProjectionResult): FCFComponentBreakdown[] {
  return result.years.map((y) => ({
    year: y.year,
    yearLabel: y.yearLabel,
    ebitda: y.ebitda,
    taxes: -y.taxes, // Negative for waterfall
    capex: -y.capex, // Negative for waterfall
    wcChange: -y.workingCapitalChange, // Negative for waterfall (increase uses cash)
    fcf: y.fcf,
  }));
}

/**
 * Format helpers
 */
export function formatFCFCurrency(value: number, compact = true): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (compact) {
    if (absValue >= 1_000_000_000) {
      return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
    }
    if (absValue >= 1_000_000) {
      return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
    }
    if (absValue >= 1_000) {
      return `${sign}$${(absValue / 1_000).toFixed(0)}K`;
    }
    return `${sign}$${absValue.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFCFPercent(value: number): string {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}%`;
}
