export function MarketingAnalytics() {
  const channelData = [
    { channel: 'Organic Search', sessions: 12450, conversions: 234, revenue: 45600, trend: '+12%' },
    { channel: 'Paid Search', sessions: 8320, conversions: 178, revenue: 34200, trend: '+8%' },
    { channel: 'Social Media', sessions: 6780, conversions: 89, revenue: 12300, trend: '+25%' },
    { channel: 'Email', sessions: 4560, conversions: 156, revenue: 28900, trend: '+5%' },
    { channel: 'Direct', sessions: 3200, conversions: 67, revenue: 9800, trend: '-2%' },
    { channel: 'Referral', sessions: 2100, conversions: 45, revenue: 7600, trend: '+18%' },
  ]

  const topCampaigns = [
    { name: 'Product Launch PPC', roi: 285, spend: 12300, revenue: 35055 },
    { name: 'Q1 Brand Awareness', roi: 156, spend: 8750, revenue: 13650 },
    { name: 'Newsletter Promo', roi: 342, spend: 1850, revenue: 6327 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketing Analytics</h2>
        <p className="text-gray-500 mt-1">Performance metrics and ROI analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Marketing ROI</p>
          <p className="text-3xl font-bold text-green-600 mt-1">247%</p>
          <p className="text-sm text-gray-400 mt-1">↑ 23% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Cost per Lead</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$24.50</p>
          <p className="text-sm text-green-500 mt-1">↓ $3.20 from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Customer Acquisition Cost</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$156</p>
          <p className="text-sm text-green-500 mt-1">↓ $12 from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Lifetime Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$1,245</p>
          <p className="text-sm text-green-500 mt-1">↑ $89 from last month</p>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-sm font-semibold text-gray-900">Channel</th>
                <th className="text-right pb-3 text-sm font-semibold text-gray-900">Sessions</th>
                <th className="text-right pb-3 text-sm font-semibold text-gray-900">Conversions</th>
                <th className="text-right pb-3 text-sm font-semibold text-gray-900">Conv. Rate</th>
                <th className="text-right pb-3 text-sm font-semibold text-gray-900">Revenue</th>
                <th className="text-right pb-3 text-sm font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {channelData.map((row) => (
                <tr key={row.channel}>
                  <td className="py-3 text-gray-900">{row.channel}</td>
                  <td className="py-3 text-right text-gray-600">{row.sessions.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-600">{row.conversions}</td>
                  <td className="py-3 text-right text-gray-600">{((row.conversions / row.sessions) * 100).toFixed(2)}%</td>
                  <td className="py-3 text-right text-gray-900 font-medium">${row.revenue.toLocaleString()}</td>
                  <td className={`py-3 text-right font-medium ${row.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {row.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Campaigns by ROI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns by ROI</h3>
        <div className="space-y-4">
          {topCampaigns.map((campaign, idx) => (
            <div key={campaign.name} className="flex items-center gap-4">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{campaign.name}</p>
                <p className="text-sm text-gray-500">
                  Spend: ${campaign.spend.toLocaleString()} → Revenue: ${campaign.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{campaign.roi}%</p>
                <p className="text-xs text-gray-500">ROI</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
          📈 Chart visualization coming soon...
        </div>
      </div>
    </div>
  )
}
