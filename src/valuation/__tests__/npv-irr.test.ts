/**
 * NPV and IRR Calculator Tests
 * 
 * Tests for Issue #22 requirements:
 * - NPV: Σ(FCF_t / (1+r)^t)
 * - IRR: Rate where NPV = 0 (Newton-Raphson or bisection)
 */

import {
  calculateNPV,
  calculateDiscountFactor,
  calculatePresentValue,
  calculateIRR,
  calculateMIRR,
  calculateIRRSimple,
  calculateNPVWithEffectiveDate,
  calculatePaybackPeriod,
  calculateDiscountedPaybackPeriod,
} from '../../models/dcf';

describe('NPV Calculator', () => {
  describe('calculateDiscountFactor', () => {
    it('should calculate correct discount factor at 10% for year 1', () => {
      // 1 / (1.10)^1 = 0.9091
      expect(calculateDiscountFactor(0.10, 1)).toBeCloseTo(0.9091, 4);
    });

    it('should calculate correct discount factor at 10% for year 5', () => {
      // 1 / (1.10)^5 = 0.6209
      expect(calculateDiscountFactor(0.10, 5)).toBeCloseTo(0.6209, 4);
    });

    it('should return 1 for period 0', () => {
      expect(calculateDiscountFactor(0.10, 0)).toBe(1);
    });

    it('should handle 0% discount rate', () => {
      expect(calculateDiscountFactor(0, 5)).toBe(1);
    });
  });

  describe('calculatePresentValue', () => {
    it('should calculate PV of $1000 at 10% for 2 years', () => {
      // 1000 / (1.10)^2 = 826.45
      expect(calculatePresentValue(1000, 0.10, 2)).toBeCloseTo(826.45, 2);
    });
  });

  describe('calculateNPV', () => {
    it('should calculate NPV = Σ(FCF_t / (1+r)^t)', () => {
      // Cash flows: 100, 200, 300 at r=10%
      // NPV = 100/1.10 + 200/1.21 + 300/1.331 = 90.91 + 165.29 + 225.39 = 481.59
      const result = calculateNPV([100, 200, 300], 0.10);
      expect(result.npv).toBeCloseTo(481.59, 2);
    });

    it('should handle initial investment (period 0)', () => {
      // -200 + 100/1.10 + 100/1.21 + 100/1.331
      const result = calculateNPV([100, 100, 100], 0.10, 200);
      expect(result.npv).toBeCloseTo(48.69, 2);
    });

    it('should return cash flow details with discount factors', () => {
      const result = calculateNPV([100, 100], 0.10);
      
      expect(result.cashFlows).toHaveLength(2);
      expect(result.cashFlows[0].discountFactor).toBeCloseTo(0.9091, 4);
      expect(result.cashFlows[1].discountFactor).toBeCloseTo(0.8264, 4);
    });

    it('should handle negative cash flows', () => {
      const result = calculateNPV([-100, 200, 300], 0.10);
      expect(result.npv).toBeGreaterThan(0);
    });

    it('should handle high discount rates', () => {
      const result = calculateNPV([1000, 1000, 1000], 0.50);
      expect(result.npv).toBeGreaterThan(0);
      expect(result.npv).toBeLessThan(3000);
    });
  });

  describe('calculateNPVWithEffectiveDate', () => {
    it('should adjust NPV for effective date offset', () => {
      const cashFlows = [-1000, 500, 500, 500];
      const startDate = new Date('2024-01-01');
      const effectiveDate = new Date('2025-01-01'); // 1 year later
      
      const npv = calculateNPVWithEffectiveDate(cashFlows, 0.10, effectiveDate, startDate);
      
      // NPV should be higher when calculated from a later date
      // (less discounting for future cash flows)
      expect(npv).toBeGreaterThan(-1000);
    });

    it('should match standard NPV when dates are equal', () => {
      const cashFlows = [-1000, 300, 400, 500];
      const startDate = new Date('2024-01-01');
      
      const npv = calculateNPVWithEffectiveDate(cashFlows, 0.10, startDate, startDate);
      const standardNPV = calculateNPV(cashFlows.slice(1), 0.10, Math.abs(cashFlows[0]));
      
      expect(npv).toBeCloseTo(standardNPV.npv, 0);
    });
  });
});

