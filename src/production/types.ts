/**
 * Production & Manufacturing Module Types
 * US-1.1: Production Type Definitions
 */

// ============================================================================
// Raw Materials
// ============================================================================

export interface RawMaterial {
  id: string;
  name: string;
  sku: string;
  unit: string;
  unitCost: number;
  currentStock: number;
  reorderPoint: number;
  supplierId: string;
}

// ============================================================================
// Bill of Materials (BOM)
// ============================================================================

export interface BOMItem {
  materialId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface BillOfMaterials {
  id: string;
  productId: string;
  productName: string;
  version: string;
  items: BOMItem[];
  laborHours: number;
  laborCostPerHour: number;
  overheadCost: number;
  effectiveDate: string; // ISO date string
  isActive: boolean;
}

// ============================================================================
// Work Orders
// ============================================================================

export enum WorkOrderStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  QualityCheck = 'QualityCheck',
  Complete = 'Complete',
  Cancelled = 'Cancelled',
}

export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface WorkOrder {
  id: string;
  bomId: string;
  quantity: number;
  status: WorkOrderStatus;
  scheduledStart: string; // ISO date string
  scheduledEnd: string; // ISO date string
  actualStart?: string; // ISO date string
  actualEnd?: string; // ISO date string
  assignedTo?: string;
  priority: WorkOrderPriority;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ============================================================================
// Quality Control
// ============================================================================

export type QualityCheckType = 
  | 'visual_inspection'
  | 'dimensional_check'
  | 'weight_check'
  | 'material_test'
  | 'functionality_test'
  | 'safety_check';

export interface QualityCheckpoint {
  id: string;
  workOrderId: string;
  checkType: QualityCheckType;
  passed: boolean;
  notes?: string;
  checkedBy: string;
  checkedAt: string; // ISO date string
}

// ============================================================================
// Production Runs
// ============================================================================

export interface MaterialConsumption {
  materialId: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
}

export interface ProductionRun {
  id: string;
  workOrderId: string;
  quantityProduced: number;
  quantityDefective: number;
  materialsConsumed: MaterialConsumption[];
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  operatorNotes?: string;
}

// ============================================================================
// Production Statistics (for dashboard)
// ============================================================================

export interface ProductionStats {
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedToday: number;
  unitsProducedToday: number;
  defectRate: number; // percentage
  onTimeRate: number; // percentage
  averageCycleTime: number; // in hours
}

// ============================================================================
// Helper Types
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number;
}

export interface ProductionAlert {
  id: string;
  type: 'low_stock' | 'overdue_order' | 'high_defect_rate' | 'quality_issue';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  relatedId?: string; // materialId, workOrderId, etc.
  createdAt: string;
  acknowledged: boolean;
}

// ============================================================================
// Status Color Mappings (for UI)
// ============================================================================

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.Draft]: 'gray',
  [WorkOrderStatus.Scheduled]: 'blue',
  [WorkOrderStatus.InProgress]: 'yellow',
  [WorkOrderStatus.QualityCheck]: 'purple',
  [WorkOrderStatus.Complete]: 'green',
  [WorkOrderStatus.Cancelled]: 'red',
};

export const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  Low: 'gray',
  Medium: 'blue',
  High: 'orange',
  Urgent: 'red',
};
