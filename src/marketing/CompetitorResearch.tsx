import { useState } from 'react'

interface SocialStats {
  platform: 'tiktok' | 'instagram' | 'youtube'
  followers: string
  avgViews?: string
}

interface Competitor {
  id: string
  name: string
  handle: string
  category: string
  socials: SocialStats[]
  postingFrequency: string
  contentThemes: string[]
  engagementRate: string
  topContent: string
  hashtags: string[]
  notes: string
  lastUpdated: string
}

const initialCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'Iron Neck',
    handle: '@ironneck',
    category: 'Neck Strengthening',
    socials: [
      { platform: 'tiktok', followers: '125K', avgViews: '50K' },
      { platform: 'instagram', followers: '89K', avgViews: '2K' },
      { platform: 'youtube', followers: '45K', avgViews: '15K' },
    ],
    postingFrequency: '3-4x/week',
    contentThemes: ['Athletic training', 'Injury prevention', 'NFL athletes', 'Before/after transformations'],
    engagementRate: '4.2%',
    topContent: 'NFL player training montages, injury recovery stories',
    hashtags: ['#ironneck', '#necktraining', '#athletetraining', '#injuryprevention'],
    notes: 'Strong athlete endorsement strategy. Heavy focus on professional sports.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    name: 'Voodoo Floss',
    handle: '@voodooflossbands',
    category: 'Compression Therapy',
    socials: [
      { platform: 'tiktok', followers: '45K', avgViews: '25K' },
      { platform: 'instagram', followers: '156K', avgViews: '3K' },
      { platform: 'youtube', followers: '12K', avgViews: '5K' },
    ],
    postingFrequency: '2-3x/week',
    contentThemes: ['CrossFit recovery', 'Mobility work', 'Tutorial content', 'User testimonials'],
    engagementRate: '3.8%',
    topContent: 'Joint mobility tutorials, CrossFit athlete features',
    hashtags: ['#voodoofloss', '#mobilitywod', '#crossfitrecovery', '#compressiontherapy'],
    notes: 'Strong CrossFit community ties. Educational content performs well.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: '3',
    name: 'Theragun',
    handle: '@theragun',
    category: 'Percussion Therapy',
    socials: [
      { platform: 'tiktok', followers: '890K', avgViews: '200K' },
      { platform: 'instagram', followers: '1.2M', avgViews: '25K' },
      { platform: 'youtube', followers: '234K', avgViews: '100K' },
    ],
    postingFrequency: '5-7x/week',
    contentThemes: ['Celebrity endorsements', 'Pro athlete recovery', 'Lifestyle/wellness', 'Product demos'],
    engagementRate: '2.9%',
    topContent: 'Celebrity usage clips, ASMR massage videos, athlete recovery routines',
    hashtags: ['#theragun', '#recoverytech', '#selfcare', '#musclerecovery'],
    notes: 'Massive budget. Heavy influencer marketing. Premium positioning.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: '4',
    name: 'Hyperice',
    handle: '@hyperice',
    category: 'Recovery Tech',
    socials: [
      { platform: 'tiktok', followers: '320K', avgViews: '80K' },
      { platform: 'instagram', followers: '567K', avgViews: '12K' },
      { platform: 'youtube', followers: '89K', avgViews: '35K' },
    ],
    postingFrequency: '4-5x/week',
    contentThemes: ['Pro sports partnerships', 'Product innovation', 'Recovery science', 'Behind the scenes'],
    engagementRate: '3.1%',
    topContent: 'NBA/NFL locker room content, product launches, athlete interviews',
    hashtags: ['#hyperice', '#recoveryforall', '#coldtherapy', '#performancerecovery'],
    notes: 'Official partner of NBA, NFL, MLB. Strong B2B presence.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: '5',
    name: 'Rogue Fitness',
    handle: '@roguefitness',
    category: 'Gym Equipment',
    socials: [
      { platform: 'tiktok', followers: '1.5M', avgViews: '500K' },
      { platform: 'instagram', followers: '2.8M', avgViews: '50K' },
      { platform: 'youtube', followers: '456K', avgViews: '150K' },
    ],
    postingFrequency: '7x/week',
    contentThemes: ['CrossFit Games', 'Strongman events', 'Made in USA', 'Gym builds'],
    engagementRate: '4.5%',
    topContent: 'CrossFit Games highlights, strongman competitions, gym build tours',
    hashtags: ['#ryourogue', '#roguefitness', '#crossfit', '#builtinusa'],
    notes: 'Dominant in CrossFit space. Strong community engagement. Events-driven content.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
]

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
}

const platformColors: Record<string, string> = {
  tiktok: 'bg-black text-white',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  youtube: 'bg-red-600 text-white',
}

