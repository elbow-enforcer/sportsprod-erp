/**
 * Baseball Calendar Seasonality Types
 */

export type CalendarType = 'pro' | 'youth';

export type SeasonPeriod = 
  | 'spring_training'
  | 'regular_season'
  | 'playoffs'
  | 'off_season';

export interface PeriodConfig {
  id: SeasonPeriod;
  name: string;
  months: number[];
  revenueMultiplier: number;
  demandMultiplier: number;
  description: string;
}

export interface CalendarConfig {
  type: CalendarType;
  name: string;
  description: string;
  periods: PeriodConfig[];
}

export interface MonthlySeasonality {
  month: number;
  monthName: string;
  period: SeasonPeriod;
  revenueMultiplier: number;
  demandMultiplier: number;
}

export interface SeasonalitySettings {
  enabled: boolean;
  calendarType: CalendarType;
}
