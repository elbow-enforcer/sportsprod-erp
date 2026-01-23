/**
 * @file mockData.ts
 * @description Mock data for Bids module development and testing
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import type { ManufacturerQuote } from './types';

export const mockQuotes: ManufacturerQuote[] = [
  {
    id: 'bid-001',
    supplierId: 'sup-001',
    supplierName: 'Shenzhen Sports Manufacturing Co.',
    supplierEmail: 'quotes@shenzhen-sports.cn',
    unitCost: {
      value: 4.75,
      confidence: 'high',
      originalText: 'Unit price: $4.75 USD per piece',
      manuallyEdited: false,
    },
    moq: {
      value: 5000,
      confidence: 'high',
      originalText: 'MOQ: 5,000 units',
      manuallyEdited: false,
    },
    leadTimeDays: {
      value: 45,
      confidence: 'high',
      originalText: 'Lead time: 45 days after deposit',
      manuallyEdited: false,
    },
    toolingCosts: {
      value: {
        moldCost: 3500,
        setupCost: 500,
        otherCosts: 0,
        total: 4000,
      },
      confidence: 'high',
      originalText: 'Mold cost: $3,500; Setup fee: $500',
      manuallyEdited: false,
    },
    paymentTerms: {
      value: {
        type: '30% deposit, 70% before shipment',
        depositPercent: 30,
      },
      confidence: 'high',
      originalText: 'Payment terms: 30% deposit, 70% before shipment',
      manuallyEdited: false,
    },
    currency: 'USD',
    productDescription: 'Premium Lacrosse Head - Model LH-2024',
    validUntil: '2026-02-28',
    emailSubject: 'RE: Quote Request - Lacrosse Head Manufacturing',
    emailBody: `Dear Purchasing Team,

Thank you for your inquiry regarding lacrosse head manufacturing. We are pleased to provide the following quotation:

Product: Premium Lacrosse Head - Model LH-2024
Material: Nylon 66 with 30% glass fiber reinforcement

PRICING:
Unit price: $4.75 USD per piece (FOB Shenzhen)

MOQ: 5,000 units

TOOLING:
Mold cost: $3,500 (one-time, reusable for future orders)
Setup fee: $500

LEAD TIME:
Lead time: 45 days after deposit and artwork approval

PAYMENT TERMS:
Payment terms: 30% deposit, 70% before shipment via T/T

This quotation is valid until February 28, 2026.

Best regards,
Wang Wei
Sales Manager
Shenzhen Sports Manufacturing Co.`,
    emailReceivedAt: '2026-01-20T09:30:00Z',
    emailFrom: 'Wang Wei <quotes@shenzhen-sports.cn>',
    status: 'parsed',
    overallConfidence: 'high',
    notes: '',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'bid-002',
    supplierId: undefined,
    supplierName: 'Taiwan Precision Plastics',
    supplierEmail: 'sales@twprecision.com.tw',
    unitCost: {
      value: 5.25,
      confidence: 'medium',
      originalText: '$5.25/unit for standard spec',
      manuallyEdited: false,
    },
    moq: {
      value: 3000,
      confidence: 'high',
      originalText: 'Minimum order quantity is 3000 pcs',
      manuallyEdited: false,
    },
    leadTimeDays: {
      value: 35,
      confidence: 'medium',
      originalText: '5 weeks production time',
      manuallyEdited: false,
    },
    toolingCosts: {
      value: {
        moldCost: 5000,
        setupCost: 0,
        otherCosts: 0,
        total: 5000,
      },
      confidence: 'medium',
      originalText: 'Tooling investment: USD 5,000',
      manuallyEdited: false,
    },
    paymentTerms: {
      value: {
        type: 'Net 30',
        netDays: 30,
      },
      confidence: 'high',
      originalText: 'Terms: Net 30',
      manuallyEdited: false,
    },
    currency: 'USD',
    productDescription: 'Lacrosse Head - Standard Model',
    validUntil: '2026-03-15',
    emailSubject: 'Quote: Lacrosse Equipment Parts',
    emailBody: `Hello,

Following up on your RFQ for lacrosse equipment.

Lacrosse Head - Standard Model
$5.25/unit for standard spec

Minimum order quantity is 3000 pcs
5 weeks production time

Tooling investment: USD 5,000 (amortized over first order)

Terms: Net 30 for established customers

Let me know if you need samples.

Thanks,
Jason Chen
Taiwan Precision Plastics`,
    emailReceivedAt: '2026-01-21T14:15:00Z',
    emailFrom: 'Jason Chen <sales@twprecision.com.tw>',
    status: 'reviewed',
    overallConfidence: 'medium',
    notes: 'Good quality reputation. Sample requested.',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    reviewedBy: 'Mike Johnson',
    reviewedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'bid-003',
    supplierId: undefined,
    supplierName: 'Vietnam Manufacturing Partners',
    supplierEmail: 'export@vnmfg.vn',
    unitCost: {
      value: 3.80,
      confidence: 'low',
      originalText: 'Around $3.80 depending on quantity',
      manuallyEdited: false,
    },
    moq: {
      value: 10000,
      confidence: 'high',
      originalText: 'MOQ 10,000 pieces',
      manuallyEdited: false,
    },
    leadTimeDays: {
      value: null,
      confidence: 'low',
      originalText: '',
      manuallyEdited: false,
    },
    toolingCosts: {
      value: {
        moldCost: 2800,
        setupCost: 0,
        otherCosts: 0,
        total: 2800,
      },
      confidence: 'medium',
      originalText: 'Mold: $2,800',
      manuallyEdited: false,
    },
    paymentTerms: {
      value: null,
      confidence: 'low',
      originalText: '',
      manuallyEdited: false,
    },
    currency: 'USD',
    productDescription: 'Budget Lacrosse Head',
    emailSubject: 'Fwd: RE: Lacrosse manufacturing inquiry',
    emailBody: `Hi,

We can make the lacrosse heads for you.

Around $3.80 depending on quantity
MOQ 10,000 pieces

Mold: $2,800

Quality same as competitors. We work with many US brands.

Contact me for more details.

Nguyen Thi
Vietnam Manufacturing Partners`,
    emailReceivedAt: '2026-01-22T08:45:00Z',
    emailFrom: 'Nguyen Thi <export@vnmfg.vn>',
    status: 'parsed',
    overallConfidence: 'low',
    notes: 'Parsing warnings:\nCould not extract lead time from email\nCould not extract payment terms from email',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'bid-004',
    supplierId: 'sup-002',
    supplierName: 'US Composites Inc.',
    supplierEmail: 'sales@uscomposites.com',
    unitCost: {
      value: 12.50,
      confidence: 'high',
      originalText: 'Unit Cost: $12.50',
      manuallyEdited: true,
    },
    moq: {
      value: 500,
      confidence: 'high',
      originalText: 'MOQ: 500 units',
      manuallyEdited: false,
    },
    leadTimeDays: {
      value: 21,
      confidence: 'high',
      originalText: 'Lead Time: 21 days',
      manuallyEdited: false,
    },
    toolingCosts: {
      value: null,
      confidence: 'manual',
      originalText: '',
      manuallyEdited: true,
    },
    paymentTerms: {
      value: {
        type: 'Net 45',
        netDays: 45,
      },
      confidence: 'high',
      originalText: 'Payment Terms: Net 45',
      manuallyEdited: false,
    },
    currency: 'USD',
    productDescription: 'Premium Carbon Fiber Lacrosse Head',
    validUntil: '2026-04-01',
    emailSubject: 'Quote #2024-1234 - Premium CF Lacrosse Head',
    emailBody: `Quote #2024-1234

Product: Premium Carbon Fiber Lacrosse Head
Material: T700 Carbon Fiber, Clear Coat Finish

Unit Cost: $12.50
MOQ: 500 units
Lead Time: 21 days from PO
Payment Terms: Net 45

Made in USA. All materials domestically sourced.

This quote valid for 90 days.

Best,
Sarah Williams
US Composites Inc.`,
    emailReceivedAt: '2026-01-19T16:00:00Z',
    emailFrom: 'Sarah Williams <sales@uscomposites.com>',
    status: 'accepted',
    overallConfidence: 'high',
    notes: 'Premium domestic option. Higher cost but lower MOQ and faster turnaround.',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    reviewedBy: 'Mike Johnson',
    reviewedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

// Sample emails for testing the parser
export const sampleEmails = [
  {
    subject: 'RE: Quote Request - Sports Equipment Parts',
    body: `Dear Sir/Madam,

Thank you for your inquiry. Please find our quotation below:

Product: Lacrosse Head - Custom Design
Unit price: $6.50 USD/pc
MOQ: 2000 units
Lead time: 30-35 days
Tooling cost: $4,500 (one-time)
Payment terms: 50% deposit, 50% before shipping

Best regards,
Sales Team`,
    from: 'sales@example-mfg.com',
    receivedAt: new Date().toISOString(),
  },
  {
    subject: 'Quotation for lacrosse equipment',
    body: `Hi,

Here's our quote:

$3.25 per unit
Minimum 8,000 pcs
6 weeks delivery
Mold fee $3,000
Terms: Net 30

Thanks`,
    from: 'John Doe <john@factory.cn>',
    receivedAt: new Date().toISOString(),
  },
];
