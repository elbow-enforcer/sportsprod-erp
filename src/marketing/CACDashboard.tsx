import { useState, useMemo } from 'react'

interface ChannelData {
  name: string
  spend: number
  customers: number
}

const defaultChannels: ChannelData[] = [
  { name: 'Meta Ads', spend: 0, customers: 0 },
  { name: 'Google Ads', spend: 0, customers: 0 },
  { name: 'Email', spend: 0, customers: 0 },
  { name: 'Organic', spend: 0, customers: 0 },
]

export function CACDashboard() {
  const [channels, setChannels] = useState<ChannelData[]>(defaultChannels)

  const updateChannel = (index: number, field: 'spend' | 'customers', value: number) => {
    setChannels(prev => prev.map((ch, i) => 
      i === index ? { ...ch, [field]: value } : ch
    ))
  }

  const calculations = useMemo(() => {
    const channelCAC = channels.map(ch => ({
      ...ch,
      cac: ch.customers > 0 ? ch.spend / ch.customers : null,
    }))
    
    const totalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0)
    const totalCustomers = channels.reduce((sum, ch) => sum + ch.customers, 0)
    const blendedCAC = totalCustomers > 0 ? totalSpend / totalCustomers : null

    return { channelCAC, totalSpend, totalCustomers, blendedCAC }
  }, [channels])

  const formatCurrency = (val: number | null) => 
    val !== null ? `$${val.toFixed(2)}` : '—'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">CAC Dashboard</h2>
        <p className="text-gray-500 mt-1">Customer Acquisition Cost by Channel</p>
      </div>

      {/* Blended CAC Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Spend</p>
            <p className="text-2xl font-bold text-gray-900">${calculations.totalSpend.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{calculations.totalCustomers}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Blended CAC</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(calculations.blendedCAC)}</p>
          </div>
        </div>
      </div>

      {/* Channel Input Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spend ($)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAC</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calculations.channelCAC.map((ch, i) => (
              <tr key={ch.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={ch.spend || ''}
                    onChange={e => updateChannel(i, 'spend', Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={ch.customers || ''}
                    onChange={e => updateChannel(i, 'customers', Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${ch.cac !== null ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatCurrency(ch.cac)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula Reference */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <strong>Formula:</strong> CAC = Marketing Spend / New Customers Acquired
      </div>
    </div>
  )
}
