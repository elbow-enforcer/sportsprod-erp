import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { useScenarioStore } from '../stores/scenarioStore';
import type { MarketingSpend, RevenueAttribution, ConversionData } from '../models/marketing';
import {
  calculateBlendedROAS,
  calculateBlendedCAC,
} from '../models/marketing';

// Channel data by scenario - spend in thousands
const channelSpendByScenario: Record<string, Record<string, { spend: number; revenue: number }>> = {
  max: {
    'Google Ads': { spend: 85, revenue: 425 },
    'Meta': { spend: 65, revenue: 292 },
    'LinkedIn': { spend: 45, revenue: 180 },
    'Organic': { spend: 15, revenue: 120 },
    'Referral': { spend: 10, revenue: 95 },
  },
  upside: {
    'Google Ads': { spend: 72, revenue: 324 },
    'Meta': { spend: 55, revenue: 220 },
    'LinkedIn': { spend: 38, revenue: 133 },
    'Organic': { spend: 12, revenue: 84 },
    'Referral': { spend: 8, revenue: 64 },
  },
  base: {
    'Google Ads': { spend: 60, revenue: 240 },
    'Meta': { spend: 45, revenue: 162 },
    'LinkedIn': { spend: 30, revenue: 96 },
    'Organic': { spend: 10, revenue: 60 },
    'Referral': { spend: 5, revenue: 40 },
  },
  downside: {
    'Google Ads': { spend: 48, revenue: 163 },
    'Meta': { spend: 36, revenue: 108 },
    'LinkedIn': { spend: 24, revenue: 62 },
    'Organic': { spend: 8, revenue: 40 },
    'Referral': { spend: 4, revenue: 24 },
  },
  min: {
    'Google Ads': { spend: 35, revenue: 87 },
    'Meta': { spend: 25, revenue: 55 },
    'LinkedIn': { spend: 15, revenue: 30 },
    'Organic': { spend: 5, revenue: 20 },
    'Referral': { spend: 2, revenue: 10 },
  },
};

// Monthly CAC trend data (12 months)
const cacTrendByScenario: Record<string, number[]> = {
  max: [145, 138, 125, 112, 98, 85, 78, 72, 68, 65, 62, 58],
  upside: [160, 152, 140, 128, 115, 105, 95, 88, 82, 78, 75, 72],
  base: [180, 172, 162, 150, 138, 128, 118, 110, 105, 100, 96, 92],
  downside: [200, 195, 188, 178, 168, 158, 148, 140, 135, 130, 126, 122],
  min: [240, 235, 228, 218, 210, 202, 195, 190, 186, 182, 178, 175],
};

// Funnel data by scenario (impressions → clicks → leads → customers)
const funnelByScenario: Record<string, { impressions: number; clicks: number; leads: number; customers: number }> = {
  max: { impressions: 2500000, clicks: 125000, leads: 8750, customers: 1750 },
  upside: { impressions: 1800000, clicks: 81000, leads: 5265, customers: 948 },
  base: { impressions: 1200000, clicks: 48000, leads: 2880, customers: 460 },
  downside: { impressions: 800000, clicks: 28000, leads: 1400, customers: 196 },
  min: { impressions: 400000, clicks: 12000, leads: 480, customers: 53 },
};

