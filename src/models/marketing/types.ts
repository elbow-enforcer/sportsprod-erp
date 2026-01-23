/**
 * Marketing Module Types
 * Interfaces for channels, spend, and conversion tracking
 */

/**
 * Marketing channel categories
 */
export type ChannelCategory = 'digital' | 'field' | 'influencer' | 'content';

/**
 * Marketing channel definition
 */
export interface MarketingChannel {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Channel category */
  category: ChannelCategory;
  /** Description of the channel */
  description: string;
  /** Whether channel is currently active */
  isActive: boolean;
}

/**
 * Marketing spend record for a channel
 */
export interface MarketingSpend {
  /** Channel ID */
  channelId: string;
  /** Period (e.g., "2024-Q1", "2024-01") */
  period: string;
  /** Total spend amount in dollars */
  amount: number;
  /** Budget allocated for the period */
  budget: number;
}

/**
 * Conversion data for CAC calculation
 */
export interface ConversionData {
  /** Channel ID */
  channelId: string;
  /** Period */
  period: string;
  /** Number of new customers acquired */
  newCustomers: number;
  /** Number of leads generated */
  leads: number;
  /** Lead to customer conversion rate */
  conversionRate: number;
}

/**
 * Revenue attribution for ROAS
 */
export interface RevenueAttribution {
  /** Channel ID */
  channelId: string;
  /** Period */
  period: string;
  /** Revenue attributed to this channel */
  revenue: number;
}

/**
 * CAC calculation result
 */
export interface CACResult {
  /** Channel ID (or 'blended' for overall) */
  channelId: string;
  /** Period */
  period: string;
  /** Total marketing spend */
  totalSpend: number;
  /** New customers acquired */
  newCustomers: number;
  /** Customer Acquisition Cost */
  cac: number;
}

/**
 * ROAS calculation result
 */
export interface ROASResult {
  /** Channel ID (or 'blended' for overall) */
  channelId: string;
  /** Period */
  period: string;
  /** Ad/marketing spend */
  adSpend: number;
  /** Revenue generated */
  revenue: number;
  /** Return on Ad Spend (ratio) */
  roas: number;
  /** ROAS as percentage */
  roasPercent: number;
}

/**
 * Budget allocation for a channel
 */
export interface BudgetAllocation {
  /** Channel ID */
  channelId: string;
  /** Period */
  period: string;
  /** Allocated budget amount */
  allocatedBudget: number;
  /** Percentage of total budget */
  percentOfTotal: number;
}

/**
 * Simple channel budget allocation
 * Used for configuring budget by marketing channel
 */
export interface ChannelBudget {
  /** Channel name or ID */
  channel: string;
  /** Allocated budget amount in dollars */
  budget: number;
  /** Percentage of total marketing budget (0-100) */
  percentage: number;
}

/**
 * Marketing performance summary
 */
export interface MarketingPerformance {
  /** Period */
  period: string;
  /** Total spend across all channels */
  totalSpend: number;
  /** Total new customers */
  totalNewCustomers: number;
  /** Total revenue attributed */
  totalRevenue: number;
  /** Blended CAC */
  blendedCAC: number;
  /** Blended ROAS */
  blendedROAS: number;
  /** Per-channel breakdown */
  byChannel: {
    channelId: string;
    spend: number;
    newCustomers: number;
    revenue: number;
    cac: number;
    roas: number;
  }[];
}
