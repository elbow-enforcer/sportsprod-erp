/**
 * G&A Personnel Cost Calculations
 */

import type {
  Personnel,
  PersonnelMonthlyCost,
  MonthlyAggregateCost,
} from './types';

/**
 * Default working hours per month (US standard: ~173.33 hours)
 */
export const DEFAULT_HOURS_PER_MONTH = 173.33;

/**
 * Default burden rate for employees (30% for benefits, taxes, etc.)
 */
export const DEFAULT_EMPLOYEE_BURDEN_RATE = 1.3;

/**
 * Default burden rate for contractors (typically 1.0 = no burden)
 */
export const DEFAULT_CONTRACTOR_BURDEN_RATE = 1.0;

/**
 * Calculate base monthly cost for a personnel member
 */
export function calculateBaseMonthlyCost(person: Personnel): number {
  if (person.rateType === 'monthly') {
    return person.rate;
  }
  // Hourly rate
  const hours = person.hoursPerMonth ?? DEFAULT_HOURS_PER_MONTH;
  return person.rate * hours;
}

/**
 * Calculate fully-loaded monthly cost for a single personnel member
 */
export function calculatePersonnelMonthlyCost(
  person: Personnel
): PersonnelMonthlyCost {
  const baseCost = calculateBaseMonthlyCost(person);
  const burdenCost = baseCost * (person.burdenRate - 1);
  const totalCost = baseCost + burdenCost;

  return {
    personnelId: person.id,
    baseCost,
    burdenCost,
    totalCost,
  };
}

/**
 * Check if a personnel member is active during a specific month
 */
export function isActiveInMonth(
  person: Personnel,
  year: number,
  month: number
): boolean {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0); // Last day of month

  // Personnel must have started on or before month end
  if (person.startDate > monthEnd) {
    return false;
  }

  // If no end date, they're still active
  if (!person.endDate) {
    return true;
  }

  // Personnel must not have ended before month start
  return person.endDate >= monthStart;
}

/**
 * Calculate prorated cost if personnel started/ended mid-month
 */
export function calculateProratedMonthlyCost(
  person: Personnel,
  year: number,
  month: number
): PersonnelMonthlyCost {
  const fullMonthCost = calculatePersonnelMonthlyCost(person);
  
  if (!isActiveInMonth(person, year, month)) {
    return {
      personnelId: person.id,
      baseCost: 0,
      burdenCost: 0,
      totalCost: 0,
    };
  }

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const daysInMonth = monthEnd.getDate();

  // Calculate active days
  const effectiveStart = person.startDate > monthStart ? person.startDate : monthStart;
  const effectiveEnd = person.endDate && person.endDate < monthEnd ? person.endDate : monthEnd;
  
  const activeDays = Math.max(
    0,
    Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const prorationFactor = activeDays / daysInMonth;

  return {
    personnelId: person.id,
    baseCost: fullMonthCost.baseCost * prorationFactor,
    burdenCost: fullMonthCost.burdenCost * prorationFactor,
    totalCost: fullMonthCost.totalCost * prorationFactor,
  };
}

/**
 * Calculate aggregate monthly costs for all personnel
 */
export function calculateMonthlyAggregate(
  personnel: Personnel[],
  year: number,
  month: number,
  prorate: boolean = true
): MonthlyAggregateCost {
  let employeeCost = 0;
  let contractorCost = 0;
  let employeeCount = 0;
  let contractorCount = 0;

  for (const person of personnel) {
    if (!isActiveInMonth(person, year, month)) {
      continue;
    }

    const cost = prorate
      ? calculateProratedMonthlyCost(person, year, month)
      : calculatePersonnelMonthlyCost(person);

    if (person.type === 'employee') {
      employeeCost += cost.totalCost;
      employeeCount++;
    } else {
      contractorCost += cost.totalCost;
      contractorCount++;
    }
  }

  return {
    year,
    month,
    employeeCost,
    contractorCost,
    totalCost: employeeCost + contractorCost,
    employeeCount,
    contractorCount,
  };
}

/**
 * Calculate annual personnel costs
 */
export function calculateAnnualCost(
  personnel: Personnel[],
  year: number,
  prorate: boolean = true
): MonthlyAggregateCost[] {
  const monthlyCosts: MonthlyAggregateCost[] = [];
  
  for (let month = 1; month <= 12; month++) {
    monthlyCosts.push(calculateMonthlyAggregate(personnel, year, month, prorate));
  }
  
  return monthlyCosts;
}

/**
 * Get total annual cost from monthly aggregates
 */
export function sumAnnualCost(monthlyCosts: MonthlyAggregateCost[]): number {
  return monthlyCosts.reduce((sum, m) => sum + m.totalCost, 0);
}
