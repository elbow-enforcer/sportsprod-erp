/**
 * @file types.ts
 * @description QuickBooks Online data types for financial statement imports
 * @related-issue #25 - QuickBooks actuals import
 */

// ============================================================================
// QBO CONNECTION & AUTH
// ============================================================================
export interface QBOConnection {
  id: string
  companyId: string
  companyName: string
  accessToken: string
  refreshToken: string
  realmId: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface QBOConnectionStatus {
  connected: boolean
  companyName: string | null
  lastSync: string | null
  tokenExpiry: string | null
}

// ============================================================================
// ACCOUNT MAPPING
// ============================================================================
export type ModelCategory = 
  | 'Revenue'
  | 'COGS'
  | 'Marketing'
  | 'G&A'
  | 'R&D'
  | 'CapEx'
  | 'Interest'
  | 'Taxes'
  | 'Other'

export type BalanceSheetCategory =
  | 'Cash'
  | 'Accounts Receivable'
  | 'Inventory'
  | 'Prepaid Expenses'
  | 'Fixed Assets'
  | 'Other Assets'
  | 'Accounts Payable'
  | 'Accrued Expenses'
  | 'Short-term Debt'
  | 'Long-term Debt'
  | 'Equity'
  | 'Retained Earnings'

export interface QBOAccountMapping {
  id: string
  qboAccountId: string
  qboAccountName: string
  qboAccountType: string
  modelCategory: ModelCategory | BalanceSheetCategory | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// FINANCIAL STATEMENTS - P&L
// ============================================================================
export interface ProfitAndLossRow {
  accountId: string
  accountName: string
  accountType: string
  amounts: MonthlyAmount[]
  total: number
  isHeader?: boolean
  isSubtotal?: boolean
  depth: number
}

export interface MonthlyAmount {
  period: string // YYYY-MM
  amount: number
}

export interface ProfitAndLossReport {
  reportId: string
  companyName: string
  startDate: string
  endDate: string
  generatedAt: string
  basis: 'Accrual' | 'Cash'
  rows: ProfitAndLossRow[]
  summary: {
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    totalOperatingExpenses: number
    operatingIncome: number
    netIncome: number
  }
}

// ============================================================================
// FINANCIAL STATEMENTS - BALANCE SHEET
// ============================================================================
export interface BalanceSheetRow {
  accountId: string
  accountName: string
  accountType: string
  balance: number
  isHeader?: boolean
  isSubtotal?: boolean
  depth: number
}

export interface BalanceSheetReport {
  reportId: string
  companyName: string
  asOfDate: string
  generatedAt: string
  assets: {
    current: BalanceSheetRow[]
    fixed: BalanceSheetRow[]
    other: BalanceSheetRow[]
    totalAssets: number
  }
  liabilities: {
    current: BalanceSheetRow[]
    longTerm: BalanceSheetRow[]
    totalLiabilities: number
  }
  equity: {
    rows: BalanceSheetRow[]
    totalEquity: number
  }
}

// ============================================================================
// FINANCIAL STATEMENTS - CASH FLOW
// ============================================================================
export interface CashFlowRow {
  accountId: string
  description: string
  amount: number
  category: 'operating' | 'investing' | 'financing'
  isSubtotal?: boolean
}

export interface CashFlowReport {
  reportId: string
  companyName: string
  startDate: string
  endDate: string
  generatedAt: string
  operating: {
    rows: CashFlowRow[]
    netCashFromOperations: number
  }
  investing: {
    rows: CashFlowRow[]
    netCashFromInvesting: number
  }
  financing: {
    rows: CashFlowRow[]
    netCashFromFinancing: number
  }
  summary: {
    beginningCash: number
    netChangeInCash: number
    endingCash: number
  }
}

// ============================================================================
// IMPORT HISTORY & SCHEDULING
// ============================================================================
export type ImportType = 'profit_loss' | 'balance_sheet' | 'cash_flow'
export type ImportStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled'

export interface ImportJob {
  id: string
  type: ImportType
  status: ImportStatus
  startDate: string | null
  endDate: string | null
  asOfDate: string | null // For balance sheet
  recordsImported: number
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

export interface ImportSchedule {
  id: string
  type: ImportType
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number // 0-6, for weekly
  dayOfMonth?: number // 1-31, for monthly
  timeOfDay: string // HH:MM
  lastRun: string | null
  nextRun: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// VALIDATION
// ============================================================================
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// ============================================================================
// ACTUALS DATA (stored locally)
// ============================================================================
export interface MonthlyActuals {
  id: string
  period: string // YYYY-MM
  category: ModelCategory
  subcategory: string | null
  qboAccountId: string | null
  amount: number
  importJobId: string
  createdAt: string
}

export interface BalanceSheetActuals {
  id: string
  asOfDate: string // YYYY-MM-DD
  category: BalanceSheetCategory
  subcategory: string | null
  qboAccountId: string | null
  balance: number
  importJobId: string
  createdAt: string
}
