import { describe, it, expect } from 'vitest';
import {
  calculateCost,
  createInterpolator,
  interpolate,
  DEFAULT_COST_POINTS,
} from '../interpolation';
import { CostPoint } from '../types';

describe('COGS Interpolation', () => {
  describe('calculateCost', () => {
    it('returns $96 at 1000 units', () => {
      const result = calculateCost(1000);
      expect(result.costPerUnit).toBe(96);
      expect(result.totalCost).toBe(96000);
      expect(result.atFloor).toBe(false);
    });

    it('returns $82 at 5000 units', () => {
      const result = calculateCost(5000);
      expect(result.costPerUnit).toBe(82);
      expect(result.totalCost).toBe(410000);
      expect(result.atFloor).toBe(true);
    });

    it('interpolates linearly between points', () => {
      // Midpoint: 3000 units should be $89 (halfway between $96 and $82)
      const result = calculateCost(3000);
      expect(result.costPerUnit).toBe(89);
      expect(result.totalCost).toBe(267000);
    });

    it('returns lowest point cost for volumes below minimum', () => {
      const result = calculateCost(500);
      expect(result.costPerUnit).toBe(96);
      expect(result.atFloor).toBe(false);
    });

    it('returns floor cost for volumes above maximum', () => {
      const result = calculateCost(10000);
      expect(result.costPerUnit).toBe(82);
      expect(result.atFloor).toBe(true);
    });

    it('throws error for zero volume', () => {
      expect(() => calculateCost(0)).toThrow('Volume must be greater than 0');
    });

    it('throws error for negative volume', () => {
      expect(() => calculateCost(-100)).toThrow('Volume must be greater than 0');
    });

    it('calculates correct intermediate values', () => {
      // 2000 units: 1/4 of the way from 1000 to 5000
      // Cost should be 96 - (14 * 0.25) = 96 - 3.5 = 92.5
      const result = calculateCost(2000);
      expect(result.costPerUnit).toBe(92.5);
    });

    it('handles custom cost points', () => {
      const customPoints: CostPoint[] = [
        { volume: 100, costPerUnit: 50 },
        { volume: 1000, costPerUnit: 40 },
      ];
      const result = calculateCost(550, customPoints);
      expect(result.costPerUnit).toBe(45);
    });

    it('handles custom minimum floor', () => {
      const result = calculateCost(10000, DEFAULT_COST_POINTS, 85);
      expect(result.costPerUnit).toBe(85);
      expect(result.atFloor).toBe(true);
    });
  });

  describe('createInterpolator', () => {
    it('creates a reusable interpolator function', () => {
      const customInterpolate = createInterpolator({
        points: [
          { volume: 500, costPerUnit: 100 },
          { volume: 2000, costPerUnit: 80 },
        ],
      });

      const result = customInterpolate(1250);
      expect(result.costPerUnit).toBe(90);
    });

    it('throws error with fewer than 2 points', () => {
      expect(() =>
        createInterpolator({ points: [{ volume: 1000, costPerUnit: 96 }] })
      ).toThrow('At least 2 cost points are required');
    });

    it('uses custom minimum floor', () => {
      const customInterpolate = createInterpolator({
        points: [
          { volume: 1000, costPerUnit: 96 },
          { volume: 5000, costPerUnit: 82 },
        ],
        minCostFloor: 85,
      });

      const result = customInterpolate(10000);
      expect(result.costPerUnit).toBe(85);
    });

    it('sorts points regardless of input order', () => {
      const customInterpolate = createInterpolator({
        points: [
          { volume: 5000, costPerUnit: 82 },
          { volume: 1000, costPerUnit: 96 },
        ],
      });

      const result = customInterpolate(3000);
      expect(result.costPerUnit).toBe(89);
    });
  });

  describe('default interpolate', () => {
    it('uses default cost points', () => {
      const result = interpolate(3000);
      expect(result.costPerUnit).toBe(89);
    });
  });

  describe('multi-point interpolation', () => {
    const threePoints: CostPoint[] = [
      { volume: 1000, costPerUnit: 100 },
      { volume: 3000, costPerUnit: 90 },
      { volume: 5000, costPerUnit: 75 },
    ];

    it('interpolates between first and second points', () => {
      const result = calculateCost(2000, threePoints);
      expect(result.costPerUnit).toBe(95);
    });

    it('interpolates between second and third points', () => {
      const result = calculateCost(4000, threePoints);
      expect(result.costPerUnit).toBe(82.5);
    });

    it('uses lowest cost as floor beyond last point', () => {
      const result = calculateCost(10000, threePoints);
      expect(result.costPerUnit).toBe(75);
      expect(result.atFloor).toBe(true);
    });
  });
});
