/**
 * Projections Page - Multi-year financial forecast with P&L metrics
 */

import { useState, useMemo } from 'react'
import { KPICard } from '../components/KPICard'
import { useScenarioStore } from '../stores/scenarioStore'
import { getAnnualProjections } from '../models/adoption'
import { calculateCost, DEFAULT_COST_POINTS } from '../models/cogs'

// Constants for P&L calculations
const REVENUE_PER_UNIT = 1000 // $1,000 per unit
const MARKETING_PERCENT = 0.15 // 15% of revenue
const GNA_BASE = 200000 // $200K base G&A
const GNA_GROWTH_RATE = 0.10 // 10% annual G&A growth
const YEARS = 10

type ScenarioId = 'min' | 'downside' | 'base' | 'upside' | 'max'

interface YearlyMetrics {
  year: number
  units: number
  revenue: number
  cogs: number
  grossMargin: number
  grossMarginPercent: number
  marketing: number
  gna: number
  operatingIncome: number
  operatingMarginPercent: number
  cumulativeRevenue: number
  cumulativeOperatingIncome: number
}

function calculateYearlyMetrics(
  scenario: ScenarioId,
  years: number = YEARS
): YearlyMetrics[] {
  const units = getAnnualProjections(scenario, 2025, years)
  let cumulativeRevenue = 0
  let cumulativeOperatingIncome = 0

  return units.map((unitCount, index) => {
    const year = index + 1
    const revenue = unitCount * REVENUE_PER_UNIT

    // Calculate COGS using interpolation (average cost per unit based on volume)
    const costPerUnit = calculateCost(Math.max(unitCount, 1000), DEFAULT_COST_POINTS).costPerUnit
    const cogs = unitCount * costPerUnit

    const grossMargin = revenue - cogs
    const grossMarginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0

    // Marketing as % of revenue
    const marketing = revenue * MARKETING_PERCENT

    // G&A grows annually from base
    const gna = GNA_BASE * Math.pow(1 + GNA_GROWTH_RATE, index)

    const operatingIncome = grossMargin - marketing - gna
    const operatingMarginPercent = revenue > 0 ? (operatingIncome / revenue) * 100 : 0

    cumulativeRevenue += revenue
    cumulativeOperatingIncome += operatingIncome

    return {
      year,
      units: unitCount,
      revenue,
      cogs,
      grossMargin,
      grossMarginPercent,
      marketing,
      gna,
      operatingIncome,
      operatingMarginPercent,
      cumulativeRevenue,
      cumulativeOperatingIncome,
    }
  })
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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function Projections() {
  const { selectedScenarioId, scenarios, selectScenario } = useScenarioStore()
  const [compareMode, setCompareMode] = useState(false)

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId)

  // Calculate metrics for selected scenario
  const metrics = useMemo(
    () => calculateYearlyMetrics(selectedScenarioId as ScenarioId),
    [selectedScenarioId]
  )

  // Calculate metrics for all scenarios (for comparison)
  const allScenarioMetrics = useMemo(() => {
    const scenarioIds: ScenarioId[] = ['max', 'upside', 'base', 'downside', 'min']
    return scenarioIds.map((id) => ({
      id,
      metrics: calculateYearlyMetrics(id),
    }))
  }, [])

  // Summary calculations
  const totalRevenue = metrics[metrics.length - 1]?.cumulativeRevenue ?? 0
  const totalUnits = metrics.reduce((sum, m) => sum + m.units, 0)

  // Break-even year (first year with positive cumulative operating income)
  const breakEvenYear = metrics.findIndex((m) => m.cumulativeOperatingIncome > 0) + 1 || null

  // Peak revenue year
  const peakRevenueYear =
    metrics.reduce(
      (peak, m) => (m.revenue > peak.revenue ? m : peak),
      metrics[0]
    )?.year ?? 1

  return (
    <div className="space-y-6">
      {/* Scenario Banner */}
      {selectedScenario && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active Scenario:</span>{' '}
            {selectedScenario.name} — {selectedScenario.description}
          </p>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              compareMode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            {compareMode ? 'Exit Compare' : 'Compare All'}
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="10-Year Total Revenue"
          value={formatCurrency(totalRevenue, true)}
          icon={<span className="text-2xl">💰</span>}
          subtitle="Cumulative projected"
        />
        <KPICard
          title="10-Year Total Units"
          value={formatUnits(totalUnits)}
          icon={<span className="text-2xl">📦</span>}
          subtitle="Cumulative projected"
        />
        <KPICard
          title="Break-even Year"
          value={breakEvenYear ? `Year ${breakEvenYear}` : 'N/A'}
          icon={<span className="text-2xl">📈</span>}
          subtitle="First profitable year"
        />
        <KPICard
          title="Peak Revenue Year"
          value={`Year ${peakRevenueYear}`}
          icon={<span className="text-2xl">🏆</span>}
          subtitle={formatCurrency(metrics[peakRevenueYear - 1]?.revenue ?? 0, true)}
        />
      </div>

      {/* Scenario Selector (shown when not in compare mode) */}
      {!compareMode && (
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
      )}

      {/* Projection Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {compareMode ? 'Scenario Comparison' : '10-Year Financial Projections'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {compareMode
              ? 'Side-by-side comparison of all scenarios'
              : `P&L forecast for ${selectedScenario?.name ?? 'Base'} scenario`}
          </p>
        </div>

        <div className="overflow-x-auto">
          {compareMode ? (
            <ScenarioComparisonTable
              allScenarioMetrics={allScenarioMetrics}
              selectedScenarioId={selectedScenarioId}
            />
          ) : (
            <SingleScenarioTable metrics={metrics} />
          )}
        </div>
      </div>

      {/* Cumulative Totals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cumulative Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(totalRevenue, true)}
            </p>
            <p className="text-sm text-green-600">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {formatUnits(totalUnits)}
            </p>
            <p className="text-sm text-blue-600">Total Units</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(
                metrics.reduce((sum, m) => sum + m.grossMargin, 0),
                true
              )}
            </p>
            <p className="text-sm text-purple-600">Total Gross Margin</p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              metrics[metrics.length - 1]?.cumulativeOperatingIncome >= 0
                ? 'bg-emerald-50'
                : 'bg-red-50'
            }`}
          >
            <p
              className={`text-2xl font-bold ${
                metrics[metrics.length - 1]?.cumulativeOperatingIncome >= 0
                  ? 'text-emerald-700'
                  : 'text-red-700'
              }`}
            >
              {formatCurrency(
                metrics[metrics.length - 1]?.cumulativeOperatingIncome ?? 0,
                true
              )}
            </p>
            <p
              className={`text-sm ${
                metrics[metrics.length - 1]?.cumulativeOperatingIncome >= 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              Cumulative Operating Income
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Single scenario table component
function SingleScenarioTable({ metrics }: { metrics: YearlyMetrics[] }) {
  const rows = [
    {
      label: 'Units',
      values: metrics.map((m) => formatUnits(m.units)),
      className: 'font-medium',
    },
    {
      label: 'Revenue',
      values: metrics.map((m) => formatCurrency(m.revenue)),
      className: 'font-medium text-green-700',
    },
    {
      label: 'COGS',
      values: metrics.map((m) => `(${formatCurrency(m.cogs)})`),
      className: 'text-red-600',
    },
    {
      label: 'Gross Margin',
      values: metrics.map((m) => formatCurrency(m.grossMargin)),
      className: 'font-medium',
    },
    {
      label: 'Gross Margin %',
      values: metrics.map((m) => formatPercent(m.grossMarginPercent)),
      className: 'text-gray-500 text-sm',
    },
    {
      label: 'Marketing',
      values: metrics.map((m) => `(${formatCurrency(m.marketing)})`),
      className: 'text-red-600',
    },
    {
      label: 'G&A',
      values: metrics.map((m) => `(${formatCurrency(m.gna)})`),
      className: 'text-red-600',
    },
    {
      label: 'Operating Income',
      values: metrics.map((m) => formatCurrency(m.operatingIncome)),
      className: 'font-bold',
      highlight: true,
    },
    {
      label: 'Operating Margin %',
      values: metrics.map((m) => formatPercent(m.operatingMarginPercent)),
      className: 'text-gray-500 text-sm',
    },
    { label: 'divider', values: [], className: '' },
    {
      label: 'Cumulative Revenue',
      values: metrics.map((m) => formatCurrency(m.cumulativeRevenue)),
      className: 'font-medium text-blue-700',
    },
  ]

  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Metric
          </th>
          {metrics.map((m) => (
            <th
              key={m.year}
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Y{m.year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row, idx) => {
          if (row.label === 'divider') {
            return (
              <tr key={idx} className="bg-gray-50">
                <td colSpan={7} className="h-2"></td>
              </tr>
            )
          }
          return (
            <tr
              key={row.label}
              className={row.highlight ? 'bg-yellow-50' : 'hover:bg-gray-50'}
            >
              <td className="px-6 py-3 text-sm text-gray-900">{row.label}</td>
              {row.values.map((value, i) => (
                <td
                  key={i}
                  className={`px-4 py-3 text-sm text-right ${row.className}`}
                >
                  {value}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// Scenario comparison table component
function ScenarioComparisonTable({
  allScenarioMetrics,
  selectedScenarioId,
}: {
  allScenarioMetrics: { id: string; metrics: YearlyMetrics[] }[]
  selectedScenarioId: string
}) {
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Scenario
          </th>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
            <th
              key={year}
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Y{year}
            </th>
          ))}
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            6Y Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {/* Units Section */}
        <tr className="bg-gray-100">
          <td
            colSpan={8}
            className="px-6 py-2 text-xs font-semibold text-gray-600 uppercase"
          >
            Units
          </td>
        </tr>
        {allScenarioMetrics.map(({ id, metrics }) => (
          <tr
            key={`units-${id}`}
            className={id === selectedScenarioId ? 'bg-blue-50' : 'hover:bg-gray-50'}
          >
            <td className="px-6 py-2 text-sm font-medium text-gray-900 capitalize">
              {id}
              {id === selectedScenarioId && (
                <span className="ml-2 text-xs text-blue-600">●</span>
              )}
            </td>
            {metrics.map((m) => (
              <td key={m.year} className="px-4 py-2 text-sm text-right text-gray-700">
                {formatUnits(m.units)}
              </td>
            ))}
            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
              {formatUnits(metrics.reduce((sum, m) => sum + m.units, 0))}
            </td>
          </tr>
        ))}

        {/* Revenue Section */}
        <tr className="bg-gray-100">
          <td
            colSpan={8}
            className="px-6 py-2 text-xs font-semibold text-gray-600 uppercase"
          >
            Revenue
          </td>
        </tr>
        {allScenarioMetrics.map(({ id, metrics }) => (
          <tr
            key={`revenue-${id}`}
            className={id === selectedScenarioId ? 'bg-blue-50' : 'hover:bg-gray-50'}
          >
            <td className="px-6 py-2 text-sm font-medium text-gray-900 capitalize">
              {id}
              {id === selectedScenarioId && (
                <span className="ml-2 text-xs text-blue-600">●</span>
              )}
            </td>
            {metrics.map((m) => (
              <td
                key={m.year}
                className="px-4 py-2 text-sm text-right text-green-700"
              >
                {formatCurrency(m.revenue, true)}
              </td>
            ))}
            <td className="px-4 py-2 text-sm text-right font-medium text-green-700">
              {formatCurrency(
                metrics[metrics.length - 1]?.cumulativeRevenue ?? 0,
                true
              )}
            </td>
          </tr>
        ))}

        {/* Operating Income Section */}
        <tr className="bg-gray-100">
          <td
            colSpan={8}
            className="px-6 py-2 text-xs font-semibold text-gray-600 uppercase"
          >
            Operating Income
          </td>
        </tr>
        {allScenarioMetrics.map(({ id, metrics }) => (
          <tr
            key={`oi-${id}`}
            className={id === selectedScenarioId ? 'bg-blue-50' : 'hover:bg-gray-50'}
          >
            <td className="px-6 py-2 text-sm font-medium text-gray-900 capitalize">
              {id}
              {id === selectedScenarioId && (
                <span className="ml-2 text-xs text-blue-600">●</span>
              )}
            </td>
            {metrics.map((m) => (
              <td
                key={m.year}
                className={`px-4 py-2 text-sm text-right font-medium ${
                  m.operatingIncome >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatCurrency(m.operatingIncome, true)}
              </td>
            ))}
            <td
              className={`px-4 py-2 text-sm text-right font-bold ${
                metrics[metrics.length - 1]?.cumulativeOperatingIncome >= 0
                  ? 'text-emerald-700'
                  : 'text-red-600'
              }`}
            >
              {formatCurrency(
                metrics[metrics.length - 1]?.cumulativeOperatingIncome ?? 0,
                true
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Projections
