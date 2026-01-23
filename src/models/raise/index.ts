/**
 * Raise Scenario Module
 * 
 * Capital raise scenario analysis and comparison tools.
 */

export type {
  RaiseInstrument,
  SAFETerms,
  ConvertibleDebtTerms,
  EquityTerms,
  RaiseScenarioInput,
  BurnRateComponents,
  RaiseScenarioResult,
  RaiseScenarioMatrix,
} from './types';

export {
  DEFAULT_RAISE_AMOUNTS,
  DEFAULT_PRE_MONEY_VALUATION,
  FOUNDER_STARTING_OWNERSHIP,
} from './types';

export {
  calculateDilution,
  calculateRunway,
  assessRunwayRisk,
  calculateBurnRate,
  calculateRaiseScenario,
  buildRaiseScenarioMatrix,
  formatRaiseCurrency,
  formatRaisePercent,
} from './calculator';
