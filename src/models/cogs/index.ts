/**
 * COGS (Cost of Goods Sold) Module
 *
 * Provides volume-based cost interpolation for pricing calculations.
 */

export * from './types';
export {
  DEFAULT_COST_POINTS,
  createInterpolator,
  calculateCost,
  interpolate,
} from './interpolation';
