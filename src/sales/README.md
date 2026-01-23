# Sales & Orders Module

## Overview
Complete sales order management system for sportsprod-erp, handling the full order-to-cash cycle from customer management through fulfillment and shipping.

## Related PRD
- `tasks/prd-sales-orders.md`

## Features

### Customer Management
- Customer list with search, type filters, and status filters
- Customer detail view with contacts, addresses, payment terms
- Customer order history and quote history
- CRUD operations for customer data

### Quote Management
- Quote creation for customers
- Line items with products, quantities, pricing, and discounts
- Quote status workflow: Draft → Sent → Approved/Rejected → Converted
- Convert approved quotes to sales orders

### Sales Orders
- Order creation (from quotes or direct)
- Order status tracking: Pending → Confirmed → Processing → Ready to Ship → Shipped → Delivered
- Priority levels (Standard, Rush, Priority)
- Order line items with totals

### Fulfillment & Shipping
- Pick list generation from orders
- Pick quantity tracking per item
- Fulfillment status workflow: Pending → Picking → Packing → Ready → Shipped
- Shipment creation with carrier, service, tracking number
- Delivery confirmation

## File Structure

```
src/sales/
├── README.md              # This file
├── index.ts               # Module exports
├── types.ts               # TypeScript type definitions
├── store.ts               # Zustand state management
├── mockData.ts            # Sample data for development
├── CustomerList.tsx       # Customer list view
├── CustomerDetail.tsx     # Customer detail with tabs
├── QuoteList.tsx          # Quote list view
├── QuoteDetail.tsx        # Quote detail and conversion
├── SalesOrderList.tsx     # Order list view
├── SalesOrderDetail.tsx   # Order detail with status workflow
└── Fulfillment.tsx        # Pick/pack/ship workflow
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/sales/customers` | CustomerList | Customer directory |
| `/sales/customers/:id` | CustomerDetail | Customer detail view |
| `/sales/quotes` | QuoteList | Quote management |
| `/sales/quotes/:id` | QuoteDetail | Quote detail/conversion |
| `/sales/orders` | SalesOrderList | Order management |
| `/sales/orders/:id` | SalesOrderDetail | Order detail/fulfillment |
| `/sales/fulfillment` | Fulfillment | Warehouse fulfillment center |

## Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `view:sales` | View customers, quotes, orders | admin, finance, management, sales_marketing, operations |
| `edit:sales` | Create/edit customers, quotes, orders | admin, management, sales_marketing |

## State Management

Uses Zustand store (`useSalesStore`) with:
- Customer CRUD actions
- Quote CRUD and status actions
- Order CRUD and status actions
- Fulfillment and shipment actions
- Computed dashboard stats

## Usage

```tsx
import { 
  CustomerList, 
  CustomerDetail,
  QuoteList,
  QuoteDetail,
  SalesOrderList,
  SalesOrderDetail,
  Fulfillment,
  useSalesStore 
} from './sales';

// Access store
const { customers, orders, stats } = useSalesStore();
```

## User Stories Implemented

- US-1.1: Customer list with CRUD ✅
- US-1.2: Customer detail (contacts, addresses, terms) ✅
- US-1.3: Customer order history ✅
- US-2.1: Create quote for customer ✅
- US-2.2: Quote line items (products, qty, pricing) ✅
- US-2.3: Quote approval and convert to order ✅
- US-3.1: Sales order creation ✅
- US-3.2: Order line items with inventory check ✅
- US-3.3: Order status tracking ✅
- US-3.4: Order fulfillment workflow ✅
- US-4.1: Pick list generation ✅
- US-4.2: Packing slip / shipping label ✅
- US-4.3: Ship confirmation and tracking ✅
- US-4.4: Delivery confirmation ✅
- US-5.1: Routes for /sales/* ✅
- US-5.2: Sidebar navigation ✅
- US-5.3: Permissions ✅
