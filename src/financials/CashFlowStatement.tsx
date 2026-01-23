/**
 * Cash Flow Statement Page
 * Includes Year 0 (historical startup costs) and cumulative capital tracking
 */
import { useMemo } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { getAnnualProjections } from '../models/adoption';

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

interface CashFlowYear {
  year: number;
  label: string;
  isYear0: boolean;
  netIncome: number;
  depreciation: number;
  changeInAR: number;
  changeInInventory: number;
  changeInAP: number;
  cashFromOperating: number;
  capex: number;
  cashFromInvesting: number;
  // Financing activities (new for startup capital)
  investorCapital: number;
  cashFromFinancing: number;
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
  freeCashFlow: number;
  // Cumulative tracking
  cumulativeCapitalInvested: number;
  cumulativeFCF: number;
}

export function CashFlowStatement() {
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const capital = useAssumptionsStore((s) => s.capital);
  const corporate = useAssumptionsStore((s) => s.corporate);

  const baseYear = 2025;
  const startupYear = capital.startupYear || 2024;
  
  // Include Year 0 (startup year) plus projection years
  const allYears = [startupYear, ...Array.from({ length: corporate.projectionYears }, (_, i) => baseYear + i)];

  const cashFlows = useMemo(() => {
    const units = getAnnualProjections('base', baseYear, corporate.projectionYears);
    let prevAR = 0, prevInventory = 0, prevAP = 0;
    let runningCash = 0;
    let cumulativeCapital = 0;
    let cumulativeFCF = 0;
    
    const flows: CashFlowYear[] = [];
    
    // Year 0 (Startup Year) - Historical costs
    const year0Capital = capital.investorCapital || 250000;
    const startupExpenses = capital.startupExpenses || 150000;
    const firstMfgOrder = capital.firstManufacturingOrder || 200000;
    const totalYear0Outflow = startupExpenses + firstMfgOrder;
    
    cumulativeCapital = year0Capital;
    const year0CashFromFinancing = year0Capital;
    const year0CashFromInvesting = -totalYear0Outflow;
    const year0NetChange = year0CashFromFinancing + year0CashFromInvesting;
    runningCash = year0NetChange;
    cumulativeFCF = -totalYear0Outflow; // FCF in Year 0 is negative (startup costs)
    
    flows.push({
      year: startupYear,
      label: `${startupYear} (Year 0)`,
      isYear0: true,
      netIncome: 0,
      depreciation: 0,
      changeInAR: 0,
      changeInInventory: -firstMfgOrder, // Initial inventory purchase
      changeInAP: 0,
      cashFromOperating: 0,
      capex: -startupExpenses, // Startup expenses as investing
      cashFromInvesting: year0CashFromInvesting,
      investorCapital: year0Capital,
      cashFromFinancing: year0CashFromFinancing,
      netCashChange: year0NetChange,
      beginningCash: 0,
      endingCash: runningCash,
      freeCashFlow: -totalYear0Outflow,
      cumulativeCapitalInvested: cumulativeCapital,
      cumulativeFCF: cumulativeFCF,
    });
    
    // Projection Years (Year 1+)
    for (let i = 0; i < corporate.projectionYears; i++) {
      const year = baseYear + i;
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
      
      const dailyRevenue = netRevenue / 365;
      const dailyCOGS = totalCOGS / 365;
      const currentAR = dailyRevenue * 30;
      const currentInventory = dailyCOGS * 45;
      const currentAP = dailyCOGS * 30;
      
      const changeInAR = -(currentAR - prevAR);
      const changeInInventory = -(currentInventory - prevInventory);
      const changeInAP = currentAP - prevAP;
      
      prevAR = currentAR;
      prevInventory = currentInventory;
      prevAP = currentAP;
      
      const cashFromOperating = netIncome + depreciation + changeInAR + changeInInventory + changeInAP;
      const capex = capital.capexYear1 * Math.pow(1 + capital.capexGrowthRate, i);
      const cashFromInvesting = -capex;
      const cashFromFinancing = 0;
      const netCashChange = cashFromOperating + cashFromInvesting + cashFromFinancing;
      const beginningCash = runningCash;
      const endingCash = beginningCash + netCashChange;
      runningCash = endingCash;
      const freeCashFlow = cashFromOperating - capex;
      cumulativeFCF += freeCashFlow;
      
      flows.push({
        year,
        label: `${year}`,
        isYear0: false,
        netIncome,
        depreciation,
        changeInAR,
        changeInInventory,
        changeInAP,
        cashFromOperating,
        capex: -capex,
        cashFromInvesting,
        investorCapital: 0,
        cashFromFinancing,
        netCashChange,
        beginningCash,
        endingCash,
        freeCashFlow,
        cumulativeCapitalInvested: cumulativeCapital,
        cumulativeFCF: cumulativeFCF,
      });
    }
    
    return flows;
  }, [revenue, cogs, marketing, gna, capital, corporate]);

  const projectionCashFlows = cashFlows.filter(cf => !cf.isYear0);
  const totalCapitalInvested = cashFlows[0]?.cumulativeCapitalInvested || 0;
  const totalStartupCosts = (capital.startupExpenses || 150000) + (capital.firstManufacturingOrder || 200000);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Cash Flow Statement</h2>
        <p className="text-sm text-gray-500">Operating, Investing, and Financing Activities (Including Year 0 Startup)</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Capital Invested</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(totalCapitalInvested)}</p>
          <p className="text-xs text-gray-400">Investor funding</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Startup Costs (Year 0)</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(-totalStartupCosts)}</p>
          <p className="text-xs text-gray-400">Pre-revenue expenses</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Cumulative FCF</p>
          <p className={`text-xl font-bold ${cashFlows[cashFlows.length - 1]?.cumulativeFCF < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(cashFlows[cashFlows.length - 1]?.cumulativeFCF || 0)}
          </p>
          <p className="text-xs text-gray-400">Includes Year 0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Year {corporate.projectionYears} Cash</p>
          <p className="text-xl font-bold">{formatCurrency(cashFlows[cashFlows.length - 1]?.endingCash || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Year 1 FCF</p>
          <p className={`text-xl font-bold ${(projectionCashFlows[0]?.freeCashFlow || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(projectionCashFlows[0]?.freeCashFlow || 0)}
          </p>
        </div>
      </div>

      {/* Year 0 Breakdown Card */}
      <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-900 mb-3">Year 0 ({startupYear}) - Pre-Revenue Startup Period</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-purple-700">Investor Capital</p>
            <p className="font-semibold text-purple-900">{formatCurrency(capital.investorCapital || 250000)}</p>
          </div>
          <div>
            <p className="text-purple-700">Startup Expenses</p>
            <p className="font-semibold text-red-700">{formatCurrency(-(capital.startupExpenses || 150000))}</p>
          </div>
          <div>
            <p className="text-purple-700">First Mfg Order</p>
            <p className="font-semibold text-red-700">{formatCurrency(-(capital.firstManufacturingOrder || 200000))}</p>
          </div>
          <div>
            <p className="text-purple-700">Net Cash Position</p>
            <p className={`font-semibold ${cashFlows[0]?.endingCash >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(cashFlows[0]?.endingCash || 0)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Cash Flow Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-gray-50">Line Item</th>
              {cashFlows.map((cf) => (
                <th 
                  key={cf.year} 
                  className={`px-4 py-3 text-right font-semibold min-w-[100px] ${cf.isYear0 ? 'bg-purple-100' : ''}`}
                >
                  {cf.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Financing Section (moved up to show capital first) */}
            <tr className="bg-purple-50">
              <td colSpan={cashFlows.length + 1} className="px-4 py-2 font-semibold text-purple-800">
                Cash from Financing
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Investor Capital</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''} ${cf.investorCapital > 0 ? 'text-green-600 font-semibold' : ''}`}>
                  {cf.investorCapital > 0 ? formatCurrency(cf.investorCapital) : '—'}
                </td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Financing</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''} ${cf.cashFromFinancing > 0 ? 'text-green-600' : ''}`}>
                  {formatCurrency(cf.cashFromFinancing)}
                </td>
              ))}
            </tr>
            
            {/* Operating Section */}
            <tr className="bg-green-50">
              <td colSpan={cashFlows.length + 1} className="px-4 py-2 font-semibold text-green-800">
                Cash from Operations
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Net Income</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''} ${cf.netIncome < 0 ? 'text-red-600' : ''}`}>
                  {cf.isYear0 ? '—' : formatCurrency(cf.netIncome)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">+ Depreciation</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''}`}>
                  {cf.isYear0 ? '—' : formatCurrency(cf.depreciation)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Δ Working Capital</td>
              {cashFlows.map((cf, i) => {
                const wcChange = cf.changeInAR + cf.changeInInventory + cf.changeInAP;
                return (
                  <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''} ${wcChange < 0 ? 'text-red-600' : ''}`}>
                    {cf.isYear0 ? '—' : formatCurrency(wcChange)}
                  </td>
                );
              })}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Ops</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''} ${cf.cashFromOperating < 0 ? 'text-red-600' : ''}`}>
                  {cf.isYear0 ? '—' : formatCurrency(cf.cashFromOperating)}
                </td>
              ))}
            </tr>
            
            {/* Investing Section */}
            <tr className="bg-yellow-50">
              <td colSpan={cashFlows.length + 1} className="px-4 py-2 font-semibold text-yellow-800">
                Cash from Investing
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Startup Expenses</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50 text-red-600' : ''}`}>
                  {cf.isYear0 ? formatCurrency(cf.capex) : '—'}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">Initial Inventory</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50 text-red-600' : ''}`}>
                  {cf.isYear0 ? formatCurrency(cf.changeInInventory) : '—'}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white pl-6">CapEx</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''} text-red-600`}>
                  {cf.isYear0 ? '—' : formatCurrency(cf.capex)}
                </td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-50">
              <td className="px-4 py-2 sticky left-0 bg-gray-50">Net Cash from Investing</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right text-red-600 ${cf.isYear0 ? 'bg-purple-100' : ''}`}>
                  {formatCurrency(cf.cashFromInvesting)}
                </td>
              ))}
            </tr>
            
            <tr className="h-4" />
            
            {/* Summary Section */}
            <tr className="border-t font-bold bg-blue-50">
              <td className="px-4 py-2 sticky left-0 bg-blue-50">Net Change in Cash</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''} ${cf.netCashChange < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(cf.netCashChange)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2 sticky left-0 bg-white">Beginning Cash</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-50' : ''}`}>
                  {formatCurrency(cf.beginningCash)}
                </td>
              ))}
            </tr>
            <tr className="border-t font-bold bg-blue-50">
              <td className="px-4 py-2 sticky left-0 bg-blue-50">Ending Cash</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''}`}>
                  {formatCurrency(cf.endingCash)}
                </td>
              ))}
            </tr>
            
            <tr className="h-4" />
            
            {/* FCF and Cumulative Tracking */}
            <tr className="border-t-2 font-bold bg-green-100">
              <td className="px-4 py-2 sticky left-0 bg-green-100">Free Cash Flow</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''} ${cf.freeCashFlow < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {formatCurrency(cf.freeCashFlow)}
                </td>
              ))}
            </tr>
            <tr className="border-t font-semibold bg-gray-100">
              <td className="px-4 py-2 sticky left-0 bg-gray-100">Cumulative FCF</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right ${cf.isYear0 ? 'bg-purple-100' : ''} ${cf.cumulativeFCF < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {formatCurrency(cf.cumulativeFCF)}
                </td>
              ))}
            </tr>
            <tr className="border-t bg-purple-50">
              <td className="px-4 py-2 sticky left-0 bg-purple-50 font-semibold text-purple-800">Cumulative Capital Invested</td>
              {cashFlows.map((cf, i) => (
                <td key={i} className={`px-4 py-2 text-right font-semibold text-purple-700 ${cf.isYear0 ? 'bg-purple-100' : ''}`}>
                  {formatCurrency(cf.cumulativeCapitalInvested)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
