import { describe, it, expect } from 'vitest';
import {
  calculateDailySalesRate,
  calculateReorderPoint,
  calculateSafetyStock,
  calculateWorkingCapital,
  shouldReorder,
  calculateOrderQuantity,
} from '../calculator';

describe('Inventory Calculator', () => {
  describe('calculateDailySalesRate', () => {
    it('should calculate daily rate from annual units', () => {
      expect(calculateDailySalesRate(365)).toBeCloseTo(1, 5);
      expect(calculateDailySalesRate(3650)).toBeCloseTo(10, 5);
      expect(calculateDailySalesRate(10000)).toBeCloseTo(27.397, 2);
    });

    it('should handle zero annual units', () => {
      expect(calculateDailySalesRate(0)).toBe(0);
    });
  });

  describe('calculateReorderPoint', () => {
    it('should calculate reorder point correctly', () => {
      // Daily rate of 10 units, 90 day lead time, 30 day safety
      // Lead time demand: 10 * 90 = 900
      // Safety stock: 10 * 30 = 300
      // Reorder point: 900 + 300 = 1200
      const result = calculateReorderPoint(10, 90, 30);
      expect(result).toBe(1200);
    });

    it('should round up to whole units', () => {
      // 27.397 daily * 90 lead = 2465.75 + (27.397 * 30 = 821.92 safety) = 3287.67
      const result = calculateReorderPoint(27.397, 90, 30);
      expect(result).toBe(3288);
    });

    it('should handle zero daily rate', () => {
      expect(calculateReorderPoint(0, 90, 30)).toBe(0);
    });
  });

  describe('calculateSafetyStock', () => {
    it('should calculate safety stock correctly', () => {
      expect(calculateSafetyStock(10, 30)).toBe(300);
      expect(calculateSafetyStock(27.397, 30)).toBe(822);
    });

    it('should handle zero values', () => {
      expect(calculateSafetyStock(0, 30)).toBe(0);
      expect(calculateSafetyStock(10, 0)).toBe(0);
    });
  });

  describe('calculateWorkingCapital', () => {
    it('should calculate working capital correctly', () => {
      // 1000 units at $200 each = $200,000
      expect(calculateWorkingCapital(1000, 200)).toBe(200000);
    });

    it('should handle zero inventory', () => {
      expect(calculateWorkingCapital(0, 200)).toBe(0);
    });

    it('should handle zero unit cost', () => {
      expect(calculateWorkingCapital(1000, 0)).toBe(0);
    });
  });

  describe('shouldReorder', () => {
    it('should return true when inventory is below reorder point', () => {
      expect(shouldReorder(100, 200)).toBe(true);
    });

    it('should return true when inventory equals reorder point', () => {
      expect(shouldReorder(200, 200)).toBe(true);
    });

    it('should return false when inventory is above reorder point', () => {
      expect(shouldReorder(300, 200)).toBe(false);
    });
  });

  describe('calculateOrderQuantity', () => {
    it('should return MOQ when needed quantity is less than MOQ', () => {
      // Need 500 units to reach target, MOQ is 1000
      expect(calculateOrderQuantity(1500, 1000, 1000)).toBe(1000);
    });

    it('should round up to MOQ multiple when needed exceeds MOQ', () => {
      // Need 1500 units, MOQ is 1000, should order 2000
      expect(calculateOrderQuantity(2500, 1000, 1000)).toBe(2000);
    });

    it('should return zero when current exceeds target', () => {
      expect(calculateOrderQuantity(1000, 1500, 1000)).toBe(0);
    });

    it('should handle exact MOQ multiples', () => {
      expect(calculateOrderQuantity(3000, 1000, 1000)).toBe(2000);
    });
  });
});
