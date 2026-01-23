import { useMemo } from 'react'
import { KPICard } from '../components/KPICard'
import { CostBreakdownChart } from '../components/charts/CostBreakdownChart'
import { PermissionGate } from '../auth'
import { useScenarioStore } from '../stores/scenarioStore'
import { useGnaStore } from '../stores/gnaStore'
import { getAnnualProjections } from '../models/adoption'

// Format currency values for display
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// COGS breakdown table component
function COGSTable({ cogs, units }: { cogs: number; units: number }) {
  const unitCost = 200
  const materials = unitCost * 0.6
  const labor = unitCost * 0.25
  const overhead = unitCost * 0.15

  const cogsBreakdown = [
    { category: 'Raw Materials', perUnit: materials, total: units * materials },
    { category: 'Direct Labor', perUnit: labor, total: units * labor },
    { category: 'Manufacturing Overhead', perUnit: overhead, total: units * overhead },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cost of Goods Sold (COGS)
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Per Unit
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total ({units.toLocaleString()} units)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cogsBreakdown.map((item) => (
              <tr key={item.category} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  ${item.perUnit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                Total COGS
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                $200.00
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(cogs)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// Salary table component (restricted via PermissionGate)
function SalaryTable() {
  const { personnel } = useGnaStore()

  // Sample salary data if store is empty
  const salaryData = personnel.length > 0
    ? personnel.map((p) => ({
        role: p.role,
        type: p.type,
        annualCost: p.rateType === 'monthly' 
          ? p.rate * 12 * p.burdenRate 
          : p.rate * (p.hoursPerMonth || 160) * 12 * p.burdenRate,
      }))
    : [
        { role: 'CEO', type: 'employee', annualCost: 150000 },
        { role: 'CTO', type: 'employee', annualCost: 140000 },
        { role: 'Sales Director', type: 'employee', annualCost: 120000 },
        { role: 'Marketing Manager', type: 'employee', annualCost: 95000 },
        { role: 'Operations Lead', type: 'employee', annualCost: 85000 },
        { role: 'Software Engineer', type: 'contractor', annualCost: 72000 },
      ]

  const totalSalaries = salaryData.reduce((sum, item) => sum + item.annualCost, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Salary Details
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Annual Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {salaryData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.role}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'employee'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(item.annualCost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900">
                Total Personnel Cost
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(totalSalaries)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function Costs() {
  const { selectedScenarioId, scenarios } = useScenarioStore()
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId)

  // Calculate costs based on scenario
  const costData = useMemo(() => {
    const units = getAnnualProjections(selectedScenarioId, 2025, 1)[0]
    const unitCost = 200
    const cogs = units * unitCost

    const revenue = units * 1000
    const marketingBase = 30000
    const marketingVariable = revenue * 0.1
    const marketing = marketingBase + marketingVariable

    const gna = 50000

    const totalCosts = cogs + marketing + gna

    return {
      units,
      cogs,
      marketing,
      gna,
      totalCosts,
    }
  }, [selectedScenarioId])

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
          title="Total Costs"
          value={formatCurrency(costData.totalCosts)}
          trend={{ value: 8.2, isPositive: false }}
          icon={<span className="text-2xl">💰</span>}
          subtitle="Year 1 projected"
        />
        <KPICard
          title="COGS"
          value={formatCurrency(costData.cogs)}
          trend={{ value: 12.5, isPositive: false }}
          icon={<span className="text-2xl">🏭</span>}
          subtitle="Manufacturing costs"
        />
        <KPICard
          title="Marketing"
          value={formatCurrency(costData.marketing)}
          trend={{ value: 5.3, isPositive: true }}
          icon={<span className="text-2xl">📢</span>}
          subtitle="Customer acquisition"
        />
        <KPICard
          title="G&A"
          value={formatCurrency(costData.gna)}
          trend={{ value: 2.1, isPositive: false }}
          icon={<span className="text-2xl">🏢</span>}
          subtitle="Personnel & overhead"
        />
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cost Breakdown
        </h3>
        <div className="h-80">
          <CostBreakdownChart />
        </div>
      </div>

      {/* COGS Table */}
      <COGSTable cogs={costData.cogs} units={costData.units} />

      {/* G&A Section with Salary Gate */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          General & Administrative (G&A)
        </h3>
        
        {/* Basic G&A summary visible to all with costs permission */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-sm text-gray-500">Team Members</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500">Full-Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500">Contractors</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(costData.gna)}</p>
              <p className="text-sm text-gray-500">Monthly G&A</p>
            </div>
          </div>
        </div>

        {/* Salary details - restricted to Finance team */}
        <PermissionGate
          permission="view:costs:salaries"
          fallback={
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <span className="text-2xl mb-2 block">🔒</span>
              <p className="text-amber-800 font-medium">Access restricted to Finance team</p>
              <p className="text-amber-600 text-sm mt-1">
                Detailed salary information requires Finance or Admin role.
              </p>
            </div>
          }
        >
          <SalaryTable />
        </PermissionGate>
      </div>
    </div>
  )
}
