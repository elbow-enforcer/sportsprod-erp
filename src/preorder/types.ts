/**
 * @file types.ts
 * @description TypeScript type definitions for Pre-order Deposit Structure Options.
 *              Defines interfaces for deposit configurations, Kickstarter benchmarks,
 *              and conversion rate assumptions.
 * @related-prd Issue #20 - Pre-order Deposit Structure Options
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

// ============================================================================
// Deposit Option Types
// ============================================================================

export type DepositType = 'full' | 'partial' | 'custom';

export interface DepositOption {
  id: string;
  type: DepositType;
  name: string;
  description: string;
  amount: number;
  percentOfTotal?: number;
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export interface DepositConfiguration {
  id: string;
  name: string;
  productPrice: number; // Base product price (e.g., $1,000)
  options: DepositOption[];
  allowCustomAmount: boolean;
  customMinimum?: number;
  customMaximum?: number;
  manufacturingCostCovered: number; // Amount needed to cover mfg ($200)
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Kickstarter Benchmark Data Types
// ============================================================================

export type ProductCategory = 'hardware' | 'electronics' | 'sports_equipment' | 'wearables' | 'other';

export interface KickstarterBenchmark {
  id: string;
  category: ProductCategory;
  projectName: string;
  year: number;
  totalRaised: number;
  backersCount: number;
  avgPledge: number;
  fundingGoal: number;
  fundingPercent: number;
  earlyBirdDiscount?: number;
  depositPercent?: number;
  deliveryTimeMonths: number;
  successRate: number;
  source: string;
  notes?: string;
}

export interface CategoryBenchmarks {
  category: ProductCategory;
  avgFundingPercent: number;
  avgBackers: number;
  avgPledge: number;
  avgSuccessRate: number;
  avgDeliveryTimeMonths: number;
  sampleSize: number;
}

// ============================================================================
// Conversion Rate Assumptions
// ============================================================================

export type DepositLevel = 'full_payment' | 'high_deposit' | 'medium_deposit' | 'low_deposit' | 'custom';

export interface ConversionRateAssumption {
  id: string;
  depositLevel: DepositLevel;
  depositPercentRange: {
    min: number;
    max: number;
  };
  depositAmountExample: number;
  expectedConversionRate: number; // Percentage (0-100)
  conversionRateRange: {
    low: number;
    high: number;
  };
  completionRate: number; // % that complete full payment
  refundRate: number; // Expected refund/cancellation rate
  notes: string;
  source: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface ConversionScenario {
  name: string;
  description: string;
  assumptions: ConversionRateAssumption[];
  totalLeads: number;
  projectedConversions: {
    depositLevel: DepositLevel;
    conversions: number;
    revenue: number;
    atRiskRevenue: number; // Revenue at risk from non-completion
  }[];
  totalProjectedRevenue: number;
  totalAtRiskRevenue: number;
}

// ============================================================================
// Pre-order Types
// ============================================================================

export type PreOrderStatus = 
  | 'pending_deposit'
  | 'deposit_paid'
  | 'deposit_partial'
  | 'awaiting_final_payment'
  | 'paid_in_full'
  | 'refunded'
  | 'cancelled';

export interface PreOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  depositOptionId: string;
  depositAmount: number;
  depositPaidAt?: string;
  remainingBalance: number;
  totalAmount: number;
  status: PreOrderStatus;
  estimatedShipDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Revenue Projection Types
// ============================================================================

export interface DepositRevenueProjection {
  month: string;
  depositOption: DepositType;
  newPreOrders: number;
  depositRevenue: number;
  finalPaymentsReceived: number;
  finalPaymentRevenue: number;
  totalRevenue: number;
  cumulativeDeposits: number;
  cumulativeRevenue: number;
}

// ============================================================================
// UI Display Constants
// ============================================================================

export const DEPOSIT_TYPE_LABELS: Record<DepositType, string> = {
  full: 'Full Payment',
  partial: 'Partial Deposit',
  custom: 'Custom Amount',
};

export const DEPOSIT_TYPE_COLORS: Record<DepositType, string> = {
  full: 'bg-green-100 text-green-800 border-green-200',
  partial: 'bg-blue-100 text-blue-800 border-blue-200',
  custom: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const PREORDER_STATUS_LABELS: Record<PreOrderStatus, string> = {
  pending_deposit: 'Pending Deposit',
  deposit_paid: 'Deposit Paid',
  deposit_partial: 'Partial Deposit',
  awaiting_final_payment: 'Awaiting Final Payment',
  paid_in_full: 'Paid in Full',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

export const PREORDER_STATUS_COLORS: Record<PreOrderStatus, string> = {
  pending_deposit: 'bg-yellow-100 text-yellow-800',
  deposit_paid: 'bg-blue-100 text-blue-800',
  deposit_partial: 'bg-orange-100 text-orange-800',
  awaiting_final_payment: 'bg-purple-100 text-purple-800',
  paid_in_full: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const DEPOSIT_LEVEL_LABELS: Record<DepositLevel, string> = {
  full_payment: 'Full Payment (100%)',
  high_deposit: 'High Deposit (50-99%)',
  medium_deposit: 'Medium Deposit (20-49%)',
  low_deposit: 'Low Deposit (5-19%)',
  custom: 'Custom Amount',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hardware: 'Hardware',
  electronics: 'Consumer Electronics',
  sports_equipment: 'Sports Equipment',
  wearables: 'Wearables',
  other: 'Other',
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PRODUCT_PRICE = 1000;
export const DEFAULT_MANUFACTURING_COST = 200;

export const DEFAULT_DEPOSIT_OPTIONS: DepositOption[] = [
  {
    id: 'full-1000',
    type: 'full',
    name: 'Full Payment',
    description: 'Pay the full amount upfront and secure your order with priority shipping',
    amount: 1000,
    percentOfTotal: 100,
    isDefault: false,
    isEnabled: true,
    sortOrder: 1,
  },
  {
    id: 'partial-200',
    type: 'partial',
    name: 'Manufacturing Deposit',
    description: 'Reserve your unit with $200 deposit - covers manufacturing costs',
    amount: 200,
    percentOfTotal: 20,
    isDefault: true,
    isEnabled: true,
    sortOrder: 2,
  },
  {
    id: 'custom',
    type: 'custom',
    name: 'Custom Amount',
    description: 'Choose your own deposit amount (minimum $50)',
    amount: 0,
    isDefault: false,
    isEnabled: true,
    sortOrder: 3,
  },
];