// Generate spend/attribution data for calculations
function generateSpendData(scenarioId: string): { spends: MarketingSpend[]; attributions: RevenueAttribution[]; conversions: ConversionData[] } {
  const channelData = channelSpendByScenario[scenarioId] || channelSpendByScenario.base;
  const funnelData = funnelByScenario[scenarioId] || funnelByScenario.base;
  const period = '2026-01';

  const channels = Object.keys(channelData);
  const totalCustomers = funnelData.customers;
  const customersPerChannel = Math.floor(totalCustomers / channels.length);

  const spends: MarketingSpend[] = channels.map((ch) => ({
    channelId: ch,
    period,
    amount: channelData[ch].spend * 1000,
    budget: channelData[ch].spend * 1200,
  }));

  const attributions: RevenueAttribution[] = channels.map((ch) => ({
    channelId: ch,
    period,
    revenue: channelData[ch].revenue * 1000,
  }));

  const conversions: ConversionData[] = channels.map((ch) => ({
    channelId: ch,
    period,
    newCustomers: customersPerChannel,
    leads: Math.floor(funnelData.leads / channels.length),
    conversionRate: 0.16,
  }));

  return { spends, attributions, conversions };
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MarketingAnalytics() {
  const { scenarios, selectedScenarioId, selectScenario } = useScenarioStore();

  // Calculate metrics based on selected scenario
  const metrics = useMemo(() => {
    const { spends, attributions, conversions } = generateSpendData(selectedScenarioId);
    const period = '2026-01';

    const roasResult = calculateBlendedROAS(spends, attributions, period);
    const cacResult = calculateBlendedCAC(spends, conversions, period);

    return {
      totalSpend: roasResult.adSpend,
      totalRevenue: roasResult.revenue,
      roas: roasResult.roas,
      cac: cacResult.cac,
    };
  }, [selectedScenarioId]);

  // Channel performance chart data
  const channelChartData = useMemo(() => {
    const channelData = channelSpendByScenario[selectedScenarioId] || channelSpendByScenario.base;
    return Object.entries(channelData).map(([channel, data]) => ({
      channel,
      spend: data.spend,
      revenue: data.revenue,
    }));
  }, [selectedScenarioId]);

  // CAC trend chart data
  const cacTrendData = useMemo(() => {
    const cacData = cacTrendByScenario[selectedScenarioId] || cacTrendByScenario.base;
    return months.map((month, idx) => ({
      month,
      cac: cacData[idx],
    }));
  }, [selectedScenarioId]);

  // Funnel data
  const funnelData = useMemo(() => {
    const data = funnelByScenario[selectedScenarioId] || funnelByScenario.base;
    const stages = [
      { stage: 'Impressions', value: data.impressions, rate: 100 },
      { stage: 'Clicks', value: data.clicks, rate: (data.clicks / data.impressions) * 100 },
      { stage: 'Leads', value: data.leads, rate: (data.leads / data.clicks) * 100 },
      { stage: 'Customers', value: data.customers, rate: (data.customers / data.leads) * 100 },
    ];
    return stages;
  }, [selectedScenarioId]);

  // Trend comparisons (vs previous period)
  const trends = useMemo(() => {
    const scenarioIndex = ['min', 'downside', 'base', 'upside', 'max'].indexOf(selectedScenarioId);
    const magnitude = Math.abs(scenarioIndex - 2) * 5 + 8;

    return {
      spend: { value: 12, isPositive: true },
      revenue: { value: magnitude + 10, isPositive: scenarioIndex >= 2 },
      roas: { value: magnitude, isPositive: scenarioIndex >= 2 },
      cac: { value: magnitude + 2, isPositive: scenarioIndex >= 2 },
    };
  }, [selectedScenarioId]);

  return (
    <div className="space-y-6">
      {/* Header with Scenario Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Analytics</h2>
          <p className="text-gray-500 mt-1">Performance metrics, ROI analysis, and funnel insights</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="scenario-select" className="text-sm font-medium text-gray-700">
            Scenario:
          </label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => selectScenario(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend"
          value={`$${(metrics.totalSpend / 1000).toFixed(0)}K`}
          trend={trends.spend}
          subtitle="Monthly ad spend"
          icon={<CurrencyIcon />}
        />
        <KPICard
          title="Revenue Generated"
          value={`$${(metrics.totalRevenue / 1000).toFixed(0)}K`}
          trend={trends.revenue}
          subtitle="Attributed revenue"
          icon={<ChartIcon />}
        />
        <KPICard
          title="ROAS"
          value={`${metrics.roas.toFixed(2)}x`}
          trend={trends.roas}
          subtitle="Return on ad spend"
          icon={<TrendIcon />}
        />
        <KPICard
          title="CAC"
          value={`$${metrics.cac.toFixed(0)}`}
          trend={trends.cac}
          subtitle="Customer acquisition cost"
          icon={<UserIcon />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
          <p className="text-sm text-gray-500 mb-4">Spend vs Revenue by Channel (in $K)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="channel"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `$${value}K`}
                />
                <Tooltip
                  formatter={(value) => [`$${value}K`, '']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="spend" name="Spend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CAC Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CAC Trend</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly CAC over 12 months (target: $100)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cacTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `$${value}`}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'CAC']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={100}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'Target $100', fill: '#ef4444', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="cac"
                  name="CAC"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Marketing Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Funnel</h3>
        <p className="text-sm text-gray-500 mb-6">
          Impressions → Clicks → Leads → Customers
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {funnelData.map((stage, idx) => (
            <div key={stage.stage} className="relative">
              <div
                className={`p-6 rounded-xl text-center ${
                  idx === 0
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : idx === 1
                      ? 'bg-indigo-50 border-2 border-indigo-200'
                      : idx === 2
                        ? 'bg-purple-50 border-2 border-purple-200'
                        : 'bg-green-50 border-2 border-green-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">{stage.stage}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stage.value >= 1000000
                    ? `${(stage.value / 1000000).toFixed(1)}M`
                    : stage.value >= 1000
                      ? `${(stage.value / 1000).toFixed(1)}K`
                      : stage.value.toLocaleString()}
                </p>
                {idx > 0 && (
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    {stage.rate.toFixed(1)}% conv.
                  </p>
                )}
              </div>
              {idx < funnelData.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Funnel Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Click-Through Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {((funnelData[1].value / funnelData[0].value) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lead Conversion</p>
              <p className="text-lg font-semibold text-gray-900">
                {((funnelData[2].value / funnelData[1].value) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Conversion</p>
              <p className="text-lg font-semibold text-gray-900">
                {((funnelData[3].value / funnelData[2].value) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon components
function CurrencyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
