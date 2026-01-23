/**
 * MultiplierConfig - Monthly multiplier configuration table
 */

import { useSeasonalityStore } from '../stores/seasonalityStore';
import { CATEGORY_DESCRIPTIONS } from '../models/seasonality';
import type { SeasonCategory } from '../models/seasonality';

export function MultiplierConfig() {
  const { enabled, multipliers, updateMultiplier, resetMultipliers, presetId } =
    useSeasonalityStore();

  if (!enabled) {
    return null;
  }

  const formatPercent = (multiplier: number) => {
    const percent = (multiplier - 1) * 100;
    if (percent > 0) return `+${percent.toFixed(0)}%`;
    if (percent < 0) return `${percent.toFixed(0)}%`;
    return '0%';
  };

  const getCategoryStyle = (category: SeasonCategory) => {
    const desc = CATEGORY_DESCRIPTIONS[category];
    return `${desc.bgColor} ${desc.color}`;
  };

  // Group by category for summary
  const categoryStats = Object.entries(CATEGORY_DESCRIPTIONS).map(([key, desc]) => {
    const categoryMultipliers = multipliers.filter((m) => m.category === key);
    const avgMultiplier =
      categoryMultipliers.length > 0
        ? categoryMultipliers.reduce((sum, m) => sum + m.multiplier, 0) / categoryMultipliers.length
        : 1;
    return {
      category: key as SeasonCategory,
      ...desc,
      months: categoryMultipliers.map((m) => m.name.slice(0, 3)).join(', '),
      avgMultiplier,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Multipliers</h3>
          <p className="text-sm text-gray-500 mt-1">
            {presetId === 'custom' ? 'Custom configuration' : `Preset: ${presetId}`}
          </p>
        </div>
        {presetId === 'custom' && (
          <button
            onClick={resetMultipliers}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Reset to Default
          </button>
        )}
      </div>

      {/* Category Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryStats.map((stat) => (
            <div
              key={stat.category}
              className={`p-3 rounded-lg ${stat.bgColor}`}
            >
              <p className={`text-xs font-medium ${stat.color}`}>{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>
                {formatPercent(stat.avgMultiplier)}
              </p>
              <p className="text-xs text-gray-500">{stat.months || 'None'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Multiplier
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {multipliers.map((m) => (
              <tr key={m.month} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {m.name}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyle(
                      m.category
                    )}`}
                  >
                    {CATEGORY_DESCRIPTIONS[m.category].label}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.05"
                      value={m.multiplier}
                      onChange={(e) => updateMultiplier(m.month, parseFloat(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="0.1"
                      max="3.0"
                      step="0.05"
                      value={m.multiplier.toFixed(2)}
                      onChange={(e) => updateMultiplier(m.month, parseFloat(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md"
                    />
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <span
                    className={`text-sm font-medium ${
                      m.multiplier > 1
                        ? 'text-green-600'
                        : m.multiplier < 1
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatPercent(m.multiplier)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MultiplierConfig;
