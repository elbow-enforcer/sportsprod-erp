/**
 * Deposit Impact Calculator
 * 
 * Functions for calculating how pre-order deposits affect capital needs,
 * cash flow timing, and overall financial position.
 */

import type {
  DepositImpactInput,
  DepositImpactResult,
  MonthlyCashFlow,
  DepositSensitivityRow,
  DepositSensitivityTable,
} from './types';
import { DEFAULT_DEPOSIT_AMOUNTS } from './types';

/**
 * Generate month label from month number
 */
export function getMonthLabel(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = Math.ceil(month / 12);
  const monthIndex = ((month - 1) % 12);
  return `${months[monthIndex]} Y${year}`;
}

/**
 * Distribute a total quantity evenly across months
 */
export function distributeEvenly(total: number, months: number): number[] {
  if (months <= 0) return [];
  const perMonth = Math.floor(total / months);
  const remainder = total % months;
  
  return Array.from({ length: months }, (_, i) => 
    perMonth + (i < remainder ? 1 : 0)
  );
}

/**
 * Calculate deposit impact on capital needs
 */
export function calculateDepositImpact(
  input: DepositImpactInput
): DepositImpactResult {
  const {
    depositAmount,
    conversionRate,
    preOrderCount,
    preOrderStartMonth,
    preOrderDurationMonths,
    productionStartMonth,
    fulfillmentStartMonth,
    fulfillmentDurationMonths,
    unitProductionCost,
    fulfillmentCostPerUnit,
    fullPrice,
  } = input;

  // Calculate timeline span (add buffer for completion)
  const endMonth = Math.max(
    preOrderStartMonth + preOrderDurationMonths,
    fulfillmentStartMonth + fulfillmentDurationMonths
  ) + 2;
  
  // Pre-calculate quantities
  const convertedOrders = Math.round(preOrderCount * conversionRate);
  const cancelledOrders = preOrderCount - convertedOrders;
  const balancePerUnit = fullPrice - depositAmount;
  
  // Distribute pre-orders across collection period
  const preOrdersPerMonth = distributeEvenly(preOrderCount, preOrderDurationMonths);
  
  // Distribute production across period before fulfillment
  const productionMonths = Math.max(1, fulfillmentStartMonth - productionStartMonth);
  const productionPerMonth = distributeEvenly(convertedOrders, productionMonths);
  
  // Distribute fulfillment/delivery
  const deliveryPerMonth = distributeEvenly(convertedOrders, fulfillmentDurationMonths);
  
  // Calculate refund timing (happens at fulfillment start - when we'd know about cancellations)
  const refundMonth = fulfillmentStartMonth;
  const totalRefunds = cancelledOrders * depositAmount;
  
  // Build cash flow timeline
  const timeline: MonthlyCashFlow[] = [];
  let cumulativeCash = 0;
  let cumulativePreOrders = 0;
  let depositsHeld = 0;
  let totalDepositsCollected = 0;
  let cumulativeProduced = 0;
  let cumulativeDelivered = 0;

  for (let month = 1; month <= endMonth; month++) {
    // Calculate inflows
    const isPreOrderMonth = month >= preOrderStartMonth && 
                            month < preOrderStartMonth + preOrderDurationMonths;
    const preOrderIdx = month - preOrderStartMonth;
    const preOrdersThisMonth = isPreOrderMonth && preOrderIdx >= 0 && preOrderIdx < preOrdersPerMonth.length
      ? preOrdersPerMonth[preOrderIdx]
      : 0;
    
    const depositsReceived = preOrdersThisMonth * depositAmount;
    totalDepositsCollected += depositsReceived;
    cumulativePreOrders += preOrdersThisMonth;
    
    // Balance payments come at fulfillment/delivery
    const isFulfillmentMonth = month >= fulfillmentStartMonth && 
                               month < fulfillmentStartMonth + fulfillmentDurationMonths;
    const fulfillIdx = month - fulfillmentStartMonth;
    const unitsDelivered = isFulfillmentMonth && fulfillIdx >= 0 && fulfillIdx < deliveryPerMonth.length
      ? deliveryPerMonth[fulfillIdx]
      : 0;
    
    const balancePaymentsReceived = unitsDelivered * balancePerUnit;
    cumulativeDelivered += unitsDelivered;
    
    // Calculate outflows
    const isProductionMonth = month >= productionStartMonth && 
                              month < productionStartMonth + productionMonths;
    const prodIdx = month - productionStartMonth;
    const unitsProduced = isProductionMonth && prodIdx >= 0 && prodIdx < productionPerMonth.length
      ? productionPerMonth[prodIdx]
      : 0;
    
    const productionCosts = unitsProduced * unitProductionCost;
    cumulativeProduced += unitsProduced;
    
    const fulfillmentCosts = unitsDelivered * fulfillmentCostPerUnit;
    
    // Refunds happen at fulfillment start
    const refundsIssued = month === refundMonth ? totalRefunds : 0;
    
    // Update deposits held (liability tracking)
    depositsHeld += depositsReceived;
    if (month >= fulfillmentStartMonth) {
      // Release deposits as orders are fulfilled
      const depositsReleased = unitsDelivered * depositAmount;
      depositsHeld = Math.max(0, depositsHeld - depositsReleased);
    }
    if (month === refundMonth) {
      depositsHeld -= totalRefunds;
    }
    
    // Totals
    const totalInflows = depositsReceived + balancePaymentsReceived;
    const totalOutflows = productionCosts + fulfillmentCosts + refundsIssued;
    const netCashFlow = totalInflows - totalOutflows;
    cumulativeCash += netCashFlow;
    
    timeline.push({
      month,
      monthLabel: getMonthLabel(month),
      depositsReceived,
      balancePaymentsReceived,
      totalInflows,
      productionCosts,
      fulfillmentCosts,
      refundsIssued,
      totalOutflows,
      netCashFlow,
      cumulativeCashFlow: cumulativeCash,
      depositsHeld,
      preOrdersThisMonth,
      cumulativePreOrders,
      unitsProduced,
      unitsDelivered,
    });
  }

  // Calculate summary metrics
  const netDepositsRetained = convertedOrders * depositAmount;
  
  // Find peak capital needs (most negative cumulative cash)
  const minCash = Math.min(...timeline.map(t => t.cumulativeCashFlow));
  const peakCapitalWithDeposits = Math.abs(Math.min(0, minCash));
  const peakNegativeMonth = timeline.find(t => t.cumulativeCashFlow === minCash)?.month ?? 0;
  
  // Calculate capital needed WITHOUT deposits (all expenses, no deposit inflows)
  const totalProductionCost = convertedOrders * unitProductionCost;
  const totalFulfillmentCost = convertedOrders * fulfillmentCostPerUnit;
  const peakCapitalWithoutDeposits = totalProductionCost + totalFulfillmentCost + totalRefunds;
  
  // Capital reduction
  const capitalReduction = peakCapitalWithoutDeposits - peakCapitalWithDeposits;
  const capitalReductionPercent = peakCapitalWithoutDeposits > 0
    ? capitalReduction / peakCapitalWithoutDeposits
    : 0;
  
  // Break-even month (first month cumulative cash goes positive after being negative)
  let breakEvenMonth: number | null = null;
  let wasNegative = false;
  for (const entry of timeline) {
    if (entry.cumulativeCashFlow < 0) {
      wasNegative = true;
    } else if (wasNegative && entry.cumulativeCashFlow >= 0) {
      breakEvenMonth = entry.month;
      break;
    }
  }
  
  const endingCash = timeline[timeline.length - 1]?.cumulativeCashFlow ?? 0;

  return {
    input,
    cashFlowTimeline: timeline,
    totalDepositsCollected,
    totalRefundsIssued: totalRefunds,
    netDepositsRetained,
    peakCapitalWithoutDeposits,
    peakCapitalWithDeposits,
    capitalReduction,
    capitalReductionPercent,
    breakEvenMonth,
    peakNegativeMonth,
    minCumulativeCash: minCash,
    endingCumulativeCash: endingCash,
  };
}

