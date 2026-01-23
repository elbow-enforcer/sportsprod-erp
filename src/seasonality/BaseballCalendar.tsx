/**
 * Baseball Calendar Configuration UI
 * 
 * Configure baseball seasonality settings:
 * - Toggle between Pro and Youth calendars
 * - Enable/disable seasonality
 * - View monthly distribution preview
 */

import { useMemo } from 'react';
import { useSeasonalityStore } from '../stores/seasonalityStore';
import { CALENDARS, MONTH_NAMES } from '../models/seasonality';
import type { CalendarType, SeasonPeriod } from '../models/seasonality';

const MONTH_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const PERIOD_COLORS: Record<SeasonPeriod, { bg: string; bar: string; text: string }> = {
  spring_training: { bg: 'bg-green-50', bar: 'bg-green-400', text: 'text-green-700' },
  regular_season: { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700' },
  playoffs: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-700' },
  off_season: { bg: 'bg-gray-50', bar: 'bg-gray-300', text: 'text-gray-600' },
};

export function BaseballCalendar() {
  const {
    enabled,
    calendarType,
    setEnabled,
    setCalendarType,
    getMonthly,
    distributeRevenue,
    getAverage,
    getPeakTrough,
    reset,
  } = useSeasonalityStore();
  
  const config = CALENDARS[calendarType];
  const monthly = getMonthly();
  
  const sampleAnnual = 1200000;
  const distribution = useMemo(() => distributeRevenue(sampleAnnual), [enabled, calendarType]);
  const maxValue = Math.max(...distribution);
  
  const avgMultiplier = getAverage();
  const { peak, trough } = getPeakTrough();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ⚾ Baseball Calendar
            </h2>
            <p className="text-gray-600 mt-2">
              Model baseball season seasonality for revenue and demand forecasting
            </p>
          </div>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Enable Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enable Seasonality</h3>
            <p className="text-sm text-gray-500 mt-1">
              Apply baseball calendar multipliers to revenue projections
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
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
          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Seasonality is active. Revenue projections will be adjusted based on the{' '}
              <strong>{config.name}</strong> calendar.
            </p>
          </div>
        )}
      </div>
      
      {/* Calendar Type Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalendarCard
            type="pro"
            config={CALENDARS.pro}
            active={calendarType === 'pro'}
            onClick={() => setCalendarType('pro')}
          />
          <CalendarCard
            type="youth"
            config={CALENDARS.youth}
            active={calendarType === 'youth'}
            onClick={() => setCalendarType('youth')}
          />
        </div>
      </div>
      
      {/* Season Periods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Periods</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.periods.map(period => {
            const colors = PERIOD_COLORS[period.id];
            const monthLabels = period.months.map(m => MONTH_NAMES[m - 1].slice(0, 3)).join(', ');
            
            return (
              <div key={period.id} className={`p-4 rounded-lg ${colors.bg} border border-gray-200`}>
                <h4 className={`font-medium ${colors.text}`}>{period.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{monthLabels}</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  {period.revenueMultiplier.toFixed(1)}×
                </p>
                <p className="text-xs text-gray-500">revenue multiplier</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Monthly Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Distribution</h3>
        <p className="text-sm text-gray-500 mb-4">
          How ${(sampleAnnual / 1000000).toFixed(1)}M annual revenue distributes across months
          {!enabled && ' (flat without seasonality)'}
        </p>
        
        {/* Chart */}
        <div className="flex items-end justify-between h-48 gap-1 mb-4">
          {monthly.map((m, i) => {
            const height = (distribution[i] / maxValue) * 100;
            const colors = PERIOD_COLORS[m.period];
            
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all ${enabled ? colors.bar : 'bg-gray-300'}`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${m.monthName}: $${(distribution[i] / 1000).toFixed(0)}K`}
                />
                <span className="text-xs text-gray-500 mt-2">{MONTH_SHORT[i]}</span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        {enabled && (
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(PERIOD_COLORS).map(([period, colors]) => (
              <div key={period} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${colors.bar}`} />
                <span className="text-xs text-gray-600">
                  {period.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Average Multiplier"
            value={avgMultiplier.toFixed(2)}
            suffix="×"
          />
          <StatBox
            label="Peak Month"
            value={MONTH_NAMES[peak - 1]}
            className="text-purple-700"
          />
          <StatBox
            label="Trough Month"
            value={MONTH_NAMES[trough - 1]}
            className="text-gray-500"
          />
          <StatBox
            label="Status"
            value={enabled ? 'Active' : 'Disabled'}
            className={enabled ? 'text-green-700' : 'text-gray-400'}
          />
        </div>
      </div>
      
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
          <span>💡</span> How Baseball Calendars Work
        </h4>
        <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Spring Training:</strong> Equipment prep, training gear purchases</li>
          <li><strong>Regular Season:</strong> Peak sales period during games</li>
          <li><strong>Playoffs:</strong> Merchandise surge during postseason</li>
          <li><strong>Off-Season:</strong> Minimal activity, potential holiday gift sales</li>
        </ul>
      </div>
    </div>
  );
}

function CalendarCard({
  type,
  config,
  active,
  onClick,
}: {
  type: CalendarType;
  config: { name: string; description: string; periods: { name: string; months: number[] }[] };
  active: boolean;
  onClick: () => void;
}) {
  const icon = type === 'pro' ? '⚾' : '🧒';
  
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-xl border-2 transition-all ${
        active
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h4 className={`font-semibold ${active ? 'text-blue-700' : 'text-gray-900'}`}>
          {config.name}
        </h4>
        {active && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
            Active
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{config.description}</p>
      <ul className="text-xs text-gray-500 space-y-1">
        {config.periods.map(p => {
          const months = p.months.map(m => MONTH_NAMES[m - 1].slice(0, 3)).join('-');
          return (
            <li key={p.name}>• {p.name}: {months}</li>
          );
        })}
      </ul>
    </button>
  );
}

function StatBox({
  label,
  value,
  suffix = '',
  className = '',
}: {
  label: string;
  value: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className={`text-xl font-bold ${className || 'text-gray-900'}`}>
        {value}
        {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default BaseballCalendar;
