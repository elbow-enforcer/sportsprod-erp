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

/**
 * Individual COGS line item breakdown
 */
export interface COGSLineItem {
  /** Category identifier */
  category: 'manufacturing' | 'freight' | 'packaging' | 'duties';
  /** Display name */
  name: string;
  /** Cost per unit in dollars */
  perUnit: number;
  /** Total cost for volume */
  total: number;
  /** Percentage of total COGS */
  percentage: number;
}

/**
 * Configuration for COGS breakdown calculation
 */
export interface COGSBreakdownConfig {
  /** Manufacturing/production cost per unit */
  manufacturingCost: number;
  /** Overseas freight/transport cost per unit */
  freightCost: number;
  /** Packaging cost per unit (box, inserts, materials) */
  packagingCost: number;
  /** Import duties per unit (if applicable) */
  dutiesCost: number;
}

/**
 * Result of a full COGS breakdown calculation
 */
export interface COGSBreakdownResult {
  /** Number of units */
  volume: number;
  /** Individual line items */
  lineItems: COGSLineItem[];
  /** Total cost per unit across all categories */
  totalPerUnit: number;
  /** Total cost for the volume */
  totalCost: number;
  /** Summary by category */
  summary: {
    manufacturing: number;
    freight: number;
    packaging: number;
    duties: number;
  };
}
