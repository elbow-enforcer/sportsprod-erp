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

export function IncomeStatement() {
  const [timeFrame, setTimeFrame] = useState<'yearly' | 'quarterly' | 'monthly'>('yearly');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Income Statement</h2>
          <p className="text-sm text-gray-500">Profit & Loss Statement</p>
        </div>
        <div className="flex gap-2">
          {(['yearly', 'quarterly', 'monthly'] as const).map((tf) => (
            <button key={tf} onClick={() => setTimeFrame(tf)} className={`px-3 py-1.5 text-sm rounded-lg ${timeFrame === tf ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50">Line Item</th>
              {years.map((year) => (<th key={year} className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[100px]">{year}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">Net Revenue</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(d.netRevenue)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">COGS</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.totalCOGS)})</td>))}</tr>
            <tr className="border-t font-semibold bg-gray-50"><td className="px-4 py-2 sticky left-0 bg-gray-50">Gross Profit</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(d.grossProfit)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white pl-6">Marketing</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.marketingExpense)})</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white pl-6">G&A</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.gnaExpense)})</td>))}</tr>
            <tr className="border-t font-semibold bg-gray-50"><td className="px-4 py-2 sticky left-0 bg-gray-50">EBITDA</td>{yearlyData.map((d, i) => (<td key={i} className={`px-4 py-2 text-right ${d.ebitda < 0 ? 'text-red-600' : ''}`}>{formatCurrency(d.ebitda)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">EBITDA Margin</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right">{formatPercent(d.ebitdaMargin)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">D&A</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.depreciation)})</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">Taxes</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">({formatCurrency(d.taxes)})</td>))}</tr>
            <tr className="border-t font-bold bg-blue-50"><td className="px-4 py-2 sticky left-0 bg-blue-50">Net Income</td>{yearlyData.map((d, i) => (<td key={i} className={`px-4 py-2 text-right ${d.netIncome < 0 ? 'text-red-600' : ''}`}>{formatCurrency(d.netIncome)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">Net Margin</td>{yearlyData.map((d, i) => (<td key={i} className="px-4 py-2 text-right">{formatPercent(d.netMargin)}</td>))}</tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Year 1 Revenue</p>
          <p className="text-xl font-bold">{formatCurrency(yearlyData[0]?.netRevenue || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Year {corporate.projectionYears} Revenue</p>
          <p className="text-xl font-bold">{formatCurrency(yearlyData[yearlyData.length - 1]?.netRevenue || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Year 1 EBITDA</p>
          <p className={`text-xl font-bold ${(yearlyData[0]?.ebitda || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(yearlyData[0]?.ebitda || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Cumulative Net Income</p>
          <p className={`text-xl font-bold ${yearlyData.reduce((s, d) => s + d.netIncome, 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(yearlyData.reduce((s, d) => s + d.netIncome, 0))}</p>
        </div>
      </div>
    </div>
  );
}
