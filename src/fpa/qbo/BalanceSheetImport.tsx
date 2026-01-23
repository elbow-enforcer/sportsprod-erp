/**
 * @file BalanceSheetImport.tsx
 * @description Balance Sheet import component with preview and validation
 * @related-issue #25 - QuickBooks actuals import
 */

import { useState } from 'react'
import {
  useQBOStore,
  fetchBalanceSheet,
  importBalanceSheet,
} from './store'
import { validateBalanceSheet } from './validation'
import type { ValidationResult, BalanceSheetRow } from './types'

function BalanceSheetSection({
  title,
  rows,
  total,
  totalLabel,
}: {
  title: string
  rows: BalanceSheetRow[]
  total: number
  totalLabel: string
}) {
  return (
    <div className="mb-6">
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <table className="min-w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.accountId}
              className={`${
                row.isHeader
                  ? 'font-semibold text-gray-700'
                  : row.isSubtotal
                  ? 'font-medium bg-gray-50 border-t border-gray-200'
                  : 'text-gray-600'
              }`}
            >
              <td
                className="py-1.5 px-2"
                style={{ paddingLeft: `${8 + row.depth * 16}px` }}
              >
                {row.accountName}
              </td>
              <td className="py-1.5 px-2 text-right">
                {!row.isHeader && (
                  <span className={row.balance < 0 ? 'text-red-600' : ''}>
                    ${Math.abs(row.balance).toLocaleString()}
                    {row.balance < 0 && ' (-)'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold border-t-2 border-gray-300">
            <td className="py-2 px-2">{totalLabel}</td>
            <td className="py-2 px-2 text-right">${total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function BalanceSheetImport() {
  const {
    balanceSheetReport,
    setBalanceSheetReport,
    isLoading,
    setIsLoading,
    activeImport,
    setActiveImport,
    addImportJob,
  } = useQBOStore()

  const [asOfDate, setAsOfDate] = useState('2026-01-31')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [importComplete, setImportComplete] = useState(false)

  const handlePreview = async () => {
    setIsLoading(true)
    setActiveImport('balance_sheet')
    setValidation(null)
    setImportComplete(false)

    try {
      const report = await fetchBalanceSheet(asOfDate)
      setBalanceSheetReport(report)

      // Validate the fetched report
      const reportValidation = validateBalanceSheet(report)
      setValidation(reportValidation)
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [
          {
            field: 'api',
            message: `Failed to fetch Balance Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    if (!balanceSheetReport || (validation && !validation.isValid)) return

    setIsLoading(true)
    setActiveImport('balance_sheet')

    try {
      const job = await importBalanceSheet(asOfDate)
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
    setBalanceSheetReport(null)
    setValidation(null)
    setImportComplete(false)
  }

  const isLoadingBS = isLoading && activeImport === 'balance_sheet'

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚖️ Balance Sheet Import
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a date to import the Balance Sheet snapshot from QuickBooks.
        </p>

        <div className="max-w-xs mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            As of Date
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingBS}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={isLoadingBS}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoadingBS
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoadingBS ? '⏳ Loading...' : '👁️ Preview Data'}
          </button>
          {balanceSheetReport && (
            <button
              onClick={handleClear}
              disabled={isLoadingBS}
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
              Balance Sheet data has been imported and is ready to use.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {balanceSheetReport && !importComplete && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Preview: Balance Sheet</h4>
              <p className="text-sm text-gray-500">
                As of {balanceSheetReport.asOfDate}
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={isLoadingBS || (validation && !validation.isValid)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoadingBS || (validation && !validation.isValid)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoadingBS ? '⏳ Importing...' : '📥 Import Data'}
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assets */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                ASSETS
              </h4>
              <BalanceSheetSection
                title="Current Assets"
                rows={balanceSheetReport.assets.current}
                total={balanceSheetReport.assets.current.find((r) => r.isSubtotal)?.balance || 0}
                totalLabel="Total Current Assets"
              />
              <BalanceSheetSection
                title="Fixed Assets"
                rows={balanceSheetReport.assets.fixed}
                total={balanceSheetReport.assets.fixed.find((r) => r.isSubtotal)?.balance || 0}
                totalLabel="Total Fixed Assets"
              />
              <BalanceSheetSection
                title="Other Assets"
                rows={balanceSheetReport.assets.other}
                total={balanceSheetReport.assets.other.find((r) => r.isSubtotal)?.balance || 0}
                totalLabel="Total Other Assets"
              />
              <div className="mt-4 pt-4 border-t-2 border-gray-800">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL ASSETS</span>
                  <span>${balanceSheetReport.assets.totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                LIABILITIES & EQUITY
              </h4>
              <BalanceSheetSection
                title="Current Liabilities"
                rows={balanceSheetReport.liabilities.current}
                total={balanceSheetReport.liabilities.current.find((r) => r.isSubtotal)?.balance || 0}
                totalLabel="Total Current Liabilities"
              />
              <BalanceSheetSection
                title="Long-term Liabilities"
                rows={balanceSheetReport.liabilities.longTerm}
                total={balanceSheetReport.liabilities.longTerm.find((r) => r.isSubtotal)?.balance || 0}
                totalLabel="Total Long-term Liabilities"
              />
              <div className="mb-6 py-2 bg-gray-100 px-2 rounded">
                <div className="flex justify-between font-semibold">
                  <span>Total Liabilities</span>
                  <span>${balanceSheetReport.liabilities.totalLiabilities.toLocaleString()}</span>
                </div>
              </div>
              <BalanceSheetSection
                title="Equity"
                rows={balanceSheetReport.equity.rows}
                total={balanceSheetReport.equity.totalEquity}
                totalLabel="Total Equity"
              />
              <div className="mt-4 pt-4 border-t-2 border-gray-800">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>
                    ${(
                      balanceSheetReport.liabilities.totalLiabilities +
                      balanceSheetReport.equity.totalEquity
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {balanceSheetReport.assets.totalAssets ===
            balanceSheetReport.liabilities.totalLiabilities + balanceSheetReport.equity.totalEquity ? (
              <div className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                <span className="font-medium">Balance sheet is in balance</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <span>✗</span>
                <span className="font-medium">Balance sheet is out of balance!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
