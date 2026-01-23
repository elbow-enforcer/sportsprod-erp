/**
 * @file mockData.ts
 * @description Mock data for QBO imports - simulates API responses
 * @related-issue #25 - QuickBooks actuals import
 */

import type {
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  QBOAccountMapping,
  ImportJob,
  ImportSchedule,
} from './types'

// ============================================================================
// MOCK P&L REPORT
// ============================================================================
export const mockProfitAndLossReport: ProfitAndLossReport = {
  reportId: 'pl-2026-01',
  companyName: 'SportsProd LLC',
  startDate: '2025-10-01',
  endDate: '2026-01-31',
  generatedAt: new Date().toISOString(),
  basis: 'Accrual',
  rows: [
    {
      accountId: 'income',
      accountName: 'Income',
      accountType: 'Income',
      amounts: [
        { period: '2025-10', amount: 125000 },
        { period: '2025-11', amount: 132000 },
        { period: '2025-12', amount: 138500 },
        { period: '2026-01', amount: 142500 },
      ],
      total: 538000,
      isHeader: true,
      depth: 0,
    },
    {
      accountId: '1',
      accountName: 'Product Sales',
      accountType: 'Income',
      amounts: [
        { period: '2025-10', amount: 98000 },
        { period: '2025-11', amount: 104000 },
        { period: '2025-12', amount: 110000 },
        { period: '2026-01', amount: 115000 },
      ],
      total: 427000,
      depth: 1,
    },
    {
      accountId: '2',
      accountName: 'Service Revenue',
      accountType: 'Income',
      amounts: [
        { period: '2025-10', amount: 27000 },
        { period: '2025-11', amount: 28000 },
        { period: '2025-12', amount: 28500 },
        { period: '2026-01', amount: 27500 },
      ],
      total: 111000,
      depth: 1,
    },
    {
      accountId: 'cogs',
      accountName: 'Cost of Goods Sold',
      accountType: 'COGS',
      amounts: [
        { period: '2025-10', amount: 47500 },
        { period: '2025-11', amount: 50160 },
        { period: '2025-12', amount: 52630 },
        { period: '2026-01', amount: 54150 },
      ],
      total: 204440,
      isHeader: true,
      depth: 0,
    },
    {
      accountId: '3',
      accountName: 'Raw Materials',
      accountType: 'COGS',
      amounts: [
        { period: '2025-10', amount: 32000 },
        { period: '2025-11', amount: 34000 },
        { period: '2025-12', amount: 35500 },
        { period: '2026-01', amount: 36500 },
      ],
      total: 138000,
      depth: 1,
    },
    {
      accountId: '4',
      accountName: 'Manufacturing Labor',
      accountType: 'COGS',
      amounts: [
        { period: '2025-10', amount: 15500 },
        { period: '2025-11', amount: 16160 },
        { period: '2025-12', amount: 17130 },
        { period: '2026-01', amount: 17650 },
      ],
      total: 66440,
      depth: 1,
    },
    {
      accountId: 'expenses',
      accountName: 'Operating Expenses',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 43700 },
        { period: '2025-11', amount: 46000 },
        { period: '2025-12', amount: 48500 },
        { period: '2026-01', amount: 50600 },
      ],
      total: 188800,
      isHeader: true,
      depth: 0,
    },
    {
      accountId: '5',
      accountName: 'Facebook Ads',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 6500 },
        { period: '2025-11', amount: 7200 },
        { period: '2025-12', amount: 7800 },
        { period: '2026-01', amount: 8500 },
      ],
      total: 30000,
      depth: 1,
    },
    {
      accountId: '6',
      accountName: 'Google Ads',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 4800 },
        { period: '2025-11', amount: 5400 },
        { period: '2025-12', amount: 5700 },
        { period: '2026-01', amount: 6200 },
      ],
      total: 22100,
      depth: 1,
    },
    {
      accountId: '7',
      accountName: 'Influencer Marketing',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 3000 },
        { period: '2025-11', amount: 3200 },
        { period: '2025-12', amount: 3500 },
        { period: '2026-01', amount: 3500 },
      ],
      total: 13200,
      depth: 1,
    },
    {
      accountId: '8',
      accountName: 'Salaries & Wages',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 18000 },
        { period: '2025-11', amount: 18500 },
        { period: '2025-12', amount: 19500 },
        { period: '2026-01', amount: 20000 },
      ],
      total: 76000,
      depth: 1,
    },
    {
      accountId: '9',
      accountName: 'Rent',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 4500 },
        { period: '2025-11', amount: 4500 },
        { period: '2025-12', amount: 4500 },
        { period: '2026-01', amount: 4500 },
      ],
      total: 18000,
      depth: 1,
    },
    {
      accountId: '10',
      accountName: 'Software Subscriptions',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 2400 },
        { period: '2025-11', amount: 2600 },
        { period: '2025-12', amount: 2800 },
        { period: '2026-01', amount: 2800 },
      ],
      total: 10600,
      depth: 1,
    },
    {
      accountId: '11',
      accountName: 'Professional Services',
      accountType: 'Expense',
      amounts: [
        { period: '2025-10', amount: 4500 },
        { period: '2025-11', amount: 4600 },
        { period: '2025-12', amount: 4700 },
        { period: '2026-01', amount: 5100 },
      ],
      total: 18900,
      depth: 1,
    },
  ],
  summary: {
    totalRevenue: 538000,
    totalCOGS: 204440,
    grossProfit: 333560,
    totalOperatingExpenses: 188800,
    operatingIncome: 144760,
    netIncome: 144760,
  },
}

