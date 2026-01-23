/**
 * @file schema.ts
 * @description Database schema definitions using Drizzle ORM
 * @related-prd Issue #29 - Database Schema Setup
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// SCENARIOS - Base financial scenarios/models
// ============================================================================
export const scenarios = sqliteTable('scenarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['base', 'optimistic', 'pessimistic', 'custom'] }).notNull().default('base'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// PROJECTIONS - Financial projections linked to scenarios
// ============================================================================
export const projections = sqliteTable('projections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scenarioId: integer('scenario_id').notNull().references(() => scenarios.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month'), // Optional for monthly projections
  
  // Revenue metrics
  revenue: real('revenue').notNull().default(0),
  cogs: real('cogs').notNull().default(0),
  grossProfit: real('gross_profit').notNull().default(0),
  
  // Operating expenses
  marketing: real('marketing').notNull().default(0),
  gna: real('gna').notNull().default(0), // General & Administrative
  rd: real('rd').notNull().default(0), // R&D
  
  // Bottom line
  ebitda: real('ebitda').notNull().default(0),
  netIncome: real('net_income').notNull().default(0),
  
  // Cash flow
  operatingCashFlow: real('operating_cash_flow').notNull().default(0),
  capex: real('capex').notNull().default(0),
  freeCashFlow: real('free_cash_flow').notNull().default(0),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// PROMO_CODES - Marketing promotional codes
// ============================================================================
export const promoCodes = sqliteTable('promo_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type', { enum: ['percentage', 'fixed', 'free_shipping'] }).notNull(),
  discountValue: real('discount_value').notNull(),
  minOrderValue: real('min_order_value'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  channel: text('channel', { enum: ['website', 'email', 'social', 'influencer', 'affiliate', 'all'] }).default('all'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// PERSONNEL - Employee/contractor records for G&A planning
// ============================================================================
export const personnel = sqliteTable('personnel', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  department: text('department', { 
    enum: ['executive', 'sales', 'marketing', 'operations', 'finance', 'product', 'engineering', 'hr'] 
  }).notNull(),
  employmentType: text('employment_type', { enum: ['full_time', 'part_time', 'contractor', 'intern'] }).notNull(),
  
  // Compensation
  baseSalary: real('base_salary').notNull(),
  bonus: real('bonus').default(0),
  benefits: real('benefits').default(0), // Annual benefits cost
  
  // Timeline
  startDate: text('start_date').notNull(),
  endDate: text('end_date'), // Null means current employee
  
  // Planning
  scenarioId: integer('scenario_id').references(() => scenarios.id, { onDelete: 'set null' }),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// EXPENSES - Operating expense tracking
// ============================================================================
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category', { 
    enum: ['cogs', 'marketing', 'gna', 'rd', 'capex', 'interest', 'taxes', 'other'] 
  }).notNull(),
  subcategory: text('subcategory'), // e.g., "AWS", "Google Ads", "Legal"
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  
  // Timing
  frequency: text('frequency', { enum: ['one_time', 'monthly', 'quarterly', 'annual'] }).notNull(),
  date: text('date').notNull(), // For one-time, or start date for recurring
  endDate: text('end_date'), // For recurring expenses
  
  // Links
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  scenarioId: integer('scenario_id').references(() => scenarios.id, { onDelete: 'set null' }),
  
  // Status
  status: text('status', { enum: ['planned', 'approved', 'paid', 'cancelled'] }).notNull().default('planned'),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// VENDORS - Supplier/vendor management
// ============================================================================
export const vendors = sqliteTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { 
    enum: ['manufacturer', 'supplier', 'service_provider', 'contractor', 'software', 'logistics'] 
  }).notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  
  // Business details
  paymentTerms: text('payment_terms'), // e.g., "Net 30", "Net 60"
  currency: text('currency').notNull().default('USD'),
  taxId: text('tax_id'),
  
  // Rating/status
  rating: integer('rating'), // 1-5
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// BIDS - Vendor bids/quotes for procurement
// ============================================================================
export const bids = sqliteTable('bids', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorId: integer('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  
  // Bid details
  itemDescription: text('item_description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  currency: text('currency').notNull().default('USD'),
  
  // Timeline
  leadTimeDays: integer('lead_time_days'),
  validUntil: text('valid_until'),
  submittedDate: text('submitted_date').notNull(),
  
  // Status
  status: text('status', { 
    enum: ['pending', 'under_review', 'accepted', 'rejected', 'expired'] 
  }).notNull().default('pending'),
  notes: text('notes'),
  
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// RELATIONS
// ============================================================================
export const scenariosRelations = relations(scenarios, ({ many }) => ({
  projections: many(projections),
  personnel: many(personnel),
  expenses: many(expenses),
}));

export const projectionsRelations = relations(projections, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [projections.scenarioId],
    references: [scenarios.id],
  }),
}));

export const personnelRelations = relations(personnel, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [personnel.scenarioId],
    references: [scenarios.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  vendor: one(vendors, {
    fields: [expenses.vendorId],
    references: [vendors.id],
  }),
  scenario: one(scenarios, {
    fields: [expenses.scenarioId],
    references: [scenarios.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  bids: many(bids),
  expenses: many(expenses),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  vendor: one(vendors, {
    fields: [bids.vendorId],
    references: [vendors.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Scenario = typeof scenarios.$inferSelect;
export type NewScenario = typeof scenarios.$inferInsert;

export type Projection = typeof projections.$inferSelect;
export type NewProjection = typeof projections.$inferInsert;

export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;

export type Personnel = typeof personnel.$inferSelect;
export type NewPersonnel = typeof personnel.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
