/**
 * Income Statement (P&L) Page
 */
import { useState, useMemo } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { getAnnualProjections } from '../models/adoption';

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

type TimePeriod = 'yearly' | 'quarterly' | 'monthly';

interface PeriodData {
  label: string;
  netRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMargin: number;
  marketingExpense: number;
  gnaExpense: number;
  totalOpEx: number;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: number;
  ebit: number;
  taxes: number;
  netIncome: number;
  netMargin: number;
}

export function IncomeStatement() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly');
  const [selectedYear, setSelectedYear] = useState(0);
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const corporate = useAssumptionsStore((s) => s.corporate);

  const baseYear = 2025;
  const years = Array.from({ length: corporate.projectionYears }, (_, i) => baseYear + i);

  const yearlyData = useMemo(() => {
    const units = getAnnualProjections('base', baseYear, corporate.projectionYears);
    return years.map((year, i) => {
      const yearUnits = units[i] || 0;
      const priceThisYear = revenue.pricePerUnit * Math.pow(1 + revenue.annualPriceIncrease, i);
      const grossRevenue = yearUnits * priceThisYear;
      const netRevenue = grossRevenue * (1 - revenue.discountRate);
      const unitCostThisYear = cogs.unitCost * Math.pow(1 - cogs.costReductionPerYear, i);
      const totalCOGS = yearUnits * (unitCostThisYear + cogs.shippingPerUnit);
      const grossProfit = netRevenue - totalCOGS;
      const grossMargin = netRevenue > 0 ? grossProfit / netRevenue : 0;
      const marketingExpense = Math.max(marketing.baseBudget, netRevenue * marketing.percentOfRevenue);
      const headcount = Math.max(gna.baseHeadcount, Math.ceil(yearUnits / 2000));
      const salaryThisYear = gna.avgSalary * Math.pow(1 + gna.salaryGrowthRate, i);
      const gnaExpense = (headcount * salaryThisYear * gna.benefitsMultiplier) + gna.officeAndOps + (gna.insurance || 10000);
      const totalOpEx = marketingExpense + gnaExpense;
      const ebitda = grossProfit - totalOpEx;
      const ebitdaMargin = netRevenue > 0 ? ebitda / netRevenue : 0;
      const depreciation = 10000 * (i + 1);
      const ebit = ebitda - depreciation;
      const taxes = ebit > 0 ? ebit * corporate.taxRate : 0;
      const netIncome = ebit - taxes;
      const netMargin = netRevenue > 0 ? netIncome / netRevenue : 0;
      return { year, netRevenue, totalCOGS, grossProfit, grossMargin, marketingExpense, gnaExpense, totalOpEx, ebitda, ebitdaMargin, depreciation, ebit, taxes, netIncome, netMargin };
    });
  }, [revenue, cogs, marketing, gna, corporate, years]);

  const displayData: PeriodData[] = useMemo(() => {
    const yearData = yearlyData[selectedYear];
    if (!yearData) return [];

    if (timePeriod === 'yearly') {
      return yearlyData.map((d) => ({
        label: String(d.year),
        ...d,
      }));
    }

    const periods = timePeriod === 'quarterly' ? 4 : 12;
    const periodLabels = timePeriod === 'quarterly'
      ? ['Q1', 'Q2', 'Q3', 'Q4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Seasonal distribution weights (Q1-Q4 or monthly)
    const weights = timePeriod === 'quarterly'
      ? [0.20, 0.25, 0.30, 0.25]  // Q1 lower, Q3 peak
      : [0.06, 0.07, 0.08, 0.08, 0.09, 0.10, 0.10, 0.10, 0.09, 0.08, 0.08, 0.07];

    return periodLabels.map((label, i) => {
      const weight = weights[i];
      const netRevenue = yearData.netRevenue * weight;
      const totalCOGS = yearData.totalCOGS * weight;
      const grossProfit = netRevenue - totalCOGS;
      const grossMargin = netRevenue > 0 ? grossProfit / netRevenue : 0;
      const marketingExpense = yearData.marketingExpense / periods;
      const gnaExpense = yearData.gnaExpense / periods;
      const totalOpEx = marketingExpense + gnaExpense;
      const ebitda = grossProfit - totalOpEx;
      const ebitdaMargin = netRevenue > 0 ? ebitda / netRevenue : 0;
      const depreciation = yearData.depreciation / periods;
      const ebit = ebitda - depreciation;
      const taxes = ebit > 0 ? ebit * corporate.taxRate : 0;
      const netIncome = ebit - taxes;
      const netMargin = netRevenue > 0 ? netIncome / netRevenue : 0;

      return {
        label,
        netRevenue,
        totalCOGS,
        grossProfit,
        grossMargin,
        marketingExpense,
        gnaExpense,
        totalOpEx,
        ebitda,
        ebitdaMargin,
        depreciation,
        ebit,
        taxes,
        netIncome,
        netMargin,
      };
    });
  }, [yearlyData, selectedYear, timePeriod, corporate.taxRate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Income Statement</h2>
          <p className="text-sm text-gray-500">Profit & Loss Statement</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['monthly', 'quarterly', 'yearly'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setTimePeriod(tp)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  timePeriod === tp
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tp.charAt(0).toUpperCase() + tp.slice(1)}
              </button>
            ))}
          </div>
          {timePeriod !== 'yearly' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year, i) => (
                  <option key={year} value={i}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50">Line Item</th>
              {displayData.map((d) => (
                <th key={d.label} className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[100px]">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Net Revenue</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.netRevenue)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">COGS</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.totalCOGS)})</td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Gross Profit</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.grossProfit)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Gross Margin</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatPercent(d.grossMargin)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Marketing</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.marketingExpense)})</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">G&A</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.gnaExpense)})</td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">EBITDA</td>
              {displayData.map((d, i) => (
                <td key={i} className={`px-4 py-2 text-right ${d.ebitda < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(d.ebitda)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">EBITDA Margin</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatPercent(d.ebitdaMargin)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">D&A</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.depreciation)})</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Taxes</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.taxes)})</td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-blue-50">
              <td className="px-4 py-2 sticky left-0 bg-blue-50">Net Income</td>
              {displayData.map((d, i) => (
                <td key={i} className={`px-4 py-2 text-right ${d.netIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(d.netIncome)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Net Margin</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatPercent(d.netMargin)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? 'Year 1' : years[selectedYear]} Revenue
          </p>
          <p className="text-xl font-bold">
            {formatCurrency(timePeriod === 'yearly' ? yearlyData[0]?.netRevenue || 0 : yearlyData[selectedYear]?.netRevenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? `Year ${corporate.projectionYears}` : years[selectedYear]} EBITDA
          </p>
          <p className={`text-xl font-bold ${(timePeriod === 'yearly' ? yearlyData[yearlyData.length - 1]?.ebitda : yearlyData[selectedYear]?.ebitda || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(timePeriod === 'yearly' ? yearlyData[yearlyData.length - 1]?.ebitda || 0 : yearlyData[selectedYear]?.ebitda || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? 'Year 1' : years[selectedYear]} Net Income
          </p>
          <p className={`text-xl font-bold ${(timePeriod === 'yearly' ? yearlyData[0]?.netIncome : yearlyData[selectedYear]?.netIncome || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(timePeriod === 'yearly' ? yearlyData[0]?.netIncome || 0 : yearlyData[selectedYear]?.netIncome || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Cumulative Net Income</p>
          <p className={`text-xl font-bold ${yearlyData.reduce((s, d) => s + d.netIncome, 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(yearlyData.reduce((s, d) => s + d.netIncome, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
