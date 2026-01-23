import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  selectedScenario: string;
}

// Revenue data in thousands of dollars
const revenueData = [
  { year: 'Year 1', min: 0, downside: 0, base: 200, upside: 400, max: 700 },
  { year: 'Year 2', min: 400, downside: 400, base: 900, upside: 1800, max: 4400 },
  { year: 'Year 3', min: 1100, downside: 1400, base: 2600, upside: 4600, max: 9100 },
  { year: 'Year 4', min: 1800, downside: 2600, base: 4700, upside: 8000, max: 13700 },
  { year: 'Year 5', min: 2500, downside: 3700, base: 6500, upside: 11000, max: 17200 },
  { year: 'Year 6', min: 3100, downside: 4700, base: 8200, upside: 13700, max: 20400 },
];

const scenarioConfig: Record<string, { color: string; name: string }> = {
  max: { color: '#10b981', name: 'Max' },
  upside: { color: '#22c55e', name: 'Upside' },
  base: { color: '#3b82f6', name: 'Base' },
  downside: { color: '#f59e0b', name: 'Downside' },
  min: { color: '#ef4444', name: 'Min' },
};

export function RevenueChart({ selectedScenario }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={revenueData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `$${value / 1000}M`}
          domain={[0, 'auto']}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}K`, '']}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {Object.entries(scenarioConfig).map(([key, config]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={config.name}
            stroke={config.color}
            strokeWidth={selectedScenario === key ? 3 : 1.5}
            strokeOpacity={selectedScenario === key ? 1 : 0.5}
            dot={selectedScenario === key}
            activeDot={selectedScenario === key ? { r: 6 } : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
