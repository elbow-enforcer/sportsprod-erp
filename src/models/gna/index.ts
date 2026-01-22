/**
 * G&A (General & Administrative) Module
 * 
 * Personnel expense tracking for employees and contractors
 */

// Types
export type {
  Personnel,
  PersonnelType,
  RateType,
  PersonnelMonthlyCost,
  MonthlyAggregateCost,
} from './types';

// Calculations
export {
  DEFAULT_HOURS_PER_MONTH,
  DEFAULT_EMPLOYEE_BURDEN_RATE,
  DEFAULT_CONTRACTOR_BURDEN_RATE,
  calculateBaseMonthlyCost,
  calculatePersonnelMonthlyCost,
  isActiveInMonth,
  calculateProratedMonthlyCost,
  calculateMonthlyAggregate,
  calculateAnnualCost,
  sumAnnualCost,
} from './calculations';
