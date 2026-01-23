/**
 * SeasonalitySettings - Settings page with toggle and multiplier view
 * Issue #15
 */

import { SeasonalityToggle } from './SeasonalityToggle';
import { useSeasonalityStore, CATEGORY_DESCRIPTIONS } from '../stores/seasonalityStore';

export function SeasonalitySettings() {
  const { enabled, multipliers, updateMultiplier, resetMultipliers, presetId } = useSeasonalityStore();

  const formatPercent = (multiplier: number) => {
    const percent = (multiplier - 1) * 100;
    if (percent > 0) return `+${percent.toFixed(0)}%`;
    if (percent < 0) return `${percent.toFixed(0)}%`;
    return '0%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900">Seasonality Settings</h2>
        <p className="text-gray-600 mt-2">
          Configure monthly revenue multipliers to model seasonal patterns in your projections.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            🎄 Holiday Bump (Nov-Dec)
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            ☀️ Late Summer Peak (Aug-Sep)
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            🌸 Early Season High (Mar-May)
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            ❄️ Off-Season Low (Oct, Jan-Feb)
          </span>
        </div>
      </div>

      {/* Toggle */}
      <SeasonalityToggle showPresets={true} />

      {/* Multiplier Table */}
      {enabled && (
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

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Multiplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          CATEGORY_DESCRIPTIONS[m.category].bgColor
                        } ${CATEGORY_DESCRIPTIONS[m.category].color}`}
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
                        <span className="w-12 text-sm text-center text-gray-700">
                          {m.multiplier.toFixed(2)}
                        </span>
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
      )}

      {/* Info Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
          <span>💡</span> How Seasonality Works
        </h4>
        <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Multipliers adjust monthly revenue relative to a flat baseline</li>
          <li>A multiplier of 1.25 means 25% above baseline (holiday peak)</li>
          <li>A multiplier of 0.70 means 30% below baseline (off-season)</li>
          <li>The average should be close to 1.0 to maintain annual totals</li>
        </ul>
      </div>
    </div>
  );
}

export default SeasonalitySettings;
