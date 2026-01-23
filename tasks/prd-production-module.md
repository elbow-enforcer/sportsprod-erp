# PRD: Production & Manufacturing Module

## Overview
Build a complete production/manufacturing module for SportsProd ERP to manage the manufacturing process from raw materials to finished goods. This is essential for a sports equipment manufacturing business.

## Business Context
SportsProd manufactures sports equipment (bats, balls, protective gear, etc.). The production module needs to handle:
- Bill of Materials (BOM) - what components make up each product
- Work Orders - production jobs to manufacture products
- Production scheduling and tracking
- Inventory consumption and output
- Quality control checkpoints

---

## Sprint 1: Data Models & Types (Demoable: Type-safe foundation)

### US-1.1: Production Type Definitions
**Task:** Create TypeScript interfaces for production entities
**File:** `src/production/types.ts`
**Requirements:**
- `RawMaterial` - id, name, sku, unit, unitCost, currentStock, reorderPoint, supplierId
- `BOMItem` - materialId, quantity, unit, notes
- `BillOfMaterials` - id, productId, productName, version, items: BOMItem[], laborHours, laborCostPerHour, overheadCost, effectiveDate
- `WorkOrderStatus` - enum: Draft, Scheduled, InProgress, QualityCheck, Complete, Cancelled
- `WorkOrder` - id, bomId, quantity, status, scheduledStart, scheduledEnd, actualStart, actualEnd, assignedTo, priority, notes
- `QualityCheckpoint` - id, workOrderId, checkType, passed, notes, checkedBy, checkedAt
- `ProductionRun` - id, workOrderId, quantityProduced, quantityDefective, materialsConsumed, startTime, endTime

**Validation:** TypeScript compiles with no errors, types are exported from index

---

### US-1.2: Production State Store
**Task:** Create Zustand store for production state management
**File:** `src/production/store.ts`
**Requirements:**
- Store for: rawMaterials, billsOfMaterials, workOrders, productionRuns
- Actions: addBOM, updateBOM, createWorkOrder, updateWorkOrderStatus, recordProductionRun
- Computed: getActiveBOMs, getPendingWorkOrders, getProductionStats
- Persist to localStorage

**Validation:** Unit tests for all store actions and computed values

---

### US-1.3: Mock Production Data
**Task:** Create realistic mock data for development/testing
**File:** `src/production/mockData.ts`
**Requirements:**
- 10+ raw materials (aluminum, leather, rubber, thread, foam, plastic, etc.)
- 5+ BOMs for different products (baseball bat, glove, helmet, baseball, batting gloves)
- 8+ work orders in various statuses
- Production history data for charts

**Validation:** Mock data conforms to types, no TS errors

---

## Sprint 2: Bill of Materials UI (Demoable: View and manage BOMs)

### US-2.1: BOM List Page
**Task:** Create page listing all Bills of Materials
**File:** `src/production/BOMList.tsx`
**Requirements:**
- Table with: Product, Version, Components Count, Labor Hours, Total Cost, Effective Date, Actions
- Sort by any column
- Filter by product name
- Link to BOM detail view
- "Create New BOM" button

**Validation:** Page renders, sorting works, navigation works

---

### US-2.2: BOM Detail/Edit Page
**Task:** Create page to view and edit a BOM
**File:** `src/production/BOMDetail.tsx`
**Requirements:**
- Header: Product name, version, effective date
- Components table: Material, Quantity, Unit, Unit Cost, Line Total
- Add/remove component rows
- Labor section: Hours, Rate, Total
- Overhead input
- Total cost calculation (materials + labor + overhead)
- Save/Cancel buttons
- Version history sidebar

**Validation:** Edit flow works, calculations correct, saves to store

---

### US-2.3: BOM Cost Breakdown Chart
**Task:** Visual breakdown of BOM costs
**File:** `src/production/BOMCostChart.tsx`
**Requirements:**
- Pie chart: Materials vs Labor vs Overhead
- Bar chart: Cost by material
- Margin analysis if selling price known

**Validation:** Charts render with mock data

---

## Sprint 3: Work Orders (Demoable: Create and manage production jobs)

### US-3.1: Work Order List Page
**Task:** Create page listing all work orders
**File:** `src/production/WorkOrderList.tsx`
**Requirements:**
- Table: WO#, Product, Quantity, Status, Scheduled Date, Priority, Assigned To
- Status badge colors (Draft=gray, Scheduled=blue, InProgress=yellow, QC=purple, Complete=green, Cancelled=red)
- Filter by status, date range, assignee
- Bulk actions: Start Selected, Complete Selected
- "Create Work Order" button

**Validation:** Page renders, filters work, bulk actions work

---

### US-3.2: Work Order Detail Page
**Task:** Create/edit work order with full details
**File:** `src/production/WorkOrderDetail.tsx`
**Requirements:**
- BOM selector (dropdown of active BOMs)
- Quantity input
- Scheduling: Start date, End date
- Priority selector (Low, Medium, High, Urgent)
- Assignee selector
- Status workflow buttons (contextual based on current status)
- Materials requirements preview (quantity × BOM components)
- Inventory availability check (show warnings if insufficient stock)
- Notes/comments section

