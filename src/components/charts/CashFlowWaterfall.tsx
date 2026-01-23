/**
 * Cash Flow Waterfall Chart
 * Visual waterfall showing cash flow components
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface WaterfallData {
  name: string;
  value: number;
  start: number;
  end: number;
  isTotal?: boolean;
}

interface CashFlowWaterfallProps {
  startingCash: number;
  operatingCashFlow: number;
  capex: number;
  workingCapitalChange: number;
  financing?: number;
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

export function CashFlowWaterfall({
  startingCash,
  operatingCashFlow,
  capex,
  workingCapitalChange,
  financing = 0,
}: CashFlowWaterfallProps) {
  const endingCash = startingCash + operatingCashFlow - Math.abs(capex) - workingCapitalChange + financing;

  // Build waterfall data
  const data: WaterfallData[] = [
    {
      name: 'Starting Cash',
      value: startingCash,
      start: 0,
      end: startingCash,
      isTotal: true,
    },
    {
      name: 'Operating CF',
      value: operatingCashFlow,
      start: startingCash,
      end: startingCash + operatingCashFlow,
    },
    {
      name: 'CapEx',
      value: -Math.abs(capex),
      start: startingCash + operatingCashFlow,
      end: startingCash + operatingCashFlow - Math.abs(capex),
    },
    {
      name: 'Working Cap',
      value: -workingCapitalChange,
      start: startingCash + operatingCashFlow - Math.abs(capex),
      end: startingCash + operatingCashFlow - Math.abs(capex) - workingCapitalChange,
    },
  ];

  if (financing !== 0) {
    data.push({
      name: 'Financing',
      value: financing,
      start: data[data.length - 1].end,
      end: data[data.length - 1].end + financing,
    });
  }

  data.push({
    name: 'Ending Cash',
    value: endingCash,
    start: 0,
    end: endingCash,
    isTotal: true,
  });

  // Transform for stacked bar chart (waterfall effect)
  const chartData = data.map((item) => ({
    name: item.name,
    invisible: item.isTotal ? 0 : Math.min(item.start, item.end),
    value: item.isTotal ? item.value : Math.abs(item.value),
    actualValue: item.value,
    isPositive: item.value >= 0,
    isTotal: item.isTotal,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Cash Flow Waterfall</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value, name, props) => [
              formatCurrency(props.payload.actualValue),
              props.payload.name
            ]}
          />
          <ReferenceLine y={0} stroke="#666" />
          
          {/* Invisible base for waterfall effect */}
          <Bar dataKey="invisible" stackId="stack" fill="transparent" />
          
          {/* Actual values */}
          <Bar dataKey="value" stackId="stack">
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.isTotal
                    ? '#3B82F6' // Blue for totals
                    : entry.isPositive
                    ? '#22C55E' // Green for positive
                    : '#EF4444' // Red for negative
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>Total</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Inflow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Outflow</span>
        </div>
      </div>
    </div>
  );
}
