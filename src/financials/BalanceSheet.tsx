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

type TimePeriod = 'yearly' | 'quarterly' | 'monthly';

interface BalanceData {
  label: string;
  cash: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  ppe: number;
  accumulatedDepreciation: number;
  netPPE: number;
  totalAssets: number;
  accountsPayable: number;
  accruedExpenses: number;
  totalCurrentLiabilities: number;
  totalLiabilities: number;
  commonStock: number;
  retainedEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export function BalanceSheet() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly');
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

  const displayData: BalanceData[] = useMemo(() => {
    if (timePeriod === 'yearly') {
      return balanceSheets.map((d) => ({
        label: String(d.year),
        ...d,
      }));
    }

    const yearData = balanceSheets[selectedYear];
    const prevYearData = selectedYear > 0 ? balanceSheets[selectedYear - 1] : null;
    if (!yearData) return [];

    const periods = timePeriod === 'quarterly' ? 4 : 12;
    const periodLabels = timePeriod === 'quarterly'
      ? ['Q1', 'Q2', 'Q3', 'Q4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Progressive buildup through the year
    const startRetainedEarnings = prevYearData ? prevYearData.retainedEarnings : 0;
    const yearNetIncome = yearData.retainedEarnings - startRetainedEarnings;
    const startPPE = prevYearData ? prevYearData.ppe : 0;
    const yearPPE = yearData.ppe - startPPE;
    const startDepreciation = prevYearData ? prevYearData.accumulatedDepreciation : 0;
    const yearDepreciation = yearData.accumulatedDepreciation - startDepreciation;

    return periodLabels.map((label, i) => {
      const progress = (i + 1) / periods;
      
      const retainedEarnings = startRetainedEarnings + (yearNetIncome * progress);
      const ppe = startPPE + (yearPPE * progress);
      const accumulatedDepreciation = startDepreciation + (yearDepreciation * progress);
      
      // Assets scale with progress through year
      const cash = yearData.cash * (0.7 + 0.3 * progress);
      const accountsReceivable = yearData.accountsReceivable * progress;
      const inventory = yearData.inventory * (0.8 + 0.2 * progress);
      const totalCurrentAssets = cash + accountsReceivable + inventory;
      const netPPE = ppe - accumulatedDepreciation;
      const totalAssets = totalCurrentAssets + netPPE;

      // Liabilities
      const accountsPayable = yearData.accountsPayable * progress;
      const accruedExpenses = yearData.accruedExpenses * (0.5 + 0.5 * progress);
      const totalCurrentLiabilities = accountsPayable + accruedExpenses;
      const totalLiabilities = totalCurrentLiabilities;

      // Equity
      const commonStock = yearData.commonStock;
      const totalEquity = commonStock + retainedEarnings;

      return {
        label,
        cash,
        accountsReceivable,
        inventory,
        totalCurrentAssets,
        ppe,
        accumulatedDepreciation,
        netPPE,
        totalAssets,
        accountsPayable,
        accruedExpenses,
        totalCurrentLiabilities,
        totalLiabilities,
        commonStock,
        retainedEarnings,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      };
    });
  }, [balanceSheets, selectedYear, timePeriod]);

  // Use the last period's data for the detail cards
  const currentData = displayData[displayData.length - 1] || balanceSheets[selectedYear];
  const balanceCheck = currentData ? Math.abs(currentData.totalAssets - currentData.totalLiabilitiesAndEquity) < 1 : true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Balance Sheet</h2>
          <p className="text-sm text-gray-500">Assets = Liabilities + Equity</p>
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

      <div className={`rounded-lg p-3 ${balanceCheck ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-sm font-medium ${balanceCheck ? 'text-green-700' : 'text-red-700'}`}>
          {balanceCheck ? '✓ Balance Sheet Balances' : '⚠ Balance Sheet Does NOT Balance'}
        </p>
      </div>

      {/* Table View */}
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
            {/* Assets Section */}
            <tr className="bg-blue-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-blue-800">Assets</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Cash</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.cash)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Accounts Receivable</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.accountsReceivable)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Inventory</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.inventory)}</td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Total Current Assets</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.totalCurrentAssets)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Net PP&E</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.netPPE)}</td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-blue-100">
              <td className="px-4 py-2 sticky left-0 bg-blue-100">Total Assets</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.totalAssets)}</td>
              ))}
            </tr>

            {/* Liabilities Section */}
            <tr className="bg-red-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-red-800">Liabilities</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Accounts Payable</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.accountsPayable)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Accrued Expenses</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.accruedExpenses)}</td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-red-100">
              <td className="px-4 py-2 sticky left-0 bg-red-100">Total Liabilities</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.totalLiabilities)}</td>
              ))}
            </tr>

            {/* Equity Section */}
            <tr className="bg-green-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-green-800">Equity</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Common Stock</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.commonStock)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Retained Earnings</td>
              {displayData.map((d, i) => (
                <td key={i} className={`px-4 py-2 text-right ${d.retainedEarnings < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(d.retainedEarnings)}
                </td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-green-100">
              <td className="px-4 py-2 sticky left-0 bg-green-100">Total Equity</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.totalEquity)}</td>
              ))}
            </tr>

            {/* Total L+E */}
            <tr className="border-t-2 font-bold bg-gray-100">
              <td className="px-4 py-2 sticky left-0 bg-gray-100">Total L + E</td>
              {displayData.map((d, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(d.totalLiabilitiesAndEquity)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-xl font-bold">{formatCurrency(currentData?.totalAssets || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Liabilities</p>
          <p className="text-xl font-bold">{formatCurrency(currentData?.totalLiabilities || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Equity</p>
          <p className={`text-xl font-bold ${(currentData?.totalEquity || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(currentData?.totalEquity || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Cash Position</p>
          <p className="text-xl font-bold">{formatCurrency(currentData?.cash || 0)}</p>
        </div>
      </div>
    </div>
  );
}
