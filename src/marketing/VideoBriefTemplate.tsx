/**
 * Video Concept Brief Template
 * Form for planning individual video content
 */

import { useState, useRef } from 'react';

interface VideoBrief {
  id: string;
  title: string;
  contentPillar: 'Educational' | 'Testimonial' | 'Product' | 'Entertainment' | '';
  targetPlatform: 'TikTok' | 'Reels' | 'Shorts' | '';
  hook: string;
  mainContent: string;
  cta: string;
  requiredProps: string;
  trendingSound: string;
  estimatedTime: string;
  notes: string;
  status: 'draft' | 'ready' | 'filming' | 'editing' | 'published';
  createdAt: string;
  updatedAt: string;
}

const EMPTY_BRIEF: Omit<VideoBrief, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  contentPillar: '',
  targetPlatform: '',
  hook: '',
  mainContent: '',
  cta: '',
  requiredProps: '',
  trendingSound: '',
  estimatedTime: '',
  notes: '',
  status: 'draft',
};

const TEMPLATE_BRIEF: Omit<VideoBrief, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '[Video Title - Make it Descriptive]',
  contentPillar: 'Educational',
  targetPlatform: 'TikTok',
  hook: 'First 3 seconds: Start with a question, bold statement, or visual hook that stops the scroll...',
  mainContent: `Key points to cover:
• Point 1: [Main value/insight]
• Point 2: [Supporting detail]
• Point 3: [Demonstration or proof]

Transition ideas:
- Cut to product shot
- Show before/after
- Include text overlay`,
  cta: 'Link in bio | Follow for more tips | Comment your experience',
  requiredProps: '• Elbow Enforcer product\n• Good lighting setup\n• Gym equipment (optional)\n• Phone/camera tripod',
  trendingSound: '[Search TikTok trending sounds or use original audio]',
  estimatedTime: '30-45 minutes',
  notes: 'Additional notes:\n- Film multiple takes\n- Capture B-roll footage\n- Remember to speak clearly and with energy',
  status: 'draft',
};

const CONTENT_PILLARS = ['Educational', 'Testimonial', 'Product', 'Entertainment'] as const;
const PLATFORMS = ['TikTok', 'Reels', 'Shorts'] as const;
const STATUSES = ['draft', 'ready', 'filming', 'editing', 'published'] as const;

const STATUS_COLORS: Record<VideoBrief['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  ready: 'bg-blue-100 text-blue-700',
  filming: 'bg-yellow-100 text-yellow-700',
  editing: 'bg-purple-100 text-purple-700',
  published: 'bg-green-100 text-green-700',
};

const PILLAR_COLORS: Record<string, string> = {
  Educational: 'border-blue-500 bg-blue-50',
  Testimonial: 'border-green-500 bg-green-50',
  Product: 'border-purple-500 bg-purple-50',
  Entertainment: 'border-orange-500 bg-orange-50',
};

