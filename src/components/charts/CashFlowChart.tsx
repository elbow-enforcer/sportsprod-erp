import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { projectInventoryTimeline, getMonthlyInventorySummary } from '../../models/inventory';
import type { InventoryConfig } from '../../models/inventory';

interface CashFlowChartProps {
  scenario: string;
  config: InventoryConfig;
  years?: number;
}

interface MonthlyChartData {
  month: number;
  monthLabel: string;
  cashOutflow: number;
  cumulativeCash: number;
  hasReorder: boolean;
}

export function CashFlowChart({ scenario, config, years = 6 }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    const timeline = projectInventoryTimeline(scenario, config, years);
    const monthlySummary = getMonthlyInventorySummary(timeline);
    
    // Calculate initial investment (first month's cumulative position)
    const initialInvestment = timeline[0]?.cumulativeCashOutflow || 0;
    
    // Track cumulative cash position
    let cumulativeCash = initialInvestment;
    
    return monthlySummary.map((month, index) => {
      if (index > 0) {
        cumulativeCash += month.totalCashOutflow;
      }
      
      const yearNum = Math.ceil(month.month / 12);
      const monthInYear = ((month.month - 1) % 12) + 1;
      
      return {
        month: month.month,
        monthLabel: month.month % 6 === 0 ? `Y${yearNum}M${monthInYear}` : '',
        cashOutflow: month.totalCashOutflow,
        cumulativeCash,
        hasReorder: month.ordersPlaced > 0,
      } as MonthlyChartData;
    });
  }, [scenario, config, years]);

  // Find months with reorder events for reference lines
  const reorderMonths = chartData.filter(d => d.hasReorder && d.cashOutflow > 0).map(d => d.month);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(month) => {
            if (month % 12 === 0) {
              return `Y${month / 12}`;
            }
            return '';
          }}
          interval={11}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={formatCurrency}
          label={{ 
            value: 'Cash Outflow', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: '#ef4444', fontSize: 12 }
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={formatCurrency}
          label={{ 
            value: 'Cumulative Cash', 
            angle: 90, 
            position: 'insideRight',
            style: { textAnchor: 'middle', fill: '#3b82f6', fontSize: 12 }
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value) || 0),
            name === 'cashOutflow' ? 'Cash Outflow' : 'Cumulative Cash'
          ]}
          labelFormatter={(month) => `Month ${month}`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend 
          formatter={(value) => 
            value === 'cashOutflow' ? 'Inventory Purchases' : 'Cumulative Cash Position'
          }
        />
        
        {/* Reference lines for reorder events */}
        {reorderMonths.slice(0, 20).map((month) => (
          <ReferenceLine
            key={month}
            x={month}
            yAxisId="left"
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
        ))}
        
        <Bar
          yAxisId="left"
          dataKey="cashOutflow"
          name="cashOutflow"
          fill="#ef4444"
          fillOpacity={0.8}
          radius={[2, 2, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativeCash"
          name="cumulativeCash"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
