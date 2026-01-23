import { describe, it, expect } from 'vitest';
import {
  getDaysUntilLaunch,
  getWeeksUntilLaunch,
  getLaunchStatus,
  formatLaunchDate,
} from '../../stores/preorderStore';

// Helper to get YYYY-MM-DD string for a date offset from today
function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('preorderStore helpers', () => {
  describe('getDaysUntilLaunch', () => {
    it('returns null for null launch date', () => {
      expect(getDaysUntilLaunch(null)).toBeNull();
    });

    it('returns positive number for future date', () => {
      const futureDate = getDateString(10);
      const result = getDaysUntilLaunch(futureDate);
      expect(result).toBe(10);
    });

    it('returns 0 for today', () => {
      const today = getDateString(0);
      expect(getDaysUntilLaunch(today)).toBe(0);
    });

    it('returns negative number for past date', () => {
      const pastDate = getDateString(-5);
      const result = getDaysUntilLaunch(pastDate);
      expect(result).toBe(-5);
    });
  });

  describe('getWeeksUntilLaunch', () => {
    it('returns null for null launch date', () => {
      expect(getWeeksUntilLaunch(null)).toBeNull();
    });

    it('returns correct weeks for 14 days', () => {
      const futureDate = getDateString(14);
      const result = getWeeksUntilLaunch(futureDate);
      expect(result).toBe(2);
    });

    it('returns 0 for less than 7 days', () => {
      const futureDate = getDateString(5);
      const result = getWeeksUntilLaunch(futureDate);
      expect(result).toBe(0);
    });
  });

  describe('getLaunchStatus', () => {
    it('returns not-set for null date', () => {
      expect(getLaunchStatus(null)).toBe('not-set');
    });

    it('returns today for current date', () => {
      const today = getDateString(0);
      expect(getLaunchStatus(today)).toBe('today');
    });

    it('returns past for past date', () => {
      const pastDate = getDateString(-5);
      expect(getLaunchStatus(pastDate)).toBe('past');
    });

    it('returns imminent for date within 7 days', () => {
      const nearDate = getDateString(5);
      expect(getLaunchStatus(nearDate)).toBe('imminent');
    });

    it('returns upcoming for date beyond 7 days', () => {
      const futureDate = getDateString(30);
      expect(getLaunchStatus(futureDate)).toBe('upcoming');
    });
  });

  describe('formatLaunchDate', () => {
    it('returns "Not set" for null date', () => {
      expect(formatLaunchDate(null)).toBe('Not set');
    });

    it('returns formatted date string for valid date', () => {
      const result = formatLaunchDate('2026-03-15');
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });

    it('includes weekday in formatted output', () => {
      const result = formatLaunchDate('2026-01-01');
      expect(result).toContain('Thursday');
      expect(result).toContain('January');
      expect(result).toContain('1');
      expect(result).toContain('2026');
    });
  });
});
