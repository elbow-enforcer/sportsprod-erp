import {
  // FCF
  calculateFCF,
  calculateFCFSeries,
  projectFCF,
  // NPV
  calculateNPV,
  calculateNPVWithPeriods,
  calculateDiscountFactor,
  calculatePresentValue,
  // IRR
  calculateIRR,
  calculateMIRR,
  // Terminal Value
  calculateTerminalValue,
  calculateGordonGrowthTV,
  calculateExitMultipleTV,
  calculateImpliedMultiple,
  calculateImpliedGrowthRate,
  compareTerminalValueMethods,
  getTerminalValueBreakdown,
  getComparableCompanies,
  getComparableMultipleStats,
  COMPARABLE_COMPANIES,
} from '../index';

describe('DCF Model', () => {
  describe('Free Cash Flow (FCF)', () => {
    describe('calculateFCF', () => {
      it('should calculate FCF correctly', () => {
        const result = calculateFCF({
          ebitda: 1000000,
          capex: 200000,
          workingCapitalChange: 50000,
          taxes: 150000,
        });

        expect(result.fcf).toBe(600000);
      });

      it('should handle negative working capital change (release)', () => {
        const result = calculateFCF({
          ebitda: 500000,
          capex: 100000,
          workingCapitalChange: -25000, // WC release adds to FCF
          taxes: 75000,
        });

        expect(result.fcf).toBe(350000);
      });

      it('should handle zero values', () => {
        const result = calculateFCF({
          ebitda: 100000,
          capex: 0,
          workingCapitalChange: 0,
          taxes: 0,
        });

        expect(result.fcf).toBe(100000);
      });

      it('should throw on invalid EBITDA', () => {
        expect(() =>
          calculateFCF({
            ebitda: NaN,
            capex: 100,
            workingCapitalChange: 0,
            taxes: 0,
          })
        ).toThrow('EBITDA must be a valid number');
      });
    });

    describe('calculateFCFSeries', () => {
      it('should calculate FCF for multiple periods', () => {
        const results = calculateFCFSeries([
          { ebitda: 100, capex: 20, workingCapitalChange: 5, taxes: 15 },
          { ebitda: 120, capex: 25, workingCapitalChange: 6, taxes: 18 },
        ]);

        expect(results).toHaveLength(2);
        expect(results[0].fcf).toBe(60);
        expect(results[1].fcf).toBe(71);
      });
    });

    describe('projectFCF', () => {
      it('should project FCF with growth rate', () => {
        const projections = projectFCF(100, 0.1, 3);

        expect(projections).toHaveLength(3);
        expect(projections[0]).toBeCloseTo(110, 2);
        expect(projections[1]).toBeCloseTo(121, 2);
        expect(projections[2]).toBeCloseTo(133.1, 2);
      });

      it('should throw on invalid years', () => {
        expect(() => projectFCF(100, 0.1, 0)).toThrow('Years must be at least 1');
      });
    });
  });

  describe('Net Present Value (NPV)', () => {
    describe('calculateDiscountFactor', () => {
      it('should calculate discount factor correctly', () => {
        expect(calculateDiscountFactor(0.1, 1)).toBeCloseTo(0.9091, 4);
        expect(calculateDiscountFactor(0.1, 2)).toBeCloseTo(0.8264, 4);
        expect(calculateDiscountFactor(0.1, 5)).toBeCloseTo(0.6209, 4);
      });

      it('should return 1 for period 0', () => {
        expect(calculateDiscountFactor(0.1, 0)).toBe(1);
      });
    });

    describe('calculatePresentValue', () => {
      it('should calculate present value correctly', () => {
        const pv = calculatePresentValue(1000, 0.1, 2);
        expect(pv).toBeCloseTo(826.45, 2);
      });
    });

    describe('calculateNPV', () => {
      it('should calculate NPV of cash flow series', () => {
        const result = calculateNPV([100, 200, 300], 0.1);

        expect(result.npv).toBeCloseTo(481.59, 2);
        expect(result.cashFlows).toHaveLength(3);
      });

      it('should handle initial investment', () => {
        const result = calculateNPV([100, 100, 100], 0.1, 200);

        // NPV = -200 + 100/1.1 + 100/1.21 + 100/1.331
        expect(result.npv).toBeCloseTo(48.69, 2);
        expect(result.cashFlows).toHaveLength(4); // Including period 0
      });

      it('should include discount factors in results', () => {
        const result = calculateNPV([100], 0.1);

        expect(result.cashFlows[0].discountFactor).toBeCloseTo(0.9091, 4);
        expect(result.cashFlows[0].presentValue).toBeCloseTo(90.91, 2);
      });
    });

    describe('calculateNPVWithPeriods', () => {
      it('should handle non-sequential periods', () => {
        const result = calculateNPVWithPeriods(
          [
            { fcf: -1000, period: 0 },
            { fcf: 500, period: 2 },
            { fcf: 800, period: 5 },
          ],
          0.1
        );

        expect(result.npv).toBeCloseTo(-90.04, 2);
      });
    });
  });

  describe('Internal Rate of Return (IRR)', () => {
    describe('calculateIRR', () => {
      it('should calculate IRR for simple cash flows', () => {
        // -1000 initial, then 400 per year for 4 years
        const result = calculateIRR([-1000, 400, 400, 400, 400]);

        expect(result.converged).toBe(true);
        expect(result.irr).toBeCloseTo(0.2186, 3);
      });

      it('should calculate IRR for break-even scenario', () => {
        // Should be close to 0%
        const result = calculateIRR([-100, 100]);

        expect(result.converged).toBe(true);
        expect(result.irr).toBeCloseTo(0, 4);
      });

      it('should handle high return scenarios', () => {
        const result = calculateIRR([-100, 200]);

        expect(result.converged).toBe(true);
        expect(result.irr).toBeCloseTo(1.0, 2); // 100% return
      });

      it('should return NaN when no IRR exists', () => {
        const result = calculateIRR([100, 100, 100]); // All positive

        expect(result.converged).toBe(false);
        expect(result.irr).toBeNaN();
      });

      it('should throw on insufficient cash flows', () => {
        expect(() => calculateIRR([100])).toThrow(
          'At least 2 cash flows required'
        );
      });
    });

    describe('calculateMIRR', () => {
      it('should calculate MIRR correctly', () => {
        const mirr = calculateMIRR([-1000, 300, 400, 500], 0.08, 0.12);

        expect(mirr).toBeCloseTo(0.0982, 3);
      });
    });
  });

  describe('Terminal Value', () => {
    describe('calculateGordonGrowthTV', () => {
      it('should calculate Gordon Growth terminal value', () => {
        // TV = 100 * (1 + 0.02) / (0.10 - 0.02) = 102 / 0.08 = 1275
        const tv = calculateGordonGrowthTV(100, 0.02, 0.1);

        expect(tv).toBe(1275);
      });

      it('should throw when growth >= discount rate', () => {
        expect(() => calculateGordonGrowthTV(100, 0.1, 0.1)).toThrow(
          'Growth rate must be less than discount rate'
        );
      });
    });

    describe('calculateExitMultipleTV', () => {
      it('should calculate exit multiple terminal value', () => {
        const tv = calculateExitMultipleTV(500000, 8);

        expect(tv).toBe(4000000);
      });

      it('should throw on invalid multiple', () => {
        expect(() => calculateExitMultipleTV(100, -5)).toThrow(
          'Exit multiple must be positive'
        );
      });
    });

    describe('calculateTerminalValue', () => {
      it('should calculate Gordon Growth with present value', () => {
        const result = calculateTerminalValue(
          {
            method: 'gordon-growth',
            finalYearFCF: 500000,
            growthRate: 0.02,
            discountRate: 0.1,
          },
          5
        );

        expect(result.terminalValue).toBe(6375000);
        expect(result.presentValue).toBeCloseTo(3958373.43, 2);
        expect(result.method).toBe('gordon-growth');
      });

      it('should calculate Exit Multiple with present value', () => {
        const result = calculateTerminalValue(
          {
            method: 'exit-multiple',
            finalYearEBITDA: 1000000,
            exitMultiple: 8,
            discountRate: 0.1,
          },
          5
        );

        expect(result.terminalValue).toBe(8000000);
        expect(result.presentValue).toBeCloseTo(4967370.58, 2);
        expect(result.method).toBe('exit-multiple');
      });
    });

    describe('calculateImpliedMultiple', () => {
      it('should calculate implied multiple from Gordon TV', () => {
        const tv = 8000000;
        const ebitda = 1000000;
        const multiple = calculateImpliedMultiple(tv, ebitda);

        expect(multiple).toBe(8);
      });
    });

    describe('calculateImpliedGrowthRate', () => {
      it('should calculate implied growth rate from exit multiple TV', () => {
        // If TV = 1275 at r = 10%, FCF = 100
        // g = (1275 * 0.1 - 100) / (1275 + 100) = 27.5 / 1375 ≈ 0.02
        const g = calculateImpliedGrowthRate(1275, 100, 0.1);

        expect(g).toBeCloseTo(0.02, 4);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should perform complete DCF valuation', () => {
      // Project FCF
      const baseFCF = 1000000;
      const projectedFCFs = projectFCF(baseFCF, 0.05, 5);

      // Calculate NPV of projected cash flows
      const npvResult = calculateNPV(projectedFCFs, 0.1);

      // Calculate terminal value
      const tvResult = calculateTerminalValue(
        {
          method: 'gordon-growth',
          finalYearFCF: projectedFCFs[projectedFCFs.length - 1],
          growthRate: 0.02,
          discountRate: 0.1,
        },
        5
      );

      // Enterprise value = PV of cash flows + PV of terminal value
      const enterpriseValue = npvResult.npv + tvResult.presentValue;

      expect(enterpriseValue).toBeGreaterThan(0);
      expect(npvResult.cashFlows).toHaveLength(5);
    });

    it('should verify IRR matches NPV = 0', () => {
      const cashFlows = [-1000, 300, 400, 500, 200];
      const irrResult = calculateIRR(cashFlows);

      if (irrResult.converged) {
        // NPV at IRR should be approximately 0
        const npvAtIRR = calculateNPVWithPeriods(
          cashFlows.map((fcf, period) => ({ fcf, period })),
          irrResult.irr
        );

        expect(npvAtIRR.npv).toBeCloseTo(0, 6);
      }
    });
  });

  describe('Terminal Value Comparison', () => {
    describe('compareTerminalValueMethods', () => {
      it('should compare both methods and calculate differences', () => {
        const comparison = compareTerminalValueMethods(
          500000,   // finalYearFCF
          800000,   // finalYearEBITDA
          0.02,     // growthRate
          0.10,     // discountRate
          10,       // exitMultiple
          5         // projectionYears
        );

        // Gordon Growth: 500000 * (1.02) / (0.10 - 0.02) = 6,375,000
        expect(comparison.gordonGrowth.terminalValue).toBe(6375000);
        
        // Exit Multiple: 800000 * 10 = 8,000,000
        expect(comparison.exitMultiple.terminalValue).toBe(8000000);
        
        // Difference
        expect(comparison.difference.terminalValue).toBe(1625000);
        expect(comparison.difference.percentDifference).toBeCloseTo(25.49, 1);
        
        // Implied metrics
        expect(comparison.gordonGrowth.impliedEbitdaMultiple).toBeCloseTo(7.97, 1);
        expect(comparison.exitMultiple.impliedGrowthRate).toBeGreaterThan(0.02);
      });

      it('should handle when methods produce similar results', () => {
        const comparison = compareTerminalValueMethods(
          500000,
          625000,  // EBITDA that would give similar TV at 10.2x multiple
          0.02,
          0.10,
          10.2,
          5
        );

        // Both should be close to 6,375,000
        expect(Math.abs(comparison.difference.percentDifference)).toBeLessThan(5);
      });
    });

    describe('getTerminalValueBreakdown', () => {
      it('should return Gordon Growth breakdown with formula', () => {
        const breakdown = getTerminalValueBreakdown(
          'gordon-growth',
          6375000,
          3958373,
          10000000,
          500000,
          800000,
          0.02,
          0.10,
          8
        );

        expect(breakdown.method).toBe('gordon-growth');
        expect(breakdown.gordonDetails).toBeDefined();
        expect(breakdown.gordonDetails?.formula).toContain('FCF');
        expect(breakdown.gordonDetails?.impliedMultiple).toBeCloseTo(7.97, 1);
        expect(breakdown.percentOfEnterpriseValue).toBeCloseTo(39.58, 1);
      });

      it('should return Exit Multiple breakdown with comparables', () => {
        const breakdown = getTerminalValueBreakdown(
          'exit-multiple',
          8000000,
          4967370,
          12000000,
          500000,
          1000000,
          0.02,
          0.10,
          8
        );

        expect(breakdown.method).toBe('exit-multiple');
        expect(breakdown.exitMultipleDetails).toBeDefined();
        expect(breakdown.exitMultipleDetails?.formula).toContain('EBITDA');
        expect(breakdown.exitMultipleDetails?.exitMultiple).toBe(8);
        expect(breakdown.exitMultipleDetails?.comparableCompanies.length).toBeGreaterThan(0);
      });
    });

    describe('getComparableCompanies', () => {
      it('should return all companies when no filter', () => {
        const companies = getComparableCompanies();
        expect(companies.length).toBe(COMPARABLE_COMPANIES.length);
      });

      it('should filter by sector', () => {
        const golfCompanies = getComparableCompanies('golf');
        expect(golfCompanies.length).toBeGreaterThan(0);
        golfCompanies.forEach((c) => {
          expect(c.sector.toLowerCase()).toContain('golf');
        });
      });

      it('should filter by multiple range', () => {
        const conservativeCompanies = getComparableCompanies(undefined, 5, 9);
        expect(conservativeCompanies.length).toBeGreaterThan(0);
        conservativeCompanies.forEach((c) => {
          expect(c.evEbitdaMultiple).toBeGreaterThanOrEqual(5);
          expect(c.evEbitdaMultiple).toBeLessThanOrEqual(9);
        });
      });
    });

    describe('getComparableMultipleStats', () => {
      it('should calculate statistics correctly', () => {
        const stats = getComparableMultipleStats();
        
        expect(stats.ebitdaMultiple.mean).toBeGreaterThan(0);
        expect(stats.ebitdaMultiple.median).toBeGreaterThan(0);
        expect(stats.ebitdaMultiple.min).toBeLessThanOrEqual(stats.ebitdaMultiple.median);
        expect(stats.ebitdaMultiple.max).toBeGreaterThanOrEqual(stats.ebitdaMultiple.median);
        
        expect(stats.revenueMultiple.mean).toBeGreaterThan(0);
      });

      it('should handle empty array', () => {
        const stats = getComparableMultipleStats([]);
        
        expect(stats.ebitdaMultiple.mean).toBe(0);
        expect(stats.ebitdaMultiple.median).toBe(0);
      });
    });
  });
});
