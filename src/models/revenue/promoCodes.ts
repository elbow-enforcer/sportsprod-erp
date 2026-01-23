/**
 * Promotional code system for tracking discounts by channel
 */

export type MarketingChannel = 'pt' | 'doctor' | 'influencer' | 'ad' | 'organic';

export interface PromoCode {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  channel: MarketingChannel;
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
}

/**
 * Check if a promo code is valid and usable
 */
export function isPromoCodeValid(promo: PromoCode): boolean {
  // Check expiration
  if (promo.expiresAt && new Date() > promo.expiresAt) {
    return false;
  }
  
  // Check usage limit
  if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
    return false;
  }
  
  return true;
}

/**
 * Calculate the discount amount for a given price
 */
export function calculatePromoDiscount(promo: PromoCode, price: number): number {
  if (!isPromoCodeValid(promo)) {
    return 0;
  }
  
  if (promo.discountType === 'percent') {
    return price * (promo.discountValue / 100);
  }
  
  return Math.min(promo.discountValue, price);
}
