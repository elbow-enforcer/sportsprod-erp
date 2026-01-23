/**
 * FCF Projections Component
 * 
 * Displays Free Cash Flow projections by scenario with:
 * - FCF projection table by year
 * - Component breakdown chart
 * - Scenario comparison
 */

import { useMemo, useState } from 'react';
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
  BarChart,
  Cell,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { useScenarioStore } from '../stores/scenarioStore';
import {
  projectFCFByScenario,
  projectFCFAllScenarios,
  getFCFComponentBreakdown,
  formatFCFCurrency,
  formatFCFPercent,
  type FCFProjectionResult,
  type FCFScenarioComparison,
} from '../models/dcf';

type ScenarioId = 'min' | 'downside' | 'base' | 'upside' | 'max';

const SCENARIO_COLORS: Record<string, string> = {
  max: '#22c55e',      // green-500
  upside: '#84cc16',   // lime-500
  base: '#3b82f6',     // blue-500
  downside: '#f97316', // orange-500
  min: '#ef4444',      // red-500
};

const SCENARIO_BG_COLORS: Record<string, string> = {
  max: 'bg-green-50',
  upside: 'bg-lime-50',
  base: 'bg-blue-50',
  downside: 'bg-orange-50',
  min: 'bg-red-50',
};

export function FCFProjections() {
  const assumptions = useAssumptionsStore();
  const { selectedScenarioId, scenarios, selectScenario } = useScenarioStore();
  const [compareMode, setCompareMode] = useState(false);
  const [projectionYears, setProjectionYears] = useState(5);

  // Calculate FCF projections
  const fcfResult = useMemo(
    () => projectFCFByScenario(selectedScenarioId, assumptions, projectionYears),
    [selectedScenarioId, assumptions, projectionYears]
  );

  const allScenarios = useMemo(
    () => projectFCFAllScenarios(assumptions, projectionYears),
    [assumptions, projectionYears]
  );

  const componentBreakdown = useMemo(
    () => getFCFComponentBreakdown(fcfResult),
    [fcfResult]
  );

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <div className="space-y-6">
      {/* Header with Scenario Banner */}
      {selectedScenario && (
        <div className={`border rounded-lg px-4 py-3 flex items-center justify-between ${SCENARIO_BG_COLORS[selectedScenarioId]} border-gray-200`}>
          <div>
            <p className="text-sm text-gray-800">
              <span className="font-medium">FCF Projections:</span>{' '}
              {selectedScenario.name} Scenario — {projectionYears}-Year Forecast
            </p>
            <p className="text-xs text-gray-600 mt-1">
              FCF = EBIT(1-t) + D&A - CapEx - ΔWorking Capital
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
            >
              <option value={5}>5 Years</option>
              <option value={7}>7 Years</option>
              <option value={10}>10 Years</option>
            </select>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                compareMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare All'}
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={`${projectionYears}-Year Total FCF`}
          value={formatFCFCurrency(fcfResult.totalFCF)}
          icon={<span className="text-2xl">💰</span>}
          subtitle={fcfResult.totalFCF >= 0 ? 'Cumulative cash generation' : 'Cumulative cash burn'}
          trend={fcfResult.totalFCF >= 0 ? 'up' : 'down'}
        />
        <KPICard
          title="Present Value"
          value={formatFCFCurrency(fcfResult.totalPV)}
          icon={<span className="text-2xl">📊</span>}
          subtitle={`At ${(assumptions.corporate.discountRate * 100).toFixed(0)}% WACC`}
        />
        <KPICard
          title="FCF Margin"
          value={formatFCFPercent(fcfResult.avgFCFMargin)}
          icon={<span className="text-2xl">📈</span>}
          subtitle="Average over projection period"
        />
        <KPICard
          title="Break-even Year"
          value={fcfResult.breakEvenYear ? `Year ${fcfResult.breakEvenYear}` : 'N/A'}
          icon={<span className="text-2xl">🎯</span>}
          subtitle="First cumulative FCF positive"
        />
      </div>

      {/* Scenario Selector */}
      {!compareMode && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Scenario:</span>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => selectScenario(scenario.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  scenario.id === selectedScenarioId
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={scenario.id === selectedScenarioId ? { backgroundColor: SCENARIO_COLORS[scenario.id] } : {}}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {compareMode ? (
        <ScenarioComparisonView allScenarios={allScenarios} selectedScenarioId={selectedScenarioId} />
      ) : (
        <>
          {/* FCF Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Free Cash Flow Projection
            </h3>
            <div className="h-80">
              <FCFProjectionChart data={fcfResult} scenarioColor={SCENARIO_COLORS[selectedScenarioId]} />
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              FCF Component Breakdown
            </h3>
            <div className="h-80">
              <FCFComponentChart data={componentBreakdown} />
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                FCF Projection Detail
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Year-by-year breakdown of FCF components
              </p>
            </div>
            <FCFDetailTable data={fcfResult} />
          </div>
        </>
      )}

      {/* Summary Totals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {projectionYears}-Year Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {formatFCFCurrency(fcfResult.totalRevenue)}
            </p>
            <p className="text-sm text-blue-600">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">
              {formatFCFCurrency(fcfResult.totalEBITDA)}
            </p>
            <p className="text-sm text-purple-600">Total EBITDA</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-700">
              ({formatFCFCurrency(fcfResult.totalCapex)})
            </p>
            <p className="text-sm text-orange-600">Total CapEx</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-700">
              ({formatFCFCurrency(fcfResult.totalWCChange)})
            </p>
            <p className="text-sm text-amber-600">Total WC Change</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${fcfResult.totalFCF >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-2xl font-bold ${fcfResult.totalFCF >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatFCFCurrency(fcfResult.totalFCF)}
            </p>
            <p className={`text-sm ${fcfResult.totalFCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Total FCF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// FCF Projection Line/Bar Chart
function FCFProjectionChart({ data, scenarioColor }: { data: FCFProjectionResult; scenarioColor: string }) {
  const chartData = data.years.map((y) => ({
    year: `Y${y.year}`,
    fcf: y.fcf,
    pv: y.presentValue,
    cumulativeFCF: y.cumulativeFCF,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => formatFCFCurrency(v)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => formatFCFCurrency(v)}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatFCFCurrency(value, false),
            name === 'fcf' ? 'FCF' : name === 'pv' ? 'Present Value' : 'Cumulative FCF',
          ]}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <ReferenceLine yAxisId="left" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
        <Bar yAxisId="left" dataKey="fcf" name="FCF" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fcf >= 0 ? scenarioColor : '#ef4444'} fillOpacity={0.8} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativeFCF"
          name="Cumulative FCF"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// FCF Component Waterfall Chart
function FCFComponentChart({ data }: { data: ReturnType<typeof getFCFComponentBreakdown> }) {
  // Prepare data for stacked bar chart showing components
  const chartData = data.map((d) => ({
    year: `Y${d.year}`,
    EBITDA: d.ebitda,
    Taxes: d.taxes,
    CapEx: d.capex,
    'WC Change': d.wcChange,
    FCF: d.fcf,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => formatFCFCurrency(v)} />
        <Tooltip
          formatter={(value: number, name: string) => [formatFCFCurrency(value, false), name]}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
        <Bar dataKey="EBITDA" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Taxes" stackId="a" fill="#ef4444" />
        <Bar dataKey="CapEx" stackId="a" fill="#f97316" />
        <Bar dataKey="WC Change" stackId="a" fill="#eab308" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// FCF Detail Table
function FCFDetailTable({ data }: { data: FCFProjectionResult }) {
  const rows = [
    { label: 'Units', values: data.years.map((y) => y.units.toLocaleString()), className: 'font-medium' },
    { label: 'Revenue', values: data.years.map((y) => formatFCFCurrency(y.revenue, false)), className: 'text-blue-700' },
    { label: 'divider', values: [] },
    { label: 'EBITDA', values: data.years.map((y) => formatFCFCurrency(y.ebitda, false)), className: 'font-medium' },
    { label: 'EBITDA Margin', values: data.years.map((y) => formatFCFPercent(y.ebitdaMarginPct)), className: 'text-gray-500 text-sm' },
    { label: 'divider', values: [] },
    { label: 'Less: Taxes', values: data.years.map((y) => `(${formatFCFCurrency(y.taxes, false)})`), className: 'text-red-600' },
    { label: 'Less: CapEx', values: data.years.map((y) => `(${formatFCFCurrency(y.capex, false)})`), className: 'text-red-600' },
    { label: 'Less: ΔWC', values: data.years.map((y) => y.workingCapitalChange >= 0 ? `(${formatFCFCurrency(y.workingCapitalChange, false)})` : formatFCFCurrency(Math.abs(y.workingCapitalChange), false)), className: 'text-red-600' },
    { label: 'divider', values: [] },
    { label: 'Free Cash Flow', values: data.years.map((y) => formatFCFCurrency(y.fcf, false)), className: 'font-bold', highlight: true },
    { label: 'FCF Margin', values: data.years.map((y) => formatFCFPercent(y.fcfMarginPct)), className: 'text-gray-500 text-sm' },
    { label: 'divider', values: [] },
    { label: 'Discount Factor', values: data.years.map((y) => y.discountFactor.toFixed(4)), className: 'text-gray-500 text-sm' },
    { label: 'Present Value', values: data.years.map((y) => formatFCFCurrency(y.presentValue, false)), className: 'font-medium text-purple-700' },
    { label: 'divider', values: [] },
    { label: 'Cumulative FCF', values: data.years.map((y) => formatFCFCurrency(y.cumulativeFCF, false)), className: 'font-medium text-blue-700' },
    { label: 'Cumulative PV', values: data.years.map((y) => formatFCFCurrency(y.cumulativePV, false)), className: 'font-medium text-purple-700' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metric
            </th>
            {data.years.map((y) => (
              <th key={y.year} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year {y.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, idx) => {
            if (row.label === 'divider') {
              return (
                <tr key={idx} className="bg-gray-50">
                  <td colSpan={data.years.length + 1} className="h-2"></td>
                </tr>
              );
            }
            return (
              <tr key={row.label} className={(row as { highlight?: boolean }).highlight ? 'bg-green-50' : 'hover:bg-gray-50'}>
                <td className="px-6 py-3 text-sm text-gray-900">{row.label}</td>
                {row.values.map((value, i) => (
                  <td key={i} className={`px-4 py-3 text-sm text-right ${row.className || ''}`}>
                    {value}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Scenario Comparison View
function ScenarioComparisonView({
  allScenarios,
  selectedScenarioId,
}: {
  allScenarios: FCFScenarioComparison;
  selectedScenarioId: string;
}) {
  const chartData = allScenarios.scenarioOrder.map((s) => ({
    scenario: allScenarios.scenarios[s].scenarioLabel,
    scenarioId: s,
    totalFCF: allScenarios.scenarios[s].totalFCF,
    totalPV: allScenarios.scenarios[s].totalPV,
    avgMargin: allScenarios.scenarios[s].avgFCFMargin,
  }));

  // Year-by-year comparison data
  const yearCount = allScenarios.scenarios['base'].years.length;
  const yearComparisonData = Array.from({ length: yearCount }, (_, i) => {
    const yearData: Record<string, number | string> = { year: `Y${i + 1}` };
    for (const s of allScenarios.scenarioOrder) {
      yearData[s] = allScenarios.scenarios[s].years[i].fcf;
    }
    return yearData;
  });

  return (
    <div className="space-y-6">
      {/* Summary Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scenario Comparison Summary
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="scenario" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => formatFCFCurrency(v)} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatFCFCurrency(value, false),
                  name === 'totalFCF' ? 'Total FCF' : 'Present Value',
                ]}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="totalFCF" name="Total FCF" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.scenarioId}
                    fill={SCENARIO_COLORS[entry.scenarioId]}
                    fillOpacity={entry.scenarioId === selectedScenarioId ? 1 : 0.6}
                    stroke={entry.scenarioId === selectedScenarioId ? '#000' : 'none'}
                    strokeWidth={entry.scenarioId === selectedScenarioId ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year-by-Year Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Year-by-Year FCF Comparison
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => formatFCFCurrency(v)} />
              <Tooltip
                formatter={(value: number) => [formatFCFCurrency(value, false), '']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              {allScenarios.scenarioOrder.map((s) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  name={allScenarios.scenarios[s].scenarioLabel}
                  stroke={SCENARIO_COLORS[s]}
                  strokeWidth={s === selectedScenarioId ? 3 : 1.5}
                  dot={{ fill: SCENARIO_COLORS[s], r: s === selectedScenarioId ? 5 : 3 }}
                  strokeOpacity={s === selectedScenarioId ? 1 : 0.7}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Scenario Metrics Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                {allScenarios.scenarioOrder.map((s) => (
                  <th
                    key={s}
                    className={`px-4 py-3 text-right text-xs font-medium uppercase ${
                      s === selectedScenarioId ? 'bg-blue-100 text-blue-800' : 'text-gray-500'
                    }`}
                  >
                    {allScenarios.scenarios[s].scenarioLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Total Revenue</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    {formatFCFCurrency(allScenarios.scenarios[s].totalRevenue)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Total EBITDA</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    {formatFCFCurrency(allScenarios.scenarios[s].totalEBITDA)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Total CapEx</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    ({formatFCFCurrency(allScenarios.scenarios[s].totalCapex)})
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Total WC Change</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    ({formatFCFCurrency(allScenarios.scenarios[s].totalWCChange)})
                  </td>
                ))}
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="px-6 py-3 text-sm text-gray-900">Total FCF</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-100' : ''}`}>
                    {formatFCFCurrency(allScenarios.scenarios[s].totalFCF)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Present Value</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right text-purple-700 ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    {formatFCFCurrency(allScenarios.scenarios[s].totalPV)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Avg FCF Margin</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    {formatFCFPercent(allScenarios.scenarios[s].avgFCFMargin)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">Break-even Year</td>
                {allScenarios.scenarioOrder.map((s) => (
                  <td key={s} className={`px-4 py-3 text-sm text-right ${s === selectedScenarioId ? 'bg-blue-50 font-medium' : ''}`}>
                    {allScenarios.scenarios[s].breakEvenYear ? `Year ${allScenarios.scenarios[s].breakEvenYear}` : 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FCFProjections;
