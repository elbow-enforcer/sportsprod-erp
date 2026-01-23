/**
 * Balance Sheet Calculator
 * Calculates Assets, Liabilities, and Equity based on income statement and assumptions
 */

import { IncomeStatement, WorkingCapitalComponents, FinancingAssumptions, DEFAULT_WORKING_CAPITAL, DEFAULT_FINANCING } from './types';

export interface BalanceSheet {
  year: number;
  
  // Current Assets
  cash: number;
  accountsReceivable: number;
  inventory: number;
  prepaidExpenses: number;
  totalCurrentAssets: number;
  
  // Non-Current Assets
  grossPPE: number;           // Property, Plant & Equipment
  accumulatedDepreciation: number;
  netPPE: number;
  intangibleAssets: number;
  totalNonCurrentAssets: number;
  
  totalAssets: number;
  
  // Current Liabilities
  accountsPayable: number;
  accruedExpenses: number;
  currentPortionDebt: number;
  totalCurrentLiabilities: number;
  
  // Non-Current Liabilities
  longTermDebt: number;
  deferredTaxLiabilities: number;
  totalNonCurrentLiabilities: number;
  
  totalLiabilities: number;
  
  // Equity
  commonStock: number;
  additionalPaidInCapital: number;
  retainedEarnings: number;
  totalEquity: number;
  
  // Check
  totalLiabilitiesAndEquity: number;
  balanceCheck: boolean;  // Should always be true (A = L + E)
}

export interface BalanceSheetInputs {
  incomeStatement: IncomeStatement;
  previousBalanceSheet: BalanceSheet | null;
  workingCapital?: WorkingCapitalComponents;
  financing?: FinancingAssumptions;
  capex?: number;
}

/**
 * Calculate balance sheet from income statement and prior period
 */
export function calculateBalanceSheet(inputs: BalanceSheetInputs): BalanceSheet {
  const { 
    incomeStatement, 
    previousBalanceSheet,
    workingCapital = DEFAULT_WORKING_CAPITAL,
    financing = DEFAULT_FINANCING,
    capex = 0 
  } = inputs;

  const year = incomeStatement.year;
  const isFirstYear = previousBalanceSheet === null;
  
  // Working capital calculations (based on days outstanding)
  const dailyCOGS = incomeStatement.cogs / 365;
  const dailyRevenue = incomeStatement.netRevenue / 365;
  
  const accountsReceivable = dailyRevenue * workingCapital.daysReceivable;
  const inventory = dailyCOGS * workingCapital.daysInventory;
  const accountsPayable = dailyCOGS * workingCapital.daysPayable;
  
  // Prepaid expenses (estimate as 1 month of opex)
  const prepaidExpenses = (incomeStatement.marketing + incomeStatement.gna) / 12;
  
  // Total current assets
  const priorCash = isFirstYear ? financing.initialCash : previousBalanceSheet!.cash;
  const totalCurrentAssets = priorCash + accountsReceivable + inventory + prepaidExpenses;
  
  // PPE with depreciation
  const priorGrossPPE = isFirstYear ? 0 : previousBalanceSheet!.grossPPE;
  const priorAccumDepr = isFirstYear ? 0 : previousBalanceSheet!.accumulatedDepreciation;
  const grossPPE = priorGrossPPE + capex;
  const accumulatedDepreciation = priorAccumDepr + incomeStatement.depreciation;
  const netPPE = grossPPE - accumulatedDepreciation;
  
  const intangibleAssets = 0; // Can be expanded
  const totalNonCurrentAssets = netPPE + intangibleAssets;
  
  // Liabilities
  const accruedExpenses = (incomeStatement.marketing + incomeStatement.gna) / 12;
  const currentPortionDebt = 0; // Simplified
  const totalCurrentLiabilities = accountsPayable + accruedExpenses + currentPortionDebt;
  
  const longTermDebt = isFirstYear ? financing.initialDebt : previousBalanceSheet!.longTermDebt;
  const deferredTaxLiabilities = 0;
  const totalNonCurrentLiabilities = longTermDebt + deferredTaxLiabilities;
  
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  
  // Equity
  const commonStock = financing.initialEquity;
  const additionalPaidInCapital = 0; // Future funding rounds
  const priorRetainedEarnings = isFirstYear ? 0 : previousBalanceSheet!.retainedEarnings;
  const dividends = incomeStatement.netIncome * financing.dividendPayoutRatio;
  const retainedEarnings = priorRetainedEarnings + incomeStatement.netIncome - dividends;
  
  const totalEquity = commonStock + additionalPaidInCapital + retainedEarnings;
  
  // Calculate ending cash to balance
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  
  // Adjust cash to make balance sheet balance (plug)
  const cashPlug = totalLiabilitiesAndEquity - (totalAssets - priorCash);
  const cash = Math.max(cashPlug, financing.minCashBalance);
  
  // Recalculate with adjusted cash
  const finalTotalCurrentAssets = cash + accountsReceivable + inventory + prepaidExpenses;
  const finalTotalAssets = finalTotalCurrentAssets + totalNonCurrentAssets;
  
  const balanceCheck = Math.abs(finalTotalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    year,
    
    cash,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    totalCurrentAssets: finalTotalCurrentAssets,
    
    grossPPE,
    accumulatedDepreciation,
    netPPE,
    intangibleAssets,
    totalNonCurrentAssets,
    
    totalAssets: finalTotalAssets,
    
    accountsPayable,
    accruedExpenses,
    currentPortionDebt,
    totalCurrentLiabilities,
    
    longTermDebt,
    deferredTaxLiabilities,
    totalNonCurrentLiabilities,
    
    totalLiabilities,
    
    commonStock,
    additionalPaidInCapital,
    retainedEarnings,
    totalEquity,
    
    totalLiabilitiesAndEquity,
    balanceCheck,
  };
}

/**
 * Generate multi-year balance sheet projections
 */
export function projectBalanceSheets(
  incomeStatements: IncomeStatement[],
  workingCapital?: WorkingCapitalComponents,
  financing?: FinancingAssumptions,
  annualCapex?: number[]
): BalanceSheet[] {
  const balanceSheets: BalanceSheet[] = [];
  
  for (let i = 0; i < incomeStatements.length; i++) {
    const bs = calculateBalanceSheet({
      incomeStatement: incomeStatements[i],
      previousBalanceSheet: i === 0 ? null : balanceSheets[i - 1],
      workingCapital,
      financing,
      capex: annualCapex?.[i] ?? 0,
    });
    balanceSheets.push(bs);
  }
  
  return balanceSheets;
}
