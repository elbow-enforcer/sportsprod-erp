/**
 * Cash Flow Statement Page
 */
import { useMemo } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { getAnnualProjections } from '../models/adoption';

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export function CashFlowStatement() {
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const capital = useAssumptionsStore((s) => s.capital);
  const corporate = useAssumptionsStore((s) => s.corporate);

  const baseYear = 2025;
  const years = Array.from({ length: corporate.projectionYears }, (_, i) => baseYear + i);

  const cashFlows = useMemo(() => {
    const units = getAnnualProjections('base', baseYear, corporate.projectionYears);
    let prevAR = 0, prevInventory = 0, prevAP = 0, runningCash = capital.initialInvestment + 200000;
    return years.map((year, i) => {
      const yearUnits = units[i] || 0;
      const priceThisYear = revenue.pricePerUnit * Math.pow(1 + revenue.annualPriceIncrease, i);
      const netRevenue = yearUnits * priceThisYear * (1 - revenue.discountRate);
      const unitCostThisYear = cogs.unitCost * Math.pow(1 - cogs.costReductionPerYear, i);
      const totalCOGS = yearUnits * (unitCostThisYear + cogs.shippingPerUnit);
      const grossProfit = netRevenue - totalCOGS;
      const marketingExpense = Math.max(marketing.baseBudget, netRevenue * marketing.percentOfRevenue);
      const headcount = Math.max(gna.baseHeadcount, Math.ceil(yearUnits / 2000));
      const salaryThisYear = gna.avgSalary * Math.pow(1 + gna.salaryGrowthRate, i);
      const gnaExpense = (headcount * salaryThisYear * gna.benefitsMultiplier) + gna.officeAndOps + (gna.insurance || 10000);
      const ebitda = grossProfit - marketingExpense - gnaExpense;
      const depreciation = 10000 * (i + 1);
      const taxes = ebitda - depreciation > 0 ? (ebitda - depreciation) * corporate.taxRate : 0;
      const netIncome = ebitda - depreciation - taxes;
      const dailyRevenue = netRevenue / 365, dailyCOGS = totalCOGS / 365;
      const currentAR = dailyRevenue * 30, currentInventory = dailyCOGS * 45, currentAP = dailyCOGS * 30;
      const changeInAR = -(currentAR - prevAR), changeInInventory = -(currentInventory - prevInventory), changeInAP = currentAP - prevAP;
      prevAR = currentAR; prevInventory = currentInventory; prevAP = currentAP;
      const cashFromOperating = netIncome + depreciation + changeInAR + changeInInventory + changeInAP;
      const capex = capital.capexYear1 * Math.pow(1 + capital.capexGrowthRate, i);
      const cashFromInvesting = -capex;
      const cashFromFinancing = 0;
      const netCashChange = cashFromOperating + cashFromInvesting + cashFromFinancing;
      const beginningCash = runningCash;
      const endingCash = beginningCash + netCashChange;
      runningCash = endingCash;
      const freeCashFlow = cashFromOperating - capex;
      return { year, netIncome, depreciation, changeInAR, changeInInventory, changeInAP, cashFromOperating, capex: -capex, cashFromInvesting, cashFromFinancing, netCashChange, beginningCash, endingCash, freeCashFlow };
    });
  }, [revenue, cogs, marketing, gna, capital, corporate, years]);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900">Cash Flow Statement</h2><p className="text-sm text-gray-500">Operating, Investing, and Financing Activities</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4"><p className="text-sm text-gray-500">Cumulative FCF</p><p className={`text-xl font-bold ${cashFlows.reduce((s, cf) => s + cf.freeCashFlow, 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(cashFlows.reduce((s, cf) => s + cf.freeCashFlow, 0))}</p></div>
        <div className="bg-white rounded-lg shadow-sm border p-4"><p className="text-sm text-gray-500">Year {corporate.projectionYears} Cash</p><p className="text-xl font-bold">{formatCurrency(cashFlows[cashFlows.length - 1]?.endingCash || 0)}</p></div>
        <div className="bg-white rounded-lg shadow-sm border p-4"><p className="text-sm text-gray-500">Total CapEx</p><p className="text-xl font-bold text-red-600">{formatCurrency(cashFlows.reduce((s, cf) => s + cf.capex, 0))}</p></div>
        <div className="bg-white rounded-lg shadow-sm border p-4"><p className="text-sm text-gray-500">Year 1 FCF</p><p className={`text-xl font-bold ${(cashFlows[0]?.freeCashFlow || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(cashFlows[0]?.freeCashFlow || 0)}</p></div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-semibold sticky left-0 bg-gray-50">Line Item</th>{years.map((year) => (<th key={year} className="px-4 py-3 text-right font-semibold min-w-[100px]">{year}</th>))}</tr></thead>
          <tbody>
            <tr className="bg-green-50"><td colSpan={years.length + 1} className="px-4 py-2 font-semibold text-green-800">Cash from Operations</td></tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">Net Income</td>{cashFlows.map((cf, i) => (<td key={i} className={`px-4 py-2 text-right ${cf.netIncome < 0 ? 'text-red-600' : ''}`}>{formatCurrency(cf.netIncome)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white pl-6">+ Depreciation</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.depreciation)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white pl-6">Δ Working Capital</td>{cashFlows.map((cf, i) => (<td key={i} className={`px-4 py-2 text-right ${(cf.changeInAR + cf.changeInInventory + cf.changeInAP) < 0 ? 'text-red-600' : ''}`}>{formatCurrency(cf.changeInAR + cf.changeInInventory + cf.changeInAP)}</td>))}</tr>
            <tr className="border-t font-semibold bg-gray-50"><td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Ops</td>{cashFlows.map((cf, i) => (<td key={i} className={`px-4 py-2 text-right ${cf.cashFromOperating < 0 ? 'text-red-600' : ''}`}>{formatCurrency(cf.cashFromOperating)}</td>))}</tr>
            <tr className="bg-yellow-50"><td colSpan={years.length + 1} className="px-4 py-2 font-semibold text-yellow-800">Cash from Investing</td></tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white pl-6">CapEx</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">{formatCurrency(cf.capex)}</td>))}</tr>
            <tr className="border-t font-semibold bg-gray-50"><td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Investing</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right text-red-600">{formatCurrency(cf.cashFromInvesting)}</td>))}</tr>
            <tr className="bg-purple-50"><td colSpan={years.length + 1} className="px-4 py-2 font-semibold text-purple-800">Cash from Financing</td></tr>
            <tr className="border-t font-semibold bg-gray-50"><td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Financing</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.cashFromFinancing)}</td>))}</tr>
            <tr className="h-4" />
            <tr className="border-t font-bold bg-blue-50"><td className="px-4 py-2 sticky left-0 bg-blue-50">Net Change in Cash</td>{cashFlows.map((cf, i) => (<td key={i} className={`px-4 py-2 text-right ${cf.netCashChange < 0 ? 'text-red-600' : ''}`}>{formatCurrency(cf.netCashChange)}</td>))}</tr>
            <tr className="border-t"><td className="px-4 py-2 sticky left-0 bg-white">Beginning Cash</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.beginningCash)}</td>))}</tr>
            <tr className="border-t font-bold bg-blue-50"><td className="px-4 py-2 sticky left-0 bg-blue-50">Ending Cash</td>{cashFlows.map((cf, i) => (<td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.endingCash)}</td>))}</tr>
            <tr className="h-4" />
            <tr className="border-t-2 font-bold bg-green-100"><td className="px-4 py-2 sticky left-0 bg-green-100">Free Cash Flow</td>{cashFlows.map((cf, i) => (<td key={i} className={`px-4 py-2 text-right ${cf.freeCashFlow < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatCurrency(cf.freeCashFlow)}</td>))}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
