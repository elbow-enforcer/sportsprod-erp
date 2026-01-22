/**
 * Revenue module exports
 */

export type { PricingConfig } from './pricing';
export { defaultPricing } from './pricing';

export type { DiscountTier, DiscountRange } from './discounts';
export { discountRates, getAverageDiscount } from './discounts';

export type { PromoCode } from './promoCodes';
export { isPromoCodeValid, calculatePromoDiscount } from './promoCodes';

export { calculateRevenue, projectRevenue, totalProjectedRevenue } from './projections';
