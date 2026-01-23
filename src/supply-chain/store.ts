/**
 * @file store.ts
 * @description Zustand store for Supply Chain state management - suppliers, POs, receiving records
 * @related-prd tasks/prd-supply-chain.md#US-1.1, US-2.1, US-2.2, US-3.1, US-3.3
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { create } from 'zustand';
import type {
  Supplier,
  PurchaseOrder,
  ReceivingRecord,
  ReceivingLineItem,
  POStatus,
  SupplierPerformance,
} from './types';
import { mockSuppliers, mockPurchaseOrders, mockReceivingRecords } from './mockData';

interface SupplyChainState {
  // Data
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  receivingRecords: ReceivingRecord[];

  // UI State
  selectedSupplierId: string | null;
  selectedPOId: string | null;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  setSelectedSupplier: (id: string | null) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getSupplierPerformance: (id: string) => SupplierPerformance;

  // Purchase Order Actions
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => string;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  setSelectedPO: (id: string | null) => void;
  getPOById: (id: string) => PurchaseOrder | undefined;
  approvePurchaseOrder: (id: string, approvedBy: string) => void;
  submitPurchaseOrder: (id: string) => void;
  cancelPurchaseOrder: (id: string) => void;

  // Receiving Actions
  createReceivingRecord: (record: Omit<ReceivingRecord, 'id'>) => void;
  updateReceivingStatus: (id: string, lineItems: ReceivingLineItem[], notes: string) => void;
  getReceivingByPOId: (poId: string) => ReceivingRecord[];

  // Computed
  getActiveSuppliers: () => Supplier[];
  getPOsByStatus: (status: POStatus) => PurchaseOrder[];
  getPendingReceiving: () => PurchaseOrder[];
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function generatePONumber(): string {
  const year = new Date().getFullYear();
  const count = Math.floor(Math.random() * 900) + 100;
  return `PO-${year}-${count}`;
}

export const useSupplyChainStore = create<SupplyChainState>((set, get) => ({
  // Initial data from mock
  suppliers: mockSuppliers,
  purchaseOrders: mockPurchaseOrders,
  receivingRecords: mockReceivingRecords,

  selectedSupplierId: null,
  selectedPOId: null,

  // Supplier Actions
  addSupplier: (supplier) => {
    const now = Date.now();
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId('sup'),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      suppliers: [...state.suppliers, newSupplier],
    }));
  },

  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ),
    }));
  },

  deleteSupplier: (id) => {
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },

  setSelectedSupplier: (id) => {
    set({ selectedSupplierId: id });
  },

  getSupplierById: (id) => {
    return get().suppliers.find((s) => s.id === id);
  },

  getSupplierPerformance: (id) => {
    const orders = get().purchaseOrders.filter((po) => po.supplierId === id);
    const receivings = get().receivingRecords.filter((r) => r.supplierId === id);

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, po) => sum + po.total, 0);

    // Calculate on-time delivery rate
    const completedOrders = orders.filter((po) => po.actualDeliveryDate);
    const onTimeOrders = completedOrders.filter((po) => {
      if (!po.actualDeliveryDate) return false;
      return new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate);
    });
    const onTimeDeliveryRate = completedOrders.length > 0
      ? (onTimeOrders.length / completedOrders.length) * 100
      : 0;

    // Calculate quality acceptance rate
    const totalReceived = receivings.reduce(
      (sum, r) => sum + r.lineItems.reduce((s, li) => s + li.quantityReceived, 0),
      0
    );
    const totalAccepted = receivings.reduce(
      (sum, r) => sum + r.lineItems.reduce((s, li) => s + li.quantityAccepted, 0),
      0
    );
    const qualityAcceptanceRate = totalReceived > 0
      ? (totalAccepted / totalReceived) * 100
      : 0;

    // Average lead time
    const supplier = get().getSupplierById(id);
    const avgLeadTimeDays = supplier?.leadTimeDays || 0;

    return {
      supplierId: id,
      totalOrders,
      totalValue,
      onTimeDeliveryRate,
      qualityAcceptanceRate,
      avgLeadTimeDays,
    };
  },

  // Purchase Order Actions
  createPurchaseOrder: (po) => {
    const now = Date.now();
    const id = generateId('po');
    const newPO: PurchaseOrder = {
      ...po,
      id,
      poNumber: generatePONumber(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      purchaseOrders: [...state.purchaseOrders, newPO],
    }));
    return id;
  },

  updatePurchaseOrder: (id, updates) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, ...updates, updatedAt: Date.now() } : po
      ),
    }));
  },

  deletePurchaseOrder: (id) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
    }));
  },

  setSelectedPO: (id) => {
    set({ selectedPOId: id });
  },

  getPOById: (id) => {
    return get().purchaseOrders.find((po) => po.id === id);
  },

  approvePurchaseOrder: (id, approvedBy) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? {
              ...po,
              status: 'approved' as POStatus,
              approvedBy,
              approvedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : po
      ),
    }));
  },

  submitPurchaseOrder: (id) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? { ...po, status: 'submitted' as POStatus, updatedAt: Date.now() }
          : po
      ),
    }));
  },

  cancelPurchaseOrder: (id) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? { ...po, status: 'cancelled' as POStatus, updatedAt: Date.now() }
          : po
      ),
    }));
  },

  // Receiving Actions
  createReceivingRecord: (record) => {
    const newRecord: ReceivingRecord = {
      ...record,
      id: generateId('rec'),
    };

    // Update PO status based on received quantities
    const po = get().getPOById(record.purchaseOrderId);
    if (po) {
      const totalOrdered = po.lineItems.reduce((sum, li) => sum + li.quantityOrdered, 0);
      const totalReceived = po.lineItems.reduce((sum, li) => sum + li.quantityReceived, 0) +
        record.lineItems.reduce((sum, li) => sum + li.quantityReceived, 0);

      const newStatus: POStatus = totalReceived >= totalOrdered ? 'received' : 'partial';

      // Update line item quantities
      const updatedLineItems = po.lineItems.map((li) => {
        const receivedItem = record.lineItems.find((ri) => ri.lineItemId === li.id);
        if (receivedItem) {
          return {
            ...li,
            quantityReceived: li.quantityReceived + receivedItem.quantityReceived,
          };
        }
        return li;
      });

      set((state) => ({
        receivingRecords: [...state.receivingRecords, newRecord],
        purchaseOrders: state.purchaseOrders.map((p) =>
          p.id === record.purchaseOrderId
            ? {
                ...p,
                status: newStatus,
                lineItems: updatedLineItems,
                actualDeliveryDate: newStatus === 'received' ? new Date().toISOString().split('T')[0] : p.actualDeliveryDate,
                updatedAt: Date.now(),
              }
            : p
        ),
      }));
    } else {
      set((state) => ({
        receivingRecords: [...state.receivingRecords, newRecord],
      }));
    }
  },

  updateReceivingStatus: (id, lineItems, notes) => {
    set((state) => ({
      receivingRecords: state.receivingRecords.map((r) =>
        r.id === id
          ? {
              ...r,
              lineItems,
              inspectionNotes: notes,
              inspectionStatus: lineItems.every((li) => li.inspectionStatus === 'passed')
                ? 'passed'
                : lineItems.some((li) => li.inspectionStatus === 'failed')
                ? 'failed'
                : 'partial',
            }
          : r
      ),
    }));
  },

  getReceivingByPOId: (poId) => {
    return get().receivingRecords.filter((r) => r.purchaseOrderId === poId);
  },

  // Computed
  getActiveSuppliers: () => {
    return get().suppliers.filter((s) => s.status === 'active');
  },

  getPOsByStatus: (status) => {
    return get().purchaseOrders.filter((po) => po.status === status);
  },

  getPendingReceiving: () => {
    return get().purchaseOrders.filter(
      (po) => po.status === 'ordered' || po.status === 'partial' || po.status === 'approved'
    );
  },
}));
