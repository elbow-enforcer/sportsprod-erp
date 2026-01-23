import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

export interface WaterfallData {
  name: string;
  value: number;
  fill: string;
  isTotal?: boolean;
}

interface CashFlowWaterfallProps {
  startingCash: number;
  operatingCashFlow: number;
  capex: number;
  workingCapitalChange: number;
}

interface WaterfallBarData {
  name: string;
  value: number;
  start: number;
  end: number;
  fill: string;
  isTotal: boolean;
  displayValue: number;
}

const COLORS = {
  positive: '#22c55e', // green-500
  negative: '#ef4444', // red-500
  total: '#3b82f6',    // blue-500
};

// Format currency values for display
const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export function CashFlowWaterfall({
  startingCash,
  operatingCashFlow,
  capex,
  workingCapitalChange,
}: CashFlowWaterfallProps) {
  const data = useMemo((): WaterfallBarData[] => {
    // Calculate running totals for waterfall positioning
    let runningTotal = 0;
    
    const items: WaterfallBarData[] = [];
    
    // Starting Cash (total bar from 0)
    items.push({
      name: 'Starting Cash',
      value: startingCash,
      start: 0,
      end: startingCash,
      fill: COLORS.total,
      isTotal: true,
      displayValue: startingCash,
    });
    runningTotal = startingCash;
    
    // Operating Cash Flow (positive contribution)
    const ocfStart = runningTotal;
    runningTotal += operatingCashFlow;
    items.push({
      name: '+ Operating CF',
      value: Math.abs(operatingCashFlow),
      start: Math.min(ocfStart, runningTotal),
      end: Math.max(ocfStart, runningTotal),
      fill: operatingCashFlow >= 0 ? COLORS.positive : COLORS.negative,
      isTotal: false,
      displayValue: operatingCashFlow,
    });
    
    // CapEx (typically negative)
    const capexValue = -Math.abs(capex); // Ensure it's treated as outflow
    const capexStart = runningTotal;
    runningTotal += capexValue;
    items.push({
      name: '- CapEx',
      value: Math.abs(capexValue),
      start: Math.min(capexStart, runningTotal),
      end: Math.max(capexStart, runningTotal),
      fill: COLORS.negative,
      isTotal: false,
      displayValue: capexValue,
    });
    
    // Working Capital Change (can be positive or negative)
    const wcValue = -workingCapitalChange; // Increase in WC is cash outflow
    const wcStart = runningTotal;
    runningTotal += wcValue;
    items.push({
      name: '- WC Change',
      value: Math.abs(wcValue),
      start: Math.min(wcStart, runningTotal),
      end: Math.max(wcStart, runningTotal),
      fill: wcValue >= 0 ? COLORS.positive : COLORS.negative,
      isTotal: false,
      displayValue: wcValue,
    });
    
    // Ending Cash (total bar from 0)
    items.push({
      name: 'Ending Cash',
      value: runningTotal,
      start: 0,
      end: runningTotal,
      fill: COLORS.total,
      isTotal: true,
      displayValue: runningTotal,
    });
    
    return items;
  }, [startingCash, operatingCashFlow, capex, workingCapitalChange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WaterfallBarData }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className={`text-lg font-bold ${
            item.displayValue >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(item.displayValue)}
          </p>
          {!item.isTotal && (
            <p className="text-xs text-gray-500 mt-1">
              Running Total: {formatCurrency(item.end)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Find min/max for domain
  const minValue = Math.min(0, ...data.map(d => Math.min(d.start, d.end)));
  const maxValue = Math.max(0, ...data.map(d => Math.max(d.start, d.end)));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={formatCurrency}
          domain={[minValue - padding, maxValue + padding]}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
        
        {/* Invisible bar for positioning (from 0 to start) */}
        <Bar
          dataKey="start"
          stackId="waterfall"
          fill="transparent"
          isAnimationActive={false}
        />
        
        {/* Visible bar (the actual value) */}
        <Bar
          dataKey={(d: WaterfallBarData) => d.end - d.start}
          stackId="waterfall"
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Variant with custom data input
interface CashFlowWaterfallCustomProps {
  data: WaterfallData[];
}

export function CashFlowWaterfallCustom({ data }: CashFlowWaterfallCustomProps) {
  const chartData = useMemo((): WaterfallBarData[] => {
    let runningTotal = 0;
    
    return data.map((item) => {
      if (item.isTotal) {
        // Total bars start from 0
        runningTotal = item.value;
        return {
          name: item.name,
          value: item.value,
          start: 0,
          end: item.value,
          fill: item.fill || COLORS.total,
          isTotal: true,
          displayValue: item.value,
        };
      } else {
        // Delta bars
        const start = runningTotal;
        runningTotal += item.value;
        return {
          name: item.name,
          value: Math.abs(item.value),
          start: Math.min(start, runningTotal),
          end: Math.max(start, runningTotal),
          fill: item.fill || (item.value >= 0 ? COLORS.positive : COLORS.negative),
          isTotal: false,
          displayValue: item.value,
        };
      }
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WaterfallBarData }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className={`text-lg font-bold ${
            item.displayValue >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(item.displayValue)}
          </p>
        </div>
      );
    }
    return null;
  };

  const minValue = Math.min(0, ...chartData.map(d => Math.min(d.start, d.end)));
  const maxValue = Math.max(0, ...chartData.map(d => Math.max(d.start, d.end)));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={formatCurrency}
          domain={[minValue - padding, maxValue + padding]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
        
        <Bar
          dataKey="start"
          stackId="waterfall"
          fill="transparent"
          isAnimationActive={false}
        />
        
        <Bar
          dataKey={(d: WaterfallBarData) => d.end - d.start}
          stackId="waterfall"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
