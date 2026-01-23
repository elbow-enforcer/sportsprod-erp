import { useState } from 'react'

type SequenceType = 'welcome' | 'onboarding' | 'reengagement'
type EmailStatus = 'active' | 'paused' | 'draft'

interface Email {
  id: string
  day: number
  subject: string
  previewText: string
  status: EmailStatus
  openRate: number
  clickRate: number
  sent: number
}

interface Sequence {
  id: string
  type: SequenceType
  name: string
  description: string
  status: EmailStatus
  totalSubscribers: number
  emails: Email[]
}

const mockSequences: Sequence[] = [
  {
    id: 'welcome',
    type: 'welcome',
    name: 'Welcome Sequence',
    description: 'New subscribers introduction series',
    status: 'active',
    totalSubscribers: 2450,
    emails: [
      {
        id: 'w1',
        day: 0,
        subject: 'Welcome to UCL Recovery Pro! Here\'s What to Expect',
        previewText: 'Thank you for joining our community of athletes committed to recovery...',
        status: 'active',
        openRate: 68.4,
        clickRate: 22.3,
        sent: 2450,
      },
      {
        id: 'w2',
        day: 2,
        subject: 'Understanding UCL Injuries: What Every Athlete Should Know',
        previewText: 'UCL injuries don\'t have to sideline you forever. Learn the science...',
        status: 'active',
        openRate: 52.1,
        clickRate: 18.7,
        sent: 2312,
      },
      {
        id: 'w3',
        day: 5,
        subject: 'Meet the ElbowEnforcer: Your Recovery Game-Changer',
        previewText: 'Discover how our patented technology accelerates UCL recovery...',
        status: 'active',
        openRate: 45.8,
        clickRate: 24.1,
        sent: 2198,
      },
      {
        id: 'w4',
        day: 7,
        subject: 'Real Athletes, Real Results: Recovery Stories',
        previewText: 'See how professional and amateur athletes have transformed their recovery...',
        status: 'active',
        openRate: 41.2,
        clickRate: 15.6,
        sent: 2089,
      },
      {
        id: 'w5',
        day: 10,
        subject: 'Ready to Start Your Recovery? Special Offer Inside',
        previewText: 'Exclusive 15% off for new subscribers. Your arm deserves the best...',
        status: 'active',
        openRate: 38.9,
        clickRate: 28.4,
        sent: 1956,
      },
    ],
  },
  {
    id: 'onboarding',
    type: 'onboarding',
    name: 'Onboarding Sequence',
    description: 'New customer success journey',
    status: 'active',
    totalSubscribers: 1823,
    emails: [
      {
        id: 'o1',
        day: 0,
        subject: 'Order Confirmed! Your ElbowEnforcer is On Its Way',
        previewText: 'Thank you for your order #EE-XXXXX. Here\'s what happens next...',
        status: 'active',
        openRate: 89.2,
        clickRate: 34.1,
        sent: 1823,
      },
      {
        id: 'o2',
        day: 3,
        subject: 'Shipping Update: Your Package is Moving!',
        previewText: 'Great news! Your ElbowEnforcer has shipped and is on track for delivery...',
        status: 'active',
        openRate: 76.5,
        clickRate: 42.8,
        sent: 1756,
      },
      {
        id: 'o3',
        day: 7,
        subject: 'Getting Started: Your Complete Setup Guide',
        previewText: 'Everything you need to know to get the most from your ElbowEnforcer...',
        status: 'active',
        openRate: 62.3,
        clickRate: 38.9,
        sent: 1698,
      },
      {
        id: 'o4',
        day: 14,
        subject: 'How\'s Your Recovery Going? Tips to Maximize Results',
        previewText: 'You\'ve been using ElbowEnforcer for 2 weeks now. Here are pro tips...',
        status: 'active',
        openRate: 48.7,
        clickRate: 21.4,
        sent: 1612,
      },
      {
        id: 'o5',
        day: 30,
        subject: 'Share Your Recovery Story – We\'d Love Your Feedback',
        previewText: 'Your experience matters! Leave a review and help other athletes...',
        status: 'active',
        openRate: 35.2,
        clickRate: 18.9,
        sent: 1489,
      },
    ],
  },
  {
    id: 'reengagement',
    type: 'reengagement',
    name: 'Re-engagement Sequence',
    description: 'Win back inactive leads',
    status: 'paused',
    totalSubscribers: 567,
    emails: [
      {
        id: 'r1',
        day: 0,
        subject: 'We Miss You! What\'s Keeping You From Recovery?',
        previewText: 'It\'s been a while since we connected. Your arm health is still important...',
        status: 'paused',
        openRate: 24.6,
        clickRate: 8.2,
        sent: 567,
      },
      {
        id: 'r2',
        day: 3,
        subject: 'New Research: Breakthrough in UCL Recovery Science',
        previewText: 'Exciting developments in sports medicine you won\'t want to miss...',
        status: 'paused',
        openRate: 19.8,
        clickRate: 11.4,
        sent: 498,
      },
      {
        id: 'r3',
        day: 7,
        subject: 'Exclusive: 20% Off – Just For You',
        previewText: 'We want to help you get back on track. Here\'s a special offer...',
        status: 'paused',
        openRate: 28.3,
        clickRate: 15.7,
        sent: 456,
      },
      {
        id: 'r4',
        day: 14,
        subject: 'Last Chance: Your Recovery Awaits',
        previewText: 'This is our final reminder. Don\'t let this opportunity slip away...',
        status: 'paused',
        openRate: 22.1,
        clickRate: 12.3,
        sent: 412,
      },
    ],
  },
]

