/**
 * @file types.ts
 * @description Type definitions for Supply Chain module - Suppliers, Purchase Orders, and Receiving
 * @related-prd tasks/prd-supply-chain.md#US-1.1, US-1.2, US-2.1, US-3.1
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

// Supply Chain Module Types

export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type POStatus = 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
export type InspectionStatus = 'pending' | 'passed' | 'failed' | 'partial';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  status: SupplierStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  paymentTerms: string; // e.g., "Net 30", "Net 60"
  leadTimeDays: number;
  minimumOrderValue: number;
  rating: number; // 1-5 stars
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface POLineItem {
  id: string;
  materialId: string;
  materialName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  lineItems: POLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes: string;
  approvedBy?: string;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReceivingRecord {
  id: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedAt: number;
  receivedBy: string;
  lineItems: ReceivingLineItem[];
  inspectionStatus: InspectionStatus;
  inspectionNotes: string;
  inventoryUpdated: boolean;
}

export interface ReceivingLineItem {
  lineItemId: string;
  materialName: string;
  sku: string;
  quantityExpected: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  inspectionStatus: InspectionStatus;
  notes: string;
}

export interface SupplierPerformance {
  supplierId: string;
  totalOrders: number;
  totalValue: number;
  onTimeDeliveryRate: number;
  qualityAcceptanceRate: number;
  avgLeadTimeDays: number;
}

// Default values
export const DEFAULT_SUPPLIER: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  code: '',
  status: 'pending',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  paymentTerms: 'Net 30',
  leadTimeDays: 14,
  minimumOrderValue: 0,
  rating: 3,
  notes: '',
};

export const PO_STATUS_LABELS: Record<POStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  ordered: 'Ordered',
  partial: 'Partially Received',
  received: 'Fully Received',
  cancelled: 'Cancelled',
};

export const PO_STATUS_COLORS: Record<POStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  ordered: 'bg-purple-100 text-purple-800',
  partial: 'bg-orange-100 text-orange-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  partial: 'Partial Pass',
};
