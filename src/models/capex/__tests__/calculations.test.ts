import { describe, it, expect } from 'vitest';
import {
  calculateToolingAmortization,
  generateToolingProjections,
  calculateToolingCostPerUnit,
} from '../calculations';

describe('calculateToolingAmortization', () => {
  it('calculates straight-line amortization correctly', () => {
    // $85,000 tooling over 3 years = $28,333.33/year
    const result = calculateToolingAmortization(85000, 3);
    expect(result).toBeCloseTo(28333.33, 0);
  });

  it('returns 0 when retoolingYears is 0', () => {
    expect(calculateToolingAmortization(85000, 0)).toBe(0);
  });

  it('returns 0 when retoolingYears is negative', () => {
    expect(calculateToolingAmortization(85000, -1)).toBe(0);
  });

  it('handles full cost in single year', () => {
    expect(calculateToolingAmortization(100000, 1)).toBe(100000);
  });
});

describe('generateToolingProjections', () => {
  it('generates correct number of years', () => {
    const result = generateToolingProjections(85000, 3, 10, 2025);
    expect(result.years).toHaveLength(10);
    expect(result.years[0].year).toBe(2025);
    expect(result.years[9].year).toBe(2034);
  });

  it('marks re-tooling years correctly', () => {
    const result = generateToolingProjections(85000, 3, 10, 2025);
    
    // Year 3 (index 2), Year 6 (index 5), Year 9 (index 8) should be re-tooling years
    expect(result.years[0].isRetoolingYear).toBe(false); // Year 1
    expect(result.years[1].isRetoolingYear).toBe(false); // Year 2
    expect(result.years[2].isRetoolingYear).toBe(true);  // Year 3 (first cycle complete)
    expect(result.years[3].isRetoolingYear).toBe(false); // Year 4
    expect(result.years[4].isRetoolingYear).toBe(false); // Year 5
    expect(result.years[5].isRetoolingYear).toBe(true);  // Year 6 (second cycle)
    expect(result.years[6].isRetoolingYear).toBe(false); // Year 7
    expect(result.years[7].isRetoolingYear).toBe(false); // Year 8
    expect(result.years[8].isRetoolingYear).toBe(true);  // Year 9 (third cycle)
  });

  it('calculates retooling investments on cycle years', () => {
    const result = generateToolingProjections(85000, 3, 10, 2025);
    
    expect(result.years[2].retoolingInvestment).toBe(85000); // Year 3
    expect(result.years[5].retoolingInvestment).toBe(85000); // Year 6
    expect(result.years[0].retoolingInvestment).toBe(0);     // Year 1 (no retooling)
  });

  it('calculates totals correctly', () => {
    const result = generateToolingProjections(85000, 3, 10, 2025);
    
    // 10 years of amortization at ~$28,333.33/year
    expect(result.totalAmortization).toBeCloseTo(283333.33, 0);
    
    // 3 re-tooling investments at $85,000 each (years 3, 6, 9)
    expect(result.totalRetoolingInvestments).toBe(255000);
  });

  it('handles 5-year cycle', () => {
    const result = generateToolingProjections(100000, 5, 10, 2025);
    
    // Re-tooling at years 5 and 10
    expect(result.years[4].isRetoolingYear).toBe(true);  // Year 5
    expect(result.years[9].isRetoolingYear).toBe(true);  // Year 10
    
    // Amortization: $100k / 5 years = $20k/year
    expect(result.years[0].amortizationExpense).toBe(20000);
    
    // Total investments: 2 × $100k = $200k
    expect(result.totalRetoolingInvestments).toBe(200000);
  });
});

describe('calculateToolingCostPerUnit', () => {
  it('calculates cost per unit correctly', () => {
    // $28,333 amortization / 5,000 units = $5.67/unit
    const result = calculateToolingCostPerUnit(28333.33, 5000);
    expect(result).toBeCloseTo(5.67, 2);
  });

  it('returns 0 when units is 0', () => {
    expect(calculateToolingCostPerUnit(28333, 0)).toBe(0);
  });

  it('returns 0 when units is negative', () => {
    expect(calculateToolingCostPerUnit(28333, -100)).toBe(0);
  });

  it('handles large production volumes', () => {
    // $28,333 / 50,000 units = $0.57/unit
    const result = calculateToolingCostPerUnit(28333.33, 50000);
    expect(result).toBeCloseTo(0.57, 2);
  });
});
