/**
 * @file revenueByScenario.test.ts
 * @description Tests for revenue by scenario calculations
 * @related-prd Issue #5: Revenue by Scenario
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRevenue,
  calculateScenarioRevenue,
  calculateAllScenariosRevenue,
  getRevenueMatrix,
  SCENARIO_NAMES,
  DEFAULT_DISCOUNT_RATE,
} from '../revenueByScenario';

describe('calculateRevenue', () => {
  it('calculates revenue correctly with no discount', () => {
    expect(calculateRevenue(100, 1000, 0)).toBe(100_000);
  });

  it('calculates revenue correctly with 10% discount', () => {
    expect(calculateRevenue(100, 1000, 0.10)).toBe(90_000);
  });

  it('calculates revenue correctly with 25% discount', () => {
    expect(calculateRevenue(100, 1000, 0.25)).toBe(75_000);
  });

  it('returns 0 for 0 units', () => {
    expect(calculateRevenue(0, 1000, 0.10)).toBe(0);
  });
});

describe('calculateScenarioRevenue', () => {
  it('returns correct structure for base scenario', () => {
    const result = calculateScenarioRevenue('base', 5);

    expect(result.scenario).toBe('base');
    expect(result.years).toHaveLength(5);
    expect(result.years[0]).toHaveProperty('year');
    expect(result.years[0]).toHaveProperty('units');
    expect(result.years[0]).toHaveProperty('grossRevenue');
    expect(result.years[0]).toHaveProperty('discountAmount');
    expect(result.years[0]).toHaveProperty('netRevenue');
  });

  it('calculates totals correctly', () => {
    const result = calculateScenarioRevenue('base', 3, 1000, 0.10);

    const expectedTotalUnits = result.years.reduce((sum, y) => sum + y.units, 0);
    const expectedTotalNetRevenue = result.years.reduce((sum, y) => sum + y.netRevenue, 0);

    expect(result.totalUnits).toBe(expectedTotalUnits);
    expect(result.totalNetRevenue).toBe(expectedTotalNetRevenue);
  });

  it('applies discount correctly', () => {
    const result = calculateScenarioRevenue('base', 1, 1000, 0.10);
    const year1 = result.years[0];

    expect(year1.netRevenue).toBeCloseTo(year1.grossRevenue * 0.9);
    expect(year1.discountAmount).toBeCloseTo(year1.grossRevenue * 0.1);
  });
});

describe('calculateAllScenariosRevenue', () => {
  it('returns data for all 5 scenarios', () => {
    const results = calculateAllScenariosRevenue(3);

    expect(results).toHaveLength(5);
    expect(results.map((r) => r.scenario)).toEqual(SCENARIO_NAMES);
  });

  it('max scenario has highest revenue', () => {
    const results = calculateAllScenariosRevenue(10);
    const maxRevenue = results.find((r) => r.scenario === 'max')!.totalNetRevenue;
    const minRevenue = results.find((r) => r.scenario === 'min')!.totalNetRevenue;

    expect(maxRevenue).toBeGreaterThan(minRevenue);
  });
});

describe('getRevenueMatrix', () => {
  it('returns a matrix with all scenarios', () => {
    const matrix = getRevenueMatrix(5);

    expect(Object.keys(matrix)).toEqual(SCENARIO_NAMES);
    expect(matrix.base).toHaveLength(5);
  });

  it('values match calculateScenarioRevenue', () => {
    const matrix = getRevenueMatrix(3, 1000, 0.10);
    const baseScenario = calculateScenarioRevenue('base', 3, 1000, 0.10);

    expect(matrix.base).toEqual(baseScenario.years.map((y) => y.netRevenue));
  });
});

describe('DEFAULT_DISCOUNT_RATE', () => {
  it('is 10%', () => {
    expect(DEFAULT_DISCOUNT_RATE).toBe(0.10);
  });
});
