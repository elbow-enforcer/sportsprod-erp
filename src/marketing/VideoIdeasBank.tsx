import React, { useState } from 'react';

type Category = 'Educational' | 'Testimonial' | 'Demo' | 'Humor' | 'Trending';
type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'All';
type Effort = 'Low' | 'Medium' | 'High';
type Status = 'New' | 'In Progress' | 'Used';

interface VideoIdea {
  id: number;
  title: string;
  description: string;
  category: Category;
  platform: Platform;
  effort: Effort;
  notes: string;
  status: Status;
}

const initialIdeas: VideoIdea[] = [
  // Educational (1-15)
  {
    id: 1,
    title: 'Why elbow pain happens during curls',
    description: 'Explain the biomechanics of elbow strain during bicep curls and how proper support helps',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'Medium',
    notes: 'Include anatomical diagrams',
    status: 'New',
  },
  {
    id: 2,
    title: '3 grip mistakes destroying your elbows',
    description: 'Common grip errors that lead to elbow pain and how to fix them',
    category: 'Educational',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Quick cuts, punchy delivery',
    status: 'New',
  },
  {
    id: 3,
    title: 'The science behind elbow support',
    description: 'Deep dive into compression, stability, and injury prevention science',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Partner with physical therapist',
    status: 'New',
  },
  {
    id: 4,
    title: 'Golfers elbow vs Tennis elbow explained',
    description: 'Difference between medial and lateral epicondylitis and how our product helps both',
    category: 'Educational',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Use split screen comparison',
    status: 'New',
  },
  {
    id: 5,
    title: '5 exercises that destroy elbows (and how to save them)',
    description: 'Skull crushers, dips, curls - exercises that cause pain and proper form tips',
    category: 'Educational',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Listicle format works well',
    status: 'New',
  },
  {
    id: 6,
    title: 'Why your elbows hurt after pull-ups',
    description: 'Explain the strain on tendons during pulling movements',
    category: 'Educational',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Reel format, 30 seconds',
    status: 'New',
  },
  {
    id: 7,
    title: "The warm-up you're skipping (for elbow health)",
    description: 'Quick wrist and elbow mobility routine before lifting',
    category: 'Educational',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Follow-along format',
    status: 'New',
  },
  {
    id: 8,
    title: 'How compression reduces inflammation',
    description: 'Medical explanation of how compression aids recovery',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'Medium',
    notes: 'Animation could help here',
    status: 'New',
  },
  {
    id: 9,
    title: "Signs you need elbow support (don't ignore these)",
    description: 'Warning signs of developing elbow issues',
    category: 'Educational',
    platform: 'All',
    effort: 'Low',
    notes: 'Evergreen content',
    status: 'New',
  },
  {
    id: 10,
    title: 'Anatomy of the elbow for lifters',
    description: 'Quick anatomy lesson relevant to weightlifting',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'Medium',
    notes: '3D model would be ideal',
    status: 'New',
  },
  {
    id: 11,
    title: 'How to train around elbow pain',
    description: 'Exercise modifications when dealing with elbow issues',
    category: 'Educational',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Show alternatives for common exercises',
    status: 'New',
  },
  {
    id: 12,
    title: 'Recovery tips for elbow tendinitis',
    description: 'Rest, ice, compression, and when to use support',
    category: 'Educational',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Medical disclaimer needed',
    status: 'New',
  },
  {
    id: 13,
    title: 'Why strongmen wear elbow sleeves',
    description: 'Professional perspective on elbow protection in strength sports',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Could interview a strongman',
    status: 'New',
  },
  {
    id: 14,
    title: 'The difference between sleeves, wraps, and braces',
    description: 'Product category comparison and when to use each',
    category: 'Educational',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Carousel post could work too',
    status: 'New',
  },
  {
    id: 15,
    title: 'How elbow pain affects your entire lifting chain',
    description: 'Show how compensations from elbow pain cause other issues',
    category: 'Educational',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Kinetic chain explanation',
    status: 'New',
  },

  // Testimonials (16-28)
  {
    id: 16,
    title: 'CrossFit athlete review',
    description: 'Real CrossFit athlete shares their experience with Elbow Enforcer',
    category: 'Testimonial',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Find athlete with good following',
    status: 'New',
  },
  {
    id: 17,
    title: 'Physical therapist recommendation',
    description: 'PT explains why they recommend our product to patients',
    category: 'Testimonial',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Great for credibility',
    status: 'New',
  },
  {
    id: 18,
    title: 'Powerlifter gets back to PRs',
    description: 'Story of recovery from elbow injury using our product',
    category: 'Testimonial',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Before/after format',
    status: 'New',
  },
  {
    id: 19,
    title: 'Weekend warrior review',
    description: 'Regular gym-goer testimonial - relatable audience',
    category: 'Testimonial',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'User-generated content style',
    status: 'New',
  },
  {
    id: 20,
    title: "Climber's elbow success story",
    description: 'Rock climber who solved elbow issues with our product',
    category: 'Testimonial',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Climbing content does well',
    status: 'New',
  },
  {
    id: 21,
    title: 'Personal trainer recommends to clients',
    description: 'Trainer explaining why they stock our product for clients',
    category: 'Testimonial',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'B2B angle',
    status: 'New',
  },
  {
    id: 22,
    title: 'Arm wrestler endorsement',
    description: 'Arm wrestler discusses elbow stress in their sport',
    category: 'Testimonial',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Niche but dedicated audience',
    status: 'New',
  },
  {
    id: 23,
    title: 'Bodybuilder prep series feature',
    description: 'Bodybuilder uses product through competition prep',
    category: 'Testimonial',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Multi-part content opportunity',
    status: 'New',
  },
  {
    id: 24,
    title: 'Construction worker review',
    description: 'Blue collar worker using product for repetitive strain',
    category: 'Testimonial',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Expands beyond gym audience',
    status: 'New',
  },
  {
    id: 25,
    title: 'Tennis player testimonial',
    description: 'Tennis player discussing elbow support during play',
    category: 'Testimonial',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Tennis elbow is common search term',
    status: 'New',
  },
  {
    id: 26,
    title: 'Golfer review for golf elbow',
    description: 'Golfer shares experience with medial elbow pain',
    category: 'Testimonial',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Older demographic, Facebook too',
    status: 'New',
  },
  {
    id: 27,
    title: 'Musician uses for repetitive strain',
    description: 'Guitarist/drummer discusses elbow issues from playing',
    category: 'Testimonial',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Unique angle, shareable',
    status: 'New',
  },
  {
    id: 28,
    title: 'Amazon review compilation',
    description: 'Video featuring best real customer reviews',
    category: 'Testimonial',
    platform: 'All',
    effort: 'Low',
    notes: 'Easy to produce, social proof',
    status: 'New',
  },

  // Product Demos (29-40)
  {
    id: 29,
    title: 'Unboxing and first impressions',
    description: 'Classic unboxing video showing product quality',
    category: 'Demo',
    platform: 'YouTube',
    effort: 'Low',
    notes: 'ASMR style could work',
    status: 'New',
  },
  {
    id: 30,
    title: 'How to size your Elbow Enforcer',
    description: 'Measurement guide for perfect fit',
    category: 'Demo',
    platform: 'All',
    effort: 'Low',
    notes: 'Reduces returns, FAQ content',
    status: 'New',
  },
  {
    id: 31,
    title: 'How to put on and adjust properly',
    description: 'Step by step guide for proper wear',
    category: 'Demo',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Quick tutorial format',
    status: 'New',
  },
  {
    id: 32,
    title: 'Quality comparison vs competitors',
    description: 'Side by side comparison with other products',
    category: 'Demo',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Must be factual and fair',
    status: 'New',
  },
  {
    id: 33,
    title: 'Durability test - 1 year later',
    description: 'Show product condition after heavy use',
    category: 'Demo',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Need actual aged product',
    status: 'New',
  },
  {
    id: 34,
    title: 'Washing and care instructions',
    description: 'How to maintain product longevity',
    category: 'Demo',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Practical, evergreen',
    status: 'New',
  },
  {
    id: 35,
    title: 'Wearing during different exercises',
    description: 'Show product in action across various lifts',
    category: 'Demo',
    platform: 'Instagram',
    effort: 'Medium',
    notes: 'Montage style',
    status: 'New',
  },
  {
    id: 36,
    title: 'Material breakdown and features',
    description: 'Close up look at fabric, stitching, design choices',
    category: 'Demo',
    platform: 'YouTube',
    effort: 'Medium',
    notes: 'Detail-oriented buyers',
    status: 'New',
  },
  {
    id: 37,
    title: 'Full workout wearing Elbow Enforcer',
    description: 'Complete arm workout showcasing comfort and mobility',
    category: 'Demo',
    platform: 'YouTube',
    effort: 'High',
    notes: 'Workout content is evergreen',
    status: 'New',
  },
  {
    id: 38,
    title: '360 degree product view',
    description: 'All angles of the product for online shoppers',
    category: 'Demo',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Good for product page too',
    status: 'New',
  },
  {
    id: 39,
    title: 'Color options showcase',
    description: 'Show all available colors and styles',
    category: 'Demo',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Trendy transitions',
    status: 'New',
  },
  {
    id: 40,
    title: 'Pack flat for gym bag',
    description: 'Show portability and travel-friendliness',
    category: 'Demo',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Practical benefit',
    status: 'New',
  },

  // Humor (41-48)
  {
    id: 41,
    title: 'POV: Your elbows after arm day',
    description: 'Comedic take on post-workout elbow soreness',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Trending POV format',
    status: 'New',
  },
  {
    id: 42,
    title: 'Types of gym bros who need elbow sleeves',
    description: 'Comedic character sketches of lifters',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Multiple characters, costume changes',
    status: 'New',
  },
  {
    id: 43,
    title: 'When someone asks why you wear elbow sleeves',
    description: 'Exaggerated explanation of elbow pain journey',
    category: 'Humor',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Relatable humor',
    status: 'New',
  },
  {
    id: 44,
    title: 'Elbow sleeves in the wild',
    description: 'Funny compilation of people wearing them everywhere',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Absurdist humor',
    status: 'New',
  },
  {
    id: 45,
    title: 'When you finally solve your elbow pain',
    description: 'Over the top celebration of pain-free lifting',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Use trending audio',
    status: 'New',
  },
  {
    id: 46,
    title: 'My elbows explaining why they hurt',
    description: 'Personified elbows comedy sketch',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Creative storytelling',
    status: 'New',
  },
  {
    id: 47,
    title: 'Before vs After elbow sleeves personality',
    description: 'Comedic transformation in gym confidence',
    category: 'Humor',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Split screen format',
    status: 'New',
  },
  {
    id: 48,
    title: 'Things people say when they see your elbow sleeves',
    description: 'Compilation of common reactions/questions',
    category: 'Humor',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Relatable content',
    status: 'New',
  },

  // Trending (49-55)
  {
    id: 49,
    title: 'Day in my life: Fitness entrepreneur',
    description: 'Behind the scenes of running a fitness product company',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Humanizes the brand',
    status: 'New',
  },
  {
    id: 50,
    title: 'Get ready with me: Arm day edition',
    description: 'GRWM format for gym prep including elbow sleeves',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Trend-jack GRWM format',
    status: 'New',
  },
  {
    id: 51,
    title: 'What I ordered vs what I got (positive)',
    description: 'Subvert the trend - product exceeds expectations',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Play on negative trend positively',
    status: 'New',
  },
  {
    id: 52,
    title: 'Gym bag essentials',
    description: 'Feature product in gym bag must-haves video',
    category: 'Trending',
    platform: 'Instagram',
    effort: 'Low',
    notes: 'Aesthetic flat lay style',
    status: 'New',
  },
  {
    id: 53,
    title: 'Small business packing orders',
    description: 'Satisfying order packing ASMR content',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Very popular format',
    status: 'New',
  },
  {
    id: 54,
    title: 'Storytime: How I started the company',
    description: 'Origin story of Elbow Enforcer',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Medium',
    notes: 'Connect with audience',
    status: 'New',
  },
  {
    id: 55,
    title: 'Replying to comments (product Q&A)',
    description: 'Answer real customer questions in video format',
    category: 'Trending',
    platform: 'TikTok',
    effort: 'Low',
    notes: 'Use reply to comment feature',
    status: 'New',
  },
];

