/**
 * Video Content Playbook
 * Team workflow and guidelines for video content creation
 */

import { useState } from 'react';

interface PlaybookSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ children, done = false }: { children: React.ReactNode; done?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
      <span className="mt-0.5">{done ? '✅' : '☐'}</span>
      <span>{children}</span>
    </li>
  );
}

export function VideoPlaybook() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📹 Video Content Playbook</h1>
        <p className="text-purple-100">
          Everything you need to create killer video content for Elbow Enforcer
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-purple-600">3-5</p>
          <p className="text-sm text-gray-500">Videos/Week Target</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-pink-600">15-60s</p>
          <p className="text-sm text-gray-500">Optimal Length</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-500">Platforms</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-green-600">5%</p>
          <p className="text-sm text-gray-500">Engagement Goal</p>
        </div>
      </div>

      {/* Content Pillars */}
      <SectionCard title="Content Pillars" icon="🎯">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📚 Educational (40%)</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Training tips & techniques</li>
              <li>• Injury prevention science</li>
              <li>• Elbow anatomy explained</li>
              <li>• Exercise form corrections</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">⭐ Testimonials (25%)</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Customer reviews & results</li>
              <li>• Pro athlete endorsements</li>
              <li>• Physical therapist opinions</li>
              <li>• Before/after transformations</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📦 Product (20%)</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Unboxing & first impressions</li>
              <li>• How-to & sizing guides</li>
              <li>• Product in action</li>
              <li>• Feature highlights</li>
            </ul>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">🎭 Entertainment (15%)</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Gym humor & memes</li>
              <li>• Trending sounds/challenges</li>
              <li>• Behind-the-scenes</li>
              <li>• Founder story moments</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Hook Templates */}
      <SectionCard title="Hook Templates" icon="🪝">
        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">First 3 Seconds (Critical!)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded p-3 border-l-4 border-red-500">
                <p className="font-medium text-sm">Problem Hook</p>
                <p className="text-xs text-gray-600 italic">"If your elbows hurt during curls, you need to see this..."</p>
              </div>
              <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                <p className="font-medium text-sm">Curiosity Hook</p>
                <p className="text-xs text-gray-600 italic">"This is why pro athletes swear by elbow support..."</p>
              </div>
              <div className="bg-white rounded p-3 border-l-4 border-green-500">
                <p className="font-medium text-sm">Result Hook</p>
                <p className="text-xs text-gray-600 italic">"I went from elbow pain every workout to zero pain in 2 weeks..."</p>
              </div>
              <div className="bg-white rounded p-3 border-l-4 border-purple-500">
                <p className="font-medium text-sm">Controversy Hook</p>
                <p className="text-xs text-gray-600 italic">"Your trainer is wrong about elbow sleeves..."</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Call-to-Action Templates</h4>
            <ul className="text-sm space-y-2">
              <li>✅ "Link in bio for 15% off your first order"</li>
              <li>✅ "Comment 'ELBOW' and I'll send you the link"</li>
              <li>✅ "Follow for more training tips"</li>
              <li>✅ "Save this for your next arm day"</li>
              <li>❌ Avoid: Generic "check it out" or no CTA at all</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Production Workflow */}
      <SectionCard title="Production Workflow" icon="🎬">
        <div className="mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pre-Production */}
            <div className="flex-1 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">📝 Pre-Production</h4>
              <ul className="text-sm space-y-2">
                <ChecklistItem>Select idea from Video Ideas Bank</ChecklistItem>
                <ChecklistItem>Write script/outline (keep under 60 sec)</ChecklistItem>
                <ChecklistItem>Choose trending sound (if applicable)</ChecklistItem>
                <ChecklistItem>Prep props & product</ChecklistItem>
                <ChecklistItem>Check lighting & background</ChecklistItem>
              </ul>
            </div>
            
            {/* Production */}
            <div className="flex-1 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">🎥 Production</h4>
              <ul className="text-sm space-y-2">
                <ChecklistItem>Film in 9:16 vertical format</ChecklistItem>
                <ChecklistItem>Record 3-5 takes minimum</ChecklistItem>
                <ChecklistItem>Capture B-roll clips</ChecklistItem>
                <ChecklistItem>Get product close-ups</ChecklistItem>
                <ChecklistItem>Film in good lighting (natural best)</ChecklistItem>
              </ul>
            </div>
            
            {/* Post-Production */}
            <div className="flex-1 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">✂️ Post-Production</h4>
              <ul className="text-sm space-y-2">
                <ChecklistItem>Edit to under 60 seconds</ChecklistItem>
                <ChecklistItem>Add captions (85% watch muted!)</ChecklistItem>
                <ChecklistItem>Add trending audio</ChecklistItem>
                <ChecklistItem>Color correct if needed</ChecklistItem>
                <ChecklistItem>Export in 1080x1920</ChecklistItem>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Platform Guidelines */}
      <SectionCard title="Platform Best Practices" icon="📱">
        <div className="mt-4 space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Platform</th>
                  <th className="px-4 py-2 text-left">Best Length</th>
                  <th className="px-4 py-2 text-left">Best Times</th>
                  <th className="px-4 py-2 text-left">Hashtags</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">TikTok</td>
                  <td className="px-4 py-3">15-30 sec</td>
                  <td className="px-4 py-3">7am, 12pm, 7pm</td>
                  <td className="px-4 py-3">3-5 hashtags</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-3 font-medium">Instagram Reels</td>
                  <td className="px-4 py-3">15-30 sec</td>
                  <td className="px-4 py-3">11am, 1pm, 7pm</td>
                  <td className="px-4 py-3">5-10 hashtags</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">YouTube Shorts</td>
                  <td className="px-4 py-3">30-60 sec</td>
                  <td className="px-4 py-3">2pm, 4pm, 9pm</td>
                  <td className="px-4 py-3">3-5 hashtags</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Platform Don'ts</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Don't repost TikTok videos to Reels with watermark</li>
              <li>• Don't use copyrighted music (use platform sounds)</li>
              <li>• Don't post same content to all platforms same day</li>
              <li>• Don't ignore comments in first hour</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Team Roles */}
      <SectionCard title="Team Roles & Responsibilities" icon="👥">
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="text-4xl">🎬</span>
              <h4 className="font-semibold mt-2">Content Creator</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ideation & scripting</li>
              <li>• On-camera talent</li>
              <li>• Filming content</li>
              <li>• Trend monitoring</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="text-4xl">✂️</span>
              <h4 className="font-semibold mt-2">Video Editor</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Edit & cut footage</li>
              <li>• Add captions & text</li>
              <li>• Sound & music</li>
              <li>• Export & format</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="text-4xl">📊</span>
              <h4 className="font-semibold mt-2">Social Manager</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Schedule & post</li>
              <li>• Engage comments</li>
              <li>• Track analytics</li>
              <li>• Report performance</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Performance Benchmarks */}
      <SectionCard title="Performance Benchmarks" icon="📈">
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">10K+</p>
              <p className="text-xs text-green-600">Views (Good)</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">5%+</p>
              <p className="text-xs text-green-600">Engagement Rate</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">50%+</p>
              <p className="text-xs text-green-600">Watch-through</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">2%+</p>
              <p className="text-xs text-green-600">Click-through</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Weekly Goals</h4>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span>Videos Posted</span>
                <span className="font-medium">3-5 per platform</span>
              </li>
              <li className="flex justify-between">
                <span>Total Reach</span>
                <span className="font-medium">50K+ impressions</span>
              </li>
              <li className="flex justify-between">
                <span>New Followers</span>
                <span className="font-medium">100+ per week</span>
              </li>
              <li className="flex justify-between">
                <span>Website Clicks</span>
                <span className="font-medium">500+ per week</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Tools */}
      <SectionCard title="Recommended Tools" icon="🛠️">
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">CapCut</p>
            <p className="text-xs text-gray-500">Video Editing</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">Canva</p>
            <p className="text-xs text-gray-500">Thumbnails</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">Later</p>
            <p className="text-xs text-gray-500">Scheduling</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">TrendTok</p>
            <p className="text-xs text-gray-500">Trend Research</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
