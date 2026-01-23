/**
 * SeasonalitySettings - Full settings page combining toggle, config, and preview
 */

import { SeasonalityToggle } from './SeasonalityToggle';
import { MultiplierConfig } from './MultiplierConfig';
import { SeasonalityPreview } from './SeasonalityPreview';
import { useAssumptionsStore } from '../stores/assumptionsStore';

export function SeasonalitySettings() {
  const { revenue } = useAssumptionsStore();

  // Calculate approximate annual revenue for preview
  // Using a simple estimate: 1000 units in year 1 at pricePerUnit
  const estimatedAnnualRevenue = 1000 * revenue.pricePerUnit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900">Seasonality Settings</h2>
        <p className="text-gray-600 mt-2">
          Configure monthly revenue multipliers to model seasonal patterns in your projections.
          When enabled, projections will reflect higher revenue in peak months and lower revenue
          in off-season periods.
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

      {/* Preview Chart */}
      <SeasonalityPreview annualRevenue={estimatedAnnualRevenue} />

      {/* Multiplier Configuration */}
      <MultiplierConfig />

      {/* Info Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
          <span>💡</span> How Seasonality Works
        </h4>
        <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Multipliers adjust monthly revenue relative to a flat baseline</li>
          <li>A multiplier of 1.25 means 25% above baseline (holiday peak)</li>
          <li>A multiplier of 0.70 means 30% below baseline (off-season)</li>
          <li>
            The average of all multipliers should be close to 1.0 to maintain annual totals
          </li>
          <li>Custom values are saved and persist across sessions</li>
        </ul>
      </div>
    </div>
  );
}

export default SeasonalitySettings;
