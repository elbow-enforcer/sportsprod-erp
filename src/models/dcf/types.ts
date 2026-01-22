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

/** Complete DCF valuation result */
export interface DCFValuation {
  enterpriseValue: number;
  pvOfCashFlows: number;
  pvOfTerminalValue: number;
  terminalValue: number;
  cashFlows: PeriodCashFlow[];
  params: DCFParams;
}
