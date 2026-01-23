/**
 * Cash Flow Statement Page
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

interface CashFlowData {
  label: string;
  netIncome: number;
  depreciation: number;
  changeInAR: number;
  changeInInventory: number;
  changeInAP: number;
  cashFromOperating: number;
  capex: number;
  cashFromInvesting: number;
  cashFromFinancing: number;
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
  freeCashFlow: number;
}

export function CashFlowStatement() {
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

  const displayData: CashFlowData[] = useMemo(() => {
    if (timePeriod === 'yearly') {
      return cashFlows.map((cf) => ({
        label: String(cf.year),
        ...cf,
      }));
    }

    const yearCF = cashFlows[selectedYear];
    const prevYearCF = selectedYear > 0 ? cashFlows[selectedYear - 1] : null;
    if (!yearCF) return [];

    const periods = timePeriod === 'quarterly' ? 4 : 12;
    const periodLabels = timePeriod === 'quarterly'
      ? ['Q1', 'Q2', 'Q3', 'Q4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Seasonal distribution weights
    const weights = timePeriod === 'quarterly'
      ? [0.20, 0.25, 0.30, 0.25]
      : [0.06, 0.07, 0.08, 0.08, 0.09, 0.10, 0.10, 0.10, 0.09, 0.08, 0.08, 0.07];

    let runningCash = prevYearCF ? prevYearCF.endingCash : (capital.initialInvestment + 200000);
    let prevPeriodAR = 0, prevPeriodInventory = 0, prevPeriodAP = 0;

    return periodLabels.map((label, i) => {
      const weight = weights[i];
      
      // Operating activities
      const netIncome = yearCF.netIncome * weight;
      const depreciation = yearCF.depreciation / periods;
      
      // Working capital changes (simplified progressive buildup)
      const yearARChange = yearCF.changeInAR;
      const yearInvChange = yearCF.changeInInventory;
      const yearAPChange = yearCF.changeInAP;
      
      const currentAR = (Math.abs(yearARChange) / periods) * (i + 1);
      const currentInventory = (Math.abs(yearInvChange) / periods) * (i + 1);
      const currentAP = (Math.abs(yearAPChange) / periods) * (i + 1);
      
      const changeInAR = -(currentAR - prevPeriodAR) * Math.sign(yearARChange);
      const changeInInventory = -(currentInventory - prevPeriodInventory) * Math.sign(yearInvChange);
      const changeInAP = (currentAP - prevPeriodAP) * Math.sign(yearAPChange);
      
      prevPeriodAR = currentAR;
      prevPeriodInventory = currentInventory;
      prevPeriodAP = currentAP;
      
      const cashFromOperating = netIncome + depreciation + changeInAR + changeInInventory + changeInAP;
      
      // Investing activities
      const capex = yearCF.capex / periods;
      const cashFromInvesting = capex;
      
      // Financing activities
      const cashFromFinancing = yearCF.cashFromFinancing / periods;
      
      // Cash position
      const netCashChange = cashFromOperating + cashFromInvesting + cashFromFinancing;
      const beginningCash = runningCash;
      const endingCash = beginningCash + netCashChange;
      runningCash = endingCash;
      
      const freeCashFlow = cashFromOperating + capex; // capex is negative

      return {
        label,
        netIncome,
        depreciation,
        changeInAR,
        changeInInventory,
        changeInAP,
        cashFromOperating,
        capex,
        cashFromInvesting,
        cashFromFinancing,
        netCashChange,
        beginningCash,
        endingCash,
        freeCashFlow,
      };
    });
  }, [cashFlows, selectedYear, timePeriod, capital.initialInvestment]);

  // Summary metrics
  const totalFCF = timePeriod === 'yearly' 
    ? cashFlows.reduce((s, cf) => s + cf.freeCashFlow, 0)
    : displayData.reduce((s, cf) => s + cf.freeCashFlow, 0);
  const totalCapex = timePeriod === 'yearly'
    ? cashFlows.reduce((s, cf) => s + cf.capex, 0)
    : displayData.reduce((s, cf) => s + cf.capex, 0);
  const endingCash = displayData[displayData.length - 1]?.endingCash || 0;
  const firstPeriodFCF = displayData[0]?.freeCashFlow || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cash Flow Statement</h2>
          <p className="text-sm text-gray-500">Operating, Investing, and Financing Activities</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? 'Cumulative' : years[selectedYear]} FCF
          </p>
          <p className={`text-xl font-bold ${totalFCF < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(totalFCF)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Ending Cash</p>
          <p className="text-xl font-bold">{formatCurrency(endingCash)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? 'Total' : years[selectedYear]} CapEx
          </p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalCapex)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">
            {timePeriod === 'yearly' ? 'Year 1' : displayData[0]?.label || ''} FCF
          </p>
          <p className={`text-xl font-bold ${firstPeriodFCF < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(firstPeriodFCF)}
          </p>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-gray-50">Line Item</th>
              {displayData.map((cf) => (
                <th key={cf.label} className="px-4 py-3 text-right font-semibold min-w-[100px]">
                  {cf.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Operating Section */}
            <tr className="bg-green-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-green-800">
                Cash from Operations
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Net Income</td>
              {displayData.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.netIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(cf.netIncome)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">+ Depreciation</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.depreciation)}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Δ Working Capital</td>
              {displayData.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${(cf.changeInAR + cf.changeInInventory + cf.changeInAP) < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(cf.changeInAR + cf.changeInInventory + cf.changeInAP)}
                </td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Ops</td>
              {displayData.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.cashFromOperating < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(cf.cashFromOperating)}
                </td>
              ))}
            </tr>

            {/* Investing Section */}
            <tr className="bg-yellow-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-yellow-800">
                Cash from Investing
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">CapEx</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">{formatCurrency(cf.capex)}</td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Investing</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right text-red-600">{formatCurrency(cf.cashFromInvesting)}</td>
              ))}
            </tr>

            {/* Financing Section */}
            <tr className="bg-purple-50">
              <td colSpan={displayData.length + 1} className="px-4 py-2 font-semibold text-purple-800">
                Cash from Financing
              </td>
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Financing</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.cashFromFinancing)}</td>
              ))}
            </tr>

            {/* Summary */}
            <tr className="h-4" />
            <tr className="border-t font-bold bg-blue-50">
              <td className="px-4 py-2 sticky left-0 bg-blue-50">Net Change in Cash</td>
              {displayData.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.netCashChange < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(cf.netCashChange)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Beginning Cash</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.beginningCash)}</td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-blue-50">
              <td className="px-4 py-2 sticky left-0 bg-blue-50">Ending Cash</td>
              {displayData.map((cf, i) => (
                <td key={i} className="px-4 py-2 text-right">{formatCurrency(cf.endingCash)}</td>
              ))}
            </tr>
            <tr className="h-4" />
            <tr className="border-t-2 font-bold bg-green-100">
              <td className="px-4 py-2 sticky left-0 bg-green-100">Free Cash Flow</td>
              {displayData.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.freeCashFlow < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {formatCurrency(cf.freeCashFlow)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
