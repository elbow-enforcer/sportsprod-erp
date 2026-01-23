/**
 * @file emailParser.ts
 * @description Email parsing service for extracting manufacturer quote data
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import type {
  EmailInput,
  ParseResult,
  ManufacturerQuote,
  ParsedField,
  ParseConfidence,
  ToolingCost,
  PaymentTerms,
  PricingTier,
} from './types';

// Re-export EmailInput for convenience
export type { EmailInput };

/**
 * Regex patterns for extracting quote data from emails
 */
const PATTERNS = {
  // Unit cost patterns: "$1.50", "USD 1.50", "1.50 USD", "$1.50/unit", "unit price: $1.50"
  unitCost: [
    /(?:unit\s*(?:price|cost)|price\s*per\s*unit|cost\s*per\s*unit|ppu)\s*[:=]?\s*\$?\s*([\d,]+\.?\d*)\s*(?:USD|usd)?/i,
    /\$\s*([\d,]+\.?\d*)\s*(?:\/?\s*(?:unit|pc|pcs|piece|ea|each))/i,
    /(?:USD|usd)\s*([\d,]+\.?\d*)\s*(?:\/?\s*(?:unit|pc|pcs|piece|ea|each))/i,
    /([\d,]+\.?\d*)\s*(?:USD|usd)\s*(?:\/?\s*(?:unit|pc|pcs|piece|ea|each))/i,
  ],

  // MOQ patterns: "MOQ: 1000", "minimum order: 1,000 units", "min qty 1000"
  moq: [
    /(?:moq|minimum\s*order\s*(?:quantity|qty)?|min\.?\s*(?:order|qty|quantity))\s*[:=]?\s*(?:is\s*)?([\d,]+)\s*(?:units?|pcs?|pieces?)?/i,
    /(?:minimum|min\.?)\s*[:=]?\s*(?:is\s*)?([\d,]+)\s*(?:units?|pcs?|pieces?)/i,
    /([\d,]+)\s*(?:units?|pcs?|pieces?)\s*(?:minimum|min\.?)/i,
  ],

  // Lead time patterns: "lead time: 30 days", "delivery: 4-6 weeks", "30 day lead time"
  leadTime: [
    /(?:lead\s*time|delivery\s*time|production\s*time|turnaround)\s*[:=]?\s*(\d+)(?:\s*-\s*\d+)?\s*(?:days?|d)/i,
    /(?:lead\s*time|delivery\s*time|production\s*time|turnaround)\s*[:=]?\s*(\d+)(?:\s*-\s*\d+)?\s*(?:weeks?|wks?)/i,
    /(\d+)(?:\s*-\s*\d+)?\s*(?:days?|d)\s*(?:lead\s*time|delivery|turnaround)/i,
    /(\d+)(?:\s*-\s*\d+)?\s*(?:weeks?|wks?)\s*(?:lead\s*time|delivery|turnaround)/i,
  ],

  // Tooling/mold costs: "tooling: $5,000", "mold cost: $5000", "tooling fee: $5,000"
  tooling: [
    /(?:tooling|mold|mould|die)\s*(?:cost|fee|charge|price)?\s*[:=]?\s*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d*)\s*(?:tooling|mold|mould|die)/i,
    /(?:setup|set-up)\s*(?:cost|fee|charge)?\s*[:=]?\s*\$?\s*([\d,]+\.?\d*)/i,
  ],

  // Payment terms: "Net 30", "50% deposit", "T/T 30 days"
  paymentTerms: [
    /(?:payment\s*terms?|terms?)\s*[:=]?\s*((?:net|n)\s*\d+)/i,
    /(\d+%?\s*(?:deposit|down|upfront)(?:\s*,?\s*\d+%?\s*(?:on|upon|at)\s*(?:shipment|delivery|completion))?)/i,
    /(T\/T\s*\d+\s*days?)/i,
    /(?:payment\s*terms?|terms?)\s*[:=]?\s*([^.\n]{5,50})/i,
  ],

  // Currency detection
  currency: [
    /\b(USD|EUR|GBP|CNY|RMB|JPY)\b/i,
    /(\$|€|£|¥|￥)/,
  ],

  // Pricing tiers: "1000-4999: $1.50, 5000+: $1.25"
  pricingTiers: [
    /(\d[\d,]*)\s*(?:-|to)\s*(\d[\d,]*)\s*(?:units?|pcs?)?\s*[:=@]?\s*\$?\s*([\d.]+)/gi,
    /(\d[\d,]*)\s*\+\s*(?:units?|pcs?)?\s*[:=@]?\s*\$?\s*([\d.]+)/gi,
  ],

  // Email sender extraction
  emailFrom: [
    /<([^>]+@[^>]+)>/,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  ],
};

/**
 * Parse a number from string, handling commas
 */
