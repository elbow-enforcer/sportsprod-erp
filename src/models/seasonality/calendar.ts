/**
 * Baseball Calendar Data & Calculator
 */

import type { CalendarConfig, CalendarType, PeriodConfig, SeasonPeriod, MonthlySeasonality } from './types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PRO_PERIODS: PeriodConfig[] = [
  {
    id: 'spring_training',
    name: 'Spring Training',
    months: [2, 3],
    revenueMultiplier: 1.2,
    demandMultiplier: 1.3,
    description: 'Pre-season equipment prep and training gear',
  },
  {
    id: 'regular_season',
    name: 'Regular Season',
    months: [4, 5, 6, 7, 8, 9],
    revenueMultiplier: 1.5,
    demandMultiplier: 1.6,
    description: 'Peak season with highest demand',
  },
  {
    id: 'playoffs',
    name: 'Playoffs',
    months: [10],
    revenueMultiplier: 1.8,
    demandMultiplier: 1.4,
    description: 'Postseason merchandise surge',
  },
  {
    id: 'off_season',
    name: 'Off-Season',
    months: [11, 12, 1],
    revenueMultiplier: 0.5,
    demandMultiplier: 0.4,
    description: 'Winter break with minimal activity',
  },
];

export const YOUTH_PERIODS: PeriodConfig[] = [
  {
    id: 'spring_training',
    name: 'Spring Training',
    months: [3, 4],
    revenueMultiplier: 1.4,
    demandMultiplier: 1.5,
    description: 'League signups and new equipment',
  },
  {
    id: 'regular_season',
    name: 'Regular Season',
    months: [5, 6, 7],
    revenueMultiplier: 1.6,
    demandMultiplier: 1.7,
    description: 'Peak youth league season',
  },
  {
    id: 'playoffs',
    name: 'Playoffs',
    months: [8],
    revenueMultiplier: 1.3,
    demandMultiplier: 1.2,
    description: 'Tournament season and all-stars',
  },
  {
    id: 'off_season',
    name: 'Off-Season',
    months: [9, 10, 11, 12, 1, 2],
    revenueMultiplier: 0.6,
    demandMultiplier: 0.5,
    description: 'School year with indoor training',
  },
];

export const PRO_CALENDAR: CalendarConfig = {
  type: 'pro',
  name: 'Pro Baseball',
  description: 'MLB-style: Feb spring training through October playoffs',
  periods: PRO_PERIODS,
};

export const YOUTH_CALENDAR: CalendarConfig = {
  type: 'youth',
  name: 'Youth Baseball',
  description: 'Youth leagues: Mar signups through Aug tournaments',
  periods: YOUTH_PERIODS,
};

export const CALENDARS: Record<CalendarType, CalendarConfig> = {
  pro: PRO_CALENDAR,
  youth: YOUTH_CALENDAR,
};

export function getPeriodForMonth(month: number, calendarType: CalendarType): SeasonPeriod {
  const config = CALENDARS[calendarType];
  for (const period of config.periods) {
    if (period.months.includes(month)) {
      return period.id;
    }
  }
  return 'off_season';
}

export function getMonthlySeasonality(calendarType: CalendarType): MonthlySeasonality[] {
  const config = CALENDARS[calendarType];
  
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const periodId = getPeriodForMonth(month, calendarType);
    const period = config.periods.find(p => p.id === periodId)!;
    
    return {
      month,
      monthName: MONTH_NAMES[i],
      period: periodId,
      revenueMultiplier: period.revenueMultiplier,
      demandMultiplier: period.demandMultiplier,
    };
  });
}

export function getRevenueMultiplier(month: number, calendarType: CalendarType): number {
  const monthly = getMonthlySeasonality(calendarType);
  return monthly[month - 1].revenueMultiplier;
}

export function distributeAnnually(
  annualValue: number,
  calendarType: CalendarType,
  multiplierType: 'revenue' | 'demand' = 'revenue'
): number[] {
  const monthly = getMonthlySeasonality(calendarType);
  
  const totalMultiplier = monthly.reduce(
    (sum, m) => sum + (multiplierType === 'revenue' ? m.revenueMultiplier : m.demandMultiplier),
    0
  );
  
  return monthly.map(m => {
    const multiplier = multiplierType === 'revenue' ? m.revenueMultiplier : m.demandMultiplier;
    return (annualValue * multiplier) / totalMultiplier;
  });
}

export function getQuarterlyMultiplier(
  quarter: 1 | 2 | 3 | 4,
  calendarType: CalendarType
): number {
  const monthly = getMonthlySeasonality(calendarType);
  const quarterMonths: Record<number, number[]> = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
  };
  
  const months = quarterMonths[quarter];
  const multipliers = months.map(m => monthly[m - 1].revenueMultiplier);
  return multipliers.reduce((sum, m) => sum + m, 0) / 3;
}

export function getAverageMultiplier(calendarType: CalendarType): number {
  const monthly = getMonthlySeasonality(calendarType);
  return monthly.reduce((sum, m) => sum + m.revenueMultiplier, 0) / 12;
}

export function getPeakTroughMonths(calendarType: CalendarType): { peak: number; trough: number } {
  const monthly = getMonthlySeasonality(calendarType);
  
  const peak = monthly.reduce(
    (max, m) => m.revenueMultiplier > max.revenueMultiplier ? m : max,
    monthly[0]
  ).month;
  
  const trough = monthly.reduce(
    (min, m) => m.revenueMultiplier < min.revenueMultiplier ? m : min,
    monthly[0]
  ).month;
  
  return { peak, trough };
}
