/**
 * COGS (Cost of Goods Sold) Module
 *
 * Provides volume-based cost interpolation and breakdown calculations.
 */

export * from './types';
export {
  DEFAULT_COST_POINTS,
  createInterpolator,
  calculateCost,
  interpolate,
} from './interpolation';
export {
  DEFAULT_COGS_BREAKDOWN,
  calculateCOGSBreakdown,
  createBreakdownCalculator,
  applyCostReduction,
  projectCOGSBreakdown,
} from './breakdown';
