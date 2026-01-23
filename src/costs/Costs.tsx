import { useMemo, useState } from 'react'
import { KPICard } from '../components/KPICard'
import { CostBreakdownChart } from '../components/charts/CostBreakdownChart'
import { PermissionGate } from '../auth'
import { useScenarioStore } from '../stores/scenarioStore'
import { useGnaStore } from '../stores/gnaStore'
import { useAssumptionsStore } from '../stores/assumptionsStore'
import { getAnnualProjections } from '../models/adoption'
import { calculateCOGSBreakdown, type COGSBreakdownResult } from '../models/cogs'

// Format currency values for display
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Category colors for the breakdown
const categoryColors: Record<string, string> = {
  manufacturing: 'bg-blue-100 text-blue-800',
  freight: 'bg-amber-100 text-amber-800',
  packaging: 'bg-green-100 text-green-800',
  duties: 'bg-purple-100 text-purple-800',
}

// Category icons
const categoryIcons: Record<string, string> = {
  manufacturing: '🏭',
  freight: '🚢',
  packaging: '📦',
  duties: '📋',
}

// COGS breakdown table component with configurable line items
function COGSTable({ breakdown, units }: { breakdown: COGSBreakdownResult; units: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Cost of Goods Sold (COGS)
        </h3>
        <span className="text-sm text-gray-500">
          {units.toLocaleString()} units projected
        </span>
      </div>
      
      {/* Visual breakdown bars */}
      <div className="mb-6">
        <div className="flex h-4 rounded-full overflow-hidden">
          {breakdown.lineItems.map((item) => (
            <div
              key={item.category}
              className={`${
                item.category === 'manufacturing' ? 'bg-blue-500' :
                item.category === 'freight' ? 'bg-amber-500' :
                item.category === 'packaging' ? 'bg-green-500' : 'bg-purple-500'
              }`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.name}: ${item.percentage.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {breakdown.lineItems.map((item) => (
            <div key={item.category} className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  item.category === 'manufacturing' ? 'bg-blue-500' :
                  item.category === 'freight' ? 'bg-amber-500' :
                  item.category === 'packaging' ? 'bg-green-500' : 'bg-purple-500'
                }`}
              />
              <span>{item.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

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
                % of COGS
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakdown.lineItems.map((item) => (
              <tr key={item.category} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[item.category]}</span>
                    <span>{item.name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  ${item.perUnit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {item.percentage.toFixed(1)}%
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
                ${breakdown.totalPerUnit.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                100%
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(breakdown.totalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// COGS Configuration Panel
function COGSConfigPanel({ 
  config, 
  onUpdate 
}: { 
  config: {
    manufacturingCost: number;
    freightCost: number;
    packagingCost: number;
    dutiesCost: number;
  };
  onUpdate: (updates: Partial<typeof config>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onUpdate(localConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setIsEditing(false);
  };

  const totalCost = localConfig.manufacturingCost + localConfig.freightCost + 
                    localConfig.packagingCost + localConfig.dutiesCost;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          COGS Configuration
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit Costs
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'manufacturingCost', label: 'Manufacturing', icon: '🏭', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
          { key: 'freightCost', label: 'Freight', icon: '🚢', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
          { key: 'packagingCost', label: 'Packaging', icon: '📦', bgColor: 'bg-green-50', borderColor: 'border-green-100' },
          { key: 'dutiesCost', label: 'Import Duties', icon: '📋', bgColor: 'bg-purple-50', borderColor: 'border-purple-100' },
        ].map(({ key, label, icon, bgColor, borderColor }) => (
          <div key={key} className={`p-4 rounded-lg ${bgColor} border ${borderColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{icon}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={localConfig[key as keyof typeof localConfig]}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    [key]: parseFloat(e.target.value) || 0,
                  })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-right font-mono"
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${config[key as keyof typeof config].toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
        <span className="font-medium text-gray-700">Total COGS per Unit</span>
        <span className={`text-xl font-bold ${isEditing && totalCost !== config.manufacturingCost + config.freightCost + config.packagingCost + config.dutiesCost ? 'text-amber-600' : 'text-gray-900'}`}>
          ${totalCost.toFixed(2)}
        </span>
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
  const { cogs: cogsConfig, updateCOGS } = useAssumptionsStore()

  // Calculate costs based on scenario and COGS config
  const costData = useMemo(() => {
    const units = getAnnualProjections(selectedScenarioId, 2025, 1)[0]
    
    // Calculate COGS breakdown using the new model
    const cogsBreakdown = calculateCOGSBreakdown(units, {
      manufacturingCost: cogsConfig.manufacturingCost,
      freightCost: cogsConfig.freightCost,
      packagingCost: cogsConfig.packagingCost,
      dutiesCost: cogsConfig.dutiesCost,
    })

    const revenue = units * 1000
    const marketingBase = 30000
    const marketingVariable = revenue * 0.1
    const marketing = marketingBase + marketingVariable

    const gna = 50000

    const totalCosts = cogsBreakdown.totalCost + marketing + gna

    return {
      units,
      cogs: cogsBreakdown.totalCost,
      cogsBreakdown,
      marketing,
      gna,
      totalCosts,
    }
  }, [selectedScenarioId, cogsConfig])

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

      {/* COGS Configuration */}
      <PermissionGate
        permission="edit:costs"
        fallback={null}
      >
        <COGSConfigPanel
          config={{
            manufacturingCost: cogsConfig.manufacturingCost,
            freightCost: cogsConfig.freightCost,
            packagingCost: cogsConfig.packagingCost,
            dutiesCost: cogsConfig.dutiesCost,
          }}
          onUpdate={(updates) => updateCOGS(updates)}
        />
      </PermissionGate>

      {/* COGS Breakdown Table */}
      <COGSTable breakdown={costData.cogsBreakdown} units={costData.units} />

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
