import { describe, it, expect } from 'vitest';
import {
  projectUnits,
  getAnnualProjections,
  getMonthlyProjections,
  getSigmoidValue
} from '../projections';
import { baseParams } from '../scenarios';

describe('projectUnits', () => {
  it('should apply linear regression formula correctly', () => {
    // Units = 571.01 × sigmoidValue - 695.89
    const sigmoidValue = 20;
    const expected = 571.01 * 20 - 695.89;
    expect(projectUnits(sigmoidValue)).toBeCloseTo(expected, 5);
  });

  it('should return negative for low sigmoid values', () => {
    const sigmoidValue = 1;
    const result = projectUnits(sigmoidValue);
    expect(result).toBeLessThan(0);
  });

  it('should return positive for high sigmoid values', () => {
    const sigmoidValue = 30;
    const result = projectUnits(sigmoidValue);
    expect(result).toBeGreaterThan(0);
  });
});

describe('getAnnualProjections', () => {
  it('should return correct number of years', () => {
    const projections = getAnnualProjections('base', 2024, 5);
    expect(projections.length).toBe(5);
  });

  it('should floor negative projections to 0', () => {
    // Very early year should result in floored value
    const projections = getAnnualProjections('min', 2000, 1);
    expect(projections[0]).toBeGreaterThanOrEqual(0);
  });

  it('should produce increasing values over time', () => {
    const projections = getAnnualProjections('base', 2020, 5);
    for (let i = 1; i < projections.length; i++) {
      expect(projections[i]).toBeGreaterThanOrEqual(projections[i - 1]);
    }
  });

  it('max scenario should produce higher values than min', () => {
    const maxProj = getAnnualProjections('max', 2024, 1)[0];
    const minProj = getAnnualProjections('min', 2024, 1)[0];
    expect(maxProj).toBeGreaterThan(minProj);
  });
});

describe('getMonthlyProjections', () => {
  it('should return 12 months', () => {
    const monthly = getMonthlyProjections(12000, 0.02);
    expect(monthly.length).toBe(12);
  });

  it('should sum to annual units', () => {
    const annualUnits = 12000;
    const monthly = getMonthlyProjections(annualUnits, 0.02);
    const sum = monthly.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(annualUnits, 5);
  });

  it('should distribute evenly when growth rate is 0', () => {
    const annualUnits = 12000;
    const monthly = getMonthlyProjections(annualUnits, 0);
    monthly.forEach(m => {
      expect(m).toBeCloseTo(1000, 5);
    });
  });

  it('should apply seasonality with positive factor (peak in Q3)', () => {
    const monthly = getMonthlyProjections(12000, 0.05);
    // With sine wave seasonality, values vary but sum to annual
    const sum = monthly.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(12000, 0);
    // Peak should be around August (index 7)
    const maxMonth = monthly.indexOf(Math.max(...monthly));
    expect(maxMonth).toBeGreaterThanOrEqual(5);
    expect(maxMonth).toBeLessThanOrEqual(9);
  });

  it('should apply inverted seasonality with negative factor', () => {
    const monthly = getMonthlyProjections(12000, -0.05);
    // With negative seasonality, pattern inverts
    const sum = monthly.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(12000, 0);
    // Trough should be around summer months
    const minMonth = monthly.indexOf(Math.min(...monthly));
    expect(minMonth).toBeGreaterThanOrEqual(5);
    expect(minMonth).toBeLessThanOrEqual(9);
  });
});

describe('getSigmoidValue', () => {
  it('should return midpoint value at x0 for base scenario', () => {
    const result = getSigmoidValue('base', baseParams.x0);
    // At midpoint: L/2 + b = 42.14/2 + (-0.66) = 20.41
    const expected = baseParams.L / 2 + (-0.66);
    expect(result).toBeCloseTo(expected, 5);
  });

  it('should throw for invalid scenario', () => {
    expect(() => getSigmoidValue('invalid', 2024)).toThrow();
  });
});
