/**
 * CAC Alerts Tests
 * Tests for CAC target checking and alert generation
 */

import { describe, it, expect } from 'vitest';
import {
  determineAlertSeverity,
  checkCACTarget,
  checkCACTargets,
  checkBlendedCACTarget,
  getCACStatus,
  calculateCACEfficiency,
  getCACRecommendation,
  defaultCACTarget,
} from '../cacAlerts';
import type { CACTarget } from '../cacAlerts';
import type { CACResult } from '../types';

describe('CAC Alert System', () => {
  const testTarget: CACTarget = {
    targetCAC: 100,
    warningThreshold: 0.15,
    criticalThreshold: 0.30,
    channelTargets: {
      'paid-search': 120,
      'email': 50,
    },
  };

  describe('determineAlertSeverity', () => {
    it('should return null when under target', () => {
      expect(determineAlertSeverity(90, 100, testTarget)).toBeNull();
    });

    it('should return info when slightly over target', () => {
      expect(determineAlertSeverity(110, 100, testTarget)).toBe('info');
    });

    it('should return warning at warning threshold', () => {
      expect(determineAlertSeverity(116, 100, testTarget)).toBe('warning');
    });

    it('should return critical at critical threshold', () => {
      expect(determineAlertSeverity(135, 100, testTarget)).toBe('critical');
    });

    it('should handle zero target gracefully', () => {
      expect(determineAlertSeverity(100, 0, testTarget)).toBeNull();
    });
  });

  describe('checkCACTarget', () => {
    it('should return null when CAC is under target', () => {
      const result: CACResult = {
        channelId: 'paid-search',
        period: '2026-01',
        totalSpend: 10000,
        newCustomers: 100,
        cac: 100,
      };
      // Channel target is 120, CAC is 100
      const alert = checkCACTarget(result, testTarget);
      expect(alert).toBeNull();
    });

    it('should generate alert when CAC exceeds target', () => {
      const result: CACResult = {
        channelId: 'paid-search',
        period: '2026-01',
        totalSpend: 15000,
        newCustomers: 100,
        cac: 150,
      };
      const alert = checkCACTarget(result, testTarget);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('warning');
      expect(alert?.channelId).toBe('paid-search');
      expect(alert?.currentCAC).toBe(150);
      expect(alert?.targetCAC).toBe(120); // Channel-specific target
    });

    it('should use channel-specific target when available', () => {
      const result: CACResult = {
        channelId: 'email',
        period: '2026-01',
        totalSpend: 4000,
        newCustomers: 50,
        cac: 80,
      };
      const alert = checkCACTarget(result, testTarget);
      expect(alert).not.toBeNull();
      expect(alert?.targetCAC).toBe(50); // Email channel target
      expect(alert?.severity).toBe('critical'); // 80 is 60% over 50
    });

    it('should use default target when channel-specific not available', () => {
      const result: CACResult = {
        channelId: 'seo',
        period: '2026-01',
        totalSpend: 5000,
        newCustomers: 40,
        cac: 125,
      };
      const alert = checkCACTarget(result, testTarget);
      expect(alert).not.toBeNull();
      expect(alert?.targetCAC).toBe(100); // Default target
    });

    it('should return null when CAC is zero', () => {
      const result: CACResult = {
        channelId: 'paid-search',
        period: '2026-01',
        totalSpend: 0,
        newCustomers: 0,
        cac: 0,
      };
      expect(checkCACTarget(result, testTarget)).toBeNull();
    });
  });

  describe('checkCACTargets', () => {
    it('should check multiple CAC results and return alerts', () => {
      const results: CACResult[] = [
        { channelId: 'paid-search', period: '2026-01', totalSpend: 15000, newCustomers: 100, cac: 150 },
        { channelId: 'email', period: '2026-01', totalSpend: 4000, newCustomers: 50, cac: 80 },
        { channelId: 'seo', period: '2026-01', totalSpend: 2000, newCustomers: 100, cac: 20 },
      ];

      const alerts = checkCACTargets(results, testTarget);
      expect(alerts.length).toBe(2); // paid-search and email
      expect(alerts[0].severity).toBe('critical'); // Email is most severe
      expect(alerts[1].severity).toBe('warning'); // paid-search
    });

    it('should sort alerts by severity', () => {
      const results: CACResult[] = [
        { channelId: 'ch1', period: '2026-01', totalSpend: 10500, newCustomers: 100, cac: 105 }, // info
        { channelId: 'ch2', period: '2026-01', totalSpend: 12000, newCustomers: 100, cac: 120 }, // warning
        { channelId: 'ch3', period: '2026-01', totalSpend: 15000, newCustomers: 100, cac: 150 }, // critical
      ];

      const alerts = checkCACTargets(results, testTarget);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[1].severity).toBe('warning');
      expect(alerts[2].severity).toBe('info');
    });

    it('should return empty array when no alerts needed', () => {
      const results: CACResult[] = [
        { channelId: 'paid-search', period: '2026-01', totalSpend: 8000, newCustomers: 100, cac: 80 },
      ];
      const alerts = checkCACTargets(results, testTarget);
      expect(alerts.length).toBe(0);
    });
  });

  describe('checkBlendedCACTarget', () => {
    it('should check blended CAC result', () => {
      const result: CACResult = {
        channelId: 'blended',
        period: '2026-01',
        totalSpend: 50000,
        newCustomers: 400,
        cac: 125,
      };
      const alert = checkBlendedCACTarget(result, testTarget);
      expect(alert).not.toBeNull();
      expect(alert?.targetCAC).toBe(100); // Should use default, not channel-specific
    });

    it('should throw error if not blended result', () => {
      const result: CACResult = {
        channelId: 'paid-search',
        period: '2026-01',
        totalSpend: 15000,
        newCustomers: 100,
        cac: 150,
      };
      expect(() => checkBlendedCACTarget(result, testTarget)).toThrow('Expected blended CAC result');
    });
  });

  describe('getCACStatus', () => {
    it('should return "under" when significantly under target', () => {
      expect(getCACStatus(80, 100)).toBe('under');
    });

    it('should return "at" when close to target', () => {
      expect(getCACStatus(98, 100)).toBe('at');
      expect(getCACStatus(102, 100)).toBe('at');
    });

    it('should return "over" when above target but not critical', () => {
      expect(getCACStatus(120, 100)).toBe('over');
    });

    it('should return "critical" when significantly over target', () => {
      expect(getCACStatus(140, 100)).toBe('critical');
    });
  });

  describe('calculateCACEfficiency', () => {
    it('should return high score when CAC is well under target', () => {
      const score = calculateCACEfficiency(50, 100);
      expect(score).toBeGreaterThan(80);
    });

    it('should return ~50 when CAC equals target', () => {
      const score = calculateCACEfficiency(100, 100);
      expect(score).toBe(50);
    });

    it('should return low score when CAC is over target', () => {
      const score = calculateCACEfficiency(150, 100);
      expect(score).toBeLessThan(30);
    });

    it('should return 0 when CAC is 150%+ of target', () => {
      const score = calculateCACEfficiency(200, 100);
      expect(score).toBe(0);
    });

    it('should return 100 when CAC is 0 (no spend)', () => {
      const score = calculateCACEfficiency(0, 100);
      expect(score).toBe(100);
    });

    it('should handle zero target', () => {
      expect(calculateCACEfficiency(50, 0)).toBe(0);
    });
  });

  describe('getCACRecommendation', () => {
    it('should recommend scaling when under target', () => {
      const rec = getCACRecommendation(80, 100, 'Paid Search');
      expect(rec).toContain('performing well');
      expect(rec).toContain('scaling');
    });

    it('should recommend monitoring when at target', () => {
      const rec = getCACRecommendation(100, 100, 'Email');
      expect(rec).toContain('target');
      expect(rec).toContain('Monitor');
    });

    it('should recommend optimization when over target', () => {
      const rec = getCACRecommendation(120, 100, 'Display');
      expect(rec).toContain('above target');
      expect(rec).toContain('Review');
    });

    it('should recommend immediate action when critical', () => {
      const rec = getCACRecommendation(150, 100, 'Social');
      expect(rec).toContain('immediate attention');
    });
  });

  describe('defaultCACTarget', () => {
    it('should have reasonable default values', () => {
      expect(defaultCACTarget.targetCAC).toBeGreaterThan(0);
      expect(defaultCACTarget.warningThreshold).toBeLessThan(defaultCACTarget.criticalThreshold);
      expect(defaultCACTarget.channelTargets).toBeDefined();
    });

    it('should have channel-specific targets for key channels', () => {
      expect(defaultCACTarget.channelTargets?.['paid-search']).toBeDefined();
      expect(defaultCACTarget.channelTargets?.['email']).toBeDefined();
    });
  });
});