function parseNumber(str: string): number | null {
  if (!str) return null;
  const cleaned = str.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Determine confidence based on pattern match quality
 */
function determineConfidence(
  value: unknown,
  matchedPattern: RegExp | null,
  originalText: string
): ParseConfidence {
  if (value === null || value === undefined) return 'low';
  if (!matchedPattern) return 'low';
  
  // Check if the original text looks clean/unambiguous
  const textLength = originalText.trim().length;
  if (textLength < 5) return 'low';
  if (textLength > 100) return 'medium'; // Long text = more context = might be ambiguous
  
  // First pattern in each array is usually most specific
  return 'high';
}

/**
 * Extract unit cost from email body
 */
function extractUnitCost(text: string): ParsedField<number> {
  for (const pattern of PATTERNS.unitCost) {
    const match = text.match(pattern);
    if (match) {
      const value = parseNumber(match[1]);
      if (value !== null && value > 0 && value < 10000) { // Sanity check
        return {
          value,
          confidence: determineConfidence(value, pattern, match[0]),
          originalText: match[0],
          manuallyEdited: false,
        };
      }
    }
  }
  return { value: null, confidence: 'low', originalText: '', manuallyEdited: false };
}

/**
 * Extract MOQ from email body
 */
function extractMOQ(text: string): ParsedField<number> {
  for (const pattern of PATTERNS.moq) {
    const match = text.match(pattern);
    if (match) {
      const value = parseNumber(match[1]);
      if (value !== null && value > 0 && value < 10000000) { // Sanity check
        return {
          value,
          confidence: determineConfidence(value, pattern, match[0]),
          originalText: match[0],
          manuallyEdited: false,
        };
      }
    }
  }
  return { value: null, confidence: 'low', originalText: '', manuallyEdited: false };
}

/**
 * Extract lead time in days from email body
 */
function extractLeadTime(text: string): ParsedField<number> {
  for (let i = 0; i < PATTERNS.leadTime.length; i++) {
    const pattern = PATTERNS.leadTime[i];
    const match = text.match(pattern);
    if (match) {
      let value = parseNumber(match[1]);
      if (value !== null) {
        // Convert weeks to days for patterns 1 and 3 (week patterns)
        if (i === 1 || i === 3) {
          value = value * 7;
        }
        if (value > 0 && value < 365) { // Sanity check
          return {
            value,
            confidence: determineConfidence(value, pattern, match[0]),
            originalText: match[0],
            manuallyEdited: false,
          };
        }
      }
    }
  }
  return { value: null, confidence: 'low', originalText: '', manuallyEdited: false };
}

/**
 * Extract tooling costs from email body
 */
function extractToolingCosts(text: string): ParsedField<ToolingCost> {
  const costs: ToolingCost = {
    moldCost: 0,
    setupCost: 0,
    otherCosts: 0,
    total: 0,
  };
  
  let foundAny = false;
  let originalTexts: string[] = [];
  
  for (const pattern of PATTERNS.tooling) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      const value = parseNumber(match[1]);
      if (value !== null && value > 0) {
        foundAny = true;
        originalTexts.push(match[0]);
        
        const lowerMatch = match[0].toLowerCase();
        if (lowerMatch.includes('mold') || lowerMatch.includes('mould') || lowerMatch.includes('die')) {
          costs.moldCost += value;
        } else if (lowerMatch.includes('setup') || lowerMatch.includes('set-up')) {
          costs.setupCost += value;
        } else {
          costs.otherCosts += value;
        }
      }
    }
  }
  
  costs.total = costs.moldCost + costs.setupCost + costs.otherCosts;
  
  if (!foundAny) {
    return { value: null, confidence: 'low', originalText: '', manuallyEdited: false };
  }
  
  return {
    value: costs,
    confidence: costs.total > 0 ? 'medium' : 'low',
    originalText: originalTexts.join('; '),
    manuallyEdited: false,
  };
}

/**
 * Extract payment terms from email body
 */
function extractPaymentTerms(text: string): ParsedField<PaymentTerms> {
  for (const pattern of PATTERNS.paymentTerms) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const termsText = match[1].trim();
      const terms: PaymentTerms = { type: termsText };
      
      // Try to extract specific values
      const netMatch = termsText.match(/(?:net|n)\s*(\d+)/i);
      if (netMatch) {
        terms.netDays = parseInt(netMatch[1], 10);
      }
      
      const depositMatch = termsText.match(/(\d+)%?\s*(?:deposit|down|upfront)/i);
      if (depositMatch) {
        terms.depositPercent = parseInt(depositMatch[1], 10);
      }
      
      return {
        value: terms,
        confidence: terms.netDays || terms.depositPercent ? 'high' : 'medium',
        originalText: match[0],
        manuallyEdited: false,
      };
    }
  }
  return { value: null, confidence: 'low', originalText: '', manuallyEdited: false };
}

/**
 * Extract currency from email body
 */
