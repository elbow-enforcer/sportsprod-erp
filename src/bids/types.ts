/**
 * @file types.ts
 * @description Type definitions for Bids module - Manufacturer quote parsing from emails
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

export type BidStatus = 'draft' | 'parsed' | 'reviewed' | 'accepted' | 'rejected' | 'expired';
export type ParseConfidence = 'high' | 'medium' | 'low' | 'manual';

/**
 * Represents a single parsed field from an email with confidence tracking
 */
export interface ParsedField<T> {
  value: T | null;
  confidence: ParseConfidence;
  originalText: string; // The raw text that was parsed
  manuallyEdited: boolean;
}

/**
 * Payment terms structure
 */
export interface PaymentTerms {
  type: string; // e.g., "Net 30", "50% deposit, 50% on shipment"
  depositPercent?: number;
  netDays?: number;
  notes?: string;
}

/**
 * Tooling cost breakdown
 */
export interface ToolingCost {
  moldCost: number;
  setupCost: number;
  otherCosts: number;
  total: number;
  amortizedPerUnit?: number;
  notes?: string;
}

/**
 * Core quote data extracted from manufacturer email
 */
export interface ManufacturerQuote {
  id: string;
  supplierId?: string; // Link to existing supplier
  supplierName: string;
  supplierEmail: string;
  
  // Parsed fields with confidence tracking
  unitCost: ParsedField<number>;
  moq: ParsedField<number>; // Minimum Order Quantity
  leadTimeDays: ParsedField<number>;
  toolingCosts: ParsedField<ToolingCost>;
  paymentTerms: ParsedField<PaymentTerms>;
  
  // Additional parsed data
  currency: string;
  productDescription: string;
  validUntil?: string; // Quote expiration date
  
  // Original email data
  emailSubject: string;
  emailBody: string;
  emailReceivedAt: string;
  emailFrom: string;
  
  // Metadata
  status: BidStatus;
  overallConfidence: ParseConfidence;
  notes: string;
  createdAt: number;
  updatedAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
}

/**
 * Tier pricing structure (common in manufacturer quotes)
 */
export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
}

/**
 * Extended quote with tier pricing
 */
export interface ManufacturerQuoteWithTiers extends ManufacturerQuote {
  pricingTiers: ParsedField<PricingTier[]>;
}

/**
 * Input for parsing an email
 */
export interface EmailInput {
  subject: string;
  body: string;
  from: string;
  receivedAt: string;
}

/**
 * Parser result with all extracted fields
 */
export interface ParseResult {
  success: boolean;
  quote: Partial<ManufacturerQuote>;
  errors: string[];
  warnings: string[];
}

// Status labels and colors for UI
export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  draft: 'Draft',
  parsed: 'Parsed',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const BID_STATUS_COLORS: Record<BidStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  parsed: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export const CONFIDENCE_COLORS: Record<ParseConfidence, string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
  manual: 'text-blue-600',
};

export const CONFIDENCE_LABELS: Record<ParseConfidence, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  manual: 'Manually Entered',
};

// Default values for new quotes
export const DEFAULT_PARSED_FIELD = <T>(value: T | null = null): ParsedField<T> => ({
  value,
  confidence: 'low',
  originalText: '',
  manuallyEdited: false,
});

export const DEFAULT_TOOLING_COST: ToolingCost = {
  moldCost: 0,
  setupCost: 0,
  otherCosts: 0,
  total: 0,
};

export const DEFAULT_PAYMENT_TERMS: PaymentTerms = {
  type: 'Net 30',
  netDays: 30,
};
