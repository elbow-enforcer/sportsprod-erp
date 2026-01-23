/**
 * Baseball Calendar Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getPeriodForMonth,
  getMonthlySeasonality,
  getRevenueMultiplier,
  distributeAnnually,
  getQuarterlyMultiplier,
  getAverageMultiplier,
  getPeakTroughMonths,
  CALENDARS,
} from '../index';

describe('Baseball Calendar', () => {
  describe('getPeriodForMonth - Pro Calendar', () => {
    it('returns spring_training for Feb-Mar', () => {
      expect(getPeriodForMonth(2, 'pro')).toBe('spring_training');
      expect(getPeriodForMonth(3, 'pro')).toBe('spring_training');
    });

    it('returns regular_season for Apr-Sep', () => {
      expect(getPeriodForMonth(4, 'pro')).toBe('regular_season');
      expect(getPeriodForMonth(7, 'pro')).toBe('regular_season');
      expect(getPeriodForMonth(9, 'pro')).toBe('regular_season');
    });

    it('returns playoffs for Oct', () => {
      expect(getPeriodForMonth(10, 'pro')).toBe('playoffs');
    });

    it('returns off_season for Nov-Jan', () => {
      expect(getPeriodForMonth(11, 'pro')).toBe('off_season');
      expect(getPeriodForMonth(12, 'pro')).toBe('off_season');
      expect(getPeriodForMonth(1, 'pro')).toBe('off_season');
    });
  });

  describe('getPeriodForMonth - Youth Calendar', () => {
    it('returns spring_training for Mar-Apr', () => {
      expect(getPeriodForMonth(3, 'youth')).toBe('spring_training');
      expect(getPeriodForMonth(4, 'youth')).toBe('spring_training');
    });

    it('returns regular_season for May-Jul', () => {
      expect(getPeriodForMonth(5, 'youth')).toBe('regular_season');
      expect(getPeriodForMonth(6, 'youth')).toBe('regular_season');
      expect(getPeriodForMonth(7, 'youth')).toBe('regular_season');
    });

    it('returns playoffs for Aug', () => {
      expect(getPeriodForMonth(8, 'youth')).toBe('playoffs');
    });

    it('returns off_season for Sep-Feb', () => {
      expect(getPeriodForMonth(9, 'youth')).toBe('off_season');
      expect(getPeriodForMonth(10, 'youth')).toBe('off_season');
      expect(getPeriodForMonth(1, 'youth')).toBe('off_season');
    });
  });

  describe('getMonthlySeasonality', () => {
    it('returns 12 months of data', () => {
      expect(getMonthlySeasonality('pro')).toHaveLength(12);
      expect(getMonthlySeasonality('youth')).toHaveLength(12);
    });

    it('includes multipliers for each month', () => {
      const monthly = getMonthlySeasonality('pro');
      monthly.forEach(m => {
        expect(m.revenueMultiplier).toBeGreaterThan(0);
        expect(m.demandMultiplier).toBeGreaterThan(0);
      });
    });
  });

  describe('getRevenueMultiplier', () => {
    it('returns 1.8 for October playoffs in pro calendar', () => {
      expect(getRevenueMultiplier(10, 'pro')).toBe(1.8);
    });

    it('returns 0.5 for January off-season in pro calendar', () => {
      expect(getRevenueMultiplier(1, 'pro')).toBe(0.5);
    });
  });

  describe('distributeAnnually', () => {
    it('distributes annual value across 12 months', () => {
      const monthly = distributeAnnually(120000, 'pro');
      expect(monthly).toHaveLength(12);
    });

    it('sums to approximately the annual value', () => {
      const annual = 120000;
      const monthly = distributeAnnually(annual, 'pro');
      const total = monthly.reduce((sum, m) => sum + m, 0);
      expect(total).toBeCloseTo(annual, 0);
    });

    it('peak months get more than average', () => {
      const annual = 120000;
      const monthly = distributeAnnually(annual, 'pro');
      const average = annual / 12;
      
      expect(monthly[9]).toBeGreaterThan(average);
      expect(monthly[0]).toBeLessThan(average);
    });
  });

  describe('getQuarterlyMultiplier', () => {
    it('Q2 and Q3 have higher multipliers in pro calendar', () => {
      const q1 = getQuarterlyMultiplier(1, 'pro');
      const q2 = getQuarterlyMultiplier(2, 'pro');
      const q3 = getQuarterlyMultiplier(3, 'pro');
      
      expect(q2).toBeGreaterThan(q1);
      expect(q3).toBeGreaterThan(q1);
    });
  });

  describe('getAverageMultiplier', () => {
    it('returns positive average', () => {
      expect(getAverageMultiplier('pro')).toBeGreaterThan(0);
      expect(getAverageMultiplier('youth')).toBeGreaterThan(0);
    });
  });

  describe('getPeakTroughMonths', () => {
    it('pro calendar peak is October', () => {
      const { peak } = getPeakTroughMonths('pro');
      expect(peak).toBe(10);
    });

    it('pro calendar trough is in off-season', () => {
      const { trough } = getPeakTroughMonths('pro');
      expect([1, 11, 12]).toContain(trough);
    });
  });

  describe('CALENDARS', () => {
    it('contains pro and youth configs', () => {
      expect(CALENDARS.pro).toBeDefined();
      expect(CALENDARS.youth).toBeDefined();
    });

    it('each calendar has 4 periods', () => {
      expect(CALENDARS.pro.periods).toHaveLength(4);
      expect(CALENDARS.youth.periods).toHaveLength(4);
    });
  });
});
