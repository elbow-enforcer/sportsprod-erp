/**
 * Enhanced Revenue Projection Chart
 * 
 * Features:
 * - Line chart showing revenue over 10 years
 * - Multiple scenarios overlay (base, upside, downside)
 * - Area fill under lines
 * - Annotations for key milestones
 * - Revenue breakdown (units × price)
 * - Hover tooltips with details
 * - Click to drill into year
 * - Toggle scenarios on/off
 */

import { useState, useMemo, useCallback } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

// Types
export interface RevenueProjection {
  year: number
  base: number
  upside: number
  downside: number
  units: number
  price: number
}

interface ScenarioConfig {
  key: 'base' | 'upside' | 'downside'
  name: string
  color: string
  fillColor: string
}

interface RevenueProjectionChartProps {
  data?: RevenueProjection[]
  onYearClick?: (year: number, data: RevenueProjection) => void
  initialScenarios?: ('base' | 'upside' | 'downside')[]
  showMilestones?: boolean
  pricePerUnit?: number
}

interface Milestone {
  year: number
  label: string
  color: string
}

// Constants
const PRICE_PER_UNIT = 1000

const SCENARIO_CONFIGS: ScenarioConfig[] = [
  { key: 'upside', name: 'Upside', color: '#22c55e', fillColor: 'rgba(34, 197, 94, 0.15)' },
  { key: 'base', name: 'Base', color: '#3b82f6', fillColor: 'rgba(59, 130, 246, 0.2)' },
  { key: 'downside', name: 'Downside', color: '#f59e0b', fillColor: 'rgba(245, 158, 11, 0.15)' },
]

const MILESTONES: Milestone[] = [
  { year: 3, label: 'Product Maturity', color: '#8b5cf6' },
  { year: 5, label: 'Market Expansion', color: '#06b6d4' },
  { year: 7, label: 'Scale Phase', color: '#ec4899' },
]

// Default projection data (units-based, converted to revenue)
const DEFAULT_PROJECTION_TABLE = {
  downside: [0, 400, 1100, 2000, 3200, 4700, 6200, 7500, 8600, 9500],
  base: [200, 900, 2000, 3600, 5600, 8200, 11000, 13800, 16500, 19000],
  upside: [400, 1800, 4000, 6900, 10300, 13700, 17000, 20000, 22500, 24500],
}

function generateDefaultData(pricePerUnit: number): RevenueProjection[] {
  return Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    base: DEFAULT_PROJECTION_TABLE.base[i] * pricePerUnit,
    upside: DEFAULT_PROJECTION_TABLE.upside[i] * pricePerUnit,
    downside: DEFAULT_PROJECTION_TABLE.downside[i] * pricePerUnit,
    units: DEFAULT_PROJECTION_TABLE.base[i],
    price: pricePerUnit,
  }))
}

