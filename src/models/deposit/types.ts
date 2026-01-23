/**
 * Deposit Impact Modeling Types
 * 
 * Types for modeling how pre-order deposits affect capital requirements.
 * Supports variable deposit amounts, conversion rates, and timing scenarios.
 */

/**
 * Pre-order volume scenario definition
 */
export interface PreOrderScenario {
  name: string;                    // e.g., "Conservative", "Base", "Optimistic"
  preOrderCount: number;           // Number of pre-orders
  monthlyGrowthRate: number;       // Monthly pre-order growth rate
}

/**
 * Input parameters for deposit impact calculation
 */
export interface DepositImpactInput {
  depositAmount: number;           // Deposit per pre-order (default $200)
  conversionRate: number;          // % of pre-orders that convert (e.g., 0.85 = 85%)
  preOrderCount: number;           // Total pre-orders expected
  
  // Timing parameters
  preOrderStartMonth: number;      // Month when pre-orders begin (1 = Jan Y1)
  preOrderDurationMonths: number;  // How many months pre-orders are accepted
  productionStartMonth: number;    // Month when production expenses begin
  fulfillmentStartMonth: number;   // Month when fulfillment/delivery begins
  fulfillmentDurationMonths: number; // Months to fulfill all orders
  
  // Cost parameters
  unitProductionCost: number;      // Cost to produce each unit
  fulfillmentCostPerUnit: number;  // Shipping, packaging, etc.
  
  // Revenue parameters  
  fullPrice: number;               // Full retail price
}

/**
 * Monthly cash flow entry
 */
export interface MonthlyCashFlow {
  month: number;                   // Month number (1 = Jan Y1)
  monthLabel: string;              // e.g., "Jan Y1", "Feb Y1"
  
  // Inflows
  depositsReceived: number;        // New deposits received this month
  balancePaymentsReceived: number; // Balance payments from converted pre-orders
  totalInflows: number;
  
  // Outflows
  productionCosts: number;         // Manufacturing costs
  fulfillmentCosts: number;        // Shipping/handling costs
  refundsIssued: number;           // Refunds for non-converting pre-orders
  totalOutflows: number;
  
  // Running totals
  netCashFlow: number;             // Inflows - Outflows
  cumulativeCashFlow: number;      // Running total
  depositsHeld: number;            // Total deposits held (liability)
  
  // Pre-order tracking
  preOrdersThisMonth: number;      // New pre-orders this month
  cumulativePreOrders: number;     // Total pre-orders to date
  unitsProduced: number;           // Units produced this month
  unitsDelivered: number;          // Units delivered this month
}

/**
 * Result of deposit impact calculation
 */
export interface DepositImpactResult {
  // Input echo
  input: DepositImpactInput;
  
  // Timeline
  cashFlowTimeline: MonthlyCashFlow[];
  
  // Summary metrics
  totalDepositsCollected: number;  // Sum of all deposits
  totalRefundsIssued: number;      // Deposits returned to non-converters
  netDepositsRetained: number;     // Deposits kept (converted customers)
  
  // Capital impact
  peakCapitalWithoutDeposits: number;  // Max capital needed if no deposits
  peakCapitalWithDeposits: number;     // Max capital needed with deposits
  capitalReduction: number;            // Absolute $ reduction
  capitalReductionPercent: number;     // % reduction
  
  // Timing metrics
  breakEvenMonth: number | null;       // Month when cumulative cash goes positive
  peakNegativeMonth: number;           // Month of maximum capital need
  
  // Cash flow health
  minCumulativeCash: number;           // Lowest cash position
  endingCumulativeCash: number;        // Final cash position
}

/**
 * Sensitivity analysis for deposit amounts
 */
export interface DepositSensitivityRow {
  depositAmount: number;
  capitalReduction: number;
  capitalReductionPercent: number;
  peakCapitalNeeded: number;
  breakEvenMonth: number | null;
}

/**
 * Full sensitivity table result
 */
export interface DepositSensitivityTable {
  rows: DepositSensitivityRow[];
  baseCase: DepositSensitivityRow;
  conversionRate: number;
  preOrderCount: number;
}

/**
 * Default deposit amounts for sensitivity analysis
 */
export const DEFAULT_DEPOSIT_AMOUNTS = [50, 100, 150, 200, 250, 300, 400, 500];

/**
 * Default pre-order scenarios
 */
export const DEFAULT_PREORDER_SCENARIOS: PreOrderScenario[] = [
  { name: 'Conservative', preOrderCount: 100, monthlyGrowthRate: 0 },
  { name: 'Base', preOrderCount: 250, monthlyGrowthRate: 0 },
  { name: 'Optimistic', preOrderCount: 500, monthlyGrowthRate: 0 },
  { name: 'Aggressive', preOrderCount: 1000, monthlyGrowthRate: 0 },
];

/**
 * Default input values
 */
export const DEFAULT_DEPOSIT_INPUT: DepositImpactInput = {
  depositAmount: 200,
  conversionRate: 0.85,
  preOrderCount: 250,
  
  preOrderStartMonth: 1,
  preOrderDurationMonths: 6,
  productionStartMonth: 4,
  fulfillmentStartMonth: 7,
  fulfillmentDurationMonths: 3,
  
  unitProductionCost: 200,
  fulfillmentCostPerUnit: 25,
  fullPrice: 1000,
};
