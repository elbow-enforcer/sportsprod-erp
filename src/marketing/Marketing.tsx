import { NavLink } from 'react-router-dom'

const marketingCards = [
  { title: 'Active Campaigns', value: '12', change: '+3', icon: '🎯' },
  { title: 'Email Open Rate', value: '24.5%', change: '+2.1%', icon: '📧' },
  { title: 'Launch Progress', value: '67%', change: 'On Track', icon: '🚀' },
  { title: 'Lead Conversion', value: '8.2%', change: '+0.5%', icon: '📈' },
]

const quickLinks = [
  { path: '/marketing/launch', label: 'Launch Plan', icon: '🚀', desc: 'Product launch timeline & checklist' },
  { path: '/marketing/email', label: 'Email Sequences', icon: '📧', desc: 'Automated email campaigns' },
  { path: '/marketing/campaigns', label: 'Campaigns', icon: '🎯', desc: 'Track campaign performance' },
  { path: '/marketing/analytics', label: 'Analytics', icon: '📊', desc: 'Marketing metrics & ROI' },
  { path: '/marketing/budget', label: 'Budget Allocation', icon: '💰', desc: 'Configure budget by channel' },
]

export function Marketing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketing Hub</h2>
        <p className="text-gray-500 mt-1">Manage campaigns, launches, and marketing analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-sm text-green-600 font-medium">{card.change}</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Marketing Activity</h3>
        <div className="text-center py-8 text-gray-400">
          <p>Activity feed coming soon...</p>
        </div>
      </div>
    </div>
  )
}
