import { useMemo } from 'react'

export interface BurnRateData {
  monthlyBurn: number
  runwayMonths: number
  cashPosition: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface BurnRateWidgetProps {
  data?: BurnRateData
  className?: string
}

// Default mock data - in production, this would come from a store or API
const defaultData: BurnRateData = {
  monthlyBurn: 85000,
  runwayMonths: 18,
  cashPosition: 1530000,
  trend: 'decreasing',
}

export function BurnRateWidget({ data = defaultData, className = '' }: BurnRateWidgetProps) {
  const { monthlyBurn, runwayMonths, cashPosition, trend } = data

  // Determine runway status and color coding
  const runwayStatus = useMemo(() => {
    if (runwayMonths > 12) {
      return {
        label: 'Healthy',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-500',
        ringColor: 'ring-green-500',
      }
    } else if (runwayMonths >= 6) {
      return {
        label: 'Caution',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        progressColor: 'bg-yellow-500',
        ringColor: 'ring-yellow-500',
      }
    } else {
      return {
        label: 'Critical',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-500',
        ringColor: 'ring-red-500',
      }
    }
  }, [runwayMonths])

  // Calculate progress percentage (max 24 months = 100%)
  const progressPercent = Math.min((runwayMonths / 24) * 100, 100)

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  // Trend indicator
  const trendConfig = {
    increasing: {
      icon: '↑',
      label: 'Increasing',
      color: 'text-red-600',
      description: 'Burn rate rising',
    },
    decreasing: {
      icon: '↓',
      label: 'Decreasing',
      color: 'text-green-600',
      description: 'Burn rate falling',
    },
    stable: {
      icon: '→',
      label: 'Stable',
      color: 'text-gray-600',
      description: 'Burn rate steady',
    },
  }

  const currentTrend = trendConfig[trend]

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Burn Rate Analysis</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${runwayStatus.bgColor} ${runwayStatus.textColor}`}
        >
          {runwayStatus.label}
        </span>
      </div>

      {/* Runway Gauge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Runway</span>
          <span className="text-2xl font-bold text-gray-900">
            {runwayMonths} <span className="text-base font-normal text-gray-500">months</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${runwayStatus.progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0</span>
          <span className="text-gray-500">6mo</span>
          <span className="text-gray-500">12mo</span>
          <span>24mo+</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly Burn */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-gray-500">Monthly Burn</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(monthlyBurn)}</p>
          <p className="text-xs text-gray-400 mt-1">Total expenses / month</p>
        </div>

        {/* Cash Position */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💰</span>
            <span className="text-sm font-medium text-gray-500">Cash Position</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(cashPosition)}</p>
          <p className="text-xs text-gray-400 mt-1">Available funds</p>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className={`mt-4 p-3 rounded-lg ${runwayStatus.bgColor} ${runwayStatus.borderColor} border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${currentTrend.color}`}>
              {currentTrend.icon}
            </span>
            <div>
              <p className={`text-sm font-medium ${currentTrend.color}`}>
                {currentTrend.label}
              </p>
              <p className="text-xs text-gray-500">{currentTrend.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Projected depletion</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
                'en-US',
                { month: 'short', year: 'numeric' }
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