// ============================================================================
// MOCK BALANCE SHEET REPORT
// ============================================================================
export const mockBalanceSheetReport: BalanceSheetReport = {
  reportId: 'bs-2026-01-31',
  companyName: 'SportsProd LLC',
  asOfDate: '2026-01-31',
  generatedAt: new Date().toISOString(),
  assets: {
    current: [
      { accountId: 'ca', accountName: 'Current Assets', accountType: 'Asset', balance: 0, isHeader: true, depth: 0 },
      { accountId: '101', accountName: 'Cash and Cash Equivalents', accountType: 'Bank', balance: 285000, depth: 1 },
      { accountId: '102', accountName: 'Accounts Receivable', accountType: 'Accounts Receivable', balance: 78500, depth: 1 },
      { accountId: '103', accountName: 'Inventory', accountType: 'Other Current Asset', balance: 124000, depth: 1 },
      { accountId: '104', accountName: 'Prepaid Expenses', accountType: 'Other Current Asset', balance: 12500, depth: 1 },
      { accountId: 'ca-total', accountName: 'Total Current Assets', accountType: 'Asset', balance: 500000, isSubtotal: true, depth: 0 },
    ],
    fixed: [
      { accountId: 'fa', accountName: 'Fixed Assets', accountType: 'Asset', balance: 0, isHeader: true, depth: 0 },
      { accountId: '201', accountName: 'Equipment', accountType: 'Fixed Asset', balance: 95000, depth: 1 },
      { accountId: '202', accountName: 'Furniture & Fixtures', accountType: 'Fixed Asset', balance: 18000, depth: 1 },
      { accountId: '203', accountName: 'Accumulated Depreciation', accountType: 'Fixed Asset', balance: -23000, depth: 1 },
      { accountId: 'fa-total', accountName: 'Total Fixed Assets', accountType: 'Asset', balance: 90000, isSubtotal: true, depth: 0 },
    ],
    other: [
      { accountId: 'oa', accountName: 'Other Assets', accountType: 'Asset', balance: 0, isHeader: true, depth: 0 },
      { accountId: '301', accountName: 'Security Deposits', accountType: 'Other Asset', balance: 10000, depth: 1 },
      { accountId: 'oa-total', accountName: 'Total Other Assets', accountType: 'Asset', balance: 10000, isSubtotal: true, depth: 0 },
    ],
    totalAssets: 600000,
  },
  liabilities: {
    current: [
      { accountId: 'cl', accountName: 'Current Liabilities', accountType: 'Liability', balance: 0, isHeader: true, depth: 0 },
      { accountId: '401', accountName: 'Accounts Payable', accountType: 'Accounts Payable', balance: 45000, depth: 1 },
      { accountId: '402', accountName: 'Accrued Expenses', accountType: 'Other Current Liability', balance: 28000, depth: 1 },
      { accountId: '403', accountName: 'Credit Card Payable', accountType: 'Credit Card', balance: 12000, depth: 1 },
      { accountId: '404', accountName: 'Sales Tax Payable', accountType: 'Other Current Liability', balance: 8500, depth: 1 },
      { accountId: 'cl-total', accountName: 'Total Current Liabilities', accountType: 'Liability', balance: 93500, isSubtotal: true, depth: 0 },
    ],
    longTerm: [
      { accountId: 'ltl', accountName: 'Long-term Liabilities', accountType: 'Liability', balance: 0, isHeader: true, depth: 0 },
      { accountId: '501', accountName: 'Equipment Loan', accountType: 'Long Term Liability', balance: 45000, depth: 1 },
      { accountId: 'ltl-total', accountName: 'Total Long-term Liabilities', accountType: 'Liability', balance: 45000, isSubtotal: true, depth: 0 },
    ],
    totalLiabilities: 138500,
  },
  equity: {
    rows: [
      { accountId: 'eq', accountName: 'Equity', accountType: 'Equity', balance: 0, isHeader: true, depth: 0 },
      { accountId: '601', accountName: "Owner's Equity", accountType: 'Equity', balance: 200000, depth: 1 },
      { accountId: '602', accountName: 'Retained Earnings', accountType: 'Equity', balance: 116740, depth: 1 },
      { accountId: '603', accountName: 'Net Income (YTD)', accountType: 'Equity', balance: 144760, depth: 1 },
      { accountId: 'eq-total', accountName: 'Total Equity', accountType: 'Equity', balance: 461500, isSubtotal: true, depth: 0 },
    ],
    totalEquity: 461500,
  },
}

