/**
 * Raise Scenario Matrix Component
 * 
 * Interactive comparison matrix for capital raise scenarios.
 * Shows dilution, runway, and valuation impact across raise amounts.
 */

import { useState, useMemo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  buildRaiseScenarioMatrix,
  formatRaiseCurrency,
  formatRaisePercent,
  DEFAULT_RAISE_AMOUNTS,
  DEFAULT_PRE_MONEY_VALUATION,
  type RaiseScenarioResult,
  type RaiseScenarioMatrix as MatrixType,
  type RaiseInstrument,
} from '../models/raise';
import { useAssumptionsStore } from '../stores/assumptionsStore';

// Risk level colors
const RISK_COLORS: Record<string, string> = {
  critical: '#ef4444',   // red
  low: '#f97316',        // orange
  moderate: '#eab308',   // yellow
  comfortable: '#22c55e', // green
  extended: '#3b82f6',    // blue
};

const RISK_LABELS: Record<string, string> = {
  critical: 'Critical (<6 mo)',
  low: 'Low (6-12 mo)',
  moderate: 'Moderate (12-18 mo)',
  comfortable: 'Comfortable (18-24 mo)',
  extended: 'Extended (24+ mo)',
};

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}

function InputField({ label, value, onChange, prefix, suffix, step = 1000, min = 0, max }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-center">
        {prefix && <span className="text-gray-500 mr-1">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
        />
        {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function InstrumentSelector({ 
  value, 
  onChange 
}: { 
  value: RaiseInstrument; 
  onChange: (v: RaiseInstrument) => void;
}) {
  const instruments: { value: RaiseInstrument; label: string; desc: string }[] = [
    { value: 'equity', label: 'Equity', desc: 'Priced round' },
    { value: 'safe', label: 'SAFE', desc: 'Simple Agreement' },
    { value: 'convertible_debt', label: 'Convertible', desc: 'Debt instrument' },
  ];

  return (
    <div className="flex gap-2">
      {instruments.map((inst) => (
        <button
          key={inst.value}
          onClick={() => onChange(inst.value)}
          className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
            value === inst.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          <div className="font-medium">{inst.label}</div>
          <div className={`text-xs ${value === inst.value ? 'text-blue-100' : 'text-gray-500'}`}>
            {inst.desc}
          </div>
        </button>
      ))}
    </div>
  );
}

function ScenarioCard({ 
  scenario, 
  isRecommended 
}: { 
  scenario: RaiseScenarioResult; 
  isRecommended: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isRecommended
          ? 'border-green-500 bg-green-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {isRecommended && (
        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mb-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          RECOMMENDED
        </div>
      )}
      
      <div className="text-2xl font-bold text-gray-900 mb-3">
        {formatRaiseCurrency(scenario.raiseAmount)}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Dilution</span>
          <span className="font-semibold text-gray-900">
            {formatRaisePercent(scenario.dilutionPercent)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Runway</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {scenario.runwayMonths === Infinity ? '∞' : `${scenario.runwayMonths} mo`}
            </span>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: RISK_COLORS[scenario.runwayRiskLevel] }}
              title={RISK_LABELS[scenario.runwayRiskLevel]}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Post-Money</span>
          <span className="font-semibold text-gray-900">
            {formatRaiseCurrency(scenario.postMoneyValuation)}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Your Ownership</span>
            <span className="font-medium text-gray-700">
              {formatRaisePercent(scenario.founderOwnershipPost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatrixTable({ matrix }: { matrix: MatrixType }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Raise Amount
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Dilution %
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Runway (mo)
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Post-Money
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Founder %
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Risk Level
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {matrix.scenarios.map((s) => {
            const isRecommended = s.raiseAmount === matrix.recommendedScenario?.raiseAmount;
            return (
              <tr
                key={s.raiseAmount}
                className={`${isRecommended ? 'bg-green-50' : ''} hover:bg-gray-50`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {isRecommended && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {formatRaiseCurrency(s.raiseAmount)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <span className={`font-medium ${s.dilutionPercent > 0.25 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatRaisePercent(s.dilutionPercent)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {s.runwayMonths === Infinity ? '∞' : s.runwayMonths}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatRaiseCurrency(s.postMoneyValuation)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatRaisePercent(s.founderOwnershipPost)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${RISK_COLORS[s.runwayRiskLevel]}20`,
                      color: RISK_COLORS[s.runwayRiskLevel],
                    }}
                  >
                    {s.runwayRiskLevel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DilutionRunwayChart({ matrix }: { matrix: MatrixType }) {
  const data = matrix.scenarios.map((s) => ({
    name: formatRaiseCurrency(s.raiseAmount),
    dilution: s.dilutionPercent * 100,
    runway: Math.min(s.runwayMonths, 36), // Cap at 36 for chart
    runwayRisk: s.runwayRiskLevel,
    isRecommended: s.raiseAmount === matrix.recommendedScenario?.raiseAmount,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Dilution %', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Runway (months)', angle: 90, position: 'insideRight', fill: '#6b7280' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'dilution') return [`${value.toFixed(1)}%`, 'Dilution'];
              return [`${value} months`, 'Runway'];
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="dilution"
            name="Dilution %"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isRecommended ? '#22c55e' : '#3b82f6'}
                opacity={entry.isRecommended ? 1 : 0.7}
              />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="runway"
            name="Runway (months)"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 6, fill: '#f59e0b' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RaiseScenarioMatrix() {
  // Get assumptions from store for defaults
  const assumptions = useAssumptionsStore();
  
  // Local state for inputs
  const [preMoneyValuation, setPreMoneyValuation] = useState(DEFAULT_PRE_MONEY_VALUATION);
  const [currentCash, setCurrentCash] = useState(assumptions.capital.initialInvestment);
  const [instrument, setInstrument] = useState<RaiseInstrument>('equity');
  const [monthlyBurn, setMonthlyBurn] = useState(35_000);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Calculate burn rate components
  const burnRate = useMemo(() => {
    return {
      payroll: monthlyBurn * 0.6,
      marketing: monthlyBurn * 0.2,
      operations: monthlyBurn * 0.2,
      cogs: 0,
      total: monthlyBurn,
    };
  }, [monthlyBurn]);

  // Build the scenario matrix
  const matrix = useMemo(() => {
    return buildRaiseScenarioMatrix(
      burnRate,
      currentCash,
      preMoneyValuation,
      DEFAULT_RAISE_AMOUNTS,
      instrument
    );
  }, [burnRate, currentCash, preMoneyValuation, instrument]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Raise Scenario Analysis</h2>
        <p className="text-gray-500 mt-1">
          Compare dilution, runway, and valuation impact across different raise amounts
        </p>
      </div>

      {/* Inputs Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assumptions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InputField
            label="Pre-Money Valuation"
            value={preMoneyValuation}
            onChange={setPreMoneyValuation}
            prefix="$"
            step={100000}
            min={500000}
          />
          <InputField
            label="Current Cash"
            value={currentCash}
            onChange={setCurrentCash}
            prefix="$"
            step={10000}
            min={0}
          />
          <InputField
            label="Monthly Burn Rate"
            value={monthlyBurn}
            onChange={setMonthlyBurn}
            prefix="$"
            step={5000}
            min={1000}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Current Runway</label>
            <div className="flex items-center h-[42px] px-3 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold text-gray-900">
                {Math.floor(currentCash / monthlyBurn)} months
              </span>
              <span
                className="ml-2 w-3 h-3 rounded-full"
                style={{
                  backgroundColor: RISK_COLORS[
                    Math.floor(currentCash / monthlyBurn) < 6 ? 'critical' :
                    Math.floor(currentCash / monthlyBurn) < 12 ? 'low' :
                    Math.floor(currentCash / monthlyBurn) < 18 ? 'moderate' :
                    Math.floor(currentCash / monthlyBurn) < 24 ? 'comfortable' : 'extended'
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="text-sm font-medium text-gray-600 block mb-2">Instrument Type</label>
          <InstrumentSelector value={instrument} onChange={setInstrument} />
        </div>
      </div>

      {/* Recommendation Banner */}
      {matrix.recommendedScenario && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Optimal Raise Recommendation</h4>
              <p className="text-green-700 text-sm mt-1">{matrix.recommendationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Scenario Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matrix.scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.raiseAmount}
              scenario={scenario}
              isRecommended={scenario.raiseAmount === matrix.recommendedScenario?.raiseAmount}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <MatrixTable matrix={matrix} />
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dilution vs Runway Trade-off
        </h3>
        <DilutionRunwayChart matrix={matrix} />
      </div>

      {/* Burn Rate Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Burn Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Payroll</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatRaiseCurrency(burnRate.payroll)}
            </div>
            <div className="text-xs text-gray-400">60%</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Marketing</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatRaiseCurrency(burnRate.marketing)}
            </div>
            <div className="text-xs text-gray-400">20%</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Operations</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatRaiseCurrency(burnRate.operations)}
            </div>
            <div className="text-xs text-gray-400">20%</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Total Burn</div>
            <div className="text-xl font-semibold text-blue-700">
              {formatRaiseCurrency(burnRate.total)}
            </div>
            <div className="text-xs text-blue-400">/month</div>
          </div>
        </div>
      </div>

      {/* Risk Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Runway Risk Levels</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(RISK_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: RISK_COLORS[key] }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RaiseScenarioMatrix;
