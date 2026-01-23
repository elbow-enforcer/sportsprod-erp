/**
 * @file emailParser.test.ts
 * @description Unit tests for email quote parser
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { describe, it, expect } from 'vitest';
import { parseQuoteEmail, extractPricingTiers } from '../emailParser';

describe('parseQuoteEmail', () => {
  describe('unit cost extraction', () => {
    it('extracts unit price with dollar sign and per unit', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Unit price: $4.75 per unit',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.unitCost?.value).toBe(4.75);
      expect(result.quote.unitCost?.confidence).toBe('high');
    });

    it('extracts unit cost with USD notation', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Price is USD 3.50/pc',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.unitCost?.value).toBe(3.5);
    });

    it('extracts price with comma formatting', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Unit cost: $1,250.00 per piece',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.unitCost?.value).toBe(1250);
    });
  });

  describe('MOQ extraction', () => {
    it('extracts MOQ with standard format', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'MOQ: 5,000 units',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.moq?.value).toBe(5000);
      expect(result.quote.moq?.confidence).toBe('high');
    });

    it('extracts minimum order quantity', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Minimum order quantity is 3000 pcs',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.moq?.value).toBe(3000);
    });

    it('extracts min qty shorthand', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Min qty 1000',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.moq?.value).toBe(1000);
    });
  });

  describe('lead time extraction', () => {
    it('extracts lead time in days', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Lead time: 30 days',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.leadTimeDays?.value).toBe(30);
    });

    it('converts weeks to days', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Lead time: 6 weeks',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.leadTimeDays?.value).toBe(42);
    });

    it('extracts delivery time variant', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Delivery time: 45 days after deposit',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.leadTimeDays?.value).toBe(45);
    });
  });

  describe('tooling cost extraction', () => {
    it('extracts mold cost', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Mold cost: $3,500',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.toolingCosts?.value?.moldCost).toBe(3500);
      expect(result.quote.toolingCosts?.value?.total).toBe(3500);
    });

    it('extracts tooling fee', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Tooling: $5000',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.toolingCosts?.value?.total).toBe(5000);
    });

    it('extracts setup cost separately', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Mold: $3,000\nSetup cost: $500',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.toolingCosts?.value?.moldCost).toBe(3000);
      expect(result.quote.toolingCosts?.value?.setupCost).toBe(500);
      expect(result.quote.toolingCosts?.value?.total).toBe(3500);
    });
  });

  describe('payment terms extraction', () => {
    it('extracts Net 30 terms', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Payment terms: Net 30',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.paymentTerms?.value?.type).toContain('30');
      expect(result.quote.paymentTerms?.value?.netDays).toBe(30);
    });

    it('extracts deposit terms', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Terms: 50% deposit, 50% on shipment',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.paymentTerms?.value?.depositPercent).toBe(50);
    });
  });

  describe('currency detection', () => {
    it('detects USD from dollar sign', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Price: $5.00',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.currency).toBe('USD');
    });

    it('detects EUR from symbol', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Price: €5.00',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.currency).toBe('EUR');
    });

    it('detects currency code in text', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Price: 5.00 GBP per unit',
        from: 'test@example.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.currency).toBe('GBP');
    });
  });

  describe('supplier extraction', () => {
    it('extracts supplier name from email domain', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Hello',
        from: 'sales@shenzhen-sports.cn',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.supplierName).toBe('Shenzhen-sports');
    });

    it('extracts supplier email from angle brackets', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'Hello',
        from: 'John Doe <john@factory.com>',
        receivedAt: '2026-01-23T00:00:00Z',
      });
      expect(result.quote.supplierEmail).toBe('john@factory.com');
    });
  });

  describe('full email parsing', () => {
    it('parses a complete manufacturer quote email', () => {
      const email = {
        subject: 'RE: Quote Request - Lacrosse Head',
        body: `Dear Customer,

Thank you for your inquiry. Please find our quotation below:

Product: Premium Lacrosse Head
Unit price: $4.50 USD per piece (FOB)
MOQ: 5,000 units
Lead time: 45 days after deposit
Mold cost: $3,500 (one-time)
Setup fee: $500

Payment terms: 30% deposit, 70% before shipment

Best regards,
Sales Team`,
        from: 'Wang Wei <sales@manufacturer.cn>',
        receivedAt: '2026-01-23T10:00:00Z',
      };

      const result = parseQuoteEmail(email);

      expect(result.success).toBe(true);
      expect(result.quote.unitCost?.value).toBe(4.5);
      expect(result.quote.moq?.value).toBe(5000);
      expect(result.quote.leadTimeDays?.value).toBe(45);
      expect(result.quote.toolingCosts?.value?.moldCost).toBe(3500);
      expect(result.quote.toolingCosts?.value?.setupCost).toBe(500);
      expect(result.quote.paymentTerms?.value?.depositPercent).toBe(30);
      expect(result.quote.currency).toBe('USD');
      expect(result.quote.supplierEmail).toBe('sales@manufacturer.cn');
    });

    it('handles emails with missing data gracefully', () => {
      const result = parseQuoteEmail({
        subject: 'Quote',
        body: 'We can make your product. Contact us for pricing.',
        from: 'info@company.com',
        receivedAt: '2026-01-23T00:00:00Z',
      });

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.quote.unitCost?.value).toBeNull();
      expect(result.quote.unitCost?.confidence).toBe('low');
    });
  });
});

describe('extractPricingTiers', () => {
  it('extracts range-based pricing tiers', () => {
    const text = '1000-4999: $2.50\n5000-9999: $2.00';
    const tiers = extractPricingTiers(text);
    
    expect(tiers).toHaveLength(2);
    expect(tiers[0]).toEqual({ minQuantity: 1000, maxQuantity: 4999, unitPrice: 2.5 });
    expect(tiers[1]).toEqual({ minQuantity: 5000, maxQuantity: 9999, unitPrice: 2.0 });
  });

  it('extracts open-ended tiers', () => {
    const text = '10000+ units: $1.75';
    const tiers = extractPricingTiers(text);
    
    expect(tiers).toHaveLength(1);
    expect(tiers[0]).toEqual({ minQuantity: 10000, unitPrice: 1.75 });
  });

  it('sorts tiers by quantity', () => {
    const text = '5000+: $1.50\n1000-4999: $2.00';
    const tiers = extractPricingTiers(text);
    
    expect(tiers[0].minQuantity).toBe(1000);
    expect(tiers[1].minQuantity).toBe(5000);
  });
});
