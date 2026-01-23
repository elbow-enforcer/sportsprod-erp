/**
 * @file ImportSchedules.tsx
 * @description Scheduled import configuration UI
 * @related-issue #25 - QuickBooks actuals import
 */

import { useState } from 'react'
import { useQBOStore } from './store'
import type { ImportSchedule, ImportType } from './types'

function getTypeLabel(type: ImportType): { label: string; icon: string } {
  switch (type) {
    case 'profit_loss':
      return { label: 'Profit & Loss', icon: '📊' }
    case 'balance_sheet':
      return { label: 'Balance Sheet', icon: '⚖️' }
    case 'cash_flow':
      return { label: 'Cash Flow', icon: '💸' }
  }
}

function getFrequencyLabel(schedule: ImportSchedule): string {
  switch (schedule.frequency) {
    case 'daily':
      return `Daily at ${schedule.timeOfDay}`
    case 'weekly': {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return `Weekly on ${days[schedule.dayOfWeek || 0]} at ${schedule.timeOfDay}`
    }
    case 'monthly':
      return `Monthly on day ${schedule.dayOfMonth || 1} at ${schedule.timeOfDay}`
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleString()
}

function ScheduleEditModal({
  schedule,
  onSave,
  onCancel,
}: {
  schedule: ImportSchedule
  // eslint-disable-next-line no-unused-vars
  onSave: (updates: Partial<ImportSchedule>) => void
  onCancel: () => void
}) {
  const [frequency, setFrequency] = useState(schedule.frequency)
  const [dayOfWeek, setDayOfWeek] = useState(schedule.dayOfWeek || 0)
  const [dayOfMonth, setDayOfMonth] = useState(schedule.dayOfMonth || 1)
  const [timeOfDay, setTimeOfDay] = useState(schedule.timeOfDay)
  const [enabled, setEnabled] = useState(schedule.enabled)

  const handleSave = () => {
    onSave({
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      timeOfDay,
      enabled,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Edit Schedule: {getTypeLabel(schedule.type).icon} {getTypeLabel(schedule.type).label}
        </h3>

        <div className="space-y-4">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">Enabled</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ImportSchedule['frequency'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Day of Week (for weekly) */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tip: Use day 1-28 to ensure it runs every month
              </p>
            </div>
          )}

          {/* Time of Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function ImportSchedules() {
  const { importSchedules, updateSchedule, addSchedule } = useQBOStore()
  const [editingSchedule, setEditingSchedule] = useState<ImportSchedule | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleToggle = (id: string, enabled: boolean) => {
    updateSchedule(id, { enabled })
  }

  const handleSaveEdit = (updates: Partial<ImportSchedule>) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, updates)
      setEditingSchedule(null)
    }
  }

  const handleAddSchedule = (type: ImportType) => {
    const newSchedule: ImportSchedule = {
      id: `sched-${Date.now()}`,
      type,
      enabled: true,
      frequency: 'monthly',
      dayOfMonth: 5,
      timeOfDay: '06:00',
      lastRun: null,
      nextRun: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addSchedule(newSchedule)
    setShowAddModal(false)
  }

  const enabledCount = importSchedules.filter((s) => s.enabled).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🕐 Import Schedules</h3>
          <p className="text-sm text-gray-500">
            Configure automatic imports from QuickBooks
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Schedule
        </button>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl p-4 ${
          enabledCount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{enabledCount > 0 ? '✅' : '⏸️'}</span>
          <div>
            <p className="font-medium text-gray-900">
              {enabledCount > 0
                ? `${enabledCount} schedule${enabledCount > 1 ? 's' : ''} active`
                : 'No active schedules'}
            </p>
            <p className="text-sm text-gray-500">
              {enabledCount > 0
                ? 'Data will be imported automatically'
                : 'Enable a schedule to automate imports'}
            </p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {importSchedules.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p>No schedules configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first schedule →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {importSchedules.map((schedule) => {
              const typeInfo = getTypeLabel(schedule.type)
              return (
                <div
                  key={schedule.id}
                  className={`p-4 flex items-center justify-between ${
                    !schedule.enabled ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{typeInfo.label}</p>
                      <p className="text-sm text-gray-500">{getFrequencyLabel(schedule)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Last Run</p>
                      <p className="text-gray-700">{formatDate(schedule.lastRun)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Next Run</p>
                      <p className="text-gray-700">
                        {schedule.enabled ? formatDate(schedule.nextRun) : '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.enabled}
                          onChange={(e) => handleToggle(schedule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingSchedule(schedule)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit schedule"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Scheduling Tips</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Schedule P&L imports after month-end close (e.g., 5th of each month)</li>
              <li>Balance Sheet snapshots work best at month-end dates</li>
              <li>Cash Flow imports are derived from P&L and Balance Sheet data</li>
              <li>All times are in your local timezone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          onSave={handleSaveEdit}
          onCancel={() => setEditingSchedule(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Import Schedule
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select the type of import to schedule:
            </p>

            <div className="space-y-2">
              {(['profit_loss', 'balance_sheet', 'cash_flow'] as ImportType[]).map((type) => {
                const typeInfo = getTypeLabel(type)
                const exists = importSchedules.some((s) => s.type === type)
                return (
                  <button
                    key={type}
                    onClick={() => handleAddSchedule(type)}
                    disabled={exists}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      exists
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{typeInfo.icon}</span>
                    <div>
                      <p className="font-medium">{typeInfo.label}</p>
                      {exists && <p className="text-xs">Already scheduled</p>}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