function generateId(): string {
  return `brief-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export function VideoBriefTemplate() {
  const [briefs, setBriefs] = useState<VideoBrief[]>(() => {
    const saved = localStorage.getItem('sportsprod-video-briefs');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBrief, setCurrentBrief] = useState<Omit<VideoBrief, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_BRIEF);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const saveBriefs = (newBriefs: VideoBrief[]) => {
    localStorage.setItem('sportsprod-video-briefs', JSON.stringify(newBriefs));
    setBriefs(newBriefs);
  };

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    
    if (editingId) {
      const updated = briefs.map(b => 
        b.id === editingId 
          ? { ...b, ...currentBrief, updatedAt: now }
          : b
      );
      saveBriefs(updated);
    } else {
      const newBrief: VideoBrief = {
        ...currentBrief,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      saveBriefs([newBrief, ...briefs]);
    }
    
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const handleLoadTemplate = () => {
    setCurrentBrief(TEMPLATE_BRIEF);
    setEditingId(null);
  };

  const handleClear = () => {
    setCurrentBrief(EMPTY_BRIEF);
    setEditingId(null);
  };

  const handleEdit = (brief: VideoBrief) => {
    const { id, createdAt, updatedAt, ...rest } = brief;
    setCurrentBrief(rest);
    setEditingId(id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this brief?')) {
      saveBriefs(briefs.filter(b => b.id !== id));
      if (editingId === id) {
        handleClear();
      }
    }
  };

  const handleCopyToClipboard = () => {
    const text = `VIDEO BRIEF: ${currentBrief.title || 'Untitled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Content Pillar: ${currentBrief.contentPillar || 'Not selected'}
📱 Platform: ${currentBrief.targetPlatform || 'Not selected'}
⏱️ Est. Time: ${currentBrief.estimatedTime || 'Not set'}

🪝 HOOK (First 3 Seconds):
${currentBrief.hook || 'Not written'}

📝 MAIN CONTENT:
${currentBrief.mainContent || 'Not outlined'}

📣 CTA:
${currentBrief.cta || 'Not set'}

🎬 REQUIRED PROPS/EQUIPMENT:
${currentBrief.requiredProps || 'Not listed'}

🎵 TRENDING SOUND:
${currentBrief.trendingSound || 'Not selected'}

📌 NOTES:
${currentBrief.notes || 'None'}
`;
    navigator.clipboard.writeText(text);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const handleExportPDF = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Video Brief - ${currentBrief.title || 'Untitled'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field { background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin: 8px 0; white-space: pre-wrap; }
    .meta { display: flex; gap: 20px; margin-bottom: 20px; }
    .meta-item { background: #eef2ff; padding: 8px 16px; border-radius: 6px; }
    .meta-label { font-size: 12px; color: #6b7280; }
    .meta-value { font-weight: 600; color: #4f46e5; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📹 ${currentBrief.title || 'Untitled Video Brief'}</h1>
  
  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Content Pillar</div>
      <div class="meta-value">${currentBrief.contentPillar || '—'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Platform</div>
      <div class="meta-value">${currentBrief.targetPlatform || '—'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Est. Time</div>
      <div class="meta-value">${currentBrief.estimatedTime || '—'}</div>
    </div>
  </div>

  <h2>🪝 Hook (First 3 Seconds)</h2>
  <div class="field">${currentBrief.hook || 'Not written'}</div>

  <h2>📝 Main Content Outline</h2>
  <div class="field">${currentBrief.mainContent || 'Not outlined'}</div>

  <h2>📣 Call to Action</h2>
  <div class="field">${currentBrief.cta || 'Not set'}</div>

  <h2>🎬 Required Props/Equipment</h2>
  <div class="field">${currentBrief.requiredProps || 'Not listed'}</div>

  <h2>🎵 Trending Sound</h2>
  <div class="field">${currentBrief.trendingSound || 'Not selected'}</div>

  <h2>📌 Notes</h2>
  <div class="field">${currentBrief.notes || 'None'}</div>

  <script>window.print();</script>
</body>
</html>
`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const updateField = <K extends keyof typeof currentBrief>(field: K, value: typeof currentBrief[K]) => {
    setCurrentBrief(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📝 Video Concept Brief</h1>
        <p className="text-indigo-100">Plan and organize your video content before production</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-indigo-600">{briefs.length}</p>
          <p className="text-sm text-gray-500">Total Briefs</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-yellow-600">{briefs.filter(b => b.status === 'draft').length}</p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-blue-600">{briefs.filter(b => b.status === 'ready').length}</p>
          <p className="text-sm text-gray-500">Ready to Film</p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-3xl font-bold text-green-600">{briefs.filter(b => b.status === 'published').length}</p>
          <p className="text-sm text-gray-500">Published</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-4" ref={formRef}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '✏️ Edit Brief' : '➕ New Brief'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleLoadTemplate}
                  className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  📋 Load Template
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <FormField label="Video Title" required>
                <input
                  type="text"
                  value={currentBrief.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Enter a descriptive title for your video"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormField>

              {/* Content Pillar & Platform */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Content Pillar" required>
                  <select
                    value={currentBrief.contentPillar}
                    onChange={e => updateField('contentPillar', e.target.value as VideoBrief['contentPillar'])}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select pillar...</option>
                    {CONTENT_PILLARS.map(pillar => (
                      <option key={pillar} value={pillar}>{pillar}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Target Platform" required>
                  <select
                    value={currentBrief.targetPlatform}
                    onChange={e => updateField('targetPlatform', e.target.value as VideoBrief['targetPlatform'])}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select platform...</option>
                    {PLATFORMS.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Hook */}
              <FormField label="Hook (First 3 Seconds)" required>
                <textarea
                  value={currentBrief.hook}
                  onChange={e => updateField('hook', e.target.value)}
                  placeholder="What will grab attention in the first 3 seconds? Start with a question, bold statement, or visual hook..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormField>

              {/* Main Content */}
              <FormField label="Main Content Outline" required>
                <textarea
                  value={currentBrief.mainContent}
                  onChange={e => updateField('mainContent', e.target.value)}
                  placeholder="Outline the key points, structure, and flow of your video content..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormField>

              {/* CTA */}
              <FormField label="Call to Action (CTA)">
                <input
                  type="text"
                  value={currentBrief.cta}
                  onChange={e => updateField('cta', e.target.value)}
                  placeholder="e.g., Link in bio | Follow for more | Comment below"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormField>

              {/* Props & Trending Sound */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Required Props/Equipment">
                  <textarea
                    value={currentBrief.requiredProps}
                    onChange={e => updateField('requiredProps', e.target.value)}
                    placeholder="List any props, equipment, or setup needed..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </FormField>

                <FormField label="Trending Sound (Optional)">
                  <textarea
                    value={currentBrief.trendingSound}
                    onChange={e => updateField('trendingSound', e.target.value)}
                    placeholder="Link or name of trending audio to use..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </FormField>
              </div>

              {/* Est Time & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Estimated Production Time">
                  <input
                    type="text"
                    value={currentBrief.estimatedTime}
                    onChange={e => updateField('estimatedTime', e.target.value)}
                    placeholder="e.g., 30-45 minutes"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={currentBrief.status}
                    onChange={e => updateField('status', e.target.value as VideoBrief['status'])}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Notes */}
              <FormField label="Notes">
                <textarea
                  value={currentBrief.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder="Any additional notes, reminders, or creative ideas..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormField>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  💾 {editingId ? 'Update Brief' : 'Save Draft'}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📄 Export PDF
                </button>
              </div>

              {/* Save/Copy Feedback */}
              {showSavedMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
                  ✅ Brief saved successfully!
                </div>
              )}
              {showCopiedMessage && (
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                  📋 Copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Briefs Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">📚 Saved Briefs</h3>
            
            {briefs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📝</p>
                <p className="text-sm">No briefs yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Load Template" to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {briefs.map(brief => (
                  <div
                    key={brief.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      PILLAR_COLORS[brief.contentPillar] || 'border-gray-300 bg-gray-50'
                    } ${editingId === brief.id ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => handleEdit(brief)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {brief.title || 'Untitled'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[brief.status]}`}>
                            {brief.status}
                          </span>
                          {brief.targetPlatform && (
                            <span className="text-xs text-gray-500">{brief.targetPlatform}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(brief.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• Hook should answer "Why should I keep watching?"</li>
              <li>• Keep videos under 60 seconds for better engagement</li>
              <li>• Always include captions for accessibility</li>
              <li>• Film in 9:16 vertical format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoBriefTemplate;
