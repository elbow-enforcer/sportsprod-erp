import {
  projectFCFByScenario,
  projectFCFAllScenarios,
  getFCFComponentBreakdown,
  formatFCFCurrency,
  formatFCFPercent,
  type FCFYearComponents,
  type FCFProjectionResult,
} from '../fcfProjections';
import { DEFAULT_ASSUMPTIONS } from '../../assumptions/defaults';

describe('FCF Projections', () => {
  describe('projectFCFByScenario', () => {
    it('should calculate FCF for base scenario over 5 years', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      expect(result.scenario).toBe('base');
      expect(result.scenarioLabel).toBe('Base');
      expect(result.years).toHaveLength(5);
    });

    it('should include all FCF components for each year', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const year1 = result.years[0];

      // Check all required fields are present
      expect(year1).toHaveProperty('year');
      expect(year1).toHaveProperty('units');
      expect(year1).toHaveProperty('revenue');
      expect(year1).toHaveProperty('cogs');
      expect(year1).toHaveProperty('grossProfit');
      expect(year1).toHaveProperty('ebitda');
      expect(year1).toHaveProperty('taxes');
      expect(year1).toHaveProperty('capex');
      expect(year1).toHaveProperty('workingCapitalChange');
      expect(year1).toHaveProperty('fcf');
      expect(year1).toHaveProperty('discountFactor');
      expect(year1).toHaveProperty('presentValue');
    });

    it('should verify FCF formula: FCF = NOPAT + D&A - CapEx - ΔWC', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        const expectedFCF = year.nopat + year.depreciation - year.capex - year.workingCapitalChange;
        expect(year.fcf).toBeCloseTo(expectedFCF, 2);
      }
    });

    it('should calculate cumulative FCF correctly', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      let cumulativeFCF = 0;
      for (const year of result.years) {
        cumulativeFCF += year.fcf;
        expect(year.cumulativeFCF).toBeCloseTo(cumulativeFCF, 2);
      }
    });

    it('should calculate present value with discount factor', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const discountRate = DEFAULT_ASSUMPTIONS.corporate.discountRate;

      for (const year of result.years) {
        const expectedDF = 1 / Math.pow(1 + discountRate, year.year);
        expect(year.discountFactor).toBeCloseTo(expectedDF, 4);
        expect(year.presentValue).toBeCloseTo(year.fcf * year.discountFactor, 2);
      }
    });

    it('should calculate total revenue correctly', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const sumRevenue = result.years.reduce((sum, y) => sum + y.revenue, 0);
      expect(result.totalRevenue).toBeCloseTo(sumRevenue, 2);
    });

    it('should calculate total PV correctly', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const sumPV = result.years.reduce((sum, y) => sum + y.presentValue, 0);
      expect(result.totalPV).toBeCloseTo(sumPV, 2);
    });

    it('should handle different projection years', () => {
      const result5 = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const result10 = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 10);

      expect(result5.years).toHaveLength(5);
      expect(result10.years).toHaveLength(10);

      // First 5 years should be identical
      for (let i = 0; i < 5; i++) {
        expect(result5.years[i].fcf).toBeCloseTo(result10.years[i].fcf, 2);
      }
    });

    it('should identify break-even year when cumulative FCF turns positive', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 10);

      if (result.breakEvenYear !== null) {
        // Cumulative FCF should be positive at break-even year
        const breakEvenYearData = result.years[result.breakEvenYear - 1];
        expect(breakEvenYearData.cumulativeFCF).toBeGreaterThan(0);

        // And negative in the year before (if not year 1)
        if (result.breakEvenYear > 1) {
          const prevYearData = result.years[result.breakEvenYear - 2];
          expect(prevYearData.cumulativeFCF).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('projectFCFAllScenarios', () => {
    it('should calculate FCF for all 5 scenarios', () => {
      const result = projectFCFAllScenarios(DEFAULT_ASSUMPTIONS, 5);

      expect(result.scenarioOrder).toEqual(['max', 'upside', 'base', 'downside', 'min']);
      expect(Object.keys(result.scenarios)).toHaveLength(5);
    });

    it('should identify best and worst cases correctly', () => {
      const result = projectFCFAllScenarios(DEFAULT_ASSUMPTIONS, 5);

      // Best case should have highest FCF
      const allFCFs = result.scenarioOrder.map((s) => result.scenarios[s].totalFCF);
      expect(result.bestCase.totalFCF).toBe(Math.max(...allFCFs));
      expect(result.worstCase.totalFCF).toBe(Math.min(...allFCFs));
    });

    it('should have max scenario produce higher FCF than min scenario', () => {
      const result = projectFCFAllScenarios(DEFAULT_ASSUMPTIONS, 5);

      expect(result.scenarios['max'].totalFCF).toBeGreaterThan(result.scenarios['min'].totalFCF);
    });

    it('should have base case correctly identified', () => {
      const result = projectFCFAllScenarios(DEFAULT_ASSUMPTIONS, 5);

      expect(result.baseCase.scenario).toBe('base');
      expect(result.baseCase.totalFCF).toBe(result.scenarios['base'].totalFCF);
    });
  });

  describe('getFCFComponentBreakdown', () => {
    it('should return breakdown for each year', () => {
      const fcfResult = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const breakdown = getFCFComponentBreakdown(fcfResult);

      expect(breakdown).toHaveLength(5);
    });

    it('should have negative values for uses of cash', () => {
      const fcfResult = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const breakdown = getFCFComponentBreakdown(fcfResult);

      for (const year of breakdown) {
        // Taxes, CapEx, WC increase should be negative in breakdown
        expect(year.taxes).toBeLessThanOrEqual(0);
        expect(year.capex).toBeLessThanOrEqual(0);
        // WC change can be positive (release) or negative (use)
      }
    });

    it('should match original data', () => {
      const fcfResult = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);
      const breakdown = getFCFComponentBreakdown(fcfResult);

      for (let i = 0; i < 5; i++) {
        expect(breakdown[i].year).toBe(fcfResult.years[i].year);
        expect(breakdown[i].ebitda).toBe(fcfResult.years[i].ebitda);
        expect(breakdown[i].fcf).toBe(fcfResult.years[i].fcf);
      }
    });
  });

  describe('formatFCFCurrency', () => {
    it('should format billions correctly', () => {
      expect(formatFCFCurrency(1_500_000_000)).toBe('$1.50B');
    });

    it('should format millions correctly', () => {
      expect(formatFCFCurrency(2_500_000)).toBe('$2.50M');
    });

    it('should format thousands correctly', () => {
      expect(formatFCFCurrency(150_000)).toBe('$150K');
    });

    it('should format small values correctly', () => {
      expect(formatFCFCurrency(500)).toBe('$500');
    });

    it('should handle negative values', () => {
      expect(formatFCFCurrency(-1_500_000)).toBe('-$1.50M');
    });

    it('should format non-compact values', () => {
      const result = formatFCFCurrency(1_234_567, false);
      expect(result).toBe('$1,234,567');
    });
  });

  describe('formatFCFPercent', () => {
    it('should format positive percentages', () => {
      expect(formatFCFPercent(25.5)).toBe('25.5%');
    });

    it('should format negative percentages', () => {
      expect(formatFCFPercent(-10.2)).toBe('-10.2%');
    });

    it('should format zero', () => {
      expect(formatFCFPercent(0)).toBe('0.0%');
    });
  });

  describe('margin calculations', () => {
    it('should calculate correct gross margin percentage', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        if (year.revenue > 0) {
          const expectedMargin = (year.grossProfit / year.revenue) * 100;
          expect(year.grossMarginPct).toBeCloseTo(expectedMargin, 2);
        }
      }
    });

    it('should calculate correct EBITDA margin percentage', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        if (year.revenue > 0) {
          const expectedMargin = (year.ebitda / year.revenue) * 100;
          expect(year.ebitdaMarginPct).toBeCloseTo(expectedMargin, 2);
        }
      }
    });

    it('should calculate correct FCF margin percentage', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        if (year.revenue > 0) {
          const expectedMargin = (year.fcf / year.revenue) * 100;
          expect(year.fcfMarginPct).toBeCloseTo(expectedMargin, 2);
        }
      }
    });
  });

  describe('tax calculations', () => {
    it('should only apply taxes when EBIT is positive', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        if (year.ebit <= 0) {
          expect(year.taxes).toBe(0);
        } else {
          const expectedTax = year.ebit * year.taxRate;
          expect(year.taxes).toBeCloseTo(expectedTax, 2);
        }
      }
    });

    it('should calculate NOPAT correctly', () => {
      const result = projectFCFByScenario('base', DEFAULT_ASSUMPTIONS, 5);

      for (const year of result.years) {
        const expectedNOPAT = year.ebit - year.taxes;
        expect(year.nopat).toBeCloseTo(expectedNOPAT, 2);
      }
    });
  });
});
