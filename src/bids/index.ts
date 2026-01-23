/**
 * @file index.ts
 * @description Bids module exports - Email quote parsing for manufacturer bids
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

// Components
export { BidList } from './BidList';
export { BidDetail } from './BidDetail';

// Store
export { useBidsStore } from './store';

// Parser
export { parseQuoteEmail, parseMultipleEmails, extractPricingTiers } from './emailParser';

// Types
export type {
  ManufacturerQuote,
  ManufacturerQuoteWithTiers,
  ParsedField,
  ParseConfidence,
  PaymentTerms,
  ToolingCost,
  PricingTier,
  BidStatus,
  EmailInput,
  ParseResult,
} from './types';

export {
  BID_STATUS_LABELS,
  BID_STATUS_COLORS,
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
  DEFAULT_PARSED_FIELD,
  DEFAULT_TOOLING_COST,
  DEFAULT_PAYMENT_TERMS,
} from './types';
