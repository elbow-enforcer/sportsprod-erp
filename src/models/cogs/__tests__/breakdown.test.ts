import { describe, it, expect } from 'vitest';
import {
  calculateCOGSBreakdown,
  createBreakdownCalculator,
  applyCostReduction,
  projectCOGSBreakdown,
  DEFAULT_COGS_BREAKDOWN,
} from '../breakdown';
import type { COGSBreakdownConfig } from '../types';

describe('COGS Breakdown', () => {
  describe('calculateCOGSBreakdown', () => {
    it('calculates breakdown with default config at 1000 units', () => {
      const result = calculateCOGSBreakdown(1000);
      
      expect(result.volume).toBe(1000);
      expect(result.totalPerUnit).toBe(200);
      expect(result.totalCost).toBe(200000);
      expect(result.lineItems).toHaveLength(4);
    });

    it('returns correct line items', () => {
      const result = calculateCOGSBreakdown(100);
      
      const manufacturing = result.lineItems.find(li => li.category === 'manufacturing');
      const freight = result.lineItems.find(li => li.category === 'freight');
      const packaging = result.lineItems.find(li => li.category === 'packaging');
      const duties = result.lineItems.find(li => li.category === 'duties');

      expect(manufacturing?.perUnit).toBe(140);
      expect(manufacturing?.total).toBe(14000);
      expect(manufacturing?.percentage).toBe(70);

      expect(freight?.perUnit).toBe(35);
      expect(freight?.total).toBe(3500);
      expect(freight?.percentage).toBe(17.5);

      expect(packaging?.perUnit).toBe(15);
      expect(packaging?.total).toBe(1500);
      expect(packaging?.percentage).toBe(7.5);

      expect(duties?.perUnit).toBe(10);
      expect(duties?.total).toBe(1000);
      expect(duties?.percentage).toBe(5);
    });

    it('calculates summary totals correctly', () => {
      const result = calculateCOGSBreakdown(500);
      
      expect(result.summary.manufacturing).toBe(70000);
      expect(result.summary.freight).toBe(17500);
      expect(result.summary.packaging).toBe(7500);
      expect(result.summary.duties).toBe(5000);
      
      const summaryTotal = 
        result.summary.manufacturing +
        result.summary.freight +
        result.summary.packaging +
        result.summary.duties;
      expect(summaryTotal).toBe(result.totalCost);
    });

    it('uses custom configuration', () => {
      const customConfig: COGSBreakdownConfig = {
        manufacturingCost: 100,
        freightCost: 50,
        packagingCost: 30,
        dutiesCost: 20,
      };
      
      const result = calculateCOGSBreakdown(100, customConfig);
      
      expect(result.totalPerUnit).toBe(200);
      expect(result.totalCost).toBe(20000);
      expect(result.summary.manufacturing).toBe(10000);
      expect(result.summary.freight).toBe(5000);
    });

    it('throws error for zero volume', () => {
      expect(() => calculateCOGSBreakdown(0)).toThrow('Volume must be greater than 0');
    });

    it('throws error for negative volume', () => {
      expect(() => calculateCOGSBreakdown(-100)).toThrow('Volume must be greater than 0');
    });

    it('handles partial config override', () => {
      const result = calculateCOGSBreakdown(100, { freightCost: 50 });
      
      const freight = result.lineItems.find(li => li.category === 'freight');
      expect(freight?.perUnit).toBe(50);
      
      // Other values should still be defaults
      const manufacturing = result.lineItems.find(li => li.category === 'manufacturing');
      expect(manufacturing?.perUnit).toBe(140);
    });
  });

  describe('createBreakdownCalculator', () => {
    it('creates a reusable calculator with fixed config', () => {
      const calculator = createBreakdownCalculator({
        manufacturingCost: 80,
        freightCost: 20,
        packagingCost: 10,
        dutiesCost: 5,
      });

      const result = calculator(1000);
      expect(result.totalPerUnit).toBe(115);
      expect(result.totalCost).toBe(115000);
    });

    it('uses default config when none provided', () => {
      const calculator = createBreakdownCalculator();
      const result = calculator(100);
      
      expect(result.totalPerUnit).toBe(200);
    });
  });

  describe('applyCostReduction', () => {
    it('applies 5% reduction to costs (except duties)', () => {
      const original: COGSBreakdownConfig = {
        manufacturingCost: 100,
        freightCost: 40,
        packagingCost: 20,
        dutiesCost: 10,
      };

      const reduced = applyCostReduction(original, 0.05);

      expect(reduced.manufacturingCost).toBe(95);
      expect(reduced.freightCost).toBe(38);
      expect(reduced.packagingCost).toBe(19);
      expect(reduced.dutiesCost).toBe(10); // Duties unchanged
    });

    it('handles 10% reduction', () => {
      const result = applyCostReduction(DEFAULT_COGS_BREAKDOWN, 0.10);
      
      expect(result.manufacturingCost).toBe(126);
      expect(result.freightCost).toBe(31.5);
      expect(result.packagingCost).toBe(13.5);
      expect(result.dutiesCost).toBe(10);
    });

    it('handles zero reduction', () => {
      const result = applyCostReduction(DEFAULT_COGS_BREAKDOWN, 0);
      
      expect(result.manufacturingCost).toBe(140);
      expect(result.freightCost).toBe(35);
      expect(result.packagingCost).toBe(15);
      expect(result.dutiesCost).toBe(10);
    });
  });

  describe('projectCOGSBreakdown', () => {
    it('projects costs over multiple years with reduction', () => {
      const volumes = [1000, 2000, 3000];
      const results = projectCOGSBreakdown(volumes);

      expect(results).toHaveLength(3);
      
      // Year 1: no reduction
      expect(results[0].totalPerUnit).toBe(200);
      expect(results[0].totalCost).toBe(200000);

      // Year 2: 5% reduction (except duties)
      expect(results[1].totalPerUnit).toBeLessThan(200);
      expect(results[1].volume).toBe(2000);

      // Year 3: another 5% reduction
      expect(results[2].totalPerUnit).toBeLessThan(results[1].totalPerUnit);
    });

    it('applies custom reduction rate', () => {
      const volumes = [1000, 1000];
      const results = projectCOGSBreakdown(volumes, {}, 0.10);

      // Year 2 should have 10% lower costs (except duties)
      const year1Manufacturing = results[0].lineItems.find(li => li.category === 'manufacturing')!;
      const year2Manufacturing = results[1].lineItems.find(li => li.category === 'manufacturing')!;
      
      expect(year2Manufacturing.perUnit).toBe(year1Manufacturing.perUnit * 0.9);
    });

    it('uses custom base config', () => {
      const volumes = [1000];
      const results = projectCOGSBreakdown(volumes, { manufacturingCost: 100 });

      const manufacturing = results[0].lineItems.find(li => li.category === 'manufacturing');
      expect(manufacturing?.perUnit).toBe(100);
    });
  });

  describe('DEFAULT_COGS_BREAKDOWN', () => {
    it('sums to $200 total', () => {
      const total = 
        DEFAULT_COGS_BREAKDOWN.manufacturingCost +
        DEFAULT_COGS_BREAKDOWN.freightCost +
        DEFAULT_COGS_BREAKDOWN.packagingCost +
        DEFAULT_COGS_BREAKDOWN.dutiesCost;
      
      expect(total).toBe(200);
    });

    it('has reasonable proportions', () => {
      // Manufacturing should be the largest component
      expect(DEFAULT_COGS_BREAKDOWN.manufacturingCost).toBeGreaterThan(
        DEFAULT_COGS_BREAKDOWN.freightCost
      );
      expect(DEFAULT_COGS_BREAKDOWN.manufacturingCost).toBeGreaterThan(
        DEFAULT_COGS_BREAKDOWN.packagingCost
      );
      expect(DEFAULT_COGS_BREAKDOWN.manufacturingCost).toBeGreaterThan(
        DEFAULT_COGS_BREAKDOWN.dutiesCost
      );
    });
  });
});