// ============================================================================
// MOCK CASH FLOW REPORT
// ============================================================================
export const mockCashFlowReport: CashFlowReport = {
  reportId: 'cf-2026-01',
  companyName: 'SportsProd LLC',
  startDate: '2025-10-01',
  endDate: '2026-01-31',
  generatedAt: new Date().toISOString(),
  operating: {
    rows: [
      { accountId: 'ni', description: 'Net Income', amount: 144760, category: 'operating' },
      { accountId: 'dep', description: 'Depreciation & Amortization', amount: 8000, category: 'operating' },
      { accountId: 'ar', description: 'Change in Accounts Receivable', amount: -15500, category: 'operating' },
      { accountId: 'inv', description: 'Change in Inventory', amount: -24000, category: 'operating' },
      { accountId: 'prep', description: 'Change in Prepaid Expenses', amount: -2500, category: 'operating' },
      { accountId: 'ap', description: 'Change in Accounts Payable', amount: 12000, category: 'operating' },
      { accountId: 'acc', description: 'Change in Accrued Expenses', amount: 8000, category: 'operating' },
    ],
    netCashFromOperations: 130760,
  },
  investing: {
    rows: [
      { accountId: 'equip', description: 'Purchase of Equipment', amount: -25000, category: 'investing' },
      { accountId: 'soft', description: 'Software Development', amount: -8000, category: 'investing' },
    ],
    netCashFromInvesting: -33000,
  },
  financing: {
    rows: [
      { accountId: 'loan', description: 'Loan Repayment', amount: -15000, category: 'financing' },
      { accountId: 'dist', description: "Owner's Distributions", amount: -20000, category: 'financing' },
    ],
    netCashFromFinancing: -35000,
  },
  summary: {
    beginningCash: 222240,
    netChangeInCash: 62760,
    endingCash: 285000,
  },
}

