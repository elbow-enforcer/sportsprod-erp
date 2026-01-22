import { describe, it, expect } from 'vitest';
import { scenarios, baseParams, getScenarioParams } from '../scenarios';

describe('scenarios', () => {
  it('should have all 5 scenarios defined', () => {
    const expectedScenarios = ['max', 'upside', 'base', 'downside', 'min'];
    expect(Object.keys(scenarios)).toEqual(expect.arrayContaining(expectedScenarios));
    expect(Object.keys(scenarios).length).toBe(5);
  });

  it('should have correct base parameters', () => {
    expect(baseParams.L).toBe(42.14);
    expect(baseParams.x0).toBe(2018.97);
    expect(baseParams.k).toBe(0.48);
  });

  describe('getScenarioParams', () => {
    it('should return correct params for base scenario', () => {
      const params = getScenarioParams('base');
      expect(params.L).toBe(42.14);
      expect(params.x0).toBe(2018.97);
      expect(params.k).toBe(0.48);
      expect(params.b).toBe(-0.66);
    });

    it('should apply x0Shift correctly for max scenario', () => {
      const params = getScenarioParams('max');
      expect(params.x0).toBe(2018.97 - 4);
    });

    it('should apply kMultiplier correctly for max scenario', () => {
      const params = getScenarioParams('max');
      expect(params.k).toBe(0.48 * 2.0);
    });

    it('should apply x0Shift correctly for min scenario', () => {
      const params = getScenarioParams('min');
      expect(params.x0).toBe(2018.97 + 2);
    });

    it('should apply kMultiplier correctly for min scenario', () => {
      const params = getScenarioParams('min');
      expect(params.k).toBe(0.48 * 0.25);
    });

    it('should throw for unknown scenario', () => {
      expect(() => getScenarioParams('invalid')).toThrow('Unknown scenario: invalid');
    });
  });

  describe('scenario ordering', () => {
    it('max should have earliest midpoint (most aggressive)', () => {
      const max = getScenarioParams('max');
      const base = getScenarioParams('base');
      const min = getScenarioParams('min');

      expect(max.x0).toBeLessThan(base.x0);
      expect(base.x0).toBeLessThanOrEqual(min.x0);
    });

    it('max should have steepest curve', () => {
      const max = getScenarioParams('max');
      const base = getScenarioParams('base');
      const min = getScenarioParams('min');

      expect(max.k).toBeGreaterThan(base.k);
      expect(base.k).toBeGreaterThan(min.k);
    });
  });
});
