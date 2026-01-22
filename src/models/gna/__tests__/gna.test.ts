import { describe, it, expect, beforeEach } from 'vitest';
import type { Personnel } from '../types';
import {
  DEFAULT_HOURS_PER_MONTH,
  calculateBaseMonthlyCost,
  calculatePersonnelMonthlyCost,
  isActiveInMonth,
  calculateProratedMonthlyCost,
  calculateMonthlyAggregate,
  calculateAnnualCost,
  sumAnnualCost,
} from '../calculations';

describe('G&A Personnel Calculations', () => {
  // Test fixtures
  const monthlyEmployee: Personnel = {
    id: 'emp-1',
    name: 'Alice Johnson',
    role: 'Software Engineer',
    type: 'employee',
    rate: 10000, // $10k/month
    rateType: 'monthly',
    startDate: new Date('2024-01-01'),
    burdenRate: 1.3,
  };

  const hourlyContractor: Personnel = {
    id: 'con-1',
    name: 'Bob Smith',
    role: 'Consultant',
    type: 'contractor',
    rate: 150, // $150/hour
    rateType: 'hourly',
    hoursPerMonth: 80,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-09-30'),
    burdenRate: 1.0,
  };

  describe('calculateBaseMonthlyCost', () => {
    it('should return the rate directly for monthly employees', () => {
      const cost = calculateBaseMonthlyCost(monthlyEmployee);
      expect(cost).toBe(10000);
    });

    it('should calculate hours * rate for hourly workers with custom hours', () => {
      const cost = calculateBaseMonthlyCost(hourlyContractor);
      expect(cost).toBe(150 * 80); // $12,000
    });

    it('should use default hours when hoursPerMonth is not specified', () => {
      const hourlyNoHours: Personnel = {
        ...hourlyContractor,
        hoursPerMonth: undefined,
      };
      const cost = calculateBaseMonthlyCost(hourlyNoHours);
      expect(cost).toBeCloseTo(150 * DEFAULT_HOURS_PER_MONTH, 2);
    });
  });

  describe('calculatePersonnelMonthlyCost', () => {
    it('should calculate base, burden, and total costs for employees', () => {
      const result = calculatePersonnelMonthlyCost(monthlyEmployee);
      
      expect(result.personnelId).toBe('emp-1');
      expect(result.baseCost).toBe(10000);
      expect(result.burdenCost).toBeCloseTo(3000, 2); // 30% burden
      expect(result.totalCost).toBeCloseTo(13000, 2);
    });

    it('should have zero burden for contractors with 1.0 burden rate', () => {
      const result = calculatePersonnelMonthlyCost(hourlyContractor);
      
      expect(result.baseCost).toBe(12000);
      expect(result.burdenCost).toBe(0);
      expect(result.totalCost).toBe(12000);
    });
  });

  describe('isActiveInMonth', () => {
    it('should return true for active personnel in a given month', () => {
      expect(isActiveInMonth(monthlyEmployee, 2024, 6)).toBe(true);
    });

    it('should return false before start date', () => {
      expect(isActiveInMonth(hourlyContractor, 2024, 2)).toBe(false);
    });

    it('should return true in the month they start', () => {
      expect(isActiveInMonth(hourlyContractor, 2024, 3)).toBe(true);
    });

    it('should return true in the month they end', () => {
      expect(isActiveInMonth(hourlyContractor, 2024, 9)).toBe(true);
    });

    it('should return false after end date', () => {
      expect(isActiveInMonth(hourlyContractor, 2024, 10)).toBe(false);
    });

    it('should return true for ongoing employees with no end date', () => {
      expect(isActiveInMonth(monthlyEmployee, 2030, 12)).toBe(true);
    });
  });

  describe('calculateProratedMonthlyCost', () => {
    it('should return zero cost for inactive month', () => {
      const result = calculateProratedMonthlyCost(hourlyContractor, 2024, 1);
      
      expect(result.totalCost).toBe(0);
      expect(result.baseCost).toBe(0);
      expect(result.burdenCost).toBe(0);
    });

    it('should return full cost for full month of activity', () => {
      const result = calculateProratedMonthlyCost(monthlyEmployee, 2024, 6);
      
      expect(result.totalCost).toBeCloseTo(13000, 2);
    });

    it('should prorate cost when starting mid-month', () => {
      // Contractor starts March 15, so ~17 days active in March (31 day month)
      const result = calculateProratedMonthlyCost(hourlyContractor, 2024, 3);
      
      // Should be prorated for partial month
      expect(result.totalCost).toBeLessThan(12000);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should prorate cost when ending mid-month', () => {
      // Create a contractor that ends mid-September
      const midMonthEnder: Personnel = {
        ...hourlyContractor,
        startDate: new Date('2024-01-01'), // Started earlier
        endDate: new Date('2024-09-15'), // Ends mid-September
      };
      const result = calculateProratedMonthlyCost(midMonthEnder, 2024, 9);
      
      // September has 30 days, should be prorated for partial month
      expect(result.totalCost).toBeLessThan(12000);
      expect(result.totalCost).toBeGreaterThan(0);
    });
  });

  describe('calculateMonthlyAggregate', () => {
    const personnel: Personnel[] = [monthlyEmployee, hourlyContractor];

    it('should aggregate costs for all active personnel', () => {
      // June 2024: both are active
      const result = calculateMonthlyAggregate(personnel, 2024, 6, false);
      
      expect(result.year).toBe(2024);
      expect(result.month).toBe(6);
      expect(result.employeeCost).toBeCloseTo(13000, 2);
      expect(result.contractorCost).toBe(12000);
      expect(result.totalCost).toBeCloseTo(25000, 2);
      expect(result.employeeCount).toBe(1);
      expect(result.contractorCount).toBe(1);
    });

    it('should only count active personnel', () => {
      // January 2024: only employee is active
      const result = calculateMonthlyAggregate(personnel, 2024, 1, false);
      
      expect(result.employeeCost).toBeCloseTo(13000, 2);
      expect(result.contractorCost).toBe(0);
      expect(result.employeeCount).toBe(1);
      expect(result.contractorCount).toBe(0);
    });

    it('should handle empty personnel array', () => {
      const result = calculateMonthlyAggregate([], 2024, 6);
      
      expect(result.totalCost).toBe(0);
      expect(result.employeeCount).toBe(0);
      expect(result.contractorCount).toBe(0);
    });
  });

  describe('calculateAnnualCost', () => {
    it('should return 12 monthly aggregates', () => {
      const result = calculateAnnualCost([monthlyEmployee], 2024);
      
      expect(result).toHaveLength(12);
      expect(result[0].month).toBe(1);
      expect(result[11].month).toBe(12);
    });

    it('should have consistent year across all months', () => {
      const result = calculateAnnualCost([monthlyEmployee], 2025);
      
      result.forEach((m) => {
        expect(m.year).toBe(2025);
      });
    });
  });

  describe('sumAnnualCost', () => {
    it('should sum all monthly total costs', () => {
      const monthlyCosts = calculateAnnualCost([monthlyEmployee], 2024, false);
      const total = sumAnnualCost(monthlyCosts);
      
      // 12 months * $13,000 = $156,000
      expect(total).toBeCloseTo(156000, 0);
    });

    it('should handle partial year employment', () => {
      // Contractor active March-September (7 months)
      const monthlyCosts = calculateAnnualCost([hourlyContractor], 2024, false);
      const total = sumAnnualCost(monthlyCosts);
      
      // 7 months * $12,000 = $84,000
      expect(total).toBe(84000);
    });
  });
});
