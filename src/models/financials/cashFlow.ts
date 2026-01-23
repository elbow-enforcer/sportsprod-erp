/**
 * Cash Flow Statement Calculator
 * Indirect method: starts with net income and adjusts for non-cash items
 */

import { IncomeStatement } from './types';
import { BalanceSheet } from './balanceSheet';

export interface CashFlowStatement {
  year: number;
  
  // Operating Activities (Indirect Method)
  netIncome: number;
  
  // Adjustments for non-cash items
  depreciation: number;
  amortization: number;
  deferredTaxes: number;
  stockBasedComp: number;
  
  // Changes in working capital
  changeInReceivables: number;   // Decrease = source of cash
  changeInInventory: number;     // Decrease = source of cash
  changeInPrepaid: number;       // Decrease = source of cash
  changeInPayables: number;      // Increase = source of cash
  changeInAccrued: number;       // Increase = source of cash
  
  totalWorkingCapitalChange: number;
  cashFromOperations: number;
  
  // Investing Activities
  capitalExpenditures: number;   // Usually negative
  acquisitions: number;
  investmentPurchases: number;
  investmentSales: number;
  cashFromInvesting: number;
  
  // Financing Activities
  debtProceeds: number;
  debtRepayments: number;
  equityIssuance: number;
  shareRepurchases: number;
  dividendsPaid: number;
  cashFromFinancing: number;
  
  // Summary
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
  
  // Free Cash Flow metrics
  freeCashFlow: number;          // CFO - CapEx
  freeCashFlowToEquity: number;  // FCF - Net Debt Payments
}

export interface CashFlowInputs {
  incomeStatement: IncomeStatement;
  currentBalanceSheet: BalanceSheet;
  previousBalanceSheet: BalanceSheet | null;
  capex?: number;
  debtProceeds?: number;
  debtRepayments?: number;
  equityIssuance?: number;
  dividendsPaid?: number;
}

/**
 * Calculate cash flow statement from income statement and balance sheets
 */
export function calculateCashFlow(inputs: CashFlowInputs): CashFlowStatement {
  const {
    incomeStatement,
    currentBalanceSheet,
    previousBalanceSheet,
    capex = 0,
    debtProceeds = 0,
    debtRepayments = 0,
    equityIssuance = 0,
    dividendsPaid = 0,
  } = inputs;

  const year = incomeStatement.year;
  const isFirstYear = previousBalanceSheet === null;
  
  // Operating Activities
  const netIncome = incomeStatement.netIncome;
  const depreciation = incomeStatement.depreciation;
  const amortization = incomeStatement.amortization;
  const deferredTaxes = 0; // Simplified
  const stockBasedComp = 0; // Simplified
  
  // Working capital changes (increase in asset = use of cash, negative)
  const changeInReceivables = isFirstYear 
    ? -currentBalanceSheet.accountsReceivable 
    : -(currentBalanceSheet.accountsReceivable - previousBalanceSheet!.accountsReceivable);
    
  const changeInInventory = isFirstYear
    ? -currentBalanceSheet.inventory
    : -(currentBalanceSheet.inventory - previousBalanceSheet!.inventory);
    
  const changeInPrepaid = isFirstYear
    ? -currentBalanceSheet.prepaidExpenses
    : -(currentBalanceSheet.prepaidExpenses - previousBalanceSheet!.prepaidExpenses);
    
  // Increase in liability = source of cash, positive
  const changeInPayables = isFirstYear
    ? currentBalanceSheet.accountsPayable
    : currentBalanceSheet.accountsPayable - previousBalanceSheet!.accountsPayable;
    
  const changeInAccrued = isFirstYear
    ? currentBalanceSheet.accruedExpenses
    : currentBalanceSheet.accruedExpenses - previousBalanceSheet!.accruedExpenses;
  
  const totalWorkingCapitalChange = 
    changeInReceivables + 
    changeInInventory + 
    changeInPrepaid + 
    changeInPayables + 
    changeInAccrued;
  
  const cashFromOperations = 
    netIncome + 
    depreciation + 
    amortization + 
    deferredTaxes + 
    stockBasedComp + 
    totalWorkingCapitalChange;
  
  // Investing Activities
  const capitalExpenditures = -Math.abs(capex); // Always negative
  const acquisitions = 0;
  const investmentPurchases = 0;
  const investmentSales = 0;
  
  const cashFromInvesting = 
    capitalExpenditures + 
    acquisitions + 
    investmentPurchases + 
    investmentSales;
  
  // Financing Activities
  const cashFromFinancing = 
    debtProceeds - 
    debtRepayments + 
    equityIssuance - 
    dividendsPaid;
  
  // Summary
  const netCashChange = cashFromOperations + cashFromInvesting + cashFromFinancing;
  const beginningCash = isFirstYear ? 0 : previousBalanceSheet!.cash;
  const endingCash = beginningCash + netCashChange;
  
  // Free Cash Flow metrics
  const freeCashFlow = cashFromOperations - Math.abs(capex);
  const netDebtPayments = debtRepayments - debtProceeds;
  const freeCashFlowToEquity = freeCashFlow - netDebtPayments;

  return {
    year,
    
    netIncome,
    depreciation,
    amortization,
    deferredTaxes,
    stockBasedComp,
    
    changeInReceivables,
    changeInInventory,
    changeInPrepaid,
    changeInPayables,
    changeInAccrued,
    
    totalWorkingCapitalChange,
    cashFromOperations,
    
    capitalExpenditures,
    acquisitions,
    investmentPurchases,
    investmentSales,
    cashFromInvesting,
    
    debtProceeds,
    debtRepayments,
    equityIssuance,
    shareRepurchases: 0,
    dividendsPaid,
    cashFromFinancing,
    
    netCashChange,
    beginningCash,
    endingCash,
    
    freeCashFlow,
    freeCashFlowToEquity,
  };
}

/**
 * Generate multi-year cash flow projections
 */
export function projectCashFlows(
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  annualCapex?: number[]
): CashFlowStatement[] {
  const cashFlows: CashFlowStatement[] = [];
  
  for (let i = 0; i < incomeStatements.length; i++) {
    const cf = calculateCashFlow({
      incomeStatement: incomeStatements[i],
      currentBalanceSheet: balanceSheets[i],
      previousBalanceSheet: i === 0 ? null : balanceSheets[i - 1],
      capex: annualCapex?.[i] ?? 0,
    });
    cashFlows.push(cf);
  }
  
  return cashFlows;
}
