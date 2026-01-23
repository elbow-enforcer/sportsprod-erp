/**
 * Scenario Comparison Component
 * 
 * Displays NPV and IRR metrics across all scenarios (min, downside, base, upside, max).
 * Provides side-by-side comparison for investment decision making.
 */

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
import { useScenarioStore } from '../stores/scenarioStore';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { calculateDCF, calculateIRRSimple } from '../models/dcf';

// Format helpers
const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Scenario colors
const SCENARIO_COLORS: Record<string, string> = {
  min: '#ef4444',      // red
  downside: '#f97316', // orange
  base: '#3b82f6',     // blue
  upside: '#22c55e',   // green
  max: '#10b981',      // emerald
};

const SCENARIO_LABELS: Record<string, string> = {
  min: 'Min',
  downside: 'Downside',
  base: 'Base',
  upside: 'Upside',
  max: 'Max',
};

interface ScenarioMetrics {
  scenario: string;
  label: string;
  enterpriseValue: number;
  npv: number;
  irr: number | null;
  paybackPeriod: number | null;
  color: string;
  isSelected: boolean;
}

/**
 * Calculate NPV from DCF projections
 * NPV = Σ(FCF_t / (1+r)^t) for all periods
 */
function calculateNPVFromProjections(
  projections: Array<{ freeCashFlow: number; discountFactor: number }>,
  initialInvestment: number
): number {
  const pvOfCashFlows = projections.reduce(
    (sum, p) => sum + p.freeCashFlow * p.discountFactor,
    0
  );
  return pvOfCashFlows - initialInvestment;
}

/**
 * Calculate Payback Period from cash flows
 */
function calculatePayback(cashFlows: number[]): number | null {
  let cumulative = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const prev = cumulative;
    cumulative += cashFlows[t];
    if (prev < 0 && cumulative >= 0 && cashFlows[t] !== 0) {
      return t - 1 + Math.abs(prev) / cashFlows[t];
    }
  }
  return null;
}

export interface ScenarioComparisonProps {
  /** Optional callback when a scenario is selected */
  onScenarioSelect?: (scenarioId: string) => void;
  /** Show chart visualization */
  showChart?: boolean;
  /** Compact mode for dashboard widgets */
  compact?: boolean;
}

/**
 * ScenarioComparison - NPV and IRR by Scenario
 * 
 * Features:
 * 1. NPV by scenario - Shows net present value for each adoption scenario
 * 2. IRR by scenario - Shows internal rate of return for each scenario
 * 3. Visual comparison with bar charts
 * 4. Highlights scenarios above/below WACC threshold
 */
