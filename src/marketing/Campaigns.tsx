import { useState } from 'react'

interface Campaign {
  id: string
  name: string
  type: 'social' | 'email' | 'ppc' | 'content'
  status: 'active' | 'scheduled' | 'completed' | 'paused'
  budget: number
  spent: number
  leads: number
  conversions: number
  startDate: string
  endDate: string
}

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Q1 Brand Awareness', type: 'social', status: 'active', budget: 15000, spent: 8750, leads: 342, conversions: 28, startDate: '2026-01-01', endDate: '2026-03-31' },
  { id: '2', name: 'Product Launch PPC', type: 'ppc', status: 'active', budget: 25000, spent: 12300, leads: 567, conversions: 45, startDate: '2026-01-15', endDate: '2026-02-28' },
  { id: '3', name: 'Newsletter Promo', type: 'email', status: 'completed', budget: 2000, spent: 1850, leads: 189, conversions: 34, startDate: '2026-01-01', endDate: '2026-01-15' },
  { id: '4', name: 'Blog Content Push', type: 'content', status: 'scheduled', budget: 5000, spent: 0, leads: 0, conversions: 0, startDate: '2026-02-01', endDate: '2026-04-30' },
]

const typeIcons = {
  'social': '📱',
  'email': '📧',
  'ppc': '🎯',
  'content': '📝',
}

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'scheduled': 'bg-blue-100 text-blue-800',
  'completed': 'bg-gray-100 text-gray-800',
  'paused': 'bg-yellow-100 text-yellow-800',
}

export function Campaigns() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns)
  const [filter, setFilter] = useState<string>('all')

  const filteredCampaigns = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter)

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0)
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0)
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads, 0)
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-500 mt-1">Track and manage marketing campaigns</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + New Campaign
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{((totalSpent / totalBudget) * 100).toFixed(1)}% of budget</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{totalLeads.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Conversions</p>
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-xs text-gray-400">{totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0}% rate</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'scheduled', 'completed', 'paused'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeIcons[campaign.type]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-500">{campaign.startDate} → {campaign.endDate}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Budget</span>
                <span className="text-gray-700">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Leads</p>
                <p className="text-lg font-semibold text-gray-900">{campaign.leads}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversions</p>
                <p className="text-lg font-semibold text-gray-900">{campaign.conversions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