export function CompetitorResearch() {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Competitor | null>(null)

  const handleEdit = (competitor: Competitor) => {
    setEditingId(competitor.id)
    setEditForm({ ...competitor })
  }

  const handleSave = () => {
    if (editForm) {
      setCompetitors(prev => prev.map(c => 
        c.id === editForm.id ? { ...editForm, lastUpdated: new Date().toISOString().split('T')[0] } : c
      ))
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const updateEditForm = (field: keyof Competitor, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const updateSocialStat = (platform: string, field: 'followers' | 'avgViews', value: string) => {
    if (editForm) {
      const updatedSocials = editForm.socials.map(s => 
        s.platform === platform ? { ...s, [field]: value } : s
      )
      setEditForm({ ...editForm, socials: updatedSocials })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Competitor Research</h2>
          <p className="text-gray-500 mt-1">Track and analyze competitor social media presence</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'cards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🃏 Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Table
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Competitors Tracked</p>
          <p className="text-2xl font-bold text-gray-900">{competitors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg Engagement Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {(competitors.reduce((acc, c) => acc + parseFloat(c.engagementRate), 0) / competitors.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Top Platform</p>
          <p className="text-2xl font-bold text-gray-900">📸 Instagram</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Content Frequency</p>
          <p className="text-2xl font-bold text-gray-900">4x/week avg</p>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitors.map(competitor => (
            <div key={competitor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {editingId === competitor.id && editForm ? (
                // Edit Mode
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => updateEditForm('name', e.target.value)}
                      className="text-xl font-bold border-b border-gray-300 focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Save</button>
                      <button onClick={handleCancel} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Handle</label>
                      <input
                        type="text"
                        value={editForm.handle}
                        onChange={(e) => updateEditForm('handle', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Category</label>
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => updateEditForm('category', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Social Stats</label>
                    {editForm.socials.map(social => (
                      <div key={social.platform} className="flex gap-2 mt-1">
                        <span className="w-20 text-sm">{platformIcons[social.platform]} {social.platform}</span>
                        <input
                          type="text"
                          value={social.followers}
                          onChange={(e) => updateSocialStat(social.platform, 'followers', e.target.value)}
                          placeholder="Followers"
                          className="flex-1 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          value={social.avgViews || ''}
                          onChange={(e) => updateSocialStat(social.platform, 'avgViews', e.target.value)}
                          placeholder="Avg Views"
                          className="flex-1 border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Posting Frequency</label>
                      <input
                        type="text"
                        value={editForm.postingFrequency}
                        onChange={(e) => updateEditForm('postingFrequency', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Engagement Rate</label>
                      <input
                        type="text"
                        value={editForm.engagementRate}
                        onChange={(e) => updateEditForm('engagementRate', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Content Themes (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.contentThemes.join(', ')}
                      onChange={(e) => updateEditForm('contentThemes', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Top Content</label>
                    <input
                      type="text"
                      value={editForm.topContent}
                      onChange={(e) => updateEditForm('topContent', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Hashtags (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.hashtags.join(', ')}
                      onChange={(e) => updateEditForm('hashtags', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => updateEditForm('notes', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm h-20"
                    />
                  </div>
                </div>
              ) : (
                // Display Mode
                <>
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{competitor.name}</h3>
                        <p className="text-blue-600 text-sm">{competitor.handle}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {competitor.category}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleEdit(competitor)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Social Stats */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Followers</p>
                      <div className="flex gap-2 flex-wrap">
                        {competitor.socials.map(social => (
                          <div key={social.platform} className={`px-3 py-2 rounded-lg text-sm ${platformColors[social.platform]}`}>
                            {platformIcons[social.platform]} {social.followers}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Posting</p>
                        <p className="font-medium">{competitor.postingFrequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Engagement</p>
                        <p className="font-medium text-green-600">{competitor.engagementRate}</p>
                      </div>
                    </div>

                    {/* Content Themes */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Content Themes</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.contentThemes.map((theme, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Content */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Top Performing</p>
                      <p className="text-sm text-gray-700">{competitor.topContent}</p>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-blue-600">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">💡 Notes</p>
                      <p className="text-sm text-gray-600 italic">{competitor.notes}</p>
                    </div>

                    <p className="text-xs text-gray-400 text-right">Updated: {competitor.lastUpdated}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Competitor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">TikTok</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Instagram</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">YouTube</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Frequency</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Engagement</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {competitors.map(competitor => (
                  <tr key={competitor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{competitor.name}</p>
                        <p className="text-blue-600 text-xs">{competitor.handle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-black text-white rounded text-xs">
                        {competitor.socials.find(s => s.platform === 'tiktok')?.followers || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs">
                        {competitor.socials.find(s => s.platform === 'instagram')?.followers || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                        {competitor.socials.find(s => s.platform === 'youtube')?.followers || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{competitor.postingFrequency}</td>
                    <td className="px-4 py-4">
                      <span className="text-green-600 font-medium">{competitor.engagementRate}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => handleEdit(competitor)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">Top Platform by Followers</p>
            <p className="text-gray-600 text-sm mt-1">Instagram leads with highest total followers across competitors</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">Content Strategy</p>
            <p className="text-gray-600 text-sm mt-1">Athletic endorsements & transformation content performs best</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">Posting Cadence</p>
            <p className="text-gray-600 text-sm mt-1">Most competitors post 4-5x per week consistently</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompetitorResearch
