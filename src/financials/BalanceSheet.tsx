/**
 * Balance Sheet Page
 */
import { useState, useMemo } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { getAnnualProjections } from '../models/adoption';

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export function BalanceSheet() {
  const [selectedYear, setSelectedYear] = useState(0);
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const capital = useAssumptionsStore((s) => s.capital);
  const corporate = useAssumptionsStore((s) => s.corporate);

  const baseYear = 2025;
  const years = Array.from({ length: corporate.projectionYears }, (_, i) => baseYear + i);

  const balanceSheets = useMemo(() => {
    const units = getAnnualProjections('base', baseYear, corporate.projectionYears);
    let cumulativeRetainedEarnings = 0, cumulativePPE = 0, cumulativeDepreciation = 0;
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
      cumulativeRetainedEarnings += netIncome;
      const yearCapex = capital.capexYear1 * Math.pow(1 + capital.capexGrowthRate, i);
      cumulativePPE += yearCapex;
      cumulativeDepreciation += depreciation;
      const dailyRevenue = netRevenue / 365, dailyCOGS = totalCOGS / 365;
      const accountsReceivable = dailyRevenue * 30, inventory = dailyCOGS * 45;
      const accountsPayable = dailyCOGS * 30, accruedExpenses = (marketingExpense + gnaExpense) / 12;
      const workingCapitalNeeded = netRevenue * capital.workingCapitalPercent;
      const cash = Math.max(50000, workingCapitalNeeded * 0.5) + Math.max(0, cumulativeRetainedEarnings - workingCapitalNeeded) + (i === 0 ? capital.initialInvestment : 0);
      const totalCurrentAssets = cash + accountsReceivable + inventory;
      const netPPE = cumulativePPE - cumulativeDepreciation;
      const totalAssets = totalCurrentAssets + netPPE;
      const totalCurrentLiabilities = accountsPayable + accruedExpenses;
      const totalLiabilities = totalCurrentLiabilities;
      const commonStock = capital.initialInvestment + 200000;
      const totalEquity = commonStock + cumulativeRetainedEarnings;
      return { year, cash, accountsReceivable, inventory, totalCurrentAssets, ppe: cumulativePPE, accumulatedDepreciation: cumulativeDepreciation, netPPE, totalAssets, accountsPayable, accruedExpenses, totalCurrentLiabilities, totalLiabilities, commonStock, retainedEarnings: cumulativeRetainedEarnings, totalEquity, totalLiabilitiesAndEquity: totalLiabilities + totalEquity };
    });
  }, [revenue, cogs, marketing, gna, capital, corporate, years]);

  const data = balanceSheets[selectedYear];
  const balanceCheck = Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Balance Sheet</h2><p className="text-sm text-gray-500">Assets = Liabilities + Equity</p></div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-3 py-1.5 border rounded-lg text-sm">
            {years.map((year, i) => (<option key={year} value={i}>{year}</option>))}
          </select>
        </div>
      </div>
      <div className={`rounded-lg p-3 ${balanceCheck ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-sm font-medium ${balanceCheck ? 'text-green-700' : 'text-red-700'}`}>{balanceCheck ? '✓ Balance Sheet Balances' : '⚠ Balance Sheet Does NOT Balance'}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 bg-blue-50 border-b"><h3 className="font-semibold text-blue-800">Assets</h3></div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Cash</span><span className="font-medium">{formatCurrency(data.cash)}</span></div>
            <div className="flex justify-between text-sm"><span>Accounts Receivable</span><span className="font-medium">{formatCurrency(data.accountsReceivable)}</span></div>
            <div className="flex justify-between text-sm"><span>Inventory</span><span className="font-medium">{formatCurrency(data.inventory)}</span></div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2"><span>Total Current</span><span>{formatCurrency(data.totalCurrentAssets)}</span></div>
            <div className="flex justify-between text-sm pt-2"><span>Net PP&E</span><span className="font-medium">{formatCurrency(data.netPPE)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-3 bg-blue-50 -mx-4 px-4 py-2"><span>Total Assets</span><span>{formatCurrency(data.totalAssets)}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 bg-red-50 border-b"><h3 className="font-semibold text-red-800">Liabilities</h3></div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Accounts Payable</span><span className="font-medium">{formatCurrency(data.accountsPayable)}</span></div>
            <div className="flex justify-between text-sm"><span>Accrued Expenses</span><span className="font-medium">{formatCurrency(data.accruedExpenses)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-3 bg-red-50 -mx-4 px-4 py-2"><span>Total Liabilities</span><span>{formatCurrency(data.totalLiabilities)}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 bg-green-50 border-b"><h3 className="font-semibold text-green-800">Equity</h3></div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Common Stock</span><span className="font-medium">{formatCurrency(data.commonStock)}</span></div>
            <div className="flex justify-between text-sm"><span>Retained Earnings</span><span className={`font-medium ${data.retainedEarnings < 0 ? 'text-red-600' : ''}`}>{formatCurrency(data.retainedEarnings)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-3 bg-green-50 -mx-4 px-4 py-2"><span>Total Equity</span><span>{formatCurrency(data.totalEquity)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-3"><span>L + E</span><span>{formatCurrency(data.totalLiabilitiesAndEquity)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
