/**
 * Production & Manufacturing Module
 * Exports all production-related types, stores, and components
 */

// Types
export {
  // Raw Materials
  type RawMaterial,
  
  // Bill of Materials
  type BOMItem,
  type BillOfMaterials,
  
  // Work Orders
  WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrder,
  
  // Quality Control
  type QualityCheckType,
  type QualityCheckpoint,
  
  // Production Runs
  type MaterialConsumption,
  type ProductionRun,
  
  // Statistics & Helpers
  type ProductionStats,
  type Supplier,
  type ProductionAlert,
  
  // Constants
  WORK_ORDER_STATUS_COLORS,
  PRIORITY_COLORS,
} from './types';

// Store
export {
  useProductionStore,
  calculateBOMCost,
  checkMaterialAvailability,
} from './store';

// Mock Data (for development/testing)
export {
  mockSuppliers,
  mockRawMaterials,
  mockBillsOfMaterials,
  mockWorkOrders,
  mockProductionRuns,
  mockQualityCheckpoints,
  mockAlerts,
  initializeMockData,
  generateHistoricalProductionData,
  getProductionByProduct,
} from './mockData';

// Components
export { BOMList } from './BOMList';
export { BOMDetail } from './BOMDetail';
export { BOMCostChart } from './BOMCostChart';
export { WorkOrderList } from './WorkOrderList';
export { WorkOrderDetail } from './WorkOrderDetail';
export { KanbanBoard } from './KanbanBoard';
