/**
 * @file ImportHistory.tsx
 * @description Import history/log viewer
 * @related-issue #25 - QuickBooks actuals import
 */

import { useQBOStore } from './store'
import type { ImportJob, ImportType } from './types'

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

function getStatusBadge(status: ImportJob['status']): {
  label: string
  className: string
  icon: string
} {
  switch (status) {
    case 'success':
      return {
        label: 'Success',
        className: 'bg-green-100 text-green-700',
        icon: '✅',
      }
    case 'error':
      return {
        label: 'Failed',
        className: 'bg-red-100 text-red-700',
        icon: '❌',
      }
    case 'running':
      return {
        label: 'Running',
        className: 'bg-blue-100 text-blue-700',
        icon: '⏳',
      }
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-gray-100 text-gray-700',
        icon: '🕐',
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-yellow-100 text-yellow-700',
        icon: '🚫',
      }
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return '—'
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const seconds = Math.round((endTime - startTime) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function ImportHistory() {
  const { importJobs } = useQBOStore()

  const sortedJobs = [...importJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const stats = {
    total: importJobs.length,
    success: importJobs.filter((j) => j.status === 'success').length,
    failed: importJobs.filter((j) => j.status === 'error').length,
    recordsImported: importJobs
      .filter((j) => j.status === 'success')
      .reduce((sum, j) => sum + j.recordsImported, 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Imports</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.success}</p>
          <p className="text-sm text-gray-500">Successful</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-sm text-gray-500">Failed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.recordsImported.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Records Imported</p>
        </div>
      </div>

      {/* Import Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">📜 Import History</h3>
          <p className="text-sm text-gray-500">Recent import jobs and their status</p>
        </div>

        {sortedJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p>No import history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date Range</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Records</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Started</th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job) => {
                  const typeInfo = getTypeLabel(job.type)
                  const statusInfo = getStatusBadge(job.status)

                  return (
                    <tr key={job.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{typeInfo.icon}</span>
                          <span className="font-medium text-gray-900">{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {job.asOfDate
                          ? `As of ${job.asOfDate}`
                          : job.startDate && job.endDate
                          ? `${job.startDate} → ${job.endDate}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                        >
                          <span>{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {job.recordsImported > 0 ? job.recordsImported.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDuration(job.createdAt, job.completedAt)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {formatDate(job.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Error Details (if any visible) */}
        {sortedJobs.some((j) => j.status === 'error' && j.errorMessage) && (
          <div className="p-4 border-t border-gray-200 bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Recent Errors</h4>
            {sortedJobs
              .filter((j) => j.status === 'error' && j.errorMessage)
              .slice(0, 3)
              .map((job) => (
                <div key={job.id} className="text-sm text-red-700 mb-1">
                  <span className="font-medium">{getTypeLabel(job.type).label}:</span>{' '}
                  {job.errorMessage}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