export function ScenarioComparison({
  onScenarioSelect,
  showChart = true,
  compact = false,
}: ScenarioComparisonProps) {
  const { selectedScenarioId, scenarios } = useScenarioStore();
  
  // Get all assumptions
  const assumptions = useAssumptionsStore((state) => ({
    revenue: state.revenue,
    cogs: state.cogs,
    marketing: state.marketing,
    gna: state.gna,
    capital: state.capital,
    corporate: state.corporate,
    exit: state.exit,
    version: state.version,
    lastModified: state.lastModified,
  }));

  const wacc = assumptions.corporate.discountRate;
  const initialInvestment = assumptions.capital.initialInvestment;

  // Calculate metrics for all scenarios
  const scenarioMetrics: ScenarioMetrics[] = useMemo(() => {
    const scenarioIds = ['min', 'downside', 'base', 'upside', 'max'];
    
    return scenarioIds.map((scenarioId) => {
      const dcfResult = calculateDCF(scenarioId, assumptions);
      const projections = dcfResult.projections;
      
      // Build cash flow array for IRR: initial investment + FCFs + terminal value at exit
      const cashFlows = [
        -initialInvestment,
        ...projections.map((p) => p.freeCashFlow),
      ];
      
      // Add terminal value to final year
      const exitYear = assumptions.exit.exitYear || assumptions.corporate.projectionYears;
      if (exitYear <= projections.length && exitYear > 0) {
        const exitEBITDA = projections[exitYear - 1]?.ebitda || 0;
        const exitRevenue = projections[exitYear - 1]?.revenue || 0;
        const exitProceeds = assumptions.exit.useEbitdaMultiple
          ? exitEBITDA * assumptions.exit.exitEbitdaMultiple
          : exitRevenue * assumptions.exit.exitRevenueMultiple;
        cashFlows[exitYear] = (cashFlows[exitYear] || 0) + exitProceeds;
      }

      // Calculate IRR
      let irr: number | null = null;
      try {
        const calculatedIRR = calculateIRRSimple(cashFlows);
        irr = isFinite(calculatedIRR) ? calculatedIRR : null;
      } catch {
        irr = null;
      }

      // Calculate NPV (sum of PVs minus initial investment)
      const npv = calculateNPVFromProjections(projections, initialInvestment);

      // Calculate payback
      const paybackPeriod = calculatePayback(cashFlows);

      return {
        scenario: scenarioId,
        label: SCENARIO_LABELS[scenarioId],
        enterpriseValue: dcfResult.enterpriseValue,
        npv,
        irr,
        paybackPeriod,
        color: SCENARIO_COLORS[scenarioId],
        isSelected: scenarioId === selectedScenarioId,
      };
    });
  }, [assumptions, initialInvestment, selectedScenarioId]);

  // Chart data for visualization
  const chartData = useMemo(() => {
    return scenarioMetrics.map((m) => ({
      name: m.label,
      npv: m.npv,
      irr: m.irr !== null ? m.irr * 100 : 0,
      ev: m.enterpriseValue,
      color: m.color,
      isSelected: m.isSelected,
    }));
  }, [scenarioMetrics]);

  // Find base scenario for reference
  const baseScenario = scenarioMetrics.find((m) => m.scenario === 'base');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📊</span> NPV & IRR by Scenario
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Investment metrics across adoption scenarios (WACC: {formatPercent(wacc)})
            </p>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enterprise Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NPV
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IRR
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  vs WACC
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payback
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scenarioMetrics.map((metric) => {
                const aboveWacc = metric.irr !== null && metric.irr > wacc;
                return (
                  <tr
                    key={metric.scenario}
                    className={`${
                      metric.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } ${onScenarioSelect ? 'cursor-pointer' : ''}`}
                    onClick={() => onScenarioSelect?.(metric.scenario)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                        <span className={`text-sm font-medium ${
                          metric.isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {metric.label}
                        </span>
                        {metric.isSelected && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(metric.enterpriseValue)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      metric.npv >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(metric.npv)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      metric.irr !== null && metric.irr >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {metric.irr !== null ? formatPercent(metric.irr) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {metric.irr !== null ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            aboveWacc
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {aboveWacc ? '✓ Above' : '↓ Below'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {metric.paybackPeriod !== null
                        ? `${metric.paybackPeriod.toFixed(1)} yrs`
                        : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Base Case Reference */}
        {baseScenario && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Base Case Reference:</span>{' '}
              EV: {formatCurrency(baseScenario.enterpriseValue)} | 
              NPV: {formatCurrency(baseScenario.npv)} | 
              IRR: {baseScenario.irr !== null ? formatPercent(baseScenario.irr) : 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* NPV Chart */}
      {showChart && !compact && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NPV by Scenario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              NPV by Scenario
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'NPV']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Bar dataKey="npv" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={entry.isSelected ? 1 : 0.7}
                        stroke={entry.isSelected ? '#1e40af' : 'none'}
                        strokeWidth={entry.isSelected ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IRR by Scenario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              IRR by Scenario (vs WACC: {formatPercent(wacc)})
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'IRR']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine
                    y={wacc * 100}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{ value: 'WACC', position: 'right', fill: '#ef4444', fontSize: 11 }}
                  />
                  <Bar dataKey="irr" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.irr > wacc * 100 ? '#22c55e' : '#f97316'}
                        fillOpacity={entry.isSelected ? 1 : 0.7}
                        stroke={entry.isSelected ? '#1e40af' : 'none'}
                        strokeWidth={entry.isSelected ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Investment Decision Summary */}
      {!compact && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900">Investment Decision Support</h4>
              <p className="text-sm text-green-700 mt-1">
                {(() => {
                  const profitableScenarios = scenarioMetrics.filter(
                    (m) => m.irr !== null && m.irr > wacc
                  ).length;
                  const positiveNPV = scenarioMetrics.filter((m) => m.npv > 0).length;
                  
                  if (profitableScenarios >= 4) {
                    return `Strong investment: ${profitableScenarios}/5 scenarios exceed WACC hurdle rate, ${positiveNPV}/5 have positive NPV.`;
                  } else if (profitableScenarios >= 2) {
                    return `Moderate investment: ${profitableScenarios}/5 scenarios exceed WACC. Consider risk tolerance and likelihood of base/upside scenarios.`;
                  } else {
                    return `Caution advised: Only ${profitableScenarios}/5 scenarios exceed WACC. Investment may not meet return requirements.`;
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioComparison;
