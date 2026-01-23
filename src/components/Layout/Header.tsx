import { useScenarioStore } from '../../stores/scenarioStore';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  const { scenarios, selectedScenarioId, selectScenario } = useScenarioStore();
  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Scenario:</span>
          <select
            value={selectedScenarioId}
            onChange={(e) => selectScenario(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={selectedScenario?.description}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">U</span>
          </div>
          <span className="text-sm text-gray-600">User</span>
        </div>
      </div>
    </header>
  );
}
