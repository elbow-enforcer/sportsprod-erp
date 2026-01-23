/**
 * @file types.ts
 * @description CapEx and Tooling Types (minimal scope)
 * @related-issue Issue #9 - Re-tooling Cycle Planning
 */

/**
 * Annual tooling cost projection for a single year
 */
export interface ToolingYearProjection {
  year: number;
  amortizationExpense: number;   // Annual tooling amortization
  retoolingInvestment: number;   // Re-tooling investment (if cycle year)
  isRetoolingYear: boolean;      // Whether this year has re-tooling
}

/**
 * Complete tooling cost projection across all years
 */
export interface ToolingProjection {
  years: ToolingYearProjection[];
  totalAmortization: number;
  totalRetoolingInvestments: number;
}
