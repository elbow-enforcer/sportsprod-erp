# Database Schema

> Issue #29 - Database schema setup for SportsProd ERP

## Overview

This module provides the database layer using [Drizzle ORM](https://orm.drizzle.team/) with SQLite (better-sqlite3) for local development. The schema is designed to support financial planning, vendor management, and marketing operations.

## Tables

### Core Financial

| Table | Purpose |
|-------|---------|
| `scenarios` | Financial model scenarios (base, optimistic, pessimistic) |
| `projections` | Year-over-year financial projections linked to scenarios |

### Operations

| Table | Purpose |
|-------|---------|
| `personnel` | Employee and contractor records for G&A planning |
| `expenses` | Operating expense tracking by category |
| `vendors` | Supplier and service provider management |
| `bids` | Vendor quotes and procurement bids |

### Marketing

| Table | Purpose |
|-------|---------|
| `promo_codes` | Promotional codes with usage tracking |

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│  scenarios   │───┬───│ projections  │
└──────────────┘   │   └──────────────┘
                   │
                   ├───┌──────────────┐
                   │   │  personnel   │
                   │   └──────────────┘
                   │
                   └───┌──────────────┐      ┌──────────────┐
                       │   expenses   │──────│   vendors    │
                       └──────────────┘      └──────────────┘
                                                    │
                                             ┌──────────────┐
                                             │     bids     │
                                             └──────────────┘

┌──────────────┐
│ promo_codes  │  (standalone)
└──────────────┘
```

## Quick Start

### Generate migrations

```bash
npm run db:generate
```

### Run migrations

```bash
npm run db:migrate
```

### Seed the database

```bash
npm run db:seed
```

### Open Drizzle Studio (GUI)

```bash
npm run db:studio
```

## Schema Details

### scenarios

Financial modeling scenarios for what-if analysis.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Scenario name |
| description | TEXT | Detailed description |
| type | ENUM | base, optimistic, pessimistic, custom |
| is_active | BOOLEAN | Whether scenario is active |
| start_year | INTEGER | First year of projections |
| end_year | INTEGER | Last year of projections |

### projections

Financial projections tied to scenarios.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| scenario_id | INTEGER | FK to scenarios |
| year | INTEGER | Projection year |
| month | INTEGER | Optional month for monthly projections |
| revenue | REAL | Total revenue |
| cogs | REAL | Cost of goods sold |
| gross_profit | REAL | Revenue - COGS |
| marketing | REAL | Marketing spend |
| gna | REAL | General & Administrative |
| rd | REAL | R&D expenses |
| ebitda | REAL | Operating income |
| net_income | REAL | Bottom line |
| operating_cash_flow | REAL | Cash from operations |
| capex | REAL | Capital expenditures |
| free_cash_flow | REAL | OCF - CapEx |

### vendors

Supplier and service provider directory.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Company name |
| type | ENUM | manufacturer, supplier, service_provider, contractor, software, logistics |
| contact_name | TEXT | Primary contact |
| email | TEXT | Contact email |
| phone | TEXT | Contact phone |
| address | TEXT | Physical address |
| payment_terms | TEXT | e.g., "Net 30" |
| rating | INTEGER | 1-5 star rating |

### bids

Vendor quotes and procurement bids.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| vendor_id | INTEGER | FK to vendors |
| item_description | TEXT | What's being quoted |
| quantity | INTEGER | Units |
| unit_price | REAL | Price per unit |
| total_price | REAL | Total bid amount |
| lead_time_days | INTEGER | Delivery timeline |
| status | ENUM | pending, under_review, accepted, rejected, expired |

### personnel

Employee and contractor records.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Employee name |
| role | TEXT | Job title |
| department | ENUM | executive, sales, marketing, operations, finance, product, engineering, hr |
| employment_type | ENUM | full_time, part_time, contractor, intern |
| base_salary | REAL | Annual base salary |
| bonus | REAL | Annual bonus |
| benefits | REAL | Annual benefits cost |
| start_date | TEXT | Employment start |
| end_date | TEXT | Employment end (null = current) |
| scenario_id | INTEGER | FK to scenarios (for planning) |

### expenses

Operating expense tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| category | ENUM | cogs, marketing, gna, rd, capex, interest, taxes, other |
| subcategory | TEXT | e.g., "AWS", "Legal" |
| description | TEXT | Expense description |
| amount | REAL | Expense amount |
| frequency | ENUM | one_time, monthly, quarterly, annual |
| vendor_id | INTEGER | FK to vendors (optional) |
| status | ENUM | planned, approved, paid, cancelled |

### promo_codes

Marketing promotional codes.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| code | TEXT | Promo code (unique) |
| discount_type | ENUM | percentage, fixed, free_shipping |
| discount_value | REAL | Discount amount |
| min_order_value | REAL | Minimum order to apply |
| max_uses | INTEGER | Usage limit |
| used_count | INTEGER | Current usage |
| start_date | TEXT | Valid from |
| end_date | TEXT | Valid until |
| channel | ENUM | website, email, social, influencer, affiliate, all |

## TypeScript Types

All tables export inferred types:

```typescript
import { 
  Scenario, NewScenario,
  Projection, NewProjection,
  Vendor, NewVendor,
  Bid, NewBid,
  Personnel, NewPersonnel,
  Expense, NewExpense,
  PromoCode, NewPromoCode,
} from '@/db/schema';
```

## Usage Example

```typescript
import { db, scenarios, projections, eq } from '@/db';

// Get all active scenarios
const activeScenarios = await db
  .select()
  .from(scenarios)
  .where(eq(scenarios.isActive, true));

// Get projections for a scenario
const baseProjections = await db
  .select()
  .from(projections)
  .where(eq(projections.scenarioId, 1))
  .orderBy(projections.year);

// Insert new vendor
const [newVendor] = await db.insert(vendors).values({
  name: 'New Supplier',
  type: 'supplier',
  paymentTerms: 'Net 30',
}).returning();
```

## Future Considerations

- **PostgreSQL migration**: Schema is designed to be portable. Update `drizzle.config.ts` and connection to switch to PostgreSQL for production.
- **Multi-tenancy**: Add `organization_id` to all tables for multi-tenant support.
- **Audit trails**: Consider adding `created_by` and `updated_by` columns.
- **Soft deletes**: Add `deleted_at` column for recoverable deletions.
