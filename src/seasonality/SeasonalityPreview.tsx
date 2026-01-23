/**
 * SeasonalityPreview - Compare seasonal vs flat projections
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useSeasonalityStore } from '../stores/seasonalityStore';
import { CATEGORY_DESCRIPTIONS } from '../models/seasonality';

interface SeasonalityPreviewProps {
  annualRevenue?: number; // Base annual revenue to preview
}

export function SeasonalityPreview({ annualRevenue = 1000000 }: SeasonalityPreviewProps) {
  const { enabled, getAnnualComparison, getAdjustmentFactor } = useSeasonalityStore();

  const comparison = useMemo(
    () => getAnnualComparison(2025, annualRevenue),
    [getAnnualComparison, annualRevenue]
  );

  const adjustmentFactor = getAdjustmentFactor();

  const chartData = comparison.monthlyProjections.map((p) => ({
    name: p.monthName.slice(0, 3),
    flat: Math.round(p.flatRevenue),
    seasonal: Math.round(p.adjustedRevenue),
    category: p.category,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const difference = comparison.seasonalTotal - comparison.flatTotal;
  const differencePercent = ((comparison.seasonalTotal / comparison.flatTotal) - 1) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Projection Preview
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {enabled ? 'Seasonal vs Flat monthly breakdown' : 'Flat projection (seasonality disabled)'}
            </p>
          </div>
          {enabled && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Annual Impact</p>
              <p
                className={`text-lg font-bold ${
                  difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {difference >= 0 ? '+' : ''}{formatCurrency(difference)} ({differencePercent >= 0 ? '+' : ''}{differencePercent.toFixed(1)}%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Flat Projection</p>
            <p className="text-xl font-bold text-gray-700">{formatCurrency(comparison.flatTotal)}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Seasonal Projection</p>
            <p className={`text-xl font-bold ${enabled ? 'text-blue-700' : 'text-gray-400'}`}>
              {enabled ? formatCurrency(comparison.seasonalTotal) : 'N/A'}
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200 md:col-span-1 col-span-2">
            <p className="text-xs text-gray-500 uppercase">Avg Adjustment</p>
            <p className={`text-xl font-bold ${enabled ? 'text-purple-700' : 'text-gray-400'}`}>
              {enabled ? `${(adjustmentFactor * 100).toFixed(0)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'flat' ? 'Flat' : 'Seasonal',
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <ReferenceLine y={annualRevenue / 12} stroke="#9ca3af" strokeDasharray="5 5" />
              <Bar
                dataKey="flat"
                name="Flat"
                fill="#9ca3af"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              {enabled && (
                <Bar
                  dataKey="seasonal"
                  name="Seasonal"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Details Table */}
      {enabled && (
        <div className="px-6 pb-6">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View monthly details →
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-medium text-gray-500">Month</th>
                    <th className="py-2 text-right font-medium text-gray-500">Flat</th>
                    <th className="py-2 text-right font-medium text-gray-500">Seasonal</th>
                    <th className="py-2 text-right font-medium text-gray-500">Δ</th>
                    <th className="py-2 text-left font-medium text-gray-500">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparison.monthlyProjections.map((p) => (
                    <tr key={p.month}>
                      <td className="py-2 font-medium text-gray-900">{p.monthName}</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(p.flatRevenue)}</td>
                      <td className="py-2 text-right text-blue-700 font-medium">
                        {formatCurrency(p.adjustedRevenue)}
                      </td>
                      <td
                        className={`py-2 text-right font-medium ${
                          p.difference > 0 ? 'text-green-600' : p.difference < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}
                      >
                        {p.difference >= 0 ? '+' : ''}{p.differencePercent.toFixed(0)}%
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            CATEGORY_DESCRIPTIONS[p.category].bgColor
                          } ${CATEGORY_DESCRIPTIONS[p.category].color}`}
                        >
                          {CATEGORY_DESCRIPTIONS[p.category].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export default SeasonalityPreview;
