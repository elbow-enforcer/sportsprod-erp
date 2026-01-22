/**
 * COGS Volume-Cost Interpolation
 *
 * Calculates cost per unit based on volume using linear interpolation
 * between known price points.
 *
 * Default points:
 *   - $96 @ 1000 units
 *   - $82 @ 5000 units
 */

import { CostPoint, InterpolationConfig, CostCalculationResult } from './types';

/** Default cost points for interpolation */
export const DEFAULT_COST_POINTS: CostPoint[] = [
  { volume: 1000, costPerUnit: 96 },
  { volume: 5000, costPerUnit: 82 },
];

/**
 * Creates an interpolation function with the given configuration
 */
export function createInterpolator(config?: Partial<InterpolationConfig>) {
  const points = [...(config?.points ?? DEFAULT_COST_POINTS)].sort(
    (a, b) => a.volume - b.volume
  );

  if (points.length < 2) {
    throw new Error('At least 2 cost points are required for interpolation');
  }

  const minCostFloor =
    config?.minCostFloor ?? Math.min(...points.map((p) => p.costPerUnit));

  return (volume: number): CostCalculationResult => {
    return calculateCost(volume, points, minCostFloor);
  };
}

/**
 * Calculate cost per unit for a given volume using linear interpolation
 */
export function calculateCost(
  volume: number,
  points: CostPoint[] = DEFAULT_COST_POINTS,
  minCostFloor?: number
): CostCalculationResult {
  if (volume <= 0) {
    throw new Error('Volume must be greater than 0');
  }

  const sortedPoints = [...points].sort((a, b) => a.volume - b.volume);
  const floor = minCostFloor ?? Math.min(...sortedPoints.map((p) => p.costPerUnit));

  let costPerUnit: number;
  let atFloor = false;

  // Below lowest point: use lowest point's cost
  if (volume <= sortedPoints[0].volume) {
    costPerUnit = sortedPoints[0].costPerUnit;
  }
  // Above highest point: use floor
  else if (volume >= sortedPoints[sortedPoints.length - 1].volume) {
    costPerUnit = floor;
    atFloor = true;
  }
  // Interpolate between points
  else {
    // Find the two points to interpolate between
    let lowerPoint = sortedPoints[0];
    let upperPoint = sortedPoints[1];

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (volume >= sortedPoints[i].volume && volume <= sortedPoints[i + 1].volume) {
        lowerPoint = sortedPoints[i];
        upperPoint = sortedPoints[i + 1];
        break;
      }
    }

    // Linear interpolation formula
    const volumeRange = upperPoint.volume - lowerPoint.volume;
    const costRange = upperPoint.costPerUnit - lowerPoint.costPerUnit;
    const volumeOffset = volume - lowerPoint.volume;

    costPerUnit = lowerPoint.costPerUnit + (costRange * volumeOffset) / volumeRange;

    // Apply floor if interpolated value is below it
    if (costPerUnit < floor) {
      costPerUnit = floor;
      atFloor = true;
    }
  }

  return {
    volume,
    costPerUnit: Math.round(costPerUnit * 100) / 100, // Round to 2 decimal places
    totalCost: Math.round(volume * costPerUnit * 100) / 100,
    atFloor,
  };
}

/**
 * Default interpolator using standard cost points
 */
export const interpolate = createInterpolator();