const statusConfig: Record<EmailStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
}

const sequenceIcons: Record<SequenceType, string> = {
  welcome: '👋',
  onboarding: '🚀',
  reengagement: '💌',
}

export function EmailSequences() {
  const [activeSequence, setActiveSequence] = useState<SequenceType>('welcome')
  const [sequences] = useState<Sequence[]>(mockSequences)

  const currentSequence = sequences.find(s => s.type === activeSequence)!

  // Calculate overall metrics
  const totalEmails = sequences.reduce((acc, s) => acc + s.emails.length, 0)
  const avgOpenRate = sequences.reduce((acc, s) => {
    const seqAvg = s.emails.reduce((a, e) => a + e.openRate, 0) / s.emails.length
    return acc + seqAvg
  }, 0) / sequences.length
  const avgClickRate = sequences.reduce((acc, s) => {
    const seqAvg = s.emails.reduce((a, e) => a + e.clickRate, 0) / s.emails.length
    return acc + seqAvg
  }, 0) / sequences.length
  const totalSent = sequences.reduce((acc, s) => acc + s.emails.reduce((a, e) => a + e.sent, 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Sequences</h2>
          <p className="text-gray-500 mt-1">Manage automated email campaigns and drip sequences</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Sequence
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmails}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{avgOpenRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{avgClickRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sequence Selector Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {sequences.map((seq) => (
              <button
                key={seq.id}
                onClick={() => setActiveSequence(seq.type)}
                className={`flex-1 px-6 py-4 text-left transition-colors relative ${
                  activeSequence === seq.type
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sequenceIcons[seq.type]}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${activeSequence === seq.type ? 'text-blue-900' : 'text-gray-900'}`}>
                        {seq.name}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[seq.status].bg} ${statusConfig[seq.status].text}`}>
                        {seq.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{seq.emails.length} emails • {seq.totalSubscribers.toLocaleString()} subscribers</p>
                  </div>
                </div>
                {activeSequence === seq.type && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sequence Performance Summary */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentSequence.name}</h3>
              <p className="text-gray-600">{currentSequence.description}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {(currentSequence.emails.reduce((a, e) => a + e.openRate, 0) / currentSequence.emails.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Avg Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {(currentSequence.emails.reduce((a, e) => a + e.clickRate, 0) / currentSequence.emails.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Avg Click Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {currentSequence.emails[currentSequence.emails.length - 1].day}
                </p>
                <p className="text-sm text-gray-500">Day Span</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: currentSequence.status === 'active' ? '100%' : '0%' }}
              />
            </div>

            {/* Timeline Points */}
            <div className="relative flex justify-between">
              {currentSequence.emails.map((email, index) => (
                <div key={email.id} className="flex flex-col items-center" style={{ width: `${100 / currentSequence.emails.length}%` }}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-lg ${
                    email.status === 'active' ? 'bg-blue-600' : email.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}>
                    Day {email.day}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Email {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Cards */}
        <div className="p-6 pt-0 space-y-4">
          {currentSequence.emails.map((email, index) => (
            <div 
              key={email.id} 
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                    email.status === 'active' ? 'bg-blue-600' : email.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}>
                    D{email.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-medium">EMAIL {index + 1}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[email.status].bg} ${statusConfig[email.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[email.status].dot}`} />
                        {email.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{email.subject}</h4>
                    <p className="text-sm text-gray-500">{email.previewText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 ml-4">
                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold text-gray-900">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {email.openRate}%
                    </div>
                    <p className="text-xs text-gray-500">Open Rate</p>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold text-gray-900">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      {email.clickRate}%
                    </div>
                    <p className="text-xs text-gray-500">Click Rate</p>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-semibold text-gray-900">{email.sent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sequence Actions */}
        <div className="p-6 pt-0 border-t border-gray-100">
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sequence triggers when subscriber joins via {currentSequence.type === 'welcome' ? 'signup form' : currentSequence.type === 'onboarding' ? 'purchase' : 'inactivity detection'}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Duplicate
              </button>
              <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                {currentSequence.status === 'active' ? 'Pause' : 'Activate'}
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Edit Sequence
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
