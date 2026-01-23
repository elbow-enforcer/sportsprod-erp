import { useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { CashFlowWaterfall } from '../components/charts/CashFlowWaterfall';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { useScenarioStore } from '../stores/scenarioStore';
import { getAnnualProjections } from '../models/adoption';
import {
  calculateFCF,
  calculateNPV,
  calculateTerminalValue,
  calculateIRRSimple,
  calculatePaybackPeriod,
  type DCFValuation,
} from '../models/dcf';

// Format currency values for display
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

interface YearlyProjection {
  year: number;
  period: number;
  units: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marketing: number;
  gna: number;
  ebitda: number;
  taxes: number;
  capex: number;
  wcChange: number;
  fcf: number;
  pv: number;
}

// Calculate full DCF valuation
function calculateDCFValuation(
  scenarioId: string,
  discountRate: number,
  terminalGrowthRate: number,
  projectionYears: number,
  taxRate: number,
  basePrice: number,
  unitCost: number,
  marketingBaseBudget: number,
  marketingPctRevenue: number,
  workingCapitalPct: number,
  capexYear1: number,
  capexGrowthRate: number
): DCFValuation & { yearlyData: YearlyProjection[] } {
  const baseYear = 2025;
  
  // Get unit projections for each year
  const units = getAnnualProjections(scenarioId, baseYear, projectionYears);
  
  // Calculate yearly financials
  const yearlyData: YearlyProjection[] = [];
  const fcfValues: number[] = [];
  
  let previousRevenue = 0;
  
  for (let i = 0; i < projectionYears; i++) {
    const yearUnits = units[i] || 0;
    const revenue = yearUnits * basePrice;
    const cogs = yearUnits * unitCost;
    const grossProfit = revenue - cogs;
    
    // Marketing: base budget + % of revenue
    const marketing = marketingBaseBudget + (revenue * marketingPctRevenue);
    
    // G&A: scales with company size (simplified)
    const gna = 50000 + (revenue * 0.05);
    
    const ebitda = grossProfit - marketing - gna;
    
    // FCF components
    const taxes = Math.max(0, ebitda * taxRate);
    const capex = capexYear1 * Math.pow(1 + capexGrowthRate, i);
    const wcChange = (revenue - previousRevenue) * workingCapitalPct;
    
    const { fcf } = calculateFCF({
      ebitda,
      capex,
      workingCapitalChange: wcChange,
      taxes,
    });
    
    fcfValues.push(fcf);
    
    yearlyData.push({
      year: baseYear + i,
      period: i + 1,
      units: yearUnits,
      revenue,
      cogs,
      grossProfit,
      marketing,
      gna,
      ebitda,
      taxes,
      capex,
      wcChange,
      fcf,
      pv: 0, // Will be filled in
    });
    
    previousRevenue = revenue;
  }
  
  // Calculate NPV of FCFs
  const npvResult = calculateNPV(fcfValues, discountRate);
  
  // Update PV in yearly data
  npvResult.cashFlows.forEach((cf) => {
    if (cf.period > 0 && cf.period <= yearlyData.length) {
      yearlyData[cf.period - 1].pv = cf.presentValue || 0;
    }
  });
  
  // Calculate Terminal Value using Gordon Growth
  const finalYearFCF = fcfValues[fcfValues.length - 1] || 0;
  
  const tvResult = calculateTerminalValue(
    {
      method: 'gordon-growth',
      finalYearFCF,
      growthRate: terminalGrowthRate,
      discountRate,
    },
    projectionYears
  );
  
  // Enterprise Value = PV of FCFs + PV of Terminal Value
  const enterpriseValue = npvResult.npv + tvResult.presentValue;
  
  return {
    enterpriseValue,
    pvOfCashFlows: npvResult.npv,
    pvOfTerminalValue: tvResult.presentValue,
    terminalValue: tvResult.terminalValue,
    cashFlows: npvResult.cashFlows,
    params: {
      discountRate,
      projectionYears,
      terminalGrowthRate,
    },
    yearlyData,
  };
}

// Sensitivity Analysis Component
function SensitivityAnalysis({
  scenarioId,
  baseDiscountRate,
  baseTerminalGrowth,
  taxRate,
  basePrice,
  unitCost,
  marketingBaseBudget,
  marketingPctRevenue,
  workingCapitalPct,
  capexYear1,
  capexGrowthRate,
  projectionYears,
}: {
  scenarioId: string;
  baseDiscountRate: number;
  baseTerminalGrowth: number;
  taxRate: number;
  basePrice: number;
  unitCost: number;
  marketingBaseBudget: number;
  marketingPctRevenue: number;
  workingCapitalPct: number;
  capexYear1: number;
  capexGrowthRate: number;
  projectionYears: number;
}) {
  const discountRates = [0.08, 0.10, 0.12, 0.15, 0.18];
  const terminalGrowthRates = [0.01, 0.02, 0.03, 0.04, 0.05];
  
  const sensitivityData = useMemo(() => {
    return discountRates.map((dr) => ({
      discountRate: dr,
      values: terminalGrowthRates.map((tg) => {
        const result = calculateDCFValuation(
          scenarioId, dr, tg, projectionYears, taxRate,
          basePrice, unitCost, marketingBaseBudget, marketingPctRevenue,
          workingCapitalPct, capexYear1, capexGrowthRate
        );
        return result.enterpriseValue;
      }),
    }));
  }, [scenarioId, projectionYears, taxRate, basePrice, unitCost, marketingBaseBudget, marketingPctRevenue, workingCapitalPct, capexYear1, capexGrowthRate]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sensitivity Analysis
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Enterprise Value at different discount rates and terminal growth rates
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Discount Rate ↓ / Terminal Growth →
              </th>
              {terminalGrowthRates.map((tg) => (
                <th
                  key={tg}
                  className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    Math.abs(tg - baseTerminalGrowth) < 0.001
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {formatPercent(tg)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensitivityData.map((row) => (
              <tr key={row.discountRate}>
                <td
                  className={`px-4 py-3 text-sm font-medium ${
                    Math.abs(row.discountRate - baseDiscountRate) < 0.001
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {formatPercent(row.discountRate)}
                </td>
                {row.values.map((value, colIdx) => {
                  const isCurrentAssumption =
                    Math.abs(row.discountRate - baseDiscountRate) < 0.001 &&
                    Math.abs(terminalGrowthRates[colIdx] - baseTerminalGrowth) < 0.001;
                  
                  return (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-sm text-center ${
                        isCurrentAssumption
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      {formatCurrency(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Highlighted cell shows current assumptions
      </p>
    </div>
  );
}

// FCF Chart Component
function FCFChart({ yearlyData }: { yearlyData: YearlyProjection[] }) {
  const chartData = useMemo(() => {
    let cumulative = 0;
    return yearlyData.map((year) => {
      cumulative += year.pv;
      return {
        year: year.year,
        fcf: year.fcf,
        pv: year.pv,
        cumulativePV: cumulative,
      };
    });
  }, [yearlyData]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(v) => formatCurrency(v)}
          label={{
            value: 'Free Cash Flow',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: '#22c55e', fontSize: 12 },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(v) => formatCurrency(v)}
          label={{
            value: 'Cumulative PV',
            angle: 90,
            position: 'insideRight',
            style: { textAnchor: 'middle', fill: '#3b82f6', fontSize: 12 },
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value) || 0),
            name === 'fcf' ? 'Free Cash Flow' : name === 'pv' ? 'Present Value' : 'Cumulative PV',
          ]}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend
          formatter={(value) =>
            value === 'fcf'
              ? 'Free Cash Flow'
              : value === 'cumulativePV'
              ? 'Cumulative PV'
              : 'Present Value'
          }
        />
        <Bar
          yAxisId="left"
          dataKey="fcf"
          name="fcf"
          fill="#22c55e"
          fillOpacity={0.8}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativePV"
          name="cumulativePV"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Projection Table Component
function ProjectionTable({ yearlyData }: { yearlyData: YearlyProjection[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Detailed Projection Table
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                COGS
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Profit
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marketing
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                G&A
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                EBITDA
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                FCF
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                PV
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {yearlyData.map((row) => (
              <tr key={row.year} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">
                  {row.year}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(row.cogs)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(row.grossProfit)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(row.marketing)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(row.gna)}
                </td>
                <td className="px-3 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(row.ebitda)}
                </td>
                <td
                  className={`px-3 py-3 text-sm font-medium text-right ${
                    row.fcf >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(row.fcf)}
                </td>
                <td className="px-3 py-3 text-sm text-blue-600 text-right">
                  {formatCurrency(row.pv)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                Total
              </td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(yearlyData.reduce((sum, r) => sum + r.revenue, 0))}
              </td>
              <td colSpan={5}></td>
              <td className="px-3 py-3 text-sm font-semibold text-green-600 text-right">
                {formatCurrency(yearlyData.reduce((sum, r) => sum + r.fcf, 0))}
              </td>
              <td className="px-3 py-3 text-sm font-semibold text-blue-600 text-right">
                {formatCurrency(yearlyData.reduce((sum, r) => sum + r.pv, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Key Assumptions Component
function KeyAssumptions({
  discountRate,
  terminalGrowthRate,
  taxRate,
  workingCapitalPct,
  projectionYears,
}: {
  discountRate: number;
  terminalGrowthRate: number;
  taxRate: number;
  workingCapitalPct: number;
  projectionYears: number;
}) {
  const assumptions = [
    { label: 'Discount Rate (WACC)', value: formatPercent(discountRate) },
    { label: 'Terminal Growth Rate', value: formatPercent(terminalGrowthRate) },
    { label: 'Tax Rate', value: formatPercent(taxRate) },
    { label: 'Working Capital %', value: formatPercent(workingCapitalPct) },
    { label: 'Projection Years', value: String(projectionYears) },
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Key Assumptions
        </h3>
        <Link
          to="/assumptions"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Edit Assumptions →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {assumptions.map((item) => (
          <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Valuation() {
  const { selectedScenarioId, scenarios } = useScenarioStore();
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
  
  // Get assumptions from store
  const revenue = useAssumptionsStore((state) => state.revenue);
  const cogs = useAssumptionsStore((state) => state.cogs);
  const marketing = useAssumptionsStore((state) => state.marketing);
  const capital = useAssumptionsStore((state) => state.capital);
  const corporate = useAssumptionsStore((state) => state.corporate);
  
  // Calculate DCF valuation
  const valuation = useMemo(() => {
    return calculateDCFValuation(
      selectedScenarioId,
      corporate.discountRate,
      corporate.terminalGrowthRate,
      corporate.projectionYears,
      corporate.taxRate,
      revenue.pricePerUnit,
      cogs.unitCost,
      marketing.baseBudget,
      marketing.percentOfRevenue,
      capital.workingCapitalPercent,
      capital.capexYear1,
      capital.capexGrowthRate
    );
  }, [
    selectedScenarioId,
    corporate.discountRate,
    corporate.terminalGrowthRate,
    corporate.projectionYears,
    corporate.taxRate,
    revenue.pricePerUnit,
    cogs.unitCost,
    marketing.baseBudget,
    marketing.percentOfRevenue,
    capital.workingCapitalPercent,
    capital.capexYear1,
    capital.capexGrowthRate,
  ]);
  
  // Calculate multiples
  const finalYearRevenue = valuation.yearlyData[valuation.yearlyData.length - 1]?.revenue || 1;
  const finalYearEBITDA = valuation.yearlyData[valuation.yearlyData.length - 1]?.ebitda || 1;
  const evRevenueMultiple = valuation.enterpriseValue / finalYearRevenue;
  const evEbitdaMultiple = valuation.enterpriseValue / finalYearEBITDA;
  const tvContribution = (valuation.pvOfTerminalValue / valuation.enterpriseValue) * 100;
  
  // Calculate IRR and Payback Period
  const cashFlowsForIRR = useMemo(() => {
    // Initial investment (negative), then yearly FCFs, then terminal value in final year
    const initialInvestment = -(capital.capexYear1 + capital.workingCapitalPercent * valuation.yearlyData[0]?.revenue || 0);
    const fcfs = valuation.yearlyData.map((y, i) => 
      i === valuation.yearlyData.length - 1 
        ? y.fcf + valuation.terminalValue / Math.pow(1 + corporate.discountRate, i + 1) * Math.pow(1 + corporate.discountRate, i + 1)
        : y.fcf
    );
    return [initialInvestment, ...fcfs];
  }, [valuation, capital, corporate.discountRate]);
  
  const irr = useMemo(() => {
    try {
      return calculateIRRSimple(cashFlowsForIRR);
    } catch {
      return null;
    }
  }, [cashFlowsForIRR]);
  
  const paybackPeriod = useMemo(() => {
    const fcfs = valuation.yearlyData.map(y => y.fcf);
    const initialInvestment = Math.abs(cashFlowsForIRR[0]);
    let cumulative = -initialInvestment;
    for (let i = 0; i < fcfs.length; i++) {
      cumulative += fcfs[i];
      if (cumulative >= 0) {
        // Interpolate for partial year
        const prevCumulative = cumulative - fcfs[i];
        const fraction = Math.abs(prevCumulative) / fcfs[i];
        return i + fraction;
      }
    }
    return null; // Never pays back
  }, [valuation, cashFlowsForIRR]);
  
  return (
    <div className="space-y-6">
      {/* Scenario Banner */}
      {selectedScenario && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active Scenario:</span>{' '}
            {selectedScenario.name} — {selectedScenario.description}
          </p>
        </div>
      )}

      {/* Valuation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Enterprise Value"
          value={formatCurrency(valuation.enterpriseValue)}
          icon={<span className="text-2xl">💎</span>}
          subtitle="DCF Valuation"
        />
        <KPICard
          title="IRR"
          value={irr !== null ? `${(irr * 100).toFixed(1)}%` : 'N/A'}
          icon={<span className="text-2xl">📈</span>}
          subtitle={irr !== null && irr > corporate.discountRate ? '✓ Above WACC' : 'Below WACC'}
        />
        <KPICard
          title="Payback Period"
          value={paybackPeriod !== null ? `${paybackPeriod.toFixed(1)} yrs` : 'N/A'}
          icon={<span className="text-2xl">⏱️</span>}
          subtitle="Time to Recover Investment"
        />
        <KPICard
          title="EV / Revenue"
          value={`${evRevenueMultiple.toFixed(1)}x`}
          icon={<span className="text-2xl">📊</span>}
          subtitle={`Year ${corporate.projectionYears} Revenue`}
        />
        <KPICard
          title="EV / EBITDA"
          value={`${evEbitdaMultiple.toFixed(1)}x`}
          icon={<span className="text-2xl">📈</span>}
          subtitle={`Year ${corporate.projectionYears} EBITDA`}
        />
        <KPICard
          title="Terminal Value %"
          value={`${tvContribution.toFixed(0)}%`}
          icon={<span className="text-2xl">🎯</span>}
          subtitle="Of Enterprise Value"
        />
      </div>

      {/* Value Bridge */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Valuation Bridge
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg min-w-[140px]">
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(valuation.pvOfCashFlows)}
            </p>
            <p className="text-sm text-green-600 mt-1">PV of Cash Flows</p>
          </div>
          <span className="text-2xl text-gray-400">+</span>
          <div className="text-center p-4 bg-purple-50 rounded-lg min-w-[140px]">
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(valuation.pvOfTerminalValue)}
            </p>
            <p className="text-sm text-purple-600 mt-1">PV of Terminal Value</p>
          </div>
          <span className="text-2xl text-gray-400">=</span>
          <div className="text-center p-4 bg-blue-50 rounded-lg min-w-[160px]">
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(valuation.enterpriseValue)}
            </p>
            <p className="text-sm text-blue-600 mt-1">Enterprise Value</p>
          </div>
        </div>
      </div>

      {/* FCF Projection Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Free Cash Flow Projections
        </h3>
        <div className="h-80">
          <FCFChart yearlyData={valuation.yearlyData} />
        </div>
      </div>

      {/* Detailed Projection Table */}
      <ProjectionTable yearlyData={valuation.yearlyData} />

      {/* Sensitivity Analysis */}
      <SensitivityAnalysis
        scenarioId={selectedScenarioId}
        baseDiscountRate={corporate.discountRate}
        baseTerminalGrowth={corporate.terminalGrowthRate}
        taxRate={corporate.taxRate}
        basePrice={revenue.pricePerUnit}
        unitCost={cogs.unitCost}
        marketingBaseBudget={marketing.baseBudget}
        marketingPctRevenue={marketing.percentOfRevenue}
        workingCapitalPct={capital.workingCapitalPercent}
        capexYear1={capital.capexYear1}
        capexGrowthRate={capital.capexGrowthRate}
        projectionYears={corporate.projectionYears}
      />

      {/* Key Assumptions Summary */}
      <KeyAssumptions
        discountRate={corporate.discountRate}
        terminalGrowthRate={corporate.terminalGrowthRate}
        taxRate={corporate.taxRate}
        workingCapitalPct={capital.workingCapitalPercent}
        projectionYears={corporate.projectionYears}
      />
    </div>
  );
}
