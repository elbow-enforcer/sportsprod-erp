/**
 * Shared types for financial statements
 * Three-Statement Model: Income Statement, Balance Sheet, Cash Flow Statement
 */

/**
 * Income Statement - represents P&L for a single period
 * Note: YearlyProjection in dcf/calculator.ts contains most P&L fields;
 * this interface formalizes the income statement structure.
 */
export interface IncomeStatement {
  year: number;
  
  // Revenue
  units: number;
  grossRevenue: number;
  discounts: number;
  netRevenue: number;
  
  // Cost of Goods Sold
  cogs: number;
  grossProfit: number;
  grossMargin: number; // grossProfit / netRevenue
  
  // Operating Expenses
  marketing: number;
  gna: number; // General & Administrative
  totalOpex: number;
  
  // Operating Income
  ebitda: number;
  depreciation: number;
  amortization: number;
  ebit: number; // Operating Income
  
  // Below the Line
  interestExpense: number;
  interestIncome: number;
  ebt: number; // Earnings Before Tax
  
  // Taxes & Net Income
  taxExpense: number;
  netIncome: number;
  netMargin: number; // netIncome / netRevenue
}

/**
 * Working capital components for balance sheet calculations
 */
export interface WorkingCapitalComponents {
  daysReceivable: number;     // Days Sales Outstanding (DSO)
  daysInventory: number;      // Days Inventory Outstanding (DIO)
  daysPayable: number;        // Days Payable Outstanding (DPO)
}

/**
 * Financing assumptions for balance sheet
 */
export interface FinancingAssumptions {
  initialCash: number;
  initialDebt: number;
  initialEquity: number;
  debtInterestRate: number;
  dividendPayoutRatio: number;
  minCashBalance: number;
}

/**
 * Extended assumptions including balance sheet drivers
 */
export interface BalanceSheetAssumptions {
  workingCapital: WorkingCapitalComponents;
  financing: FinancingAssumptions;
}

/**
 * Default working capital assumptions
 */
export const DEFAULT_WORKING_CAPITAL: WorkingCapitalComponents = {
  daysReceivable: 30,    // 30 days to collect
  daysInventory: 45,     // 45 days of inventory
  daysPayable: 30,       // 30 days to pay suppliers
};

/**
 * Default financing assumptions
 */
export const DEFAULT_FINANCING: FinancingAssumptions = {
  initialCash: 200000,          // $200k starting cash
  initialDebt: 0,               // No debt initially
  initialEquity: 200000,        // $200k founder equity
  debtInterestRate: 0.06,       // 6% interest if debt taken
  dividendPayoutRatio: 0,       // No dividends (growth stage)
  minCashBalance: 50000,        // Maintain $50k minimum
};