/**
 * Calculate a single sensitivity row
 */
export function calculateSensitivityRow(
  baseInput: DepositImpactInput,
  depositAmount: number
): DepositSensitivityRow {
  const result = calculateDepositImpact({
    ...baseInput,
    depositAmount,
  });
  
  return {
    depositAmount,
    capitalReduction: result.capitalReduction,
    capitalReductionPercent: result.capitalReductionPercent,
    peakCapitalNeeded: result.peakCapitalWithDeposits,
    breakEvenMonth: result.breakEvenMonth,
  };
}

/**
 * Build sensitivity table for different deposit amounts
 */
export function buildDepositSensitivityTable(
  baseInput: DepositImpactInput,
  depositAmounts: number[] = DEFAULT_DEPOSIT_AMOUNTS
): DepositSensitivityTable {
  const rows = depositAmounts.map(amount => 
    calculateSensitivityRow(baseInput, amount)
  );
  
  const baseCase = calculateSensitivityRow(baseInput, baseInput.depositAmount);
  
  return {
    rows,
    baseCase,
    conversionRate: baseInput.conversionRate,
    preOrderCount: baseInput.preOrderCount,
  };
}

/**
 * Calculate deposit impact across multiple pre-order volume scenarios
 */
export function calculateVolumeScenarios(
  baseInput: DepositImpactInput,
  volumes: number[]
): DepositImpactResult[] {
  return volumes.map(volume =>
    calculateDepositImpact({
      ...baseInput,
      preOrderCount: volume,
    })
  );
}

/**
 * Calculate optimal deposit amount that achieves target capital reduction
 */
export function findOptimalDeposit(
  baseInput: DepositImpactInput,
  targetCapitalNeeded: number,
  minDeposit: number = 50,
  maxDeposit: number = 1000
): number {
  let low = minDeposit;
  let high = maxDeposit;
  
  while (high - low > 10) {
    const mid = Math.round((low + high) / 2);
    const result = calculateDepositImpact({
      ...baseInput,
      depositAmount: mid,
    });
    
    if (result.peakCapitalWithDeposits > targetCapitalNeeded) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return high;
}

/**
 * Calculate the deposit amount needed to achieve self-funding (zero external capital)
 */
export function calculateSelfFundingDeposit(
  baseInput: DepositImpactInput
): { depositAmount: number; isPossible: boolean; maxDeposit: number } {
  const maxDeposit = baseInput.fullPrice; // Can't collect more than full price
  
  // Check if self-funding is even possible
  const maxResult = calculateDepositImpact({
    ...baseInput,
    depositAmount: maxDeposit,
  });
  
  if (maxResult.peakCapitalWithDeposits > 0) {
    return {
      depositAmount: maxDeposit,
      isPossible: false,
      maxDeposit,
    };
  }
  
  // Binary search for minimum deposit that achieves self-funding
  const optimalDeposit = findOptimalDeposit(baseInput, 0, 0, maxDeposit);
  
  return {
    depositAmount: optimalDeposit,
    isPossible: true,
    maxDeposit,
  };
}

/**
 * Format currency for display
 */
export function formatDepositCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

/**
 * Format percentage for display
 */
export function formatDepositPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
