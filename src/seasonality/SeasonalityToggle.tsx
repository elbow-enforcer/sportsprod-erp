/**
 * SeasonalityToggle - Simple toggle for enabling/disabling seasonality
 * Issue #15
 */

import { useSeasonalityStore } from '../stores/seasonalityStore';

interface SeasonalityToggleProps {
  showPresets?: boolean;
  compact?: boolean;
}

export function SeasonalityToggle({ showPresets = false, compact = false }: SeasonalityToggleProps) {
  const { 
    enabled, 
    presetId, 
    toggleSeasonality, 
    applyPreset, 
    getValidationStatus, 
    getAdjustmentFactor 
  } = useSeasonalityStore();

  const validation = getValidationStatus();
  const adjustmentFactor = getAdjustmentFactor();

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSeasonality}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          Seasonality {enabled ? 'ON' : 'OFF'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seasonality Adjustment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Apply monthly multipliers to revenue projections
          </p>
        </div>

        <button
          onClick={toggleSeasonality}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              validation.valid
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            Avg: {(adjustmentFactor * 100).toFixed(0)}%
          </span>
          {!validation.valid && (
            <span className="text-xs text-yellow-600">
              ⚠️ Average differs from 100% — annual totals will shift
            </span>
          )}
        </div>
      )}

      {enabled && showPresets && (
        <div className="flex gap-2 flex-wrap">
          {(['sports-retail', 'flat', 'custom'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                presetId === preset
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {preset === 'sports-retail' ? 'Sports Retail' : 
               preset === 'flat' ? 'Flat' : 'Custom'}
            </button>
          ))}
        </div>
      )}

      {!enabled && (
        <div className="text-sm text-gray-500 italic">
          Enable to apply monthly seasonality multipliers to projections
        </div>
      )}
    </div>
  );
}

export default SeasonalityToggle;
