import { NavLink } from 'react-router-dom'
import { useState } from 'react'

interface ConnectionStatus {
  connected: boolean
  lastSync: string | null
  companyName: string | null
}

const mockStatus: ConnectionStatus = {
  connected: true,
  lastSync: '2026-01-22T18:30:00Z',
  companyName: 'SportsProd LLC'
}

const kpiCards = [
  { title: 'YTD Revenue', value: '$1.2M', change: '+24%', icon: '💰' },
  { title: 'YTD Net Income', value: '$180K', change: '+18%', icon: '📈' },
  { title: 'Gross Margin', value: '62%', change: '+3%', icon: '📊' },
  { title: 'Burn Rate', value: '$45K/mo', change: '-12%', icon: '🔥' },
]

const quickLinks = [
  { path: '/fpa/quickbooks', label: 'QuickBooks Connection', icon: '🔗', desc: 'Manage QBO integration' },
  { path: '/fpa/mapping', label: 'Account Mapping', icon: '🗂️', desc: 'Map accounts to model categories' },
  { path: '/fpa/historicals', label: 'Historical Data', icon: '📅', desc: 'View actuals vs budget' },
]

export function FPADashboard() {
  const [status] = useState<ConnectionStatus>(mockStatus)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">FP&A Dashboard</h2>
        <p className="text-gray-500 mt-1">Financial Planning & Analysis with QuickBooks integration</p>
      </div>

      {/* Connection Status Banner */}
      <div className={`rounded-xl p-4 ${status.connected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{status.connected ? '✅' : '⚠️'}</span>
            <div>
              <p className="font-semibold text-gray-900">
                {status.connected ? `Connected to ${status.companyName}` : 'QuickBooks Not Connected'}
              </p>
              <p className="text-sm text-gray-500">
                Last sync: {formatDate(status.lastSync)}
              </p>
            </div>
          </div>
          <NavLink
            to="/fpa/quickbooks"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {status.connected ? 'Manage Connection' : 'Connect Now'}
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-sm font-medium ${card.change.startsWith('+') || card.change.startsWith('-12%') ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{link.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-500">{link.desc}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actual</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Budget</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Variance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: 'Revenue', actual: 142500, budget: 135000 },
                { category: 'COGS', actual: 54150, budget: 51300 },
                { category: 'Marketing', actual: 18200, budget: 20000 },
                { category: 'G&A', actual: 32400, budget: 30000 },
              ].map((row) => {
                const variance = row.actual - row.budget
                const isRevenue = row.category === 'Revenue'
                const isPositive = isRevenue ? variance >= 0 : variance <= 0
                return (
                  <tr key={row.category} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.category}</td>
                    <td className="text-right py-3 px-4 text-gray-900">${row.actual.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-500">${row.budget.toLocaleString()}</td>
                    <td className={`text-right py-3 px-4 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
