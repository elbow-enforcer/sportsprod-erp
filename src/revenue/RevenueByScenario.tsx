/**
 * @file RevenueByScenario.tsx
 * @description Simple table showing revenue by scenario and year
 * @related-prd Issue #5: Revenue by Scenario
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useMemo, useState } from 'react';
import {
  calculateAllScenariosRevenue,
  DEFAULT_DISCOUNT_RATE,
  SCENARIO_NAMES,
  type ScenarioRevenue,
} from '../models/revenue/revenueByScenario';
import { defaultPricing } from '../models/revenue/pricing';

const YEARS_TO_SHOW = 10;

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

const SCENARIO_COLORS: Record<string, string> = {
  max: 'bg-green-100 text-green-800',
  upside: 'bg-emerald-50 text-emerald-700',
  base: 'bg-blue-50 text-blue-700',
  downside: 'bg-amber-50 text-amber-700',
  min: 'bg-red-50 text-red-700',
};

const SCENARIO_LABELS: Record<string, string> = {
  max: 'Max (Viral)',
  upside: 'Upside',
  base: 'Base',
  downside: 'Downside',
  min: 'Min (Conservative)',
};

export function RevenueByScenario() {
  const [discountRate, setDiscountRate] = useState(DEFAULT_DISCOUNT_RATE);

  const scenarioData: ScenarioRevenue[] = useMemo(() => {
    return calculateAllScenariosRevenue(YEARS_TO_SHOW, defaultPricing.basePrice, discountRate);
  }, [discountRate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue by Scenario</h2>
          <p className="text-sm text-gray-500 mt-1">
            Formula: Revenue = Units × Price × (1 - DiscountRate)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="discount" className="text-sm font-medium text-gray-700">
            Discount Rate:
          </label>
          <select
            id="discount"
            value={discountRate}
            onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">0%</option>
            <option value="0.05">5%</option>
            <option value="0.10">10%</option>
            <option value="0.15">15%</option>
            <option value="0.20">20%</option>
          </select>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-medium">Parameters:</span>
          <span>Price = ${defaultPricing.basePrice.toLocaleString()}/unit</span>
          <span>•</span>
          <span>Discount = {(discountRate * 100).toFixed(0)}%</span>
          <span>•</span>
          <span>Effective Price = ${((1 - discountRate) * defaultPricing.basePrice).toLocaleString()}/unit</span>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                  Scenario
                </th>
                {Array.from({ length: YEARS_TO_SHOW }, (_, i) => (
                  <th key={i} className="px-4 py-3 text-right font-semibold text-gray-700">
                    Y{i + 1}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-gray-900 bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scenarioData.map((scenario) => (
                <tr key={scenario.scenario} className="hover:bg-gray-50">
                  <td className={`px-4 py-3 font-medium sticky left-0 z-10 ${SCENARIO_COLORS[scenario.scenario]}`}>
                    {SCENARIO_LABELS[scenario.scenario]}
                  </td>
                  {scenario.years.map((year) => (
                    <td key={year.year} className="px-4 py-3 text-right text-gray-700 font-mono">
                      {formatCurrency(year.netRevenue)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-bold text-gray-900 bg-gray-50 font-mono">
                    {formatCurrency(scenario.totalNetRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {scenarioData.map((scenario) => (
          <div
            key={scenario.scenario}
            className={`rounded-lg border p-4 ${SCENARIO_COLORS[scenario.scenario]}`}
          >
            <h3 className="font-semibold text-sm">{SCENARIO_LABELS[scenario.scenario]}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(scenario.totalNetRevenue)}</p>
              <p className="text-xs opacity-75">
                {formatNumber(scenario.totalUnits)} units
              </p>
              <p className="text-xs opacity-75">
                Discount: {formatCurrency(scenario.totalDiscountAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueByScenario;
