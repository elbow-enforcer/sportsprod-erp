import { useScenarioStore } from '../../stores/scenarioStore'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { scenarios, selectedScenarioId, selectScenario } = useScenarioStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="scenario" className="text-sm text-gray-500">
            Scenario:
          </label>
          <select
            id="scenario"
            value={selectedScenarioId || ''}
            onChange={(e) => selectScenario(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Menu (placeholder) */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            U
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            User
          </span>
        </div>
      </div>
    </header>
  )
}
