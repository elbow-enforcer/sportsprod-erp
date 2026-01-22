/**
 * Discount tier definitions for different customer segments
 */

export type DiscountTier = 'individual' | 'pt' | 'doctor' | 'wholesaler';

export interface DiscountRange {
  min: number;
  max: number;
}

export const discountRates: Record<DiscountTier, DiscountRange> = {
  individual: { min: 0, max: 0 },
  pt: { min: 0.05, max: 0.10 },
  doctor: { min: 0.10, max: 0.15 },
  wholesaler: { min: 0.15, max: 0.25 },
};

/**
 * Get the average discount rate for a tier
 */
export function getAverageDiscount(tier: DiscountTier): number {
  const range = discountRates[tier];
  return (range.min + range.max) / 2;
}
