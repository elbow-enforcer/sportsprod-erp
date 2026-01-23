/**
 * @file QBOActualsImport.tsx
 * @description Main component for importing actuals from QuickBooks
 * @related-issue #25 - QuickBooks actuals import
 */

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useQBOStore } from './store'
import { ProfitAndLossImport } from './ProfitAndLossImport'
import { BalanceSheetImport } from './BalanceSheetImport'
import { CashFlowImport } from './CashFlowImport'
import { ImportHistory } from './ImportHistory'
import { ImportSchedules } from './ImportSchedules'

type TabId = 'pl' | 'bs' | 'cf' | 'history' | 'schedules'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'pl', label: 'Profit & Loss', icon: '📊' },
  { id: 'bs', label: 'Balance Sheet', icon: '⚖️' },
  { id: 'cf', label: 'Cash Flow', icon: '💸' },
  { id: 'history', label: 'Import History', icon: '📜' },
  { id: 'schedules', label: 'Schedules', icon: '🕐' },
]

export function QBOActualsImport() {
  const [activeTab, setActiveTab] = useState<TabId>('pl')
  const { connectionStatus, accountMappings } = useQBOStore()

  const unmappedCount = accountMappings.filter(
    (m) => m.isActive && m.modelCategory === null
  ).length

  if (!connectionStatus.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QBO Actuals Import</h2>
          <p className="text-gray-500 mt-1">Import financial statements from QuickBooks Online</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            QuickBooks Not Connected
          </h3>
          <p className="text-gray-600 mb-4">
            Please connect your QuickBooks account to import financial data.
          </p>
          <NavLink
            to="/fpa/quickbooks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            🔗 Connect QuickBooks
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QBO Actuals Import</h2>
          <p className="text-gray-500 mt-1">
            Import financial statements from QuickBooks Online
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-600 font-medium">
              {connectionStatus.companyName}
            </span>
          </div>
        </div>
      </div>

      {/* Unmapped Accounts Warning */}
      {unmappedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-gray-900">
                {unmappedCount} account{unmappedCount > 1 ? 's' : ''} not mapped
              </p>
              <p className="text-sm text-gray-500">
                Unmapped accounts won&apos;t be included in your financial model
              </p>
            </div>
          </div>
          <NavLink
            to="/fpa/mapping"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
          >
            Fix Mappings
          </NavLink>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'pl' && <ProfitAndLossImport />}
        {activeTab === 'bs' && <BalanceSheetImport />}
        {activeTab === 'cf' && <CashFlowImport />}
        {activeTab === 'history' && <ImportHistory />}
        {activeTab === 'schedules' && <ImportSchedules />}
      </div>
    </div>
  )
}
