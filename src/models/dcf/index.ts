/**
 * DCF (Discounted Cash Flow) Model
 * 
 * A comprehensive DCF valuation engine providing:
 * - Free Cash Flow (FCF) calculation
 * - Net Present Value (NPV) calculation
 * - Internal Rate of Return (IRR) calculation
 * - Terminal Value (Gordon Growth & Exit Multiple)
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
} from './types';

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
} from './terminal';

// Re-export types namespace for convenience
import * as types from './types';
export { types };
