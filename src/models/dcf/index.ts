/**
 * DCF (Discounted Cash Flow) Model
 * 
 * A comprehensive DCF valuation engine providing:
 * - Free Cash Flow (FCF) calculation
 * - Net Present Value (NPV) calculation
 * - Internal Rate of Return (IRR) calculation
 * - Terminal Value (Gordon Growth & Exit Multiple)
 * - Full DCF Valuation Calculator
 */

// Type exports
export type {
  FCFInputs,
  FCFResult,
  DCFParams,
  PeriodCashFlow,
  NPVResult,
  IRRResult,
  TerminalValueMethod,
  TerminalValueInputs,
  TerminalValueResult,
  DCFValuation,
  ComparableCompany,
  TerminalValueComparison,
  TerminalValueBreakdown,
} from './types';

// Calculator type exports
export type {
  YearlyProjection,
  DCFResult,
} from './calculator';

// FCF exports
export {
  calculateFCF,
  calculateFCFSeries,
  projectFCF,
} from './fcf';

// NPV exports
export {
  calculateNPV,
  calculateNPVWithPeriods,
  calculateDiscountFactor,
  calculatePresentValue,
} from './npv';

// IRR exports
export {
  calculateIRR,
  calculateMIRR,
} from './irr';

// Terminal Value exports
export {
  calculateTerminalValue,
  calculateGordonGrowthTV,
  calculateExitMultipleTV,
  calculateImpliedMultiple,
  calculateImpliedGrowthRate,
  compareTerminalValueMethods,
  getTerminalValueBreakdown,
  getComparableCompanies,
  getComparableMultipleStats,
  COMPARABLE_COMPANIES,
} from './terminal';

// DCF Calculator exports
export {
  calculateDCF,
  calculateAllScenarios,
  calculateIRRSimple,
  calculateNPVWithEffectiveDate,
  calculateIRRRelativeToCohort,
  calculateMetricsAtEffectiveDate,
  calculatePaybackPeriod,
  calculateDiscountedPaybackPeriod,
  formatCurrency,
  getValuationSummary,
} from './calculator';

// FCF Projections exports
export {
  projectFCFByScenario,
  projectFCFAllScenarios,
  getFCFComponentBreakdown,
  formatFCFCurrency,
  formatFCFPercent,
} from './fcfProjections';

export type {
  FCFYearComponents,
  FCFProjectionResult,
  FCFScenarioComparison,
  FCFComponentBreakdown,
} from './fcfProjections';

// Re-export types namespace for convenience
import * as types from './types';
export { types };
