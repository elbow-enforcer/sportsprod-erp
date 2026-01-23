import { useState, useMemo } from 'react';
import { KPICard } from '../components/KPICard';

// ============== MOCK DATA ==============

interface ReferralStats {
  totalSent: number;
  conversions: number;
  pending: number;
  totalEarnings: number;
}

interface TopReferrer {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
  avatar: string;
}

interface RecentActivity {
  id: string;
  referrerName: string;
  friendName: string;
  status: 'sent' | 'clicked' | 'converted' | 'paid';
  date: string;
  amount?: number;
}

const mockStats: ReferralStats = {
  totalSent: 487,
  conversions: 89,
  pending: 34,
  totalEarnings: 8900,
};

const mockTopReferrers: TopReferrer[] = [
  { rank: 1, name: 'Jake Thompson', referrals: 24, earnings: 2400, avatar: '👤' },
  { rank: 2, name: 'Sarah Mitchell', referrals: 19, earnings: 1900, avatar: '👤' },
  { rank: 3, name: 'Marcus Chen', referrals: 15, earnings: 1500, avatar: '👤' },
  { rank: 4, name: 'Emily Rodriguez', referrals: 12, earnings: 1200, avatar: '👤' },
  { rank: 5, name: 'Tyler Brooks', referrals: 9, earnings: 900, avatar: '👤' },
  { rank: 6, name: 'Jessica Lee', referrals: 8, earnings: 800, avatar: '👤' },
  { rank: 7, name: 'David Kim', referrals: 7, earnings: 700, avatar: '👤' },
  { rank: 8, name: 'Amanda Foster', referrals: 6, earnings: 600, avatar: '👤' },
  { rank: 9, name: 'Chris Johnson', referrals: 5, earnings: 500, avatar: '👤' },
  { rank: 10, name: 'Rachel Adams', referrals: 4, earnings: 400, avatar: '👤' },
];

const mockRecentActivity: RecentActivity[] = [
  { id: '1', referrerName: 'Jake Thompson', friendName: 'Mike Wilson', status: 'paid', date: '2026-01-22', amount: 100 },
  { id: '2', referrerName: 'Sarah Mitchell', friendName: 'Lisa Brown', status: 'converted', date: '2026-01-21', amount: 100 },
  { id: '3', referrerName: 'Marcus Chen', friendName: 'Kevin Park', status: 'clicked', date: '2026-01-21' },
  { id: '4', referrerName: 'Emily Rodriguez', friendName: 'Anna Martinez', status: 'sent', date: '2026-01-20' },
  { id: '5', referrerName: 'Tyler Brooks', friendName: 'Ryan Cooper', status: 'converted', date: '2026-01-20', amount: 100 },
  { id: '6', referrerName: 'Jake Thompson', friendName: 'James Turner', status: 'clicked', date: '2026-01-19' },
  { id: '7', referrerName: 'Jessica Lee', friendName: 'Sophie Clark', status: 'paid', date: '2026-01-19', amount: 100 },
  { id: '8', referrerName: 'David Kim', friendName: 'Daniel Lee', status: 'sent', date: '2026-01-18' },
];

// ============== COMPONENT ==============

export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  
  // Mock referral link for the current user
  const referralLink = 'https://sportsprod.com/ref/SPREF2026XK9';
  const referralCode = 'SPREF2026XK9';

  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    return mockStats.totalSent > 0 
      ? ((mockStats.conversions / mockStats.totalSent) * 100).toFixed(1)
      : '0';
  }, []);

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share handlers
  const handleShareEmail = () => {
    const subject = encodeURIComponent('Get $100 off SportsProd!');
    const body = encodeURIComponent(`Hey! I've been using SportsProd and thought you might like it too. Use my referral link to get $100 off your first purchase: ${referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Get $100 off @SportsProd with my referral link! 🏆 ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`);
  };

  // Status badge styling
  const getStatusBadge = (status: RecentActivity['status']) => {
    const styles = {
      sent: 'bg-gray-100 text-gray-700',
      clicked: 'bg-blue-100 text-blue-700',
      converted: 'bg-green-100 text-green-700',
      paid: 'bg-emerald-100 text-emerald-700',
    };
    const labels = {
      sent: 'Sent',
      clicked: 'Clicked',
      converted: 'Converted',
      paid: 'Paid Out',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
        <p className="text-gray-500 mt-1">Give $100, Get $100 — Share the love and earn rewards</p>
      </div>

      {/* Program Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Give $100, Get $100</h3>
            <p className="text-blue-100 mb-4">
              Refer a friend to SportsProd and you both win!
            </p>
            
            {/* How It Works */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider">How it works</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <p className="font-medium">Share Your Link</p>
                    <p className="text-sm text-blue-200">Send your unique referral link to friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <p className="font-medium">Friend Purchases</p>
                    <p className="text-sm text-blue-200">They get $100 off their first order</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <p className="font-medium">You Get Rewarded</p>
                    <p className="text-sm text-blue-200">Earn $100 credit to your account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms Summary */}
          <div className="bg-white/10 rounded-lg p-4 lg:w-72">
            <p className="font-semibold mb-2">Program Terms</p>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Referral valid for 30 days</li>
              <li>• Min. purchase of $200 required</li>
              <li>• Credit issued after order ships</li>
              <li>• No limit on referrals</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Referrals Sent"
          value={mockStats.totalSent.toLocaleString()}
          trend={{ value: 12, isPositive: true }}
          subtitle="Total invitations"
          icon={<SendIcon />}
        />
        <KPICard
          title="Conversions"
          value={mockStats.conversions.toString()}
          trend={{ value: 8, isPositive: true }}
          subtitle="Successful referrals"
          icon={<CheckIcon />}
        />
        <KPICard
          title="Pending"
          value={mockStats.pending.toString()}
          subtitle="Awaiting purchase"
          icon={<ClockIcon />}
        />
        <KPICard
          title="Total Earned"
          value={`$${mockStats.totalEarnings.toLocaleString()}`}
          trend={{ value: 15, isPositive: true }}
          subtitle="Lifetime rewards"
          icon={<CurrencyIcon />}
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          trend={{ value: 2.3, isPositive: true }}
          subtitle="Referral success"
          icon={<ChartIcon />}
        />
      </div>

      {/* Referral Link Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Link Display */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700 font-mono text-sm truncate">{referralLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your referral code: <span className="font-mono font-semibold text-gray-700">{referralCode}</span>
            </p>
          </div>
          
          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Share:</span>
            <button
              onClick={handleShareEmail}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share via Email"
            >
              <EmailIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share on Twitter"
            >
              <TwitterIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleShareFacebook}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share on Facebook"
            >
              <FacebookIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Leaderboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-right">Referrals</th>
                  <th className="pb-3 font-medium text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockTopReferrers.map((referrer) => (
                  <tr key={referrer.rank} className="text-sm">
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-semibold ${
                        referrer.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        referrer.rank === 2 ? 'bg-gray-100 text-gray-600' :
                        referrer.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {referrer.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{referrer.avatar}</span>
                        <span className="font-medium text-gray-900">{referrer.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-600">{referrer.referrals}</td>
                    <td className="py-3 text-right font-medium text-green-600">${referrer.earnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.referrerName} → {activity.friendName}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">+${activity.amount}</span>
                  )}
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ============== ICONS ==============

function SendIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
