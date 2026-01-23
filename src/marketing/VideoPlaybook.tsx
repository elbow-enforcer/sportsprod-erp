/**
 * Video Content Playbook
 * Team workflow and guidelines for video content creation
 */

import { useState } from 'react';

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

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-gray-700">
      <span className="mt-0.5">☐</span>
      <span>{children}</span>
    </li>
  );
}

export function VideoPlaybook() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📹 Video Content Playbook</h1>
        <p className="text-purple-100">Everything you need to create killer video content for Elbow Enforcer</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-purple-600">3-5</p>
          <p className="text-sm text-gray-500">Videos/Week</p>
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

      <SectionCard title="Content Pillars" icon="🎯">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📚 Educational (40%)</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Training tips & techniques</li>
              <li>• Injury prevention science</li>
              <li>• Exercise form corrections</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">⭐ Testimonials (25%)</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Customer reviews & results</li>
              <li>• Pro athlete endorsements</li>
              <li>• Before/after transformations</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📦 Product (20%)</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Unboxing & first impressions</li>
              <li>• How-to & sizing guides</li>
              <li>• Product in action</li>
            </ul>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">🎭 Entertainment (15%)</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Gym humor & memes</li>
              <li>• Trending sounds/challenges</li>
              <li>• Behind-the-scenes</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hook Templates" icon="🪝">
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded p-3 border-l-4 border-red-500">
            <p className="font-medium text-sm">Problem Hook</p>
            <p className="text-xs text-gray-600 italic">"If your elbows hurt during curls..."</p>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-blue-500">
            <p className="font-medium text-sm">Curiosity Hook</p>
            <p className="text-xs text-gray-600 italic">"This is why pro athletes swear by..."</p>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-green-500">
            <p className="font-medium text-sm">Result Hook</p>
            <p className="text-xs text-gray-600 italic">"I went from elbow pain to zero pain..."</p>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-purple-500">
            <p className="font-medium text-sm">Controversy Hook</p>
            <p className="text-xs text-gray-600 italic">"Your trainer is wrong about..."</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Production Workflow" icon="🎬">
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-3">📝 Pre-Production</h4>
            <ul className="text-sm space-y-2">
              <ChecklistItem>Select idea from Ideas Bank</ChecklistItem>
              <ChecklistItem>Write script/outline</ChecklistItem>
              <ChecklistItem>Choose trending sound</ChecklistItem>
            </ul>
          </div>
          <div className="flex-1 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">🎥 Production</h4>
            <ul className="text-sm space-y-2">
              <ChecklistItem>Film in 9:16 vertical</ChecklistItem>
              <ChecklistItem>Record 3-5 takes</ChecklistItem>
              <ChecklistItem>Capture B-roll</ChecklistItem>
            </ul>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">✂️ Post</h4>
            <ul className="text-sm space-y-2">
              <ChecklistItem>Edit under 60 seconds</ChecklistItem>
              <ChecklistItem>Add captions</ChecklistItem>
              <ChecklistItem>Export 1080x1920</ChecklistItem>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Platform Guidelines" icon="📱">
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Platform</th>
                <th className="px-4 py-2 text-left">Length</th>
                <th className="px-4 py-2 text-left">Best Times</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="px-4 py-3">TikTok</td><td>15-30s</td><td>7am, 12pm, 7pm</td></tr>
              <tr className="border-t bg-gray-50"><td className="px-4 py-3">Instagram</td><td>15-30s</td><td>11am, 1pm, 7pm</td></tr>
              <tr className="border-t"><td className="px-4 py-3">YouTube</td><td>30-60s</td><td>2pm, 4pm, 9pm</td></tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Benchmarks" icon="📈">
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">10K+</p>
            <p className="text-xs text-green-600">Views</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">5%+</p>
            <p className="text-xs text-green-600">Engagement</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">50%+</p>
            <p className="text-xs text-green-600">Watch-through</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">2%+</p>
            <p className="text-xs text-green-600">CTR</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
