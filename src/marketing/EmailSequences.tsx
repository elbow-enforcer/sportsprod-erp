import { useState } from 'react'

interface EmailSequence {
  id: string
  name: string
  status: 'active' | 'paused' | 'draft'
  emails: number
  subscribers: number
  openRate: number
  clickRate: number
}

const mockSequences: EmailSequence[] = [
  { id: '1', name: 'Welcome Series', status: 'active', emails: 5, subscribers: 2450, openRate: 42.3, clickRate: 12.1 },
  { id: '2', name: 'Onboarding Flow', status: 'active', emails: 7, subscribers: 1823, openRate: 38.7, clickRate: 9.8 },
  { id: '3', name: 'Re-engagement', status: 'paused', emails: 3, subscribers: 567, openRate: 22.1, clickRate: 4.2 },
  { id: '4', name: 'Product Launch', status: 'draft', emails: 4, subscribers: 0, openRate: 0, clickRate: 0 },
]

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'paused': 'bg-yellow-100 text-yellow-800',
  'draft': 'bg-gray-100 text-gray-800',
}

export function EmailSequences() {
  const [sequences] = useState<EmailSequence[]>(mockSequences)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Sequences</h2>
          <p className="text-gray-500 mt-1">Manage automated email campaigns</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + New Sequence
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active Sequences</p>
          <p className="text-2xl font-bold text-gray-900">{sequences.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Subscribers</p>
          <p className="text-2xl font-bold text-gray-900">{sequences.reduce((acc, s) => acc + s.subscribers, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg Open Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {(sequences.filter(s => s.openRate > 0).reduce((acc, s) => acc + s.openRate, 0) / sequences.filter(s => s.openRate > 0).length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg Click Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {(sequences.filter(s => s.clickRate > 0).reduce((acc, s) => acc + s.clickRate, 0) / sequences.filter(s => s.clickRate > 0).length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Sequences Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Sequence</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Emails</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Subscribers</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Open Rate</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Click Rate</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sequences.map((seq) => (
              <tr key={seq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{seq.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[seq.status]}`}>
                    {seq.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-600">{seq.emails}</td>
                <td className="px-6 py-4 text-right text-gray-600">{seq.subscribers.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-gray-600">{seq.openRate > 0 ? `${seq.openRate}%` : '—'}</td>
                <td className="px-6 py-4 text-right text-gray-600">{seq.clickRate > 0 ? `${seq.clickRate}%` : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
