/**
 * Burn Rate Dashboard Widget
 * Shows monthly burn, runway, and cash position
 */

interface BurnRateWidgetProps {
  monthlyBurn: number;
  cashPosition: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export function BurnRateWidget({ monthlyBurn, cashPosition, trend = 'stable' }: BurnRateWidgetProps) {
  const runwayMonths = monthlyBurn > 0 ? cashPosition / monthlyBurn : Infinity;
  
  // Color based on runway
  const getRunwayColor = () => {
    if (runwayMonths >= 18) return 'text-green-600 bg-green-100';
    if (runwayMonths >= 12) return 'text-blue-600 bg-blue-100';
    if (runwayMonths >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = () => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Burn Rate</h3>
        <span className="text-lg">{getTrendIcon()}</span>
      </div>
      
      <div className="space-y-4">
        {/* Monthly Burn */}
        <div>
          <p className="text-xs text-gray-500">Monthly Burn</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(monthlyBurn)}</p>
        </div>
        
        {/* Runway */}
        <div className={`rounded-lg p-3 ${getRunwayColor()}`}>
          <p className="text-xs font-medium">Runway</p>
          <p className="text-2xl font-bold">
            {runwayMonths === Infinity ? '∞' : `${Math.round(runwayMonths)} mo`}
          </p>
        </div>
        
        {/* Cash Position */}
        <div>
          <p className="text-xs text-gray-500">Cash Position</p>
          <p className="text-lg font-semibold text-gray-800">{formatCurrency(cashPosition)}</p>
        </div>
        
        {/* Runway Progress Bar */}
        <div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${runwayMonths >= 12 ? 'bg-green-500' : runwayMonths >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(runwayMonths / 24 * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Target: 24 months</p>
        </div>
      </div>
    </div>
  );
}
