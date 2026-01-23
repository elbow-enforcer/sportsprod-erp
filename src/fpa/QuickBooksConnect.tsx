import { useState } from 'react'

interface SyncLogEntry {
  id: string
  timestamp: string
  type: 'success' | 'error' | 'info'
  message: string
  recordsProcessed?: number
}

const mockSyncLog: SyncLogEntry[] = [
  { id: '1', timestamp: '2026-01-22T18:30:00Z', type: 'success', message: 'Full sync completed', recordsProcessed: 1247 },
  { id: '2', timestamp: '2026-01-21T18:30:00Z', type: 'success', message: 'Incremental sync completed', recordsProcessed: 34 },
  { id: '3', timestamp: '2026-01-20T18:30:00Z', type: 'error', message: 'Sync failed: Rate limit exceeded' },
  { id: '4', timestamp: '2026-01-19T18:30:00Z', type: 'success', message: 'Full sync completed', recordsProcessed: 1213 },
  { id: '5', timestamp: '2026-01-18T10:15:00Z', type: 'info', message: 'QuickBooks connection established' },
]

export function QuickBooksConnect() {
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncLog] = useState<SyncLogEntry[]>(mockSyncLog)

  const handleConnect = () => {
    // In real implementation, this would trigger OAuth flow
    alert('OAuth flow would start here - redirecting to QuickBooks authorization page')
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from QuickBooks? Historical data will be preserved.')) {
      setIsConnected(false)
    }
  }

  const handleSync = () => {
    setIsSyncing(true)
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false)
      alert('Sync completed successfully!')
    }, 2000)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QuickBooks Integration</h2>
        <p className="text-gray-500 mt-1">Connect and sync your QuickBooks Online data</p>
      </div>

      {/* Connection Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-4xl">📗</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">QuickBooks Online</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Connect to QuickBooks
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {isConnected && (
          <>
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">SportsProd LLC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Sync</p>
                  <p className="font-medium text-gray-900">Jan 22, 2026 6:30 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Records Synced</p>
                  <p className="font-medium text-gray-900">1,247</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sync Schedule</p>
                  <p className="font-medium text-gray-900">Daily at 6:30 PM</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSyncing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
              <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                ⚙️ Sync Settings
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sync Settings */}
      {isConnected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Auto-sync</p>
                <p className="text-sm text-gray-500">Automatically sync data daily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Sync Transactions</p>
                <p className="text-sm text-gray-500">Import all income and expense transactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Sync Invoices</p>
                <p className="text-sm text-gray-500">Import accounts receivable data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sync History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync History</h3>
        {syncLog.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No sync history yet</p>
        ) : (
          <div className="space-y-3">
            {syncLog.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.type === 'success'
                    ? 'bg-green-50'
                    : entry.type === 'error'
                    ? 'bg-red-50'
                    : 'bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>
                    {entry.type === 'success' ? '✅' : entry.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{entry.message}</p>
                    <p className="text-sm text-gray-500">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
                {entry.recordsProcessed && (
                  <span className="text-sm text-gray-500">
                    {entry.recordsProcessed.toLocaleString()} records
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
