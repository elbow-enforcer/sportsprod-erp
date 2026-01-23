import { useMemo } from 'react';
import { projectInventoryTimeline } from '../../models/inventory';
import type { InventoryConfig } from '../../models/inventory';

interface WorkingCapitalCardProps {
  config: InventoryConfig;
  years?: number;
}

interface ScenarioData {
  name: string;
  key: string;
  currentWorking: number;
  peakWorking: number;
  totalInvested: number;
  color: string;
}

const SCENARIOS = [
  { key: 'conservative', name: 'Conservative', color: 'text-green-600' },
  { key: 'moderate', name: 'Moderate', color: 'text-blue-600' },
  { key: 'aggressive', name: 'Aggressive', color: 'text-purple-600' },
];

export function WorkingCapitalCard({ config, years = 6 }: WorkingCapitalCardProps) {
  const scenarioData = useMemo((): ScenarioData[] => {
    return SCENARIOS.map(({ key, name, color }) => {
      const timeline = projectInventoryTimeline(key, config, years);
      
      // Current working capital (end of year 1)
      const year1End = timeline.find(t => t.day === 365);
      const currentWorking = (year1End?.inventoryLevel || 0) * config.unitCost;
      
      // Peak working capital across all time
      const peakInventory = Math.max(...timeline.map(t => t.inventoryLevel));
      const peakWorking = peakInventory * config.unitCost;
      
      // Total invested over the period
      const totalInvested = timeline[timeline.length - 1]?.cumulativeCashOutflow || 0;
      
      return {
        name,
        key,
        currentWorking,
        peakWorking,
        totalInvested,
        color,
      };
    });
  }, [config, years]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Moderate scenario as the primary display
  const primary = scenarioData.find(s => s.key === 'moderate')!;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Working Capital in Inventory</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {years}-Year Projection
        </span>
      </div>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Current (Y1)</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(primary.currentWorking)}</p>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-600 mb-1">Peak Required</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(primary.peakWorking)}</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(primary.totalInvested)}</p>
        </div>
      </div>
      
      {/* Scenario Comparison */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Scenario Comparison</p>
        <div className="space-y-3">
          {scenarioData.map((scenario) => (
            <div key={scenario.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  scenario.key === 'conservative' ? 'bg-green-500' :
                  scenario.key === 'moderate' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <span className="text-sm text-gray-600">{scenario.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  Peak: <span className={`font-medium ${scenario.color}`}>{formatCurrency(scenario.peakWorking)}</span>
                </span>
                <span className="text-gray-500">
                  Total: <span className={`font-medium ${scenario.color}`}>{formatCurrency(scenario.totalInvested)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Note:</span> Working capital represents cash tied up in inventory. 
          Peak working capital shows maximum inventory investment needed at any point.
        </p>
      </div>
    </div>
  );
}