const categories: Category[] = ['Educational', 'Testimonial', 'Demo', 'Humor', 'Trending'];
const platforms: Platform[] = ['TikTok', 'Instagram', 'YouTube', 'All'];
const efforts: Effort[] = ['Low', 'Medium', 'High'];
const statuses: Status[] = ['New', 'In Progress', 'Used'];

export default function VideoIdeasBank() {
  const [ideas, setIdeas] = useState<VideoIdea[]>(initialIdeas);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState<Omit<VideoIdea, 'id' | 'status'>>({
    title: '',
    description: '',
    category: 'Educational',
    platform: 'TikTok',
    effort: 'Low',
    notes: '',
  });

  const filteredIdeas = ideas.filter((idea) => {
    if (filterCategory !== 'All' && idea.category !== filterCategory) return false;
    if (filterPlatform !== 'All' && idea.platform !== filterPlatform && idea.platform !== 'All')
      return false;
    if (filterStatus !== 'All' && idea.status !== filterStatus) return false;
    return true;
  });

  const updateStatus = (id: number, status: Status) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
  };

  const addIdea = () => {
    if (!newIdea.title.trim()) return;
    const maxId = Math.max(...ideas.map((i) => i.id));
    setIdeas([...ideas, { ...newIdea, id: maxId + 1, status: 'New' }]);
    setNewIdea({
      title: '',
      description: '',
      category: 'Educational',
      platform: 'TikTok',
      effort: 'Low',
      notes: '',
    });
    setShowAddForm(false);
  };

  const getCategoryColor = (category: Category) => {
    const colors: Record<Category, string> = {
      Educational: 'bg-blue-100 text-blue-800',
      Testimonial: 'bg-green-100 text-green-800',
      Demo: 'bg-purple-100 text-purple-800',
      Humor: 'bg-yellow-100 text-yellow-800',
      Trending: 'bg-pink-100 text-pink-800',
    };
    return colors[category];
  };

  const getStatusColor = (status: Status) => {
    const colors: Record<Status, string> = {
      New: 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-orange-100 text-orange-800',
      Used: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  const getEffortBadge = (effort: Effort) => {
    const colors: Record<Effort, string> = {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-red-600',
    };
    return colors[effort];
  };

  const stats = {
    total: ideas.length,
    new: ideas.filter((i) => i.status === 'New').length,
    inProgress: ideas.filter((i) => i.status === 'In Progress').length,
    used: ideas.filter((i) => i.status === 'Used').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Ideas Bank</h1>
        <p className="text-gray-600">
          {stats.total} ideas • {stats.new} new • {stats.inProgress} in progress • {stats.used}{' '}
          used
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as Platform | 'All')}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="All">All Platforms</option>
              {platforms.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | 'All')}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="All">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Idea
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Video Idea</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="border rounded-md px-3 py-2 w-full text-sm"
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value as Category })}
                className="border rounded-md px-3 py-2 w-full text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={newIdea.platform}
                onChange={(e) => setNewIdea({ ...newIdea, platform: e.target.value as Platform })}
                className="border rounded-md px-3 py-2 w-full text-sm"
              >
                {platforms.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effort</label>
              <select
                value={newIdea.effort}
                onChange={(e) => setNewIdea({ ...newIdea, effort: e.target.value as Effort })}
                className="border rounded-md px-3 py-2 w-full text-sm"
              >
                {efforts.map((eff) => (
                  <option key={eff} value={eff}>
                    {eff}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="border rounded-md px-3 py-2 w-full text-sm"
                rows={2}
                placeholder="What's the video about?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={newIdea.notes}
                onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
                className="border rounded-md px-3 py-2 w-full text-sm"
                placeholder="Production notes, requirements, etc."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={addIdea}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Save Idea
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(idea.category)}`}
                  >
                    {idea.category}
                  </span>
                  <span className="text-xs text-gray-500">{idea.platform}</span>
                  <span className={`text-xs font-medium ${getEffortBadge(idea.effort)}`}>
                    {idea.effort} effort
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{idea.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                {idea.notes && <p className="text-xs text-gray-500 italic">💡 {idea.notes}</p>}
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}
                >
                  {idea.status}
                </span>
                <select
                  value={idea.status}
                  onChange={(e) => updateStatus(idea.id, e.target.value as Status)}
                  className="text-xs border rounded px-2 py-1"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No ideas match your filters. Try adjusting or add a new idea!
        </div>
      )}
    </div>
  );
}
