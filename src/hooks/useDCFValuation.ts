/**
 * Hook to calculate DCF valuation from current assumptions
 */

import { useMemo } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { useScenarioStore } from '../stores/scenarioStore';
import { getAnnualProjections } from '../models/adoption';
import {
  calculateFCF,
  calculateNPV,
  calculateTerminalValue,
} from '../models/dcf';

export interface DCFValuationResult {
  enterpriseValue: number;
  pvOfCashFlows: number;
  pvOfTerminalValue: number;
  terminalValue: number;
  finalYearRevenue: number;
  finalYearEBITDA: number;
  finalYearFCF: number;
  exitYear: number;
  exitDate: string;
  yearlyData: Array<{
    year: number;
    revenue: number;
    ebitda: number;
    fcf: number;
  }>;
}

export function useDCFValuation(): DCFValuationResult {
  const { selectedScenarioId } = useScenarioStore();
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const capital = useAssumptionsStore((s) => s.capital);
  const corporate = useAssumptionsStore((s) => s.corporate);
  const exit = useAssumptionsStore((s) => s.exit);

  return useMemo(() => {
    const baseYear = 2025;
    const projectionYears = corporate.projectionYears;
    
    // Get unit projections
    const units = getAnnualProjections(selectedScenarioId, baseYear, projectionYears);
    
    // Calculate yearly financials
    const yearlyData: DCFValuationResult['yearlyData'] = [];
    let cumulativePV = 0;
    
    for (let i = 0; i < projectionYears; i++) {
      const year = baseYear + i;
      const yearUnits = units[i] || 0;
      
      // Revenue
      const priceThisYear = revenue.pricePerUnit * Math.pow(1 + revenue.annualPriceIncrease, i);
      const grossRevenue = yearUnits * priceThisYear;
      const netRevenue = grossRevenue * (1 - revenue.discountRate);
      
      // COGS
      const unitCostThisYear = cogs.unitCost * Math.pow(1 - cogs.costReductionPerYear, i);
      const totalCOGS = yearUnits * (unitCostThisYear + cogs.shippingPerUnit);
      
      // Gross Profit
      const grossProfit = netRevenue - totalCOGS;
      
      // Operating Expenses
      const marketingExpense = Math.max(
        marketing.baseBudget,
        netRevenue * marketing.percentOfRevenue
      );
      
      const headcount = Math.max(gna.baseHeadcount, Math.ceil(yearUnits / 2000));
      const salaryThisYear = gna.avgSalary * Math.pow(1 + gna.salaryGrowthRate, i);
      const gnaExpense = (headcount * salaryThisYear * gna.benefitsMultiplier) + 
                         gna.officeAndOps + 
                         (gna.insurance || 10000);
      
      // EBITDA
      const ebitda = grossProfit - marketingExpense - gnaExpense;
      
      // Taxes (simplified - only if profitable)
      const taxes = ebitda > 0 ? ebitda * corporate.taxRate : 0;
      
      // Working capital change
      const wcThisYear = netRevenue * capital.workingCapitalPercent;
      const wcLastYear = i === 0 ? 0 : (yearlyData[i - 1].revenue * capital.workingCapitalPercent);
      const wcChange = wcThisYear - wcLastYear;
      
      // CapEx
      const capex = capital.capexYear1 * Math.pow(1 + capital.capexGrowthRate, i);
      
      // Free Cash Flow
      const fcf = ebitda - taxes - wcChange - capex;
      
      // Present Value
      const discountFactor = Math.pow(1 + corporate.discountRate, i + 1);
      const pv = fcf / discountFactor;
      cumulativePV += pv;
      
      yearlyData.push({
        year,
        revenue: netRevenue,
        ebitda,
        fcf,
      });
    }
    
    // Terminal Value
    const finalYearData = yearlyData[yearlyData.length - 1];
    let terminalValue: number;
    
    if (exit.method === 'exitMultiple') {
      // Exit multiple method
      if (exit.useEbitdaMultiple) {
        terminalValue = finalYearData.ebitda * exit.exitEbitdaMultiple;
      } else {
        terminalValue = finalYearData.revenue * exit.exitRevenueMultiple;
      }
    } else {
      // Gordon Growth Model
      const terminalFCF = finalYearData.fcf * (1 + corporate.terminalGrowthRate);
      terminalValue = terminalFCF / (corporate.discountRate - corporate.terminalGrowthRate);
    }
    
    // PV of Terminal Value
    const tvDiscountFactor = Math.pow(1 + corporate.discountRate, projectionYears);
    const pvOfTerminalValue = terminalValue / tvDiscountFactor;
    
    // Enterprise Value
    const enterpriseValue = cumulativePV + pvOfTerminalValue;
    
    // Exit date
    const exitYear = baseYear + projectionYears - 1;
    const exitDate = `${exitYear}-12-31`;

    return {
      enterpriseValue,
      pvOfCashFlows: cumulativePV,
      pvOfTerminalValue,
      terminalValue,
      finalYearRevenue: finalYearData.revenue,
      finalYearEBITDA: finalYearData.ebitda,
      finalYearFCF: finalYearData.fcf,
      exitYear,
      exitDate,
      yearlyData,
    };
  }, [
    selectedScenarioId,
    revenue,
    cogs,
    marketing,
    gna,
    capital,
    corporate,
    exit,
  ]);
}
