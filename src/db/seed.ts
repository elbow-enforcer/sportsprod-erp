/**
 * @file seed.ts
 * @description Database seed data for testing
 * @related-prd Issue #29 - Database Schema Setup
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 * 
 * Run with: npx tsx src/db/seed.ts
 */

import { db } from './index';
import { 
  scenarios, 
  projections, 
  promoCodes, 
  personnel, 
  expenses, 
  vendors, 
  bids 
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ============================================================================
  // SCENARIOS
  // ============================================================================
  console.log('Creating scenarios...');
  const [baseScenario, optimisticScenario, pessimisticScenario] = await db.insert(scenarios).values([
    {
      name: 'Base Case',
      description: 'Conservative growth assumptions based on historical trends',
      type: 'base',
      isActive: true,
      startYear: 2026,
      endYear: 2030,
    },
    {
      name: 'Optimistic Case',
      description: 'Strong market penetration with successful marketing campaigns',
      type: 'optimistic',
      isActive: true,
      startYear: 2026,
      endYear: 2030,
    },
    {
      name: 'Pessimistic Case',
      description: 'Conservative estimates accounting for market headwinds',
      type: 'pessimistic',
      isActive: true,
      startYear: 2026,
      endYear: 2030,
    },
  ]).returning();

  // ============================================================================
  // PROJECTIONS (5 years for base scenario)
  // ============================================================================
  console.log('Creating projections...');
  const baseProjections = [
    { year: 2026, revenue: 500000, cogs: 175000, grossProfit: 325000, marketing: 100000, gna: 75000, rd: 25000, ebitda: 125000, netIncome: 87500, operatingCashFlow: 100000, capex: 25000, freeCashFlow: 75000 },
    { year: 2027, revenue: 1200000, cogs: 396000, grossProfit: 804000, marketing: 180000, gna: 120000, rd: 50000, ebitda: 454000, netIncome: 317800, operatingCashFlow: 380000, capex: 50000, freeCashFlow: 330000 },
    { year: 2028, revenue: 2500000, cogs: 775000, grossProfit: 1725000, marketing: 300000, gna: 200000, rd: 100000, ebitda: 1125000, netIncome: 787500, operatingCashFlow: 900000, capex: 100000, freeCashFlow: 800000 },
    { year: 2029, revenue: 4500000, cogs: 1350000, grossProfit: 3150000, marketing: 450000, gna: 350000, rd: 175000, ebitda: 2175000, netIncome: 1522500, operatingCashFlow: 1700000, capex: 150000, freeCashFlow: 1550000 },
    { year: 2030, revenue: 7500000, cogs: 2175000, grossProfit: 5325000, marketing: 600000, gna: 500000, rd: 250000, ebitda: 3975000, netIncome: 2782500, operatingCashFlow: 3100000, capex: 200000, freeCashFlow: 2900000 },
  ];

  await db.insert(projections).values(
    baseProjections.map(p => ({ ...p, scenarioId: baseScenario.id }))
  );

  // ============================================================================
  // VENDORS
  // ============================================================================
  console.log('Creating vendors...');
  const [mfgVendor, packagingVendor, softwareVendor, logisticsVendor] = await db.insert(vendors).values([
    {
      name: 'Pro Manufacturing Co.',
      type: 'manufacturer',
      contactName: 'John Smith',
      email: 'john@promfg.com',
      phone: '+1-555-0100',
      address: '123 Industrial Way, Chicago, IL 60601',
      paymentTerms: 'Net 30',
      currency: 'USD',
      rating: 4,
      isActive: true,
      notes: 'Primary manufacturer for flagship product line',
    },
    {
      name: 'EcoPack Solutions',
      type: 'supplier',
      contactName: 'Sarah Johnson',
      email: 'sarah@ecopack.com',
      phone: '+1-555-0200',
      address: '456 Sustainable Blvd, Portland, OR 97201',
      paymentTerms: 'Net 15',
      currency: 'USD',
      rating: 5,
      isActive: true,
      notes: 'Sustainable packaging supplier',
    },
    {
      name: 'CloudOps SaaS',
      type: 'software',
      contactName: 'Tech Support',
      email: 'support@cloudops.io',
      phone: '+1-555-0300',
      paymentTerms: 'Monthly',
      currency: 'USD',
      rating: 4,
      isActive: true,
      notes: 'ERP and inventory management software',
    },
    {
      name: 'FastShip Logistics',
      type: 'logistics',
      contactName: 'Mike Chen',
      email: 'mike@fastship.com',
      phone: '+1-555-0400',
      address: '789 Fulfillment Center Dr, Memphis, TN 38118',
      paymentTerms: 'Net 30',
      currency: 'USD',
      rating: 4,
      isActive: true,
      notes: '3PL partner for nationwide distribution',
    },
  ]).returning();

  // ============================================================================
  // BIDS
  // ============================================================================
  console.log('Creating bids...');
  await db.insert(bids).values([
    {
      vendorId: mfgVendor.id,
      itemDescription: 'Premium Sports Equipment - Q1 2026 Production Run',
      quantity: 5000,
      unitPrice: 12.50,
      totalPrice: 62500,
      currency: 'USD',
      leadTimeDays: 45,
      validUntil: '2026-02-28',
      submittedDate: '2026-01-15',
      status: 'under_review',
      notes: 'Includes quality certification',
    },
    {
      vendorId: mfgVendor.id,
      itemDescription: 'Premium Sports Equipment - Q2 2026 Production Run',
      quantity: 7500,
      unitPrice: 11.75,
      totalPrice: 88125,
      currency: 'USD',
      leadTimeDays: 45,
      validUntil: '2026-03-31',
      submittedDate: '2026-01-20',
      status: 'pending',
      notes: 'Volume discount applied',
    },
    {
      vendorId: packagingVendor.id,
      itemDescription: 'Eco-friendly Product Boxes (1000 units)',
      quantity: 1000,
      unitPrice: 2.25,
      totalPrice: 2250,
      currency: 'USD',
      leadTimeDays: 14,
      validUntil: '2026-02-15',
      submittedDate: '2026-01-18',
      status: 'accepted',
    },
  ]);

  // ============================================================================
  // PERSONNEL
  // ============================================================================
  console.log('Creating personnel...');
  await db.insert(personnel).values([
    {
      name: 'Alex Rivera',
      role: 'CEO',
      department: 'executive',
      employmentType: 'full_time',
      baseSalary: 150000,
      bonus: 30000,
      benefits: 18000,
      startDate: '2025-01-01',
      scenarioId: baseScenario.id,
    },
    {
      name: 'Jordan Lee',
      role: 'VP of Sales',
      department: 'sales',
      employmentType: 'full_time',
      baseSalary: 120000,
      bonus: 40000,
      benefits: 15000,
      startDate: '2025-03-15',
      scenarioId: baseScenario.id,
    },
    {
      name: 'Taylor Kim',
      role: 'Marketing Manager',
      department: 'marketing',
      employmentType: 'full_time',
      baseSalary: 85000,
      bonus: 10000,
      benefits: 12000,
      startDate: '2025-06-01',
      scenarioId: baseScenario.id,
    },
    {
      name: 'Casey Morgan',
      role: 'Operations Lead',
      department: 'operations',
      employmentType: 'full_time',
      baseSalary: 90000,
      bonus: 8000,
      benefits: 12000,
      startDate: '2025-04-01',
      scenarioId: baseScenario.id,
    },
    {
      name: 'Sam Park',
      role: 'Financial Analyst',
      department: 'finance',
      employmentType: 'contractor',
      baseSalary: 75000,
      bonus: 0,
      benefits: 0,
      startDate: '2025-09-01',
      scenarioId: baseScenario.id,
    },
  ]);

  // ============================================================================
  // EXPENSES
  // ============================================================================
  console.log('Creating expenses...');
  await db.insert(expenses).values([
    {
      category: 'marketing',
      subcategory: 'Digital Advertising',
      description: 'Google Ads monthly budget',
      amount: 5000,
      frequency: 'monthly',
      date: '2026-01-01',
      status: 'approved',
      scenarioId: baseScenario.id,
    },
    {
      category: 'marketing',
      subcategory: 'Digital Advertising',
      description: 'Meta Ads monthly budget',
      amount: 3500,
      frequency: 'monthly',
      date: '2026-01-01',
      status: 'approved',
      scenarioId: baseScenario.id,
    },
    {
      category: 'gna',
      subcategory: 'Software',
      description: 'CloudOps ERP Subscription',
      amount: 500,
      frequency: 'monthly',
      date: '2026-01-01',
      vendorId: softwareVendor.id,
      status: 'paid',
      scenarioId: baseScenario.id,
    },
    {
      category: 'gna',
      subcategory: 'Legal',
      description: 'Trademark registration',
      amount: 2500,
      frequency: 'one_time',
      date: '2026-02-01',
      status: 'planned',
      scenarioId: baseScenario.id,
    },
    {
      category: 'cogs',
      subcategory: 'Fulfillment',
      description: 'FastShip 3PL services',
      amount: 8000,
      frequency: 'monthly',
      date: '2026-01-01',
      vendorId: logisticsVendor.id,
      status: 'approved',
      scenarioId: baseScenario.id,
    },
    {
      category: 'capex',
      subcategory: 'Equipment',
      description: 'Quality testing equipment',
      amount: 15000,
      frequency: 'one_time',
      date: '2026-03-01',
      status: 'planned',
      scenarioId: baseScenario.id,
    },
  ]);

  // ============================================================================
  // PROMO CODES
  // ============================================================================
  console.log('Creating promo codes...');
  await db.insert(promoCodes).values([
    {
      code: 'WELCOME10',
      description: 'Welcome discount for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 50,
      maxUses: 1000,
      usedCount: 127,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isActive: true,
      channel: 'website',
    },
    {
      code: 'SPRING25',
      description: 'Spring sale 2026',
      discountType: 'percentage',
      discountValue: 25,
      minOrderValue: 100,
      maxUses: 500,
      usedCount: 0,
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      isActive: true,
      channel: 'all',
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on orders over $75',
      discountType: 'free_shipping',
      discountValue: 0,
      minOrderValue: 75,
      startDate: '2026-01-01',
      isActive: true,
      channel: 'all',
    },
    {
      code: 'INFLUENCER20',
      description: 'Influencer partner code',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 0,
      maxUses: 200,
      usedCount: 45,
      startDate: '2026-01-01',
      isActive: true,
      channel: 'influencer',
    },
    {
      code: 'BULK50',
      description: 'Bulk order discount - $50 off orders over $500',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 500,
      startDate: '2026-01-01',
      isActive: true,
      channel: 'all',
    },
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nSummary:');
  console.log('  - 3 scenarios');
  console.log('  - 5 projections (5-year base case)');
  console.log('  - 4 vendors');
  console.log('  - 3 bids');
  console.log('  - 5 personnel records');
  console.log('  - 6 expenses');
  console.log('  - 5 promo codes');
}

// Run seed
seed().catch(console.error);
