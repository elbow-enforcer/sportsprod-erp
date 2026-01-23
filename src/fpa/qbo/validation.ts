/**
 * @file validation.ts
 * @description Data validation for QBO imports
 * @related-issue #25 - QuickBooks actuals import
 */

import type {
  ValidationResult,
  ValidationError,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  QBOAccountMapping,
} from './types'

// ============================================================================
// P&L VALIDATION
// ============================================================================
export function validateProfitAndLoss(report: ProfitAndLossReport): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check for required summary fields
  if (report.summary.totalRevenue === 0) {
    warnings.push({
      field: 'summary.totalRevenue',
      message: 'Total revenue is zero - verify this is correct',
      severity: 'warning',
    })
  }

  // Check gross profit calculation
  const calculatedGrossProfit = report.summary.totalRevenue - report.summary.totalCOGS
  if (Math.abs(calculatedGrossProfit - report.summary.grossProfit) > 0.01) {
    errors.push({
      field: 'summary.grossProfit',
      message: `Gross profit mismatch: calculated ${calculatedGrossProfit}, reported ${report.summary.grossProfit}`,
      severity: 'error',
    })
  }

  // Check for negative revenue (unusual)
  if (report.summary.totalRevenue < 0) {
    warnings.push({
      field: 'summary.totalRevenue',
      message: 'Total revenue is negative - this may indicate refunds exceeding sales',
      severity: 'warning',
    })
  }

  // Check for rows with missing amounts
  report.rows.forEach((row) => {
    if (!row.isHeader && !row.isSubtotal) {
      const hasAllAmounts = row.amounts.every((amt) => amt.amount !== undefined)
      if (!hasAllAmounts) {
        errors.push({
          field: `rows.${row.accountId}`,
          message: `Account "${row.accountName}" has missing amount data`,
          severity: 'error',
        })
      }
    }
  })

  // Check date range validity
  const startDate = new Date(report.startDate)
  const endDate = new Date(report.endDate)
  if (startDate >= endDate) {
    errors.push({
      field: 'dateRange',
      message: 'Start date must be before end date',
      severity: 'error',
    })
  }

  // Warn if date range is very long (>12 months)
  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
    (endDate.getMonth() - startDate.getMonth())
  if (monthsDiff > 12) {
    warnings.push({
      field: 'dateRange',
      message: 'Date range exceeds 12 months - consider importing in smaller chunks',
      severity: 'warning',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// BALANCE SHEET VALIDATION
// ============================================================================
export function validateBalanceSheet(report: BalanceSheetReport): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check that assets = liabilities + equity
  const balanceCheck = Math.abs(
    report.assets.totalAssets - 
    (report.liabilities.totalLiabilities + report.equity.totalEquity)
  )
  
  if (balanceCheck > 0.01) {
    errors.push({
      field: 'balance',
      message: `Balance sheet does not balance: Assets (${report.assets.totalAssets}) ≠ Liabilities (${report.liabilities.totalLiabilities}) + Equity (${report.equity.totalEquity})`,
      severity: 'error',
    })
  }

  // Check for negative cash (might be ok but worth flagging)
  const cashAccount = report.assets.current.find(
    (a) => a.accountType === 'Bank' && !a.isHeader && !a.isSubtotal
  )
  if (cashAccount && cashAccount.balance < 0) {
    warnings.push({
      field: 'assets.cash',
      message: 'Cash balance is negative - verify with bank statements',
      severity: 'warning',
    })
  }

  // Check for negative inventory
  const inventoryAccount = report.assets.current.find(
    (a) => a.accountName.toLowerCase().includes('inventory') && !a.isHeader && !a.isSubtotal
  )
  if (inventoryAccount && inventoryAccount.balance < 0) {
    errors.push({
      field: 'assets.inventory',
      message: 'Inventory cannot be negative',
      severity: 'error',
    })
  }

  // Check date validity
  const asOfDate = new Date(report.asOfDate)
  const today = new Date()
  if (asOfDate > today) {
    warnings.push({
      field: 'asOfDate',
      message: 'Balance sheet date is in the future',
      severity: 'warning',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// CASH FLOW VALIDATION
// ============================================================================
export function validateCashFlow(report: CashFlowReport): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check that net change reconciles
  const totalNetChange = 
    report.operating.netCashFromOperations +
    report.investing.netCashFromInvesting +
    report.financing.netCashFromFinancing

  if (Math.abs(totalNetChange - report.summary.netChangeInCash) > 0.01) {
    errors.push({
      field: 'summary.netChangeInCash',
      message: `Net change in cash doesn't reconcile: calculated ${totalNetChange}, reported ${report.summary.netChangeInCash}`,
      severity: 'error',
    })
  }

  // Check ending cash calculation
  const calculatedEndingCash = report.summary.beginningCash + report.summary.netChangeInCash
  if (Math.abs(calculatedEndingCash - report.summary.endingCash) > 0.01) {
    errors.push({
      field: 'summary.endingCash',
      message: `Ending cash doesn't reconcile: Beginning (${report.summary.beginningCash}) + Change (${report.summary.netChangeInCash}) ≠ Ending (${report.summary.endingCash})`,
      severity: 'error',
    })
  }

  // Warn if large negative operating cash flow
  if (report.operating.netCashFromOperations < -50000) {
    warnings.push({
      field: 'operating.netCashFromOperations',
      message: 'Significant negative operating cash flow - monitor burn rate',
      severity: 'warning',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// ACCOUNT MAPPING VALIDATION
// ============================================================================
export function validateAccountMappings(mappings: QBOAccountMapping[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check for unmapped accounts
  const unmapped = mappings.filter((m) => m.isActive && m.modelCategory === null)
  if (unmapped.length > 0) {
    warnings.push({
      field: 'mappings',
      message: `${unmapped.length} active account(s) are not mapped to model categories`,
      severity: 'warning',
    })
  }

  // Check for duplicate mappings
  const seen = new Set<string>()
  mappings.forEach((m) => {
    if (seen.has(m.qboAccountId)) {
      errors.push({
        field: `mapping.${m.qboAccountId}`,
        message: `Duplicate mapping for QBO account "${m.qboAccountName}"`,
        severity: 'error',
      })
    }
    seen.add(m.qboAccountId)
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// IMPORT DATE RANGE VALIDATION
// ============================================================================
export function validateDateRange(
  startDate: string,
  endDate: string,
  reportType?: 'profit_loss' | 'cash_flow'
): ValidationResult {
  // reportType reserved for future type-specific validation
  void reportType
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  if (isNaN(start.getTime())) {
    errors.push({
      field: 'startDate',
      message: 'Invalid start date format',
      severity: 'error',
    })
  }

  if (isNaN(end.getTime())) {
    errors.push({
      field: 'endDate',
      message: 'Invalid end date format',
      severity: 'error',
    })
  }

  if (start >= end) {
    errors.push({
      field: 'dateRange',
      message: 'Start date must be before end date',
      severity: 'error',
    })
  }

  if (end > today) {
    warnings.push({
      field: 'endDate',
      message: 'End date is in the future - data may be incomplete',
      severity: 'warning',
    })
  }

  // For P&L and Cash Flow, recommend month boundaries
  if (start.getDate() !== 1) {
    warnings.push({
      field: 'startDate',
      message: 'Start date is not the first of the month - consider using month boundaries',
      severity: 'warning',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