**Validation:** Create flow works, status transitions correct

---

### US-3.3: Work Order Kanban View
**Task:** Kanban board for visual work order management
**File:** `src/production/WorkOrderKanban.tsx`
**Requirements:**
- Columns: Draft, Scheduled, In Progress, QC, Complete
- Drag-and-drop to change status
- Card shows: Product, Quantity, Due Date, Priority indicator
- Swimlanes option by assignee
- Quick filters

**Validation:** Drag-drop works, persists to store

---

## Sprint 4: Production Tracking (Demoable: Record and monitor production)

### US-4.1: Production Recording Form
**Task:** Form to record production output
**File:** `src/production/RecordProduction.tsx`
**Requirements:**
- Select work order (or scan barcode placeholder)
- Quantity produced
- Quantity defective
- Time tracking (start/end or duration)
- Materials consumed (pre-filled from BOM, adjustable)
- Operator notes
- Submit creates ProductionRun record

**Validation:** Submit creates record, updates work order progress

---

### US-4.2: Quality Control Checklist
**Task:** QC checkpoint recording
**File:** `src/production/QualityControl.tsx`
**Requirements:**
- Work order selector
- Checklist items (configurable per product type)
- Pass/Fail for each item
- Photos upload placeholder
- Defect categorization
- Inspector signature field
- Approve/Reject work order

**Validation:** QC flow works, updates work order status

---

### US-4.3: Production Dashboard
**Task:** Real-time production overview
**File:** `src/production/ProductionDashboard.tsx`
**Requirements:**
- KPI cards: Orders Today, Units Produced, Defect Rate, On-Time Rate
- Production by product chart (bar)
- Throughput trend (line chart, last 30 days)
- Active work orders list (status, progress %)
- Alerts panel (low stock, overdue orders, high defect rates)

**Validation:** Dashboard renders, KPIs calculate correctly

---

## Sprint 5: Inventory Integration (Demoable: Materials flow)

### US-5.1: Raw Materials Management
**Task:** Page to manage raw material inventory
**File:** `src/production/RawMaterials.tsx`
**Requirements:**
- Table: Material, SKU, Current Stock, Reorder Point, Unit Cost, Supplier
- Stock level indicators (red/yellow/green)
- Add/Edit material modal
- Reorder alerts (stock below reorder point)
- Link to create purchase order (placeholder)

**Validation:** CRUD works, alerts show correctly

---

### US-5.2: Inventory Consumption Tracking
**Task:** Track material usage from production
**File:** `src/production/MaterialConsumption.tsx`
**Requirements:**
- Auto-deduct from inventory when production recorded
- Variance tracking (expected vs actual consumption)
- Waste/scrap recording
- Consumption history log

**Validation:** Inventory decrements correctly on production

---

### US-5.3: Finished Goods Output
**Task:** Add produced items to finished goods inventory
**File:** `src/production/FinishedGoods.tsx`
**Requirements:**
- Auto-increment finished goods when work order completes
- Lot tracking (work order = lot ID)
- Location assignment
- Integration with existing Inventory.tsx

**Validation:** Inventory increments, lots tracked

---

## Sprint 6: Routing & Navigation

### US-6.1: Production Routes
**Task:** Add routes for all production pages
**File:** `src/App.tsx` updates
**Requirements:**
- /production - Dashboard
- /production/bom - BOM list
- /production/bom/:id - BOM detail
- /production/work-orders - Work order list
- /production/work-orders/:id - Work order detail
- /production/kanban - Kanban view
- /production/materials - Raw materials
- /production/record - Record production
- /production/qc - Quality control

**Validation:** All routes navigate correctly

---

### US-6.2: Sidebar Navigation
**Task:** Add Production section to sidebar
**File:** Sidebar component updates
**Requirements:**
- Production section header
- Links: Dashboard, BOMs, Work Orders, Kanban, Materials, Record, QC
- Icons for each
- Proper permission gating (view:production)

**Validation:** Sidebar shows production section, links work

---

### US-6.3: Permission Integration
**Task:** Add production permissions
**File:** `src/auth/permissions.ts` updates
**Requirements:**
- view:production - See production pages
- edit:production - Create/edit BOMs and work orders
- manage:production - Full access including delete
- Assign to appropriate roles

**Validation:** Permissions enforced on routes

---

## Acceptance Criteria

Each sprint delivers:
1. ✅ Working, demoable features
2. ✅ TypeScript compiles with no errors
3. ✅ Tests pass (where applicable)
4. ✅ Code committed with descriptive messages
5. ✅ Builds successfully

## Dependencies
- Existing inventory module (will integrate)
- Existing auth/permissions system
- Existing component library (tables, forms, charts)

## Out of Scope (Future)
- Production scheduling optimization
- Machine/equipment tracking
- Supplier integration
- Barcode scanning
- Mobile shop floor app
