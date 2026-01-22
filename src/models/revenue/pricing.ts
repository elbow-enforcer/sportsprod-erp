/**
 * Pricing configuration for SportsProd ERP
 */

export interface PricingConfig {
  basePrice: number; // $1000 default
  currency: string;
}

export const defaultPricing: PricingConfig = {
  basePrice: 1000,
  currency: 'USD',
};
