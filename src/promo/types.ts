/**
 * @file types.ts
 * @description Promo Code types - minimal implementation
 * @related-issue Issue #2 - Promo Code System
 * @module promo
 */

export type DiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePromoCodeInput = Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePromoCodeInput = Partial<Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>>;
