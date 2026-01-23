import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KPICard } from '../components/KPICard';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { useScenarioStore } from '../stores/scenarioStore';
import { useInvestorCohortsStore } from '../stores/investorCohortsStore';
import {
  calculateDCF,
  calculateIRRSimple,
  calculatePaybackPeriod,
  calculateNPVWithEffectiveDate,
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
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

// Effective Date Preset type
interface DatePreset {
  label: string;
  date: string;
}

// Assumption Display Grid Item
interface AssumptionItem {
  label: string;
  value: string;
  category: string;
}

export function ValuationSummary() {
  const { selectedScenarioId, scenarios } = useScenarioStore();
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const { cohorts } = useInvestorCohortsStore();

  // Get all assumptions from store
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

  // Effective date state
  const [effectiveDate, setEffectiveDate] = useState(
    assumptions.corporate.effectiveDate || new Date().toISOString().split('T')[0]
  );

  // Generate date presets
  const datePresets: DatePreset[] = useMemo(() => {
    const presets: DatePreset[] = [
      { label: 'Today', date: new Date().toISOString().split('T')[0] },
      { label: 'Formation Date', date: assumptions.corporate.investmentLockInDate || '2024-01-01' },
    ];

    // Add cohort dates
    cohorts.forEach((cohort) => {
      presets.push({
        label: `${cohort.name}`,
        date: cohort.investmentDate,
      });
    });

    return presets;
  }, [cohorts, assumptions.corporate.investmentLockInDate]);

  // Calculate DCF valuation
  const dcfResult = useMemo(() => {
    return calculateDCF(selectedScenarioId, assumptions);
  }, [selectedScenarioId, assumptions]);

  // Calculate IRR, ROI, MOIC, Payback
  const investmentMetrics = useMemo(() => {
    const initialInvestment = assumptions.capital.initialInvestment;
    const projections = dcfResult.projections;

    // Build cash flow array: initial investment (negative) + yearly FCFs
    const cashFlows = [
      -initialInvestment,
      ...projections.map((p) => p.freeCashFlow),
    ];

    // Add terminal value proceeds at exit
    const exitYear = assumptions.exit.exitYear || assumptions.corporate.projectionYears;
    if (exitYear <= projections.length) {
      // Calculate exit proceeds
      const exitEBITDA = projections[exitYear - 1]?.ebitda || 0;
      const exitRevenue = projections[exitYear - 1]?.revenue || 0;
      const exitProceeds = assumptions.exit.useEbitdaMultiple
        ? exitEBITDA * assumptions.exit.exitEbitdaMultiple
        : exitRevenue * assumptions.exit.exitRevenueMultiple;
      
      // Add exit proceeds to final year
      cashFlows[exitYear] = (cashFlows[exitYear] || 0) + exitProceeds;
    }

    // IRR
    let irr: number | null = null;
    try {
      irr = calculateIRRSimple(cashFlows);
      if (!isFinite(irr)) irr = null;
    } catch {
      irr = null;
    }

    // Total Return & ROI
    const totalCashInflows = cashFlows.slice(1).reduce((sum, cf) => sum + Math.max(0, cf), 0);
    const totalReturn = totalCashInflows - initialInvestment;
    const roi = initialInvestment > 0 ? totalReturn / initialInvestment : 0;

    // MOIC (Multiple on Invested Capital)
    const moic = initialInvestment > 0 ? totalCashInflows / initialInvestment : 0;

    // Payback Period
    const paybackPeriod = calculatePaybackPeriod(cashFlows);

    // NPV at different rates
    const startDate = new Date(assumptions.corporate.investmentLockInDate || '2024-01-01');
    const effDate = new Date(effectiveDate);

    const npvAt8 = calculateNPVWithEffectiveDate(cashFlows, 0.08, effDate, startDate);
    const npvAt10 = calculateNPVWithEffectiveDate(cashFlows, 0.10, effDate, startDate);
    const npvAt12 = calculateNPVWithEffectiveDate(cashFlows, 0.12, effDate, startDate);
    const npvAt15 = calculateNPVWithEffectiveDate(cashFlows, 0.15, effDate, startDate);

    return {
      irr,
      roi,
      moic,
      paybackPeriod,
      totalReturn,
      npvAt8,
      npvAt10,
      npvAt12,
      npvAt15,
      cashFlows,
    };
  }, [dcfResult, assumptions, effectiveDate]);

  // Key Metrics Snapshot
  const keyMetrics = useMemo(() => {
    const projections = dcfResult.projections;
    const year1 = projections[0];
    const year5 = projections[4];
    const year10 = projections[9];

    const totalUnits = projections.reduce((sum, p) => sum + p.units, 0);
    const peakUnits = Math.max(...projections.map((p) => p.units));
    const totalCapital = assumptions.capital.initialInvestment +
      projections.reduce((sum, p) => sum + p.capex, 0);
    const cumulativeFCF = projections.reduce((sum, p) => sum + p.freeCashFlow, 0);

    return {
      year1: year1 ? {
        revenue: year1.revenue,
        ebitda: year1.ebitda,
        margin: year1.revenue > 0 ? year1.ebitda / year1.revenue : 0,
      } : null,
      year5: year5 ? {
        revenue: year5.revenue,
        ebitda: year5.ebitda,
        margin: year5.revenue > 0 ? year5.ebitda / year5.revenue : 0,
      } : null,
      year10: year10 ? {
        revenue: year10.revenue,
        ebitda: year10.ebitda,
        margin: year10.revenue > 0 ? year10.ebitda / year10.revenue : 0,
      } : null,
      totalUnits,
      peakUnits,
      totalCapital,
      cumulativeFCF,
    };
  }, [dcfResult, assumptions]);

  // Build assumptions display items
  const assumptionItems: AssumptionItem[] = useMemo(() => [
    // Revenue
    { label: 'Unit Price', value: formatCurrency(assumptions.revenue.pricePerUnit), category: 'Revenue' },
    { label: 'Price Growth', value: formatPercent(assumptions.revenue.annualPriceIncrease), category: 'Revenue' },
    // COGS
    { label: 'Unit Cost', value: formatCurrency(assumptions.cogs.unitCost), category: 'COGS' },
    { label: 'Cost Reduction', value: formatPercent(assumptions.cogs.costReductionPerYear), category: 'COGS' },
    // Marketing
    { label: 'Marketing Budget', value: formatCurrency(assumptions.marketing.baseBudget), category: 'Marketing' },
    { label: 'CAC Target', value: formatCurrency(assumptions.marketing.cacTarget), category: 'Marketing' },
    // G&A
    { label: 'Headcount', value: String(assumptions.gna.baseHeadcount), category: 'G&A' },
    { label: 'Avg Salary', value: formatCurrency(assumptions.gna.avgSalary), category: 'G&A' },
    // Capital
    { label: 'Initial Investment', value: formatCurrency(assumptions.capital.initialInvestment), category: 'Capital' },
    { label: 'Working Capital %', value: formatPercent(assumptions.capital.workingCapitalPercent), category: 'Capital' },
    // Corporate
    { label: 'Tax Rate', value: formatPercent(assumptions.corporate.taxRate), category: 'Corporate' },
    { label: 'WACC', value: formatPercent(assumptions.corporate.discountRate), category: 'Corporate' },
    { label: 'Terminal Growth', value: formatPercent(assumptions.corporate.terminalGrowthRate), category: 'Corporate' },
    // Exit
    { label: 'Exit Multiple', value: assumptions.exit.useEbitdaMultiple 
        ? `${assumptions.exit.exitEbitdaMultiple}x EBITDA` 
        : `${assumptions.exit.exitRevenueMultiple}x Revenue`, category: 'Exit' },
    { label: 'Exit Year', value: `Year ${assumptions.exit.exitYear}`, category: 'Exit' },
  ], [assumptions]);

  // Group assumptions by category
  const assumptionsByCategory = useMemo(() => {
    const grouped: Record<string, AssumptionItem[]> = {};
    assumptionItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [assumptionItems]);

  const categoryIcons: Record<string, string> = {
    Revenue: '💰',
    COGS: '🏭',
    Marketing: '📣',
    'G&A': '🏢',
    Capital: '🏦',
    Corporate: '📊',
    Exit: '🚀',
  };

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

      {/* Section 4: Effective Date Selector (moved to top for prominence) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📅</span> Effective Date
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              All metrics are calculated as of this date
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setEffectiveDate(e.target.value);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Preset...</option>
              {datePresets.map((preset) => (
                <option key={preset.label} value={preset.date}>
                  {preset.label} ({preset.date})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Economic Performance Outputs (KPI Cards) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>📈</span> Economic Performance
          </h3>
          <Link
            to="/valuation"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Full DCF →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <KPICard
            title="Enterprise Value"
            value={formatCurrency(dcfResult.enterpriseValue)}
            icon={<span className="text-2xl">💎</span>}
            subtitle="DCF Valuation"
          />
          <KPICard
            title="IRR"
            value={investmentMetrics.irr !== null ? formatPercent(investmentMetrics.irr) : 'N/A'}
            icon={<span className="text-2xl">📊</span>}
            subtitle={investmentMetrics.irr !== null && investmentMetrics.irr > assumptions.corporate.discountRate 
              ? '✓ Above WACC' 
              : 'vs WACC'}
          />
          <KPICard
            title="ROI"
            value={formatPercent(investmentMetrics.roi)}
            icon={<span className="text-2xl">💹</span>}
            subtitle="Total Return / Investment"
          />
          <KPICard
            title="MOIC"
            value={`${investmentMetrics.moic.toFixed(2)}x`}
            icon={<span className="text-2xl">🎯</span>}
            subtitle="Multiple on Invested Capital"
          />
          <KPICard
            title="Payback Period"
            value={investmentMetrics.paybackPeriod !== null 
              ? `${investmentMetrics.paybackPeriod.toFixed(1)} yrs` 
              : 'N/A'}
            icon={<span className="text-2xl">⏱️</span>}
            subtitle="Time to Recover"
          />
          <KPICard
            title="Total Return"
            value={formatCurrency(investmentMetrics.totalReturn)}
            icon={<span className="text-2xl">🏆</span>}
            subtitle="Net Cash Gain"
          />
        </div>

        {/* NPV at Different Rates */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">NPV at Different Discount Rates</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { rate: '8%', value: investmentMetrics.npvAt8 },
              { rate: '10%', value: investmentMetrics.npvAt10 },
              { rate: '12%', value: investmentMetrics.npvAt12 },
              { rate: '15%', value: investmentMetrics.npvAt15 },
            ].map(({ rate, value }) => (
              <div 
                key={rate}
                className={`p-4 rounded-lg text-center ${
                  value >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <p className={`text-lg font-bold ${
                  value >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(value)}
                </p>
                <p className="text-xs text-gray-500 mt-1">NPV @ {rate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Key Metrics Snapshot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📋</span> Key Metrics Snapshot
        </h3>

        {/* Year-over-Year Comparison */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year 1
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year 5
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year 10
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Revenue</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year1 ? formatCurrency(keyMetrics.year1.revenue) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year5 ? formatCurrency(keyMetrics.year5.revenue) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year10 ? formatCurrency(keyMetrics.year10.revenue) : '-'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA</td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={keyMetrics.year1 && keyMetrics.year1.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {keyMetrics.year1 ? formatCurrency(keyMetrics.year1.ebitda) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={keyMetrics.year5 && keyMetrics.year5.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {keyMetrics.year5 ? formatCurrency(keyMetrics.year5.ebitda) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={keyMetrics.year10 && keyMetrics.year10.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {keyMetrics.year10 ? formatCurrency(keyMetrics.year10.ebitda) : '-'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA Margin</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year1 ? formatPercent(keyMetrics.year1.margin) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year5 ? formatPercent(keyMetrics.year5.margin) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {keyMetrics.year10 ? formatPercent(keyMetrics.year10.margin) : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-gray-900">{formatNumber(keyMetrics.totalUnits)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Units (10yr)</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-gray-900">{formatNumber(keyMetrics.peakUnits)}</p>
            <p className="text-xs text-gray-500 mt-1">Peak Annual Units</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(keyMetrics.totalCapital)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Capital Invested</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className={`text-xl font-bold ${keyMetrics.cumulativeFCF >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(keyMetrics.cumulativeFCF)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cumulative FCF</p>
          </div>
        </div>
      </div>

      {/* Section 1: Input Assumptions Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>⚙️</span> Input Assumptions
          </h3>
          <Link
            to="/assumptions"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Edit Assumptions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(assumptionsByCategory).map(([category, items]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{categoryIcons[category] || '📌'}</span>
                <h4 className="text-sm font-semibold text-gray-700">{category}</h4>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Version info */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Model Version: {assumptions.version}</span>
          <span>Last Modified: {new Date(assumptions.lastModified).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">Quick Links</h4>
              <p className="text-sm text-blue-700 mt-1">
                Jump to detailed views for more analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/valuation"
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              DCF Details
            </Link>
            <Link
              to="/assumptions"
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Edit Assumptions
            </Link>
            <Link
              to="/investors"
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Investor Cohorts
            </Link>
            <Link
              to="/projections"
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Projections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
