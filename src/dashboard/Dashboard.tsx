import { KPICard } from '../components/KPICard'
import { CostBreakdownChart } from '../components/charts/CostBreakdownChart'
import { RevenueChart } from '../components/charts/RevenueChart'
import { useScenarioStore } from '../stores/scenarioStore'
import { getAnnualProjections } from '../models/adoption'

export function Dashboard() {
  const { selectedScenarioId, scenarios } = useScenarioStore()
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId)

  // Get Year 1 adoption data from the model
  const year1Units = getAnnualProjections(selectedScenarioId, 2025, 1)[0]
  const year1Revenue = year1Units * 1000

  // Format values for display
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const formatUnits = (value: number): string => {
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

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

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Year 1 Revenue"
          value={formatCurrency(year1Revenue)}
          trend={{ value: 12.5, isPositive: true }}
          icon={<span className="text-2xl">💰</span>}
          subtitle="Projected annual"
        />
        <KPICard
          title="Year 1 Units"
          value={formatUnits(year1Units)}
          trend={{ value: 8.3, isPositive: true }}
          icon={<span className="text-2xl">📦</span>}
          subtitle="Projected annual"
        />
        <KPICard
          title="Burn Rate"
          value="$85K"
          trend={{ value: 5.2, isPositive: false }}
          icon={<span className="text-2xl">🔥</span>}
          subtitle="Monthly spend"
        />
        <KPICard
          title="Runway"
          value="18 mo"
          trend={{ value: 2, isPositive: true }}
          icon={<span className="text-2xl">✈️</span>}
          subtitle="At current burn"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <div className="h-64">
            <RevenueChart selectedScenario={selectedScenarioId} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h3>
          <div className="h-64">
            <CostBreakdownChart />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-500">Active Products</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-500">Customers</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">$48</p>
            <p className="text-sm text-gray-500">Avg Order Value</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">3.2%</p>
            <p className="text-sm text-gray-500">Conversion Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
