import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { useScenarioStore } from '../../stores/scenarioStore'
import { getAnnualProjections } from '../../models/adoption'

const RADIAN = Math.PI / 180

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props

  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number'
  ) {
    return null
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

export function CostBreakdownChart() {
  const { selectedScenarioId } = useScenarioStore()

  const costData = useMemo(() => {
    // Get Year 1 units for selected scenario
    const units = getAnnualProjections(selectedScenarioId, 2025, 1)[0]

    // Calculate costs based on scenario
    const unitCost = 200
    const cogs = units * unitCost

    const marketingBase = 30000
    const revenue = units * 1000
    const marketingVariable = revenue * 0.1 // 10% of revenue
    const marketing = marketingBase + marketingVariable

    const gna = 50000

    const subtotal = cogs + marketing + gna
    const other = subtotal * 0.05

    // Build data array, filtering out zero COGS
    const data: { name: string; value: number; color: string }[] = []

    if (cogs > 0) {
      data.push({ name: 'Manufacturing (COGS)', value: cogs, color: '#3B82F6' })
    }
    data.push({ name: 'Marketing', value: marketing, color: '#22C55E' })
    data.push({ name: 'G&A (Personnel)', value: gna, color: '#F97316' })
    data.push({ name: 'Other', value: other, color: '#6B7280' })

    return data
  }, [selectedScenarioId])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={costData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          dataKey="value"
        >
          {costData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), 'Cost']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-gray-700">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
