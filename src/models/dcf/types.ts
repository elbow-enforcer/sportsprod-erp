/**
 * DCF Model Type Definitions
 * Free Cash Flow projections and valuation parameters
 */

/** Free Cash Flow input components */
export interface FCFInputs {
  ebitda: number;
  capex: number;
  workingCapitalChange: number; // ΔWorkingCapital (increase is negative for FCF)
  taxes: number;
}

/** Free Cash Flow result */
export interface FCFResult {
  fcf: number;
  inputs: FCFInputs;
}

/** DCF calculation parameters */
export interface DCFParams {
  discountRate: number; // WACC or required return (decimal, e.g., 0.10 for 10%)
  projectionYears: number;
  terminalGrowthRate?: number; // For Gordon Growth model (decimal)
  exitMultiple?: number; // For Exit Multiple method (e.g., 8x EBITDA)
}

/** Period cash flow with timing */
export interface PeriodCashFlow {
  period: number; // Year/period number (1, 2, 3, ...)
  fcf: number;
  discountFactor?: number;
  presentValue?: number;
}

/** NPV calculation result */
export interface NPVResult {
  npv: number;
  cashFlows: PeriodCashFlow[];
  discountRate: number;
}

/** IRR calculation result */
export interface IRRResult {
  irr: number; // Internal rate of return (decimal)
  converged: boolean;
  iterations: number;
}

/** Terminal value calculation methods */
export type TerminalValueMethod = 'gordon-growth' | 'exit-multiple';

/** Terminal value inputs */
export interface TerminalValueInputs {
  method: TerminalValueMethod;
  finalYearFCF?: number; // For Gordon Growth
  finalYearEBITDA?: number; // For Exit Multiple
  growthRate?: number; // Terminal growth rate (Gordon Growth)
  discountRate: number; // WACC
  exitMultiple?: number; // EBITDA multiple (Exit Multiple method)
}

/** Terminal value result */
export interface TerminalValueResult {
  terminalValue: number;
  presentValue: number;
  method: TerminalValueMethod;
}

/** Comparable company data for exit multiple benchmarking */
export interface ComparableCompany {
  name: string;
  ticker?: string;
  evEbitdaMultiple: number;
  evRevenueMultiple: number;
  sector: string;
  marketCap?: number; // in millions
  description?: string;
}

/** Terminal value comparison result */
export interface TerminalValueComparison {
  gordonGrowth: {
    terminalValue: number;
    presentValue: number;
    impliedEbitdaMultiple: number;
    assumptions: {
      finalYearFCF: number;
      growthRate: number;
      discountRate: number;
    };
  };
  exitMultiple: {
    terminalValue: number;
    presentValue: number;
    impliedGrowthRate: number;
    assumptions: {
      finalYearEBITDA: number;
      exitMultiple: number;
      discountRate: number;
    };
  };
  difference: {
    terminalValue: number;
    presentValue: number;
    percentDifference: number;
  };
}

/** Terminal value breakdown for display */
export interface TerminalValueBreakdown {
  method: TerminalValueMethod;
  terminalValue: number;
  presentValue: number;
  percentOfEnterpriseValue: number;
  // Gordon Growth specific
  gordonDetails?: {
    finalYearFCF: number;
    growthRate: number;
    discountRate: number;
    formula: string;
    impliedMultiple: number;
  };
  // Exit Multiple specific
  exitMultipleDetails?: {
    finalYearEBITDA: number;
    exitMultiple: number;
    formula: string;
    impliedGrowthRate: number;
    comparableCompanies: ComparableCompany[];
  };
}

/** Complete DCF valuation result */
export interface DCFValuation {
  enterpriseValue: number;
  pvOfCashFlows: number;
  pvOfTerminalValue: number;
  terminalValue: number;
  cashFlows: PeriodCashFlow[];
  params: DCFParams;
}