// Utility functions
function formatCurrency(value: number, compact = true): string {
  if (compact) {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatUnits(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString('en-US')
}

// Custom Tooltip Component
interface CustomTooltipPayload {
  dataKey: string
  value: number
  color: string
  name: string
  payload: RevenueProjection
}

interface CustomTooltipProps {
  active?: boolean
  payload?: CustomTooltipPayload[]
  label?: string | number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const dataPoint = payload[0]?.payload
  if (!dataPoint) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
      <p className="font-semibold text-gray-900 mb-2">Year {label}</p>
      <div className="space-y-2">
        {payload.map((entry) => {
          if (entry.dataKey === 'units' || entry.dataKey === 'price') return null
          const config = SCENARIO_CONFIGS.find((s) => s.key === entry.dataKey)
          if (!config) return null
          return (
            <div key={entry.dataKey} className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{config.name}</span>
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Units (base)</span>
          <span>{formatUnits(dataPoint.units)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Price/Unit</span>
          <span>{formatCurrency(dataPoint.price)}</span>
        </div>
      </div>
    </div>
  )
}

// Custom Legend Component
interface LegendToggleProps {
  scenarios: ScenarioConfig[]
  activeScenarios: Set<string>
  onToggle: (key: string) => void
}

function LegendToggle({ scenarios, activeScenarios, onToggle }: LegendToggleProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-4">
      {scenarios.map((scenario) => {
        const isActive = activeScenarios.has(scenario.key)
        return (
          <button
            key={scenario.key}
            onClick={() => onToggle(scenario.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'bg-gray-50 text-gray-400 line-through'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
              style={{ backgroundColor: scenario.color }}
            />
            {scenario.name}
          </button>
        )
      })}
    </div>
  )
}

// Main Component
export function RevenueProjectionChart({
  data,
  onYearClick,
  initialScenarios = ['base', 'upside', 'downside'],
  showMilestones = true,
  pricePerUnit = PRICE_PER_UNIT,
}: RevenueProjectionChartProps) {
  const [activeScenarios, setActiveScenarios] = useState<Set<string>>(
    new Set(initialScenarios)
  )

  // Use provided data or generate default
  const chartData = useMemo(() => {
    return data ?? generateDefaultData(pricePerUnit)
  }, [data, pricePerUnit])

  // Toggle scenario visibility
  const handleToggle = useCallback((key: string) => {
    setActiveScenarios((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        // Don't allow removing the last scenario
        if (next.size > 1) {
          next.delete(key)
        }
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // Handle chart click
  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (data?.activePayload?.[0]?.payload && onYearClick) {
        const payload = data.activePayload[0].payload as RevenueProjection
        onYearClick(payload.year, payload)
      }
    },
    [onYearClick]
  )

  // Calculate y-axis domain
  const yDomain = useMemo(() => {
    let max = 0
    chartData.forEach((d) => {
      if (activeScenarios.has('upside')) max = Math.max(max, d.upside)
      if (activeScenarios.has('base')) max = Math.max(max, d.base)
      if (activeScenarios.has('downside')) max = Math.max(max, d.downside)
    })
    return [0, Math.ceil(max * 1.1 / 1_000_000) * 1_000_000]
  }, [chartData, activeScenarios])

  return (
    <div className="w-full">
      {/* Scenario Toggle Legend */}
      <LegendToggle
        scenarios={SCENARIO_CONFIGS}
        activeScenarios={activeScenarios}
        onToggle={handleToggle}
      />

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onClick={handleClick}
          >
            <defs>
              {SCENARIO_CONFIGS.map((scenario) => (
                <linearGradient
                  key={`gradient-${scenario.key}`}
                  id={`gradient-${scenario.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={scenario.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={scenario.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="year"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `Y${value}`}
            />

            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => formatCurrency(value)}
              domain={yDomain}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Milestone Reference Lines */}
            {showMilestones &&
              MILESTONES.map((milestone) => (
                <ReferenceLine
                  key={milestone.year}
                  x={milestone.year}
                  stroke={milestone.color}
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: milestone.label,
                    position: 'top',
                    fill: milestone.color,
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                />
              ))}

            {/* Area fills - render in order: upside, base, downside */}
            {activeScenarios.has('upside') && (
              <Area
                type="monotone"
                dataKey="upside"
                stroke="none"
                fill={`url(#gradient-upside)`}
                fillOpacity={1}
              />
            )}

            {activeScenarios.has('base') && (
              <Area
                type="monotone"
                dataKey="base"
                stroke="none"
                fill={`url(#gradient-base)`}
                fillOpacity={1}
              />
            )}

            {activeScenarios.has('downside') && (
              <Area
                type="monotone"
                dataKey="downside"
                stroke="none"
                fill={`url(#gradient-downside)`}
                fillOpacity={1}
              />
            )}

            {/* Lines - render on top of areas */}
            {SCENARIO_CONFIGS.map((scenario) => {
              if (!activeScenarios.has(scenario.key)) return null
              return (
                <Line
                  key={scenario.key}
                  type="monotone"
                  dataKey={scenario.key}
                  name={scenario.name}
                  stroke={scenario.color}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: scenario.color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: scenario.color,
                    stroke: '#fff',
                    strokeWidth: 2,
                    cursor: onYearClick ? 'pointer' : 'default',
                  }}
                />
              )
            })}

            <Legend content={() => null} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Click hint */}
      {onYearClick && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Click on a data point to view year details
        </p>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        {SCENARIO_CONFIGS.filter((s) => activeScenarios.has(s.key)).map((scenario) => {
          const total = chartData.reduce(
            (sum, d) => sum + d[scenario.key],
            0
          )
          const year10 = chartData[chartData.length - 1]?.[scenario.key] ?? 0
          return (
            <div
              key={scenario.key}
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: `${scenario.color}10` }}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {scenario.name}
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: scenario.color }}
              >
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-gray-400">
                Y10: {formatCurrency(year10)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RevenueProjectionChart
