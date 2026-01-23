/**
 * Tests for Raise Scenario Calculator
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDilution,
  calculateRunway,
  assessRunwayRisk,
  calculateBurnRate,
  calculateRaiseScenario,
  buildRaiseScenarioMatrix,
} from '../calculator';
import type { BurnRateComponents, RaiseScenarioInput } from '../types';

describe('calculateDilution', () => {
  it('calculates dilution correctly for equity raise', () => {
    const result = calculateDilution(500_000, 2_000_000);
    
    expect(result.postMoneyValuation).toBe(2_500_000);
    expect(result.dilutionPercent).toBe(0.20); // 500k / 2.5M = 20%
  });

  it('handles small raises', () => {
    const result = calculateDilution(100_000, 2_000_000);
    
    expect(result.postMoneyValuation).toBe(2_100_000);
    expect(result.dilutionPercent).toBeCloseTo(0.0476, 4); // ~4.76%
  });

  it('handles large raises', () => {
    const result = calculateDilution(1_000_000, 2_000_000);
    
    expect(result.postMoneyValuation).toBe(3_000_000);
    expect(result.dilutionPercent).toBeCloseTo(0.333, 3); // ~33.3%
  });

  it('throws for negative pre-money valuation', () => {
    expect(() => calculateDilution(500_000, -1_000_000)).toThrow();
  });

  it('throws for negative raise amount', () => {
    expect(() => calculateDilution(-500_000, 2_000_000)).toThrow();
  });
});

describe('calculateRunway', () => {
  it('calculates runway correctly', () => {
    const runway = calculateRunway(600_000, 50_000);
    expect(runway).toBe(12); // 600k / 50k = 12 months
  });

  it('returns Infinity for zero burn', () => {
    const runway = calculateRunway(100_000, 0);
    expect(runway).toBe(Infinity);
  });

  it('handles fractional months (floors)', () => {
    const runway = calculateRunway(550_000, 50_000);
    expect(runway).toBe(11); // 11.0 months floored
  });
});

describe('assessRunwayRisk', () => {
  it('returns critical for < 6 months', () => {
    expect(assessRunwayRisk(3)).toBe('critical');
    expect(assessRunwayRisk(5)).toBe('critical');
  });

  it('returns low for 6-11 months', () => {
    expect(assessRunwayRisk(6)).toBe('low');
    expect(assessRunwayRisk(11)).toBe('low');
  });

  it('returns moderate for 12-17 months', () => {
    expect(assessRunwayRisk(12)).toBe('moderate');
    expect(assessRunwayRisk(17)).toBe('moderate');
  });

  it('returns comfortable for 18-23 months', () => {
    expect(assessRunwayRisk(18)).toBe('comfortable');
    expect(assessRunwayRisk(23)).toBe('comfortable');
  });

  it('returns extended for 24+ months', () => {
    expect(assessRunwayRisk(24)).toBe('extended');
    expect(assessRunwayRisk(36)).toBe('extended');
  });
});

describe('calculateBurnRate', () => {
  it('calculates total burn correctly', () => {
    const burn = calculateBurnRate(
      3,        // headcount
      80_000,   // avg salary
      1.3,      // benefits multiplier
      5_000,    // monthly marketing
      3_000,    // monthly operations
      0         // COGS
    );

    // Payroll: (3 * 80k * 1.3) / 12 = 26,000/month
    expect(burn.payroll).toBe(26_000);
    expect(burn.marketing).toBe(5_000);
    expect(burn.operations).toBe(3_000);
    expect(burn.total).toBe(34_000);
  });

  it('includes COGS in total burn', () => {
    const burn = calculateBurnRate(2, 60_000, 1.25, 2_000, 1_000, 5_000);
    
    expect(burn.cogs).toBe(5_000);
    expect(burn.total).toBe(burn.payroll + 2_000 + 1_000 + 5_000);
  });
});

describe('calculateRaiseScenario', () => {
  const baseBurnRate: BurnRateComponents = {
    payroll: 25_000,
    marketing: 5_000,
    operations: 3_000,
    cogs: 0,
    total: 33_000,
  };

  it('calculates full scenario correctly', () => {
    const input: RaiseScenarioInput = {
      raiseAmount: 500_000,
      instrument: 'equity',
      preMoneyValuation: 2_000_000,
    };

    const result = calculateRaiseScenario(input, baseBurnRate, 50_000);

    expect(result.raiseAmount).toBe(500_000);
    expect(result.postMoneyValuation).toBe(2_500_000);
    expect(result.dilutionPercent).toBe(0.20);
    expect(result.runwayMonths).toBe(16); // (50k + 500k) / 33k = 16.67 floored
    expect(result.founderOwnershipPost).toBe(0.80); // 1.0 * (1 - 0.20)
    expect(result.investorOwnershipPost).toBe(0.20);
  });

  it('calculates per-dollar metrics', () => {
    const input: RaiseScenarioInput = {
      raiseAmount: 250_000,
      instrument: 'equity',
      preMoneyValuation: 2_000_000,
    };

    const result = calculateRaiseScenario(input, baseBurnRate, 50_000);
    
    // Dilution per $100k: (dilution / amount) * 100k
    const expectedDilutionPerDollar = (result.dilutionPercent / 250_000) * 100_000;
    expect(result.dilutionPerDollar).toBeCloseTo(expectedDilutionPerDollar, 6);
  });

  it('adjusts for SAFE discount', () => {
    const input: RaiseScenarioInput = {
      raiseAmount: 250_000,
      instrument: 'safe',
      preMoneyValuation: 2_000_000,
      safeTerms: {
        valuationCap: 2_000_000,
        discountRate: 0.20, // 20% discount
        mfnClause: true,
        proRataRights: true,
      },
    };

    const result = calculateRaiseScenario(input, baseBurnRate, 50_000);
    
    // Dilution should be higher due to discount
    const baseDilution = 250_000 / (2_000_000 + 250_000);
    expect(result.dilutionPercent).toBeGreaterThan(baseDilution);
  });
});

describe('buildRaiseScenarioMatrix', () => {
  const burnRate: BurnRateComponents = {
    payroll: 20_000,
    marketing: 5_000,
    operations: 5_000,
    cogs: 0,
    total: 30_000,
  };

  it('builds matrix with all default raise amounts', () => {
    const matrix = buildRaiseScenarioMatrix(burnRate, 50_000, 2_000_000);

    expect(matrix.scenarios).toHaveLength(4); // $100k, $250k, $500k, $1M
    expect(matrix.burnRate).toBe(burnRate);
    expect(matrix.currentCash).toBe(50_000);
  });

  it('scenarios are sorted by raise amount', () => {
    const matrix = buildRaiseScenarioMatrix(burnRate, 50_000);

    const amounts = matrix.scenarios.map(s => s.raiseAmount);
    expect(amounts).toEqual([100_000, 250_000, 500_000, 1_000_000]);
  });

  it('provides a recommended scenario', () => {
    const matrix = buildRaiseScenarioMatrix(burnRate, 50_000);

    expect(matrix.recommendedScenario).not.toBeNull();
    expect(matrix.recommendationReason).toContain('Recommended');
  });

  it('allows custom raise amounts', () => {
    const customAmounts = [150_000, 300_000, 750_000];
    const matrix = buildRaiseScenarioMatrix(
      burnRate,
      50_000,
      2_000_000,
      customAmounts
    );

    expect(matrix.scenarios).toHaveLength(3);
    expect(matrix.scenarios.map(s => s.raiseAmount)).toEqual(customAmounts);
  });

  it('handles different instruments', () => {
    const matrix = buildRaiseScenarioMatrix(
      burnRate,
      50_000,
      2_000_000,
      [250_000],
      'safe'
    );

    expect(matrix.scenarios[0].instrument).toBe('safe');
  });

  it('respects founder current ownership', () => {
    // Founder already diluted to 80%
    const matrix = buildRaiseScenarioMatrix(
      burnRate,
      50_000,
      2_000_000,
      [500_000],
      'equity',
      0.80
    );

    // After 20% dilution, should be 80% * 80% = 64%
    expect(matrix.scenarios[0].founderOwnershipPost).toBeCloseTo(0.64, 2);
  });
});

describe('runway risk assessment in scenarios', () => {
  const burnRate: BurnRateComponents = {
    payroll: 40_000,
    marketing: 5_000,
    operations: 5_000,
    cogs: 0,
    total: 50_000,
  };

  it('identifies critical runway with small raise', () => {
    const matrix = buildRaiseScenarioMatrix(
      burnRate,
      0, // No existing cash
      2_000_000,
      [100_000] // Only 2 months runway
    );

    expect(matrix.scenarios[0].runwayRiskLevel).toBe('critical');
  });

  it('identifies extended runway with large raise', () => {
    const matrix = buildRaiseScenarioMatrix(
      burnRate,
      100_000, // Some existing cash
      2_000_000,
      [1_500_000] // 32 months runway
    );

    expect(matrix.scenarios[0].runwayRiskLevel).toBe('extended');
  });
});
