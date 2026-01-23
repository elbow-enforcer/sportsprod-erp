import { useState } from 'react'

type ModelCategory = 'Revenue' | 'COGS' | 'Marketing' | 'G&A' | 'CapEx' | 'Other' | null

interface QBOAccount {
  id: string
  name: string
  type: string
  balance: number
  suggestedCategory: ModelCategory
  mappedCategory: ModelCategory
  needsReview: boolean
}

const mockAccounts: QBOAccount[] = [
  { id: '1', name: 'Sales Revenue', type: 'Income', balance: 142500, suggestedCategory: 'Revenue', mappedCategory: 'Revenue', needsReview: false },
  { id: '2', name: 'Product Sales', type: 'Income', balance: 98200, suggestedCategory: 'Revenue', mappedCategory: 'Revenue', needsReview: false },
  { id: '3', name: 'Cost of Goods Sold', type: 'Cost of Goods Sold', balance: 54150, suggestedCategory: 'COGS', mappedCategory: 'COGS', needsReview: false },
  { id: '4', name: 'Inventory Purchases', type: 'Cost of Goods Sold', balance: 32400, suggestedCategory: 'COGS', mappedCategory: 'COGS', needsReview: false },
  { id: '5', name: 'Facebook Ads', type: 'Expense', balance: 8500, suggestedCategory: 'Marketing', mappedCategory: 'Marketing', needsReview: false },
  { id: '6', name: 'Google Ads', type: 'Expense', balance: 6200, suggestedCategory: 'Marketing', mappedCategory: 'Marketing', needsReview: false },
  { id: '7', name: 'Influencer Marketing', type: 'Expense', balance: 3500, suggestedCategory: 'Marketing', mappedCategory: 'Marketing', needsReview: false },
  { id: '8', name: 'Office Supplies', type: 'Expense', balance: 1200, suggestedCategory: 'G&A', mappedCategory: 'G&A', needsReview: false },
  { id: '9', name: 'Software Subscriptions', type: 'Expense', balance: 2800, suggestedCategory: 'G&A', mappedCategory: 'G&A', needsReview: false },
  { id: '10', name: 'Professional Services', type: 'Expense', balance: 5400, suggestedCategory: 'G&A', mappedCategory: null, needsReview: true },
  { id: '11', name: 'Miscellaneous', type: 'Expense', balance: 890, suggestedCategory: null, mappedCategory: null, needsReview: true },
  { id: '12', name: 'Equipment Purchase', type: 'Fixed Asset', balance: 15000, suggestedCategory: 'CapEx', mappedCategory: 'CapEx', needsReview: false },
]

const categories: ModelCategory[] = ['Revenue', 'COGS', 'Marketing', 'G&A', 'CapEx', 'Other']

export function AccountMapping() {
  const [accounts, setAccounts] = useState<QBOAccount[]>(mockAccounts)
  const [showNeedsReview, setShowNeedsReview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const filteredAccounts = showNeedsReview
    ? accounts.filter((a) => a.needsReview)
    : accounts

  const needsReviewCount = accounts.filter((a) => a.needsReview).length

  const handleCategoryChange = (accountId: string, category: ModelCategory) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, mappedCategory: category, needsReview: category === null }
          : a
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    alert('Mappings saved successfully!')
    setHasChanges(false)
  }

  const handleExport = () => {
    const mappings = accounts.map((a) => ({
      qbo_account: a.name,
      category: a.mappedCategory,
    }))
    const blob = new Blob([JSON.stringify(mappings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'account-mappings.json'
    a.click()
  }

  const handleImport = () => {
    alert('Import dialog would open here')
  }

  const handleAutoSuggest = () => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.mappedCategory === null && a.suggestedCategory
          ? { ...a, mappedCategory: a.suggestedCategory, needsReview: false }
          : a
      )
    )
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Mapping</h2>
          <p className="text-gray-500 mt-1">Map QuickBooks accounts to financial model categories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📥 Import Rules
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📤 Export Rules
          </button>
        </div>
      </div>

      {/* Needs Review Banner */}
      {needsReviewCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-900">
                {needsReviewCount} account{needsReviewCount > 1 ? 's' : ''} need{needsReviewCount === 1 ? 's' : ''} review
              </p>
              <p className="text-sm text-gray-500">Unmapped accounts won't appear in your financial model</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAutoSuggest}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🪄 Apply Suggestions
            </button>
            <button
              onClick={() => setShowNeedsReview(!showNeedsReview)}
              className="px-4 py-2 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              {showNeedsReview ? 'Show All' : 'Show Only Needs Review'}
            </button>
          </div>
        </div>
      )}

      {/* Mapping Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">QBO Account</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Account Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Balance</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Suggested</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Model Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{account.name}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{account.type}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    ${account.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {account.suggestedCategory ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {account.suggestedCategory}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={account.mappedCategory || ''}
                      onChange={(e) =>
                        handleCategoryChange(
                          account.id,
                          (e.target.value as ModelCategory) || null
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        account.needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">— Select Category —</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat!}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {account.needsReview ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Needs Review
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Mapped
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          💾 Save Mappings
        </button>
      </div>

      {/* Category Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Definitions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { cat: 'Revenue', desc: 'All income and sales', icon: '💰' },
            { cat: 'COGS', desc: 'Direct product costs', icon: '📦' },
            { cat: 'Marketing', desc: 'Advertising & promotion', icon: '📣' },
            { cat: 'G&A', desc: 'General & administrative', icon: '🏢' },
            { cat: 'CapEx', desc: 'Capital expenditures', icon: '🔧' },
            { cat: 'Other', desc: 'Uncategorized items', icon: '📋' },
          ].map((item) => (
            <div key={item.cat} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{item.cat}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
