/**
 * @file ProfitAndLossImport.tsx
 * @description P&L import component with preview and validation
 * @related-issue #25 - QuickBooks actuals import
 */

import { useState } from 'react'
import {
  useQBOStore,
  fetchProfitAndLoss,
  importProfitAndLoss,
} from './store'
import { validateProfitAndLoss, validateDateRange } from './validation'
import type { ValidationResult } from './types'

export function ProfitAndLossImport() {
  const {
    profitAndLossReport,
    setProfitAndLossReport,
    isLoading,
    setIsLoading,
    activeImport,
    setActiveImport,
    addImportJob,
  } = useQBOStore()

  const [startDate, setStartDate] = useState('2025-10-01')
  const [endDate, setEndDate] = useState('2026-01-31')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [importComplete, setImportComplete] = useState(false)

  const handlePreview = async () => {
    // Validate date range first
    const dateValidation = validateDateRange(startDate, endDate, 'profit_loss')
    if (!dateValidation.isValid) {
      setValidation(dateValidation)
      return
    }

    setIsLoading(true)
    setActiveImport('profit_loss')
    setValidation(null)
    setImportComplete(false)

    try {
      const report = await fetchProfitAndLoss(startDate, endDate)
      setProfitAndLossReport(report)

      // Validate the fetched report
      const reportValidation = validateProfitAndLoss(report)
      setValidation(reportValidation)
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [
          {
            field: 'api',
            message: `Failed to fetch P&L: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
          },
        ],
        warnings: [],
      })
    } finally {
      setIsLoading(false)
      setActiveImport(null)
    }
  }

  const handleImport = async () => {
    if (!profitAndLossReport || (validation && !validation.isValid)) return

    setIsLoading(true)
    setActiveImport('profit_loss')

    try {
      const job = await importProfitAndLoss(startDate, endDate)
      addImportJob(job)
      setImportComplete(true)
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [
          {
            field: 'import',
            message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
          },
        ],
        warnings: validation?.warnings || [],
      })
    } finally {
      setIsLoading(false)
      setActiveImport(null)
    }
  }

  const handleClear = () => {
    setProfitAndLossReport(null)
    setValidation(null)
    setImportComplete(false)
  }

  const isLoadingPL = isLoading && activeImport === 'profit_loss'

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Profit & Loss Import
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a date range to import monthly P&L data from QuickBooks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoadingPL}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoadingPL}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={isLoadingPL}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoadingPL
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoadingPL ? '⏳ Loading...' : '👁️ Preview Data'}
          </button>
          {profitAndLossReport && (
            <button
              onClick={handleClear}
              disabled={isLoadingPL}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-3">
          {validation.errors.map((error, idx) => (
            <div
              key={`error-${idx}`}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
            >
              <span className="text-red-500">❌</span>
              <div>
                <p className="font-medium text-red-800">{error.message}</p>
                <p className="text-sm text-red-600">Field: {error.field}</p>
              </div>
            </div>
          ))}
          {validation.warnings.map((warning, idx) => (
            <div
              key={`warning-${idx}`}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3"
            >
              <span className="text-yellow-500">⚠️</span>
              <div>
                <p className="font-medium text-yellow-800">{warning.message}</p>
                <p className="text-sm text-yellow-600">Field: {warning.field}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Complete Message */}
      {importComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">Import Successful!</p>
            <p className="text-sm text-green-600">
              P&L data has been imported and is ready to use in your financial model.
            </p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {profitAndLossReport && !importComplete && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Preview: P&L Report</h4>
              <p className="text-sm text-gray-500">
                {profitAndLossReport.startDate} to {profitAndLossReport.endDate} •{' '}
                {profitAndLossReport.basis} Basis
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={isLoadingPL || (validation && !validation.isValid)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoadingPL || (validation && !validation.isValid)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoadingPL ? '⏳ Importing...' : '📥 Import Data'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Account
                  </th>
                  {profitAndLossReport.rows[0]?.amounts.map((amt) => (
                    <th
                      key={amt.period}
                      className="text-right py-3 px-4 font-semibold text-gray-600"
                    >
                      {amt.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {profitAndLossReport.rows.map((row) => (
                  <tr
                    key={row.accountId}
                    className={`border-t border-gray-100 ${
                      row.isHeader
                        ? 'bg-gray-50 font-semibold'
                        : row.isSubtotal
                        ? 'bg-blue-50 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td
                      className="py-2 px-4 text-gray-900"
                      style={{ paddingLeft: `${16 + row.depth * 20}px` }}
                    >
                      {row.accountName}
                    </td>
                    {row.amounts.map((amt) => (
                      <td
                        key={amt.period}
                        className="text-right py-2 px-4 text-gray-900"
                      >
                        ${amt.amount.toLocaleString()}
                      </td>
                    ))}
                    <td className="text-right py-2 px-4 text-gray-900 font-medium">
                      ${row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${profitAndLossReport.summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${profitAndLossReport.summary.grossProfit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Operating Income</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${profitAndLossReport.summary.operatingIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Income</p>
                <p className="text-lg font-semibold text-green-600">
                  ${profitAndLossReport.summary.netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
