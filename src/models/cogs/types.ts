/**
 * COGS (Cost of Goods Sold) Types
 */

/**
 * A data point for volume-cost interpolation
 */
export interface CostPoint {
  /** Number of units */
  volume: number;
  /** Cost per unit in dollars */
  costPerUnit: number;
}

/**
 * Configuration for the interpolation table
 */
export interface InterpolationConfig {
  /** Known cost points for interpolation */
  points: CostPoint[];
  /** Optional minimum cost floor (defaults to lowest point cost) */
  minCostFloor?: number;
}

/**
 * Result of a cost calculation
 */
export interface CostCalculationResult {
  /** The input volume */
  volume: number;
  /** Calculated cost per unit */
  costPerUnit: number;
  /** Total cost for the volume */
  totalCost: number;
  /** Whether the result hit the minimum cost floor */
  atFloor: boolean;
}
