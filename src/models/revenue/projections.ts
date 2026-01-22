/**
 * Revenue projection calculations
 */

import type { PricingConfig } from './pricing';
import { defaultPricing } from './pricing';

/**
 * Calculate revenue for a given period
 * @param units - Number of units sold
 * @param price - Price per unit
 * @param avgDiscount - Average discount rate (0-1)
 * @returns Net revenue after discounts
 */
export function calculateRevenue(
  units: number,
  price: number,
  avgDiscount: number
): number {
  const effectivePrice = price * (1 - avgDiscount);
  return units * effectivePrice;
}

/**
 * Project revenue across multiple years
 * @param unitsByYear - Array of unit projections per year
 * @param pricing - Pricing configuration (defaults to defaultPricing)
 * @param avgDiscount - Average discount rate to apply (default 0.10)
 * @returns Array of projected revenue per year
 */
export function projectRevenue(
  unitsByYear: number[],
  pricing: PricingConfig = defaultPricing,
  avgDiscount: number = 0.10
): number[] {
  return unitsByYear.map((units) =>
    calculateRevenue(units, pricing.basePrice, avgDiscount)
  );
}

/**
 * Calculate total revenue across all years
 */
export function totalProjectedRevenue(
  unitsByYear: number[],
  pricing: PricingConfig = defaultPricing,
  avgDiscount: number = 0.10
): number {
  return projectRevenue(unitsByYear, pricing, avgDiscount).reduce(
    (sum, rev) => sum + rev,
    0
  );
}
