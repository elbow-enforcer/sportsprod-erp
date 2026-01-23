/**
 * Raise Scenario Types
 * 
 * Types for capital raise scenario analysis and comparison.
 * Supports equity, SAFE, and convertible debt instruments.
 */

/**
 * Type of capital raise instrument
 */
export type RaiseInstrument = 'equity' | 'safe' | 'convertible_debt';

/**
 * SAFE-specific terms
 */
export interface SAFETerms {
  valuationCap: number;        // Maximum valuation for conversion
  discountRate: number;        // Discount to next round price (e.g., 0.20 = 20%)
  mfnClause: boolean;          // Most Favored Nation clause
  proRataRights: boolean;      // Right to participate in future rounds
}

/**
 * Convertible debt terms
 */
export interface ConvertibleDebtTerms {
  interestRate: number;        // Annual interest rate (e.g., 0.06 = 6%)
  maturityMonths: number;      // Months until maturity
  valuationCap: number;        // Cap for conversion
  discountRate: number;        // Discount to conversion price
}

/**
 * Equity round terms
 */
export interface EquityTerms {
  preMoneyValuation: number;   // Pre-money valuation
  optionPoolIncrease: number;  // Additional option pool as % (e.g., 0.10 = 10%)
  liquidationPreference: number; // Multiple (1 = 1x, 2 = 2x)
  participating: boolean;       // Participating preferred
}

/**
 * Input for a single raise scenario
 */
export interface RaiseScenarioInput {
  raiseAmount: number;         // Amount to raise ($)
  instrument: RaiseInstrument; // Type of instrument
  preMoneyValuation: number;   // Pre-money valuation (for equity or conversion)
  
  // Instrument-specific terms (optional based on instrument type)
  safeTerms?: SAFETerms;
  convertibleTerms?: ConvertibleDebtTerms;
  equityTerms?: EquityTerms;
}

/**
 * Monthly burn rate components
 */
export interface BurnRateComponents {
  payroll: number;             // Monthly payroll cost
  marketing: number;           // Monthly marketing spend
  operations: number;          // Rent, software, insurance, etc.
  cogs: number;                // Variable costs (if any pre-revenue sales)
  total: number;               // Total monthly burn
}

/**
 * Output metrics for a single raise scenario
 */
export interface RaiseScenarioResult {
  // Input echo
  raiseAmount: number;
  instrument: RaiseInstrument;
  preMoneyValuation: number;
  
  // Calculated metrics
  postMoneyValuation: number;  // Pre-money + raise amount
  dilutionPercent: number;     // Ownership given up (as decimal, e.g., 0.20 = 20%)
  runwayMonths: number;        // Months of runway at current burn
  
  // Ownership breakdown
  founderOwnershipPost: number;   // Founder ownership % after raise
  investorOwnershipPost: number;  // New investor ownership %
  
  // Per-dollar metrics
  dilutionPerDollar: number;      // Dilution % per $100k raised
  monthsPerDollar: number;        // Runway months per $100k raised
  
  // Risk assessment
  runwayRiskLevel: 'critical' | 'low' | 'moderate' | 'comfortable' | 'extended';
}

/**
 * Full comparison matrix result
 */
export interface RaiseScenarioMatrix {
  scenarios: RaiseScenarioResult[];
  burnRate: BurnRateComponents;
  currentCash: number;
  recommendedScenario: RaiseScenarioResult | null;
  recommendationReason: string;
}

/**
 * Default raise amounts for comparison matrix
 */
export const DEFAULT_RAISE_AMOUNTS = [100_000, 250_000, 500_000, 1_000_000];

/**
 * Default pre-money valuation if not specified
 */
export const DEFAULT_PRE_MONEY_VALUATION = 2_000_000;

/**
 * Founder starting ownership (before any raises)
 */
export const FOUNDER_STARTING_OWNERSHIP = 1.0; // 100%
