/**
 * Production & Manufacturing Store
 * US-1.2: Production State Store
 * 
 * Zustand store for managing production state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  RawMaterial,
  BillOfMaterials,
  WorkOrder,
  WorkOrderStatus,
  ProductionRun,
  QualityCheckpoint,
  ProductionStats,
  ProductionAlert,
} from './types';

// ============================================================================
// Store State Interface
// ============================================================================

interface ProductionStoreState {
  // Core Data
  rawMaterials: RawMaterial[];
  billsOfMaterials: BillOfMaterials[];
  workOrders: WorkOrder[];
  productionRuns: ProductionRun[];
  qualityCheckpoints: QualityCheckpoint[];
  alerts: ProductionAlert[];
  
  // Actions - Raw Materials
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  adjustStock: (materialId: string, adjustment: number) => void;
  
  // Actions - Bill of Materials
  addBOM: (bom: BillOfMaterials) => void;
  updateBOM: (id: string, updates: Partial<BillOfMaterials>) => void;
  deleteBOM: (id: string) => void;
  
  // Actions - Work Orders
  createWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  deleteWorkOrder: (id: string) => void;
  
  // Actions - Production Runs
  recordProductionRun: (run: ProductionRun) => void;
  updateProductionRun: (id: string, updates: Partial<ProductionRun>) => void;
  
  // Actions - Quality Control
  addQualityCheckpoint: (checkpoint: QualityCheckpoint) => void;
  
  // Actions - Alerts
  addAlert: (alert: ProductionAlert) => void;
  acknowledgeAlert: (id: string) => void;
  clearAcknowledgedAlerts: () => void;
  
  // Computed Getters
  getActiveBOMs: () => BillOfMaterials[];
  getPendingWorkOrders: () => WorkOrder[];
  getWorkOrdersByStatus: (status: WorkOrderStatus) => WorkOrder[];
  getMaterialById: (id: string) => RawMaterial | undefined;
  getBOMById: (id: string) => BillOfMaterials | undefined;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getProductionRunsByWorkOrder: (workOrderId: string) => ProductionRun[];
  getProductionStats: () => ProductionStats;
  getLowStockMaterials: () => RawMaterial[];
  getOverdueWorkOrders: () => WorkOrder[];
}

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isOverdue = (dateStr: string): boolean => {
  return new Date(dateStr) < new Date();
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useProductionStore = create<ProductionStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      rawMaterials: [],
      billsOfMaterials: [],
      workOrders: [],
      productionRuns: [],
      qualityCheckpoints: [],
      alerts: [],

      // ========================================
      // Raw Materials Actions
      // ========================================
      
      addRawMaterial: (material) => {
        set((state) => ({
          rawMaterials: [...state.rawMaterials, material],
        }));
      },

      updateRawMaterial: (id, updates) => {
        set((state) => ({
          rawMaterials: state.rawMaterials.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteRawMaterial: (id) => {
        set((state) => ({
          rawMaterials: state.rawMaterials.filter((m) => m.id !== id),
        }));
      },

      adjustStock: (materialId, adjustment) => {
        set((state) => ({
          rawMaterials: state.rawMaterials.map((m) =>
            m.id === materialId
              ? { ...m, currentStock: Math.max(0, m.currentStock + adjustment) }
              : m
          ),
        }));
      },

      // ========================================
      // Bill of Materials Actions
      // ========================================
      
      addBOM: (bom) => {
        set((state) => ({
          billsOfMaterials: [...state.billsOfMaterials, bom],
        }));
      },

      updateBOM: (id, updates) => {
        set((state) => ({
          billsOfMaterials: state.billsOfMaterials.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      deleteBOM: (id) => {
        set((state) => ({
          billsOfMaterials: state.billsOfMaterials.filter((b) => b.id !== id),
        }));
      },

      // ========================================
      // Work Order Actions
      // ========================================
      
      createWorkOrder: (workOrder) => {
        const now = new Date().toISOString();
        const order: WorkOrder = {
          ...workOrder,
          id: workOrder.id || generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          workOrders: [...state.workOrders, order],
        }));
      },

      updateWorkOrder: (id, updates) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id
              ? { ...wo, ...updates, updatedAt: new Date().toISOString() }
              : wo
          ),
        }));
      },

      updateWorkOrderStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          workOrders: state.workOrders.map((wo) => {
            if (wo.id !== id) return wo;
            
            const updates: Partial<WorkOrder> = {
              status,
              updatedAt: now,
            };
            
            // Track actual start/end times based on status
            if (status === WorkOrderStatus.InProgress && !wo.actualStart) {
              updates.actualStart = now;
            }
            if (status === WorkOrderStatus.Complete && !wo.actualEnd) {
              updates.actualEnd = now;
            }
            
            return { ...wo, ...updates };
          }),
        }));
      },

      deleteWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.filter((wo) => wo.id !== id),
        }));
      },

      // ========================================
      // Production Run Actions
      // ========================================
      
      recordProductionRun: (run) => {
        const productionRun: ProductionRun = {
          ...run,
          id: run.id || generateId(),
        };
        
        set((state) => ({
          productionRuns: [...state.productionRuns, productionRun],
        }));
        
        // Auto-deduct materials from inventory
        const { adjustStock, rawMaterials } = get();
        run.materialsConsumed.forEach((mc) => {
          const material = rawMaterials.find((m) => m.id === mc.materialId);
          if (material) {
            adjustStock(mc.materialId, -mc.actualQuantity);
          }
        });
      },

      updateProductionRun: (id, updates) => {
        set((state) => ({
          productionRuns: state.productionRuns.map((pr) =>
            pr.id === id ? { ...pr, ...updates } : pr
          ),
        }));
      },

      // ========================================
      // Quality Control Actions
      // ========================================
      
      addQualityCheckpoint: (checkpoint) => {
        set((state) => ({
          qualityCheckpoints: [...state.qualityCheckpoints, checkpoint],
        }));
      },

      // ========================================
      // Alert Actions
      // ========================================
      
      addAlert: (alert) => {
        set((state) => ({
          alerts: [...state.alerts, { ...alert, id: alert.id || generateId() }],
        }));
      },

      acknowledgeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },

      clearAcknowledgedAlerts: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.acknowledged),
        }));
      },

      // ========================================
      // Computed Getters
      // ========================================
      
      getActiveBOMs: () => {
        return get().billsOfMaterials.filter((bom) => bom.isActive);
      },

      getPendingWorkOrders: () => {
        return get().workOrders.filter(
          (wo) =>
            wo.status === WorkOrderStatus.Draft ||
            wo.status === WorkOrderStatus.Scheduled
        );
      },

      getWorkOrdersByStatus: (status) => {
        return get().workOrders.filter((wo) => wo.status === status);
      },

      getMaterialById: (id) => {
        return get().rawMaterials.find((m) => m.id === id);
      },

      getBOMById: (id) => {
        return get().billsOfMaterials.find((b) => b.id === id);
      },

      getWorkOrderById: (id) => {
        return get().workOrders.find((wo) => wo.id === id);
      },

      getProductionRunsByWorkOrder: (workOrderId) => {
        return get().productionRuns.filter((pr) => pr.workOrderId === workOrderId);
      },

      getProductionStats: () => {
        const { workOrders, productionRuns } = get();
        const today = new Date().toDateString();
        
        const completedToday = workOrders.filter(
          (wo) =>
            wo.status === WorkOrderStatus.Complete &&
            wo.actualEnd &&
            isToday(wo.actualEnd)
        );
        
        const runsToday = productionRuns.filter((pr) => isToday(pr.endTime));
        
        const totalProducedToday = runsToday.reduce(
          (sum, pr) => sum + pr.quantityProduced,
          0
        );
        
        const totalDefectiveToday = runsToday.reduce(
          (sum, pr) => sum + pr.quantityDefective,
          0
        );
        
        const defectRate =
          totalProducedToday > 0
            ? (totalDefectiveToday / (totalProducedToday + totalDefectiveToday)) * 100
            : 0;
        
        // Calculate on-time rate (completed on or before scheduled end)
        const completedOrders = workOrders.filter(
          (wo) => wo.status === WorkOrderStatus.Complete && wo.actualEnd
        );
        const onTimeOrders = completedOrders.filter(
          (wo) => new Date(wo.actualEnd!) <= new Date(wo.scheduledEnd)
        );
        const onTimeRate =
          completedOrders.length > 0
            ? (onTimeOrders.length / completedOrders.length) * 100
            : 100;
        
        // Average cycle time in hours
        const cycleTimesHours = completedOrders
          .filter((wo) => wo.actualStart && wo.actualEnd)
          .map((wo) => {
            const start = new Date(wo.actualStart!).getTime();
            const end = new Date(wo.actualEnd!).getTime();
            return (end - start) / (1000 * 60 * 60); // Convert to hours
          });
        
        const averageCycleTime =
          cycleTimesHours.length > 0
            ? cycleTimesHours.reduce((a, b) => a + b, 0) / cycleTimesHours.length
            : 0;
        
        const activeWorkOrders = workOrders.filter(
          (wo) =>
            wo.status === WorkOrderStatus.InProgress ||
            wo.status === WorkOrderStatus.QualityCheck
        );
        
        return {
          totalWorkOrders: workOrders.length,
          activeWorkOrders: activeWorkOrders.length,
          completedToday: completedToday.length,
          unitsProducedToday: totalProducedToday,
          defectRate: Math.round(defectRate * 100) / 100,
          onTimeRate: Math.round(onTimeRate * 100) / 100,
          averageCycleTime: Math.round(averageCycleTime * 100) / 100,
        };
      },

      getLowStockMaterials: () => {
        return get().rawMaterials.filter(
          (m) => m.currentStock <= m.reorderPoint
        );
      },

      getOverdueWorkOrders: () => {
        return get().workOrders.filter(
          (wo) =>
            wo.status !== WorkOrderStatus.Complete &&
            wo.status !== WorkOrderStatus.Cancelled &&
            isOverdue(wo.scheduledEnd)
        );
      },
    }),
    {
      name: 'sportsprod-production-storage',
      partialize: (state) => ({
        rawMaterials: state.rawMaterials,
        billsOfMaterials: state.billsOfMaterials,
        workOrders: state.workOrders,
        productionRuns: state.productionRuns,
        qualityCheckpoints: state.qualityCheckpoints,
        alerts: state.alerts,
      }),
    }
  )
);

// ============================================================================
// Utility function for calculating BOM costs
// ============================================================================

export function calculateBOMCost(
  bom: BillOfMaterials,
  materials: RawMaterial[]
): {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
} {
  const materialsCost = bom.items.reduce((total, item) => {
    const material = materials.find((m) => m.id === item.materialId);
    return total + (material ? material.unitCost * item.quantity : 0);
  }, 0);
  
  const laborCost = bom.laborHours * bom.laborCostPerHour;
  const overheadCost = bom.overheadCost;
  const totalCost = materialsCost + laborCost + overheadCost;
  
  return {
    materialsCost: Math.round(materialsCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    overheadCost: Math.round(overheadCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

// ============================================================================
// Utility function for checking material availability
// ============================================================================

export function checkMaterialAvailability(
  bom: BillOfMaterials,
  quantity: number,
  materials: RawMaterial[]
): {
  available: boolean;
  shortages: Array<{
    materialId: string;
    materialName: string;
    required: number;
    available: number;
    shortage: number;
  }>;
} {
  const shortages: Array<{
    materialId: string;
    materialName: string;
    required: number;
    available: number;
    shortage: number;
  }> = [];
  
  bom.items.forEach((item) => {
    const material = materials.find((m) => m.id === item.materialId);
    const required = item.quantity * quantity;
    const available = material?.currentStock ?? 0;
    
    if (available < required) {
      shortages.push({
        materialId: item.materialId,
        materialName: material?.name ?? 'Unknown',
        required,
        available,
        shortage: required - available,
      });
    }
  });
  
  return {
    available: shortages.length === 0,
    shortages,
  };
}
