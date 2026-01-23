import { useState, useMemo } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { WorkingCapitalCard } from '../components/inventory/WorkingCapitalCard';
import { projectInventoryTimeline, getMonthlyInventorySummary } from '../models/inventory';

const SCENARIO_OPTIONS = [
  { value: 'conservative', label: 'Conservative (5K units/yr)' },
  { value: 'moderate', label: 'Moderate (10K units/yr)' },
  { value: 'aggressive', label: 'Aggressive (20K units/yr)' },
];

export function Inventory() {
  const { config, selectedScenario, setSelectedScenario, setConfig } = useInventoryStore();
  const [years] = useState(6);

  // Generate reorder schedule
  const reorderSchedule = useMemo(() => {
    const timeline = projectInventoryTimeline(selectedScenario, config, years);
    const orders = timeline
      .filter(t => t.orderPlaced !== null)
      .map(t => ({
        orderDate: t.day,
        arrivalDate: t.day + config.leadTimeDays,
        units: t.orderPlaced!,
        cost: t.orderPlaced! * config.unitCost,
        month: t.month,
        year: t.year,
      }));
    return orders;
  }, [selectedScenario, config, years]);

  // Get monthly summary for stats
  const monthlySummary = useMemo(() => {
    const timeline = projectInventoryTimeline(selectedScenario, config, years);
    return getMonthlyInventorySummary(timeline);
  }, [selectedScenario, config, years]);

  const totalOrders = reorderSchedule.length;
  const totalUnitsOrdered = reorderSchedule.reduce((sum, o) => sum + o.units, 0);
  const totalSpend = reorderSchedule.reduce((sum, o) => sum + o.cost, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (day: number) => {
    const year = Math.ceil(day / 365);
    const dayOfYear = ((day - 1) % 365) + 1;
    const month = Math.ceil(dayOfYear / 30.44);
    return `Y${year} M${month}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Scenario Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Cash flow timeline and working capital analysis</p>
        </div>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {SCENARIO_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">MOQ (units)</label>
            <input
              type="number"
              value={config.moq}
              onChange={(e) => setConfig({ moq: parseInt(e.target.value) || 1000 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Unit Cost ($)</label>
            <input
              type="number"
              value={config.unitCost}
              onChange={(e) => setConfig({ unitCost: parseFloat(e.target.value) || 200 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Lead Time (days)</label>
            <input
              type="number"
              value={config.leadTimeDays}
              onChange={(e) => setConfig({ leadTimeDays: parseInt(e.target.value) || 90 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Safety Stock (days)</label>
            <input
              type="number"
              value={config.safetyDays}
              onChange={(e) => setConfig({ safetyDays: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Orders ({years}yr)</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Units Ordered</p>
          <p className="text-2xl font-bold text-gray-900">{totalUnitsOrdered.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Spend</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpend)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalOrders > 0 ? formatCurrency(totalSpend / totalOrders) : '$0'}
          </p>
        </div>
      </div>

      {/* Working Capital Card */}
      <WorkingCapitalCard config={config} years={years} />

      {/* Cash Flow Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Timeline</h3>
        <p className="text-sm text-gray-500 mb-4">
          Red bars show inventory purchase events. Blue line shows cumulative cash invested in inventory.
          Dashed lines indicate reorder events.
        </p>
        <div className="h-80">
          <CashFlowChart scenario={selectedScenario} config={config} years={years} />
        </div>
      </div>

      {/* Reorder Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reorder Schedule</h3>
          <span className="text-sm text-gray-500">{reorderSchedule.length} orders over {years} years</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Arrival Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Units</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Cost</th>
              </tr>
            </thead>
            <tbody>
              {reorderSchedule.slice(0, 20).map((order, index) => (
                <tr key={order.orderDate} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{formatDate(order.orderDate)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.arrivalDate)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">{order.units.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 font-medium text-right">{formatCurrency(order.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reorderSchedule.length > 20 && (
            <p className="text-center text-sm text-gray-500 py-4">
              Showing first 20 of {reorderSchedule.length} orders
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
