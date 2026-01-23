import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  usePreorderStore,
  getDaysUntilLaunch,
  getLaunchStatus,
  formatLaunchDate,
} from '../stores/preorderStore';
import { KPICard } from '../components/KPICard';
import { LaunchCountdown } from './LaunchCountdown';

export function PreorderSettings() {
  const {
    launchDate,
    preorderEnabled,
    preorderStartDate,
    preorderEndDate,
    launchDateNotes,
    setLaunchDate,
    setPreorderEnabled,
    setPreorderStartDate,
    setPreorderEndDate,
    setLaunchDateNotes,
    resetToDefaults,
  } = usePreorderStore();

  const status = getLaunchStatus(launchDate);
  const daysUntil = getDaysUntilLaunch(launchDate);

  // Calculate projection timeline integration
  const projectionYears = useMemo(() => {
    if (!launchDate) return [];
    const launchYear = new Date(launchDate).getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({
      year: launchYear + i,
      label: i === 0 ? 'Launch Year' : `Year ${i + 1}`,
      isLaunchYear: i === 0,
    }));
  }, [launchDate]);

  // Pre-order period calculation
  const preorderPeriod = useMemo(() => {
    if (!preorderStartDate || !preorderEndDate) return null;
    const start = new Date(preorderStartDate);
    const end = new Date(preorderEndDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, start, end };
  }, [preorderStartDate, preorderEndDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pre-order Settings</h2>
          <p className="text-gray-500 mt-1">Configure launch date and pre-order window</p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Launch Date"
          value={formatLaunchDate(launchDate)}
          icon={<span className="text-2xl">📅</span>}
          subtitle={status === 'not-set' ? 'Configure below' : undefined}
        />
        <KPICard
          title="Days Until Launch"
          value={daysUntil !== null ? (daysUntil < 0 ? `${Math.abs(daysUntil)} ago` : daysUntil) : '—'}
          icon={<span className="text-2xl">⏳</span>}
          subtitle={
            status === 'past'
              ? 'Already launched'
              : status === 'today'
              ? 'Launch day!'
              : status === 'imminent'
              ? 'Coming soon!'
              : undefined
          }
        />
        <KPICard
          title="Pre-order Status"
          value={preorderEnabled ? 'Active' : 'Disabled'}
          icon={<span className="text-2xl">{preorderEnabled ? '✅' : '⏸️'}</span>}
          subtitle={preorderEnabled ? 'Accepting pre-orders' : 'Pre-orders paused'}
        />
        <KPICard
          title="Pre-order Period"
          value={preorderPeriod ? `${preorderPeriod.days} days` : '—'}
          icon={<span className="text-2xl">📊</span>}
          subtitle={preorderPeriod ? 'Window duration' : 'Configure dates'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Date Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Launch Date Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Launch Date
              </label>
              <input
                type="date"
                value={launchDate || ''}
                onChange={(e) => setLaunchDate(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                The official date when the product becomes available
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Enable Pre-orders</p>
                <p className="text-sm text-gray-500">Allow customers to order before launch</p>
              </div>
              <button
                onClick={() => setPreorderEnabled(!preorderEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preorderEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preorderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {preorderEnabled && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-order Start
                    </label>
                    <input
                      type="date"
                      value={preorderStartDate || ''}
                      onChange={(e) => setPreorderStartDate(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-order End
                    </label>
                    <input
                      type="date"
                      value={preorderEndDate || ''}
                      onChange={(e) => setPreorderEndDate(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {preorderPeriod && preorderPeriod.days < 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700">
                      ⚠️ End date must be after start date
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={launchDateNotes}
                onChange={(e) => setLaunchDateNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about the launch timeline..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Countdown Display */}
        <LaunchCountdown />
      </div>

      {/* Projections Timeline Integration */}
      {launchDate && projectionYears.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Projections Timeline
              </h3>
              <p className="text-sm text-gray-500">
                10-year forecast aligned to launch date
              </p>
            </div>
            <Link
              to="/projections"
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Full Projections →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {projectionYears.map((item) => (
                <div
                  key={item.year}
                  className={`flex-shrink-0 w-24 p-3 rounded-lg text-center ${
                    item.isLaunchYear
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-lg font-bold">{item.year}</p>
                  <p
                    className={`text-xs ${
                      item.isLaunchYear ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.isLaunchYear && (
                    <span className="inline-block mt-1 text-xs">🚀</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Launch Year</p>
                <p className="font-semibold text-gray-900">
                  {new Date(launchDate).getFullYear()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Projection End</p>
                <p className="font-semibold text-gray-900">
                  {new Date(launchDate).getFullYear() + 9}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Launch Quarter</p>
                <p className="font-semibold text-gray-900">
                  Q{Math.ceil((new Date(launchDate).getMonth() + 1) / 3)}{' '}
                  {new Date(launchDate).getFullYear()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Days in Launch Year</p>
                <p className="font-semibold text-gray-900">
                  {Math.ceil(
                    (new Date(new Date(launchDate).getFullYear() + 1, 0, 1).getTime() -
                      new Date(launchDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/projections"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📊 View Projections
          </Link>
          <Link
            to="/marketing/launch"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            🚀 Launch Plan
          </Link>
          <Link
            to="/inventory"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📦 Inventory Planning
          </Link>
          <Link
            to="/assumptions"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ⚙️ Model Assumptions
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PreorderSettings;
