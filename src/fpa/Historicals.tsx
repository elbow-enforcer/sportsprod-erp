import { useState } from 'react'

type ViewMode = 'monthly' | 'quarterly'

interface FinancialRow {
  category: string
  subcategory?: string
  actuals: number[]
  budget: number[]
}

const monthlyData: FinancialRow[] = [
  { category: 'Revenue', actuals: [125000, 132000, 138500, 142500], budget: [120000, 125000, 130000, 135000] },
  { category: 'COGS', actuals: [47500, 50160, 52630, 54150], budget: [45600, 47500, 49400, 51300] },
  { category: 'Gross Profit', actuals: [77500, 81840, 85870, 88350], budget: [74400, 77500, 80600, 83700] },
  { category: 'Marketing', actuals: [15200, 16800, 17500, 18200], budget: [18000, 18500, 19000, 20000] },
  { category: 'G&A', actuals: [28500, 29200, 31000, 32400], budget: [27000, 28000, 29000, 30000] },
  { category: 'Operating Expenses', actuals: [43700, 46000, 48500, 50600], budget: [45000, 46500, 48000, 50000] },
  { category: 'Net Income', actuals: [33800, 35840, 37370, 37750], budget: [29400, 31000, 32600, 33700] },
]

const quarterlyData: FinancialRow[] = [
  { category: 'Revenue', actuals: [395500, 538000], budget: [375000, 520000] },
  { category: 'COGS', actuals: [150290, 206150], budget: [142500, 198000] },
  { category: 'Gross Profit', actuals: [245210, 331850], budget: [232500, 322000] },
  { category: 'Marketing', actuals: [49500, 67500], budget: [55500, 75000] },
  { category: 'G&A', actuals: [88700, 119200], budget: [84000, 115000] },
  { category: 'Operating Expenses', actuals: [138200, 186700], budget: [139500, 190000] },
  { category: 'Net Income', actuals: [107010, 145150], budget: [93000, 132000] },
]

const monthLabels = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026']
const quarterLabels = ['Q4 2025', 'Q1 2026']

export function Historicals() {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')

  const data = viewMode === 'monthly' ? monthlyData : quarterlyData
  const labels = viewMode === 'monthly' ? monthLabels : quarterLabels

  const calculateVariance = (actual: number, budget: number, isExpense: boolean) => {
    const variance = actual - budget
    const percent = budget !== 0 ? ((variance / budget) * 100).toFixed(1) : '0'
    // For expenses, under budget is good (negative variance = positive)
    // For revenue/profit, over budget is good (positive variance = positive)
    const isPositive = isExpense ? variance <= 0 : variance >= 0
    return { variance, percent, isPositive }
  }

  const isExpenseRow = (category: string) => {
    return ['COGS', 'Marketing', 'G&A', 'Operating Expenses'].includes(category)
  }

  const isSummaryRow = (category: string) => {
    return ['Gross Profit', 'Operating Expenses', 'Net Income'].includes(category)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historical Financials</h2>
          <p className="text-gray-500 mt-1">Actuals vs Budget comparison from QuickBooks data</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('quarterly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'quarterly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Total Revenue',
            actual: data[0].actuals.reduce((a, b) => a + b, 0),
            budget: data[0].budget.reduce((a, b) => a + b, 0),
            icon: '💰',
          },
          {
            title: 'Gross Margin',
            actual: (data[2].actuals.reduce((a, b) => a + b, 0) / data[0].actuals.reduce((a, b) => a + b, 0) * 100),
            budget: (data[2].budget.reduce((a, b) => a + b, 0) / data[0].budget.reduce((a, b) => a + b, 0) * 100),
            icon: '📊',
            isPercent: true,
          },
          {
            title: 'Net Income',
            actual: data[6].actuals.reduce((a, b) => a + b, 0),
            budget: data[6].budget.reduce((a, b) => a + b, 0),
            icon: '📈',
          },
        ].map((card) => {
          const variance = card.actual - card.budget
          const isPositive = variance >= 0
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{card.isPercent ? variance.toFixed(1) + '%' : '$' + Math.round(variance).toLocaleString()}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {card.isPercent ? card.actual.toFixed(1) + '%' : '$' + Math.round(card.actual).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{card.title}</p>
            </div>
          )
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 sticky left-0 bg-gray-50">
                  Category
                </th>
                {labels.map((label) => (
                  <th key={label} colSpan={3} className="text-center py-3 px-2 font-semibold text-gray-600 border-l border-gray-200">
                    {label}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 border-t border-gray-100">
                <th className="sticky left-0 bg-gray-50"></th>
                {labels.map((label) => (
                  <React.Fragment key={`sub-${label}`}>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 border-l border-gray-200">Actual</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">Budget</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">Var %</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={row.category}
                  className={`border-t ${isSummaryRow(row.category) ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'}`}
                >
                  <td className={`py-3 px-4 sticky left-0 ${isSummaryRow(row.category) ? 'bg-gray-50 font-semibold' : 'bg-white'} text-gray-900`}>
                    {row.category}
                  </td>
                  {row.actuals.map((actual, idx) => {
                    const budget = row.budget[idx]
                    const { percent, isPositive } = calculateVariance(actual, budget, isExpenseRow(row.category))
                    return (
                      <React.Fragment key={`${row.category}-${idx}`}>
                        <td className="text-right py-3 px-2 text-gray-900 border-l border-gray-100">
                          ${actual.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-2 text-gray-500">
                          ${budget.toLocaleString()}
                        </td>
                        <td className={`text-right py-3 px-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(percent) >= 0 ? '+' : ''}{percent}%
                        </td>
                      </React.Fragment>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variance Legend */}
      <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span>Favorable variance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span>Unfavorable variance</span>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-sm text-blue-800">
            <strong>Data Source:</strong> QuickBooks Online • Last synced: Jan 22, 2026 6:30 PM
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Budget data imported from financial model assumptions
          </p>
        </div>
      </div>
    </div>
  )
}

// Need React for Fragment
import React from 'react'
