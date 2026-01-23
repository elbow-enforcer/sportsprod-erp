# Supply Chain Module

## Purpose

The Supply Chain module manages the procurement lifecycle for sportsprod-erp:
- **Supplier Management**: Track vendors, contacts, terms, and performance metrics
- **Purchase Orders**: Create, approve, and track material procurement
- **Receiving**: Receive shipments, inspect quality, and update inventory

## Related PRD

- **PRD**: `tasks/prd-supply-chain.md`
- **User Stories**: US-1.1 through US-4.3

## Dependencies

- `zustand` - State management
- `react-router-dom` - Routing and navigation
- `../auth` - Permission gates (view:supply-chain, edit:supply-chain)

## File Structure

| File | Description |
|------|-------------|
| `types.ts` | TypeScript interfaces: Supplier, PurchaseOrder, ReceivingRecord |
| `store.ts` | Zustand store with CRUD actions and computed values |
| `mockData.ts` | Sample data for development (5 suppliers, 5 POs, 2 receivings) |
| `SupplierList.tsx` | Supplier grid with add/edit modal |
| `SupplierDetail.tsx` | Supplier profile with performance metrics |
| `PurchaseOrderList.tsx` | PO table with status filtering and quick actions |
| `PurchaseOrderDetail.tsx` | PO form with line items and approval workflow |
| `Receiving.tsx` | Receiving workflow with inspection tracking |
| `index.ts` | Barrel exports |

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/supply-chain/suppliers` | SupplierList | List all suppliers |
| `/supply-chain/suppliers/:id` | SupplierDetail | View supplier details |
| `/supply-chain/purchase-orders` | PurchaseOrderList | List all POs |
| `/supply-chain/purchase-orders/:id` | PurchaseOrderDetail | View/edit PO |
| `/supply-chain/purchase-orders/new` | PurchaseOrderDetail | Create new PO |
| `/supply-chain/receiving` | Receiving | Receive against PO |

## Usage Example

```tsx
import { SupplierList, useSupplyChainStore } from './supply-chain';

// In a component
function MyComponent() {
  const { suppliers, addSupplier } = useSupplyChainStore();
  
  return <SupplierList />;
}
```

## Acceptance Criteria

### US-1.1: Supplier List with CRUD
- **Given** user has `view:supply-chain` permission
- **When** user navigates to `/supply-chain/suppliers`
- **Then** displays supplier cards with name, code, status, and rating

### US-2.2: PO Approval Workflow
- **Given** a PO in "draft" status
- **When** user clicks "Submit for Approval"
- **Then** PO status changes to "submitted"
- **When** user with approval rights clicks "Approve"
- **Then** PO status changes to "approved" with approver name and timestamp

### US-3.1: Receive Against PO
- **Given** an approved PO with pending items
- **When** user enters received quantities and submits
- **Then** PO line items update with received quantities
- **Then** PO status changes to "partial" or "received" based on completion

## Permissions

| Permission | Roles | Description |
|------------|-------|-------------|
| `view:supply-chain` | admin, finance, management, operations | View suppliers, POs, receiving |
| `edit:supply-chain` | admin, management, operations | Create/edit suppliers and POs |