describe('IRR Calculator', () => {
  describe('calculateIRR (Newton-Raphson with bisection fallback)', () => {
    it('should find rate where NPV = 0', () => {
      // -1000 initial, 400/year for 4 years → IRR ≈ 21.86%
      const result = calculateIRR([-1000, 400, 400, 400, 400]);
      
      expect(result.converged).toBe(true);
      expect(result.irr).toBeCloseTo(0.2186, 3);
    });

    it('should verify IRR makes NPV = 0', () => {
      const cashFlows = [-1000, 400, 400, 400, 400];
      const result = calculateIRR(cashFlows);
      
      if (result.converged) {
        // Calculate NPV at the IRR - should be ~0
        const npvAtIRR = calculateNPV(cashFlows.slice(1), result.irr, Math.abs(cashFlows[0]));
        expect(npvAtIRR.npv).toBeCloseTo(0, 4);
      }
    });

    it('should handle 100% return scenario', () => {
      const result = calculateIRR([-100, 200]);
      expect(result.irr).toBeCloseTo(1.0, 2); // 100%
    });

    it('should handle break-even (0% IRR)', () => {
      const result = calculateIRR([-100, 100]);
      expect(result.irr).toBeCloseTo(0, 4);
    });

    it('should handle multiple cash flow signs', () => {
      const result = calculateIRR([-1000, 300, 400, 500, -100, 200]);
      expect(result.converged).toBe(true);
      expect(typeof result.irr).toBe('number');
    });

    it('should return NaN when no IRR exists (all same sign)', () => {
      const result = calculateIRR([100, 100, 100]);
      expect(result.converged).toBe(false);
      expect(result.irr).toBeNaN();
    });
  });

  describe('calculateIRRSimple', () => {
    it('should match calculateIRR for standard cases', () => {
      const cashFlows = [-1000, 400, 400, 400, 400];
      const irrSimple = calculateIRRSimple(cashFlows);
      const irrFull = calculateIRR(cashFlows);
      
      expect(irrSimple).toBeCloseTo(irrFull.irr, 3);
    });

    it('should handle edge cases gracefully', () => {
      const irr = calculateIRRSimple([-100, 200]);
      expect(isFinite(irr)).toBe(true);
    });
  });

  describe('calculateMIRR', () => {
    it('should calculate Modified IRR with different finance/reinvest rates', () => {
      const mirr = calculateMIRR([-1000, 300, 400, 500], 0.08, 0.12);
      expect(mirr).toBeCloseTo(0.0982, 3);
    });

    it('should be less than IRR when reinvest rate < IRR', () => {
      const cashFlows = [-1000, 400, 400, 400, 400];
      const irr = calculateIRR(cashFlows).irr;
      const mirr = calculateMIRR(cashFlows, 0.08, 0.10);
      
      expect(mirr).toBeLessThan(irr);
    });
  });
});

describe('Payback Period', () => {
  describe('calculatePaybackPeriod', () => {
    it('should calculate simple payback period', () => {
      // -1000 initial, 400/year → payback between year 2-3
      const payback = calculatePaybackPeriod([-1000, 400, 400, 400]);
      
      // After Y2: -200 remaining, Y3 adds 400 → payback at 2.5 years
      expect(payback).toBeCloseTo(2.5, 1);
    });

    it('should return null when never recovers', () => {
      const payback = calculatePaybackPeriod([-1000, 100, 100, 100]);
      expect(payback).toBeNull();
    });

    it('should handle exact payback', () => {
      const payback = calculatePaybackPeriod([-200, 100, 100]);
      expect(payback).toBeCloseTo(2, 1);
    });
  });

  describe('calculateDiscountedPaybackPeriod', () => {
    it('should calculate discounted payback period', () => {
      const payback = calculateDiscountedPaybackPeriod([-1000, 500, 500, 500], 0.10);
      
      // PV of year 1: 454.55, year 2: 413.22, year 3: 375.66
      // Cumulative: -545.45, -132.23, +243.43
      expect(payback).toBeGreaterThan(2);
      expect(payback).toBeLessThan(3);
    });

    it('should be longer than simple payback', () => {
      const cashFlows = [-1000, 400, 400, 400, 400];
      const simplePayback = calculatePaybackPeriod(cashFlows);
      const discountedPayback = calculateDiscountedPaybackPeriod(cashFlows, 0.10);
      
      if (simplePayback !== null && discountedPayback !== null) {
        expect(discountedPayback).toBeGreaterThan(simplePayback);
      }
    });
  });
});

describe('Integration: NPV and IRR relationship', () => {
  it('NPV should be positive when discount rate < IRR', () => {
    const cashFlows = [-1000, 400, 400, 400, 400];
    const irr = calculateIRR(cashFlows).irr;
    
    // NPV at rate below IRR should be positive
    const npvBelow = calculateNPV(cashFlows.slice(1), irr * 0.5, Math.abs(cashFlows[0]));
    expect(npvBelow.npv).toBeGreaterThan(0);
    
    // NPV at rate above IRR should be negative
    const npvAbove = calculateNPV(cashFlows.slice(1), irr * 1.5, Math.abs(cashFlows[0]));
    expect(npvAbove.npv).toBeLessThan(0);
  });

  it('NPV should be 0 at exactly IRR', () => {
    const cashFlows = [-1000, 300, 400, 500];
    const irr = calculateIRR(cashFlows).irr;
    
    const npvAtIRR = calculateNPV(cashFlows.slice(1), irr, Math.abs(cashFlows[0]));
    expect(Math.abs(npvAtIRR.npv)).toBeLessThan(0.01);
  });
});
