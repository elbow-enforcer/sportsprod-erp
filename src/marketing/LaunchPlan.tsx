import { useState } from 'react'

interface LaunchPhase {
  id: string
  name: string
  status: 'completed' | 'in-progress' | 'upcoming'
  startDate: string
  endDate: string
  tasks: { name: string; done: boolean }[]
}

const mockPhases: LaunchPhase[] = [
  {
    id: '1',
    name: 'Pre-Launch',
    status: 'completed',
    startDate: '2026-01-01',
    endDate: '2026-01-15',
    tasks: [
      { name: 'Market research completed', done: true },
      { name: 'Competitor analysis', done: true },
      { name: 'Brand positioning finalized', done: true },
    ],
  },
  {
    id: '2',
    name: 'Soft Launch',
    status: 'in-progress',
    startDate: '2026-01-16',
    endDate: '2026-02-01',
    tasks: [
      { name: 'Beta testers onboarded', done: true },
      { name: 'Feedback collection', done: true },
      { name: 'Bug fixes and iterations', done: false },
      { name: 'Press kit prepared', done: false },
    ],
  },
  {
    id: '3',
    name: 'Full Launch',
    status: 'upcoming',
    startDate: '2026-02-02',
    endDate: '2026-02-15',
    tasks: [
      { name: 'Press release', done: false },
      { name: 'Social media campaign', done: false },
      { name: 'Email blast to waitlist', done: false },
      { name: 'Launch event', done: false },
    ],
  },
]

const statusColors = {
  'completed': 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'upcoming': 'bg-gray-100 text-gray-800',
}

export function LaunchPlan() {
  const [phases] = useState<LaunchPhase[]>(mockPhases)

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0)
  const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter(t => t.done).length, 0)
  const progress = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Launch Plan</h2>
        <p className="text-gray-500 mt-1">Track product launch phases and milestones</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
      </div>

      {/* Launch Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                <p className="text-sm text-gray-500">{phase.startDate} → {phase.endDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[phase.status]}`}>
                {phase.status.replace('-', ' ')}
              </span>
            </div>
            <div className="space-y-2">
              {phase.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.done}
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className={task.done ? 'text-gray-400 line-through' : 'text-gray-700'}>
                    {task.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
