/**
 * Revenue Page - Revenue projections with KPIs, chart, and table
 */

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { KPICard } from '../components/KPICard'
import { useScenarioStore } from '../stores/scenarioStore'
import { getAnnualProjections } from '../models/adoption'

// Constants
const REVENUE_PER_UNIT = 1000 // $1,000 per unit
const YEARS = 10

type ScenarioId = 'min' | 'downside' | 'base' | 'upside' | 'max'

interface YearData {
  year: string
  yearNum: number
  units: number
  revenue: number
}

function formatCurrency(value: number, compact = false): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (compact) {
    if (absValue >= 1_000_000) {
      return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`
    } else if (absValue >= 1_000) {
      return `${sign}$${(absValue / 1_000).toFixed(0)}K`
    }
    return `${sign}$${absValue.toFixed(0)}`
  }

  return `${sign}$${absValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatUnits(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString('en-US')
}

export function Revenue() {
  const { selectedScenarioId, scenarios, selectScenario } = useScenarioStore()
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId)

  // Calculate revenue data for selected scenario
  const yearData = useMemo((): YearData[] => {
    const units = getAnnualProjections(selectedScenarioId as ScenarioId, 2025, YEARS)
    return units.map((unitCount, index) => ({
      year: `Y${index + 1}`,
      yearNum: index + 1,
      units: unitCount,
      revenue: unitCount * REVENUE_PER_UNIT,
    }))
  }, [selectedScenarioId])

  // KPI calculations
  const totalRevenue = yearData.reduce((sum, d) => sum + d.revenue, 0)
  const year1Revenue = yearData[0]?.revenue ?? 0
  const totalUnits = yearData.reduce((sum, d) => sum + d.units, 0)
  const avgPrice = REVENUE_PER_UNIT

  return (
    <div className="space-y-6">
      {/* Scenario Banner */}
      {selectedScenario && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active Scenario:</span>{' '}
            {selectedScenario.name} — {selectedScenario.description}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue (6Y)"
          value={formatCurrency(totalRevenue, true)}
          icon={<span className="text-2xl">💰</span>}
          subtitle="Cumulative projected"
        />
        <KPICard
          title="Year 1 Revenue"
          value={formatCurrency(year1Revenue, true)}
          icon={<span className="text-2xl">📈</span>}
          subtitle="First year projection"
        />
        <KPICard
          title="Total Units (6Y)"
          value={formatUnits(totalUnits)}
          icon={<span className="text-2xl">📦</span>}
          subtitle="Cumulative projected"
        />
        <KPICard
          title="Avg Price"
          value={formatCurrency(avgPrice)}
          icon={<span className="text-2xl">🏷️</span>}
          subtitle="Per unit"
        />
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Scenario:</span>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => selectScenario(scenario.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                scenario.id === selectedScenarioId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue by Year
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => {
                  if (value >= 1_000_000) {
                    return `$${(value / 1_000_000).toFixed(1)}M`
                  } else if (value >= 1_000) {
                    return `$${(value / 1_000).toFixed(0)}K`
                  }
                  return `$${value}`
                }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Annual Projections
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Year-by-year revenue breakdown for {selectedScenario?.name ?? 'Base'} scenario
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {yearData.map((row) => (
                <tr key={row.yearNum} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Year {row.yearNum}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">
                    {formatUnits(row.units)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-700">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-sm text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatUnits(totalUnits)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-green-700">
                  {formatCurrency(totalRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Revenue
