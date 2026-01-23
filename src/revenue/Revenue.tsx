/**
 * Revenue Page - Revenue projections with KPIs, chart, and table
 */

import { useMemo, useState, useCallback } from 'react'
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
import { RevenueProjectionChart, type RevenueProjection } from '../components/charts'

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

  // State for year drill-down modal
  const [selectedYear, setSelectedYear] = useState<RevenueProjection | null>(null)

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

  // Generate multi-scenario projection data for enhanced chart
  const projectionData = useMemo((): RevenueProjection[] => {
    const baseUnits = getAnnualProjections('base', 2025, YEARS)
    const upsideUnits = getAnnualProjections('upside', 2025, YEARS)
    const downsideUnits = getAnnualProjections('downside', 2025, YEARS)

    return baseUnits.map((_, index) => ({
      year: index + 1,
      base: baseUnits[index] * REVENUE_PER_UNIT,
      upside: upsideUnits[index] * REVENUE_PER_UNIT,
      downside: downsideUnits[index] * REVENUE_PER_UNIT,
      units: baseUnits[index],
      price: REVENUE_PER_UNIT,
    }))
  }, [])

  // Handle year click for drill-down
  const handleYearClick = useCallback((_year: number, data: RevenueProjection) => {
    setSelectedYear(data)
  }, [])

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
          title="Total Revenue (10Y)"
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
          title="Total Units (10Y)"
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

      {/* Enhanced Revenue Projection Chart - Multi-Scenario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              10-Year Revenue Projection
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Compare scenarios with interactive toggle • Click data points for details
            </p>
          </div>
        </div>
        <RevenueProjectionChart
          data={projectionData}
          onYearClick={handleYearClick}
          showMilestones={true}
          pricePerUnit={REVENUE_PER_UNIT}
        />
      </div>

      {/* Year Drill-Down Modal */}
      {selectedYear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Year {selectedYear.year} Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-green-600 uppercase">Upside</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(selectedYear.upside, true)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-blue-600 uppercase">Base</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(selectedYear.base, true)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-amber-600 uppercase">Downside</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(selectedYear.downside, true)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 uppercase">Units (Base)</p>
                  <p className="text-xl font-bold text-gray-700">{formatUnits(selectedYear.units)}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Breakdown</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Units × Price = Revenue</p>
                  <p className="font-mono bg-gray-100 rounded px-2 py-1">
                    {formatUnits(selectedYear.units)} × {formatCurrency(selectedYear.price)} = {formatCurrency(selectedYear.base)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedYear(null)}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Bar Chart - Single Scenario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue by Year ({selectedScenario?.name ?? 'Base'} Scenario)
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