function extractCurrency(text: string): string {
  for (const pattern of PATTERNS.currency) {
    const match = text.match(pattern);
    if (match) {
      const curr = match[1] || match[0];
      switch (curr) {
        case '$': return 'USD';
        case '€': return 'EUR';
        case '£': return 'GBP';
        case '¥':
        case '￥':
          return text.match(/CNY|RMB/i) ? 'CNY' : 'JPY';
        default:
          return curr.toUpperCase();
      }
    }
  }
  return 'USD'; // Default
}

/**
 * Extract supplier name from email
 */
function extractSupplierName(email: EmailInput): string {
  // Try to get company name from email domain
  const emailMatch = email.from.match(/@([^.]+)\./);
  if (emailMatch) {
    // Capitalize first letter
    return emailMatch[1].charAt(0).toUpperCase() + emailMatch[1].slice(1);
  }
  
  // Try to extract from "From: Name <email>" format
  const nameMatch = email.from.match(/^([^<]+)</);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  
  return email.from;
}

/**
 * Extract supplier email address
 */
function extractSupplierEmail(from: string): string {
  for (const pattern of PATTERNS.emailFrom) {
    const match = from.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return from;
}

/**
 * Calculate overall confidence from individual field confidences
 */
function calculateOverallConfidence(quote: Partial<ManufacturerQuote>): ParseConfidence {
  const fields = [
    quote.unitCost?.confidence,
    quote.moq?.confidence,
    quote.leadTimeDays?.confidence,
    quote.paymentTerms?.confidence,
  ].filter(Boolean) as ParseConfidence[];
  
  if (fields.length === 0) return 'low';
  
  const scores = { high: 3, medium: 2, low: 1, manual: 3 };
  const avgScore = fields.reduce((sum, c) => sum + scores[c], 0) / fields.length;
  
  if (avgScore >= 2.5) return 'high';
  if (avgScore >= 1.5) return 'medium';
  return 'low';
}

/**
 * Extract pricing tiers from email body
 */
export function extractPricingTiers(text: string): PricingTier[] {
  const tiers: PricingTier[] = [];
  
  // Match range patterns: "1000-4999: $1.50"
  const rangePattern = /(\d[\d,]*)\s*(?:-|to)\s*(\d[\d,]*)\s*(?:units?|pcs?)?\s*[:=@]?\s*\$?\s*([\d.]+)/gi;
  let match;
  while ((match = rangePattern.exec(text)) !== null) {
    const minQty = parseNumber(match[1]);
    const maxQty = parseNumber(match[2]);
    const price = parseNumber(match[3]);
    if (minQty !== null && maxQty !== null && price !== null) {
      tiers.push({ minQuantity: minQty, maxQuantity: maxQty, unitPrice: price });
    }
  }
  
  // Match open-ended patterns: "5000+: $1.25"
  const openPattern = /(\d[\d,]*)\s*\+\s*(?:units?|pcs?)?\s*[:=@]?\s*\$?\s*([\d.]+)/gi;
  while ((match = openPattern.exec(text)) !== null) {
    const minQty = parseNumber(match[1]);
    const price = parseNumber(match[2]);
    if (minQty !== null && price !== null) {
      tiers.push({ minQuantity: minQty, unitPrice: price });
    }
  }
  
  // Sort by minimum quantity
  return tiers.sort((a, b) => a.minQuantity - b.minQuantity);
}

/**
 * Main parsing function - extracts all quote data from an email
 */
export function parseQuoteEmail(email: EmailInput): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const combinedText = `${email.subject}\n\n${email.body}`;
  
  // Extract all fields
  const unitCost = extractUnitCost(combinedText);
  const moq = extractMOQ(combinedText);
  const leadTimeDays = extractLeadTime(combinedText);
  const toolingCosts = extractToolingCosts(combinedText);
  const paymentTerms = extractPaymentTerms(combinedText);
  const currency = extractCurrency(combinedText);
  
  // Validation warnings
  if (!unitCost.value) {
    warnings.push('Could not extract unit cost from email');
  }
  if (!moq.value) {
    warnings.push('Could not extract MOQ from email');
  }
  if (!leadTimeDays.value) {
    warnings.push('Could not extract lead time from email');
  }
  
  const quote: Partial<ManufacturerQuote> = {
    supplierName: extractSupplierName(email),
    supplierEmail: extractSupplierEmail(email.from),
    unitCost,
    moq,
    leadTimeDays,
    toolingCosts,
    paymentTerms,
    currency,
    productDescription: email.subject,
    emailSubject: email.subject,
    emailBody: email.body,
    emailReceivedAt: email.receivedAt,
    emailFrom: email.from,
    status: 'parsed',
    notes: '',
  };
  
  quote.overallConfidence = calculateOverallConfidence(quote);
  
  return {
    success: errors.length === 0,
    quote,
    errors,
    warnings,
  };
}

/**
 * Parse multiple emails and return quotes
 */
export function parseMultipleEmails(emails: EmailInput[]): ParseResult[] {
  return emails.map(parseQuoteEmail);
}
