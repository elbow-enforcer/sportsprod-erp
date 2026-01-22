/**
 * G&A (General & Administrative) Personnel Types
 */

/**
 * Personnel type - employee or contractor
 */
export type PersonnelType = 'employee' | 'contractor';

/**
 * Rate type - how compensation is calculated
 */
export type RateType = 'monthly' | 'hourly';

/**
 * Personnel record representing an employee or contractor
 */
export interface Personnel {
  /** Unique identifier */
  id: string;
  /** Full name */
  name: string;
  /** Job role/title */
  role: string;
  /** Employee or contractor */
  type: PersonnelType;
  /** Compensation rate (monthly salary or hourly rate) */
  rate: number;
  /** How rate is calculated */
  rateType: RateType;
  /** Hours worked per month (required for hourly, optional for monthly) */
  hoursPerMonth?: number;
  /** Employment start date */
  startDate: Date;
  /** Employment end date (undefined = currently active) */
  endDate?: Date;
  /** Benefits burden multiplier (e.g., 1.3 for 30% burden) */
  burdenRate: number;
}

/**
 * Result of a monthly cost calculation for a single person
 */
export interface PersonnelMonthlyCost {
  /** Personnel ID */
  personnelId: string;
  /** Base compensation for the month */
  baseCost: number;
  /** Burden/benefits cost (baseCost * (burdenRate - 1)) */
  burdenCost: number;
  /** Total fully-loaded cost */
  totalCost: number;
}

/**
 * Aggregate monthly cost summary
 */
export interface MonthlyAggregateCost {
  /** Year */
  year: number;
  /** Month (1-12) */
  month: number;
  /** Total employee costs */
  employeeCost: number;
  /** Total contractor costs */
  contractorCost: number;
  /** Combined total */
  totalCost: number;
  /** Number of active employees */
  employeeCount: number;
  /** Number of active contractors */
  contractorCount: number;
}