// ============================================================================
// MOCK ACCOUNT MAPPINGS
// ============================================================================
export const mockAccountMappings: QBOAccountMapping[] = [
  { id: '1', qboAccountId: '1', qboAccountName: 'Product Sales', qboAccountType: 'Income', modelCategory: 'Revenue', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '2', qboAccountId: '2', qboAccountName: 'Service Revenue', qboAccountType: 'Income', modelCategory: 'Revenue', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '3', qboAccountId: '3', qboAccountName: 'Raw Materials', qboAccountType: 'COGS', modelCategory: 'COGS', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '4', qboAccountId: '4', qboAccountName: 'Manufacturing Labor', qboAccountType: 'COGS', modelCategory: 'COGS', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '5', qboAccountId: '5', qboAccountName: 'Facebook Ads', qboAccountType: 'Expense', modelCategory: 'Marketing', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '6', qboAccountId: '6', qboAccountName: 'Google Ads', qboAccountType: 'Expense', modelCategory: 'Marketing', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '7', qboAccountId: '7', qboAccountName: 'Influencer Marketing', qboAccountType: 'Expense', modelCategory: 'Marketing', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '8', qboAccountId: '8', qboAccountName: 'Salaries & Wages', qboAccountType: 'Expense', modelCategory: 'G&A', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '9', qboAccountId: '9', qboAccountName: 'Rent', qboAccountType: 'Expense', modelCategory: 'G&A', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '10', qboAccountId: '10', qboAccountName: 'Software Subscriptions', qboAccountType: 'Expense', modelCategory: 'G&A', isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: '11', qboAccountId: '11', qboAccountName: 'Professional Services', qboAccountType: 'Expense', modelCategory: null, isActive: true, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
]

// ============================================================================
// MOCK IMPORT HISTORY
// ============================================================================
export const mockImportJobs: ImportJob[] = [
  {
    id: 'job-1',
    type: 'profit_loss',
    status: 'success',
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    asOfDate: null,
    recordsImported: 48,
    errorMessage: null,
    createdAt: '2026-01-22T18:30:00Z',
    completedAt: '2026-01-22T18:30:45Z',
  },
  {
    id: 'job-2',
    type: 'balance_sheet',
    status: 'success',
    startDate: null,
    endDate: null,
    asOfDate: '2026-01-31',
    recordsImported: 18,
    errorMessage: null,
    createdAt: '2026-01-22T18:31:00Z',
    completedAt: '2026-01-22T18:31:15Z',
  },
  {
    id: 'job-3',
    type: 'cash_flow',
    status: 'success',
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    asOfDate: null,
    recordsImported: 11,
    errorMessage: null,
    createdAt: '2026-01-22T18:32:00Z',
    completedAt: '2026-01-22T18:32:30Z',
  },
  {
    id: 'job-4',
    type: 'profit_loss',
    status: 'error',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    asOfDate: null,
    recordsImported: 0,
    errorMessage: 'Rate limit exceeded. Please try again in 5 minutes.',
    createdAt: '2026-01-21T14:00:00Z',
    completedAt: '2026-01-21T14:00:05Z',
  },
]

// ============================================================================
// MOCK IMPORT SCHEDULES
// ============================================================================
export const mockImportSchedules: ImportSchedule[] = [
  {
    id: 'sched-1',
    type: 'profit_loss',
    enabled: true,
    frequency: 'monthly',
    dayOfMonth: 5,
    timeOfDay: '06:00',
    lastRun: '2026-01-05T06:00:00Z',
    nextRun: '2026-02-05T06:00:00Z',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-05T06:00:00Z',
  },
  {
    id: 'sched-2',
    type: 'balance_sheet',
    enabled: true,
    frequency: 'monthly',
    dayOfMonth: 5,
    timeOfDay: '06:30',
    lastRun: '2026-01-05T06:30:00Z',
    nextRun: '2026-02-05T06:30:00Z',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-05T06:30:00Z',
  },
  {
    id: 'sched-3',
    type: 'cash_flow',
    enabled: false,
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    timeOfDay: '07:00',
    lastRun: null,
    nextRun: null,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
]
