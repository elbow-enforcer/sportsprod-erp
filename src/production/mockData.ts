/**
 * Mock Production Data
 * US-1.3: Mock Production Data
 * 
 * Realistic mock data for development and testing
 */

import {
  RawMaterial,
  BillOfMaterials,
  WorkOrder,
  WorkOrderStatus,
  ProductionRun,
  QualityCheckpoint,
  Supplier,
  ProductionAlert,
} from './types';

// ============================================================================
// Suppliers
// ============================================================================

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Premium Metals Inc.',
    contactEmail: 'orders@premiummetals.com',
    leadTimeDays: 14,
  },
  {
    id: 'sup-002',
    name: 'LeatherCraft Supplies',
    contactEmail: 'sales@leathercraft.com',
    leadTimeDays: 10,
  },
  {
    id: 'sup-003',
    name: 'Rubber & Polymer Co.',
    contactEmail: 'procurement@rubberco.com',
    leadTimeDays: 7,
  },
  {
    id: 'sup-004',
    name: 'Thread Masters',
    contactEmail: 'bulk@threadmasters.com',
    leadTimeDays: 5,
  },
  {
    id: 'sup-005',
    name: 'Foam Solutions LLC',
    contactEmail: 'orders@foamsolutions.com',
    leadTimeDays: 8,
  },
];

// ============================================================================
// Raw Materials (10+ items)
// ============================================================================

export const mockRawMaterials: RawMaterial[] = [
  {
    id: 'mat-001',
    name: 'Aluminum Rod (Grade 7075)',
    sku: 'ALU-ROD-7075',
    unit: 'kg',
    unitCost: 8.50,
    currentStock: 500,
    reorderPoint: 150,
    supplierId: 'sup-001',
  },
  {
    id: 'mat-002',
    name: 'Premium Cowhide Leather',
    sku: 'LTH-COW-PRM',
    unit: 'sq ft',
    unitCost: 12.00,
    currentStock: 800,
    reorderPoint: 200,
    supplierId: 'sup-002',
  },
  {
    id: 'mat-003',
    name: 'Natural Rubber Compound',
    sku: 'RUB-NAT-001',
    unit: 'kg',
    unitCost: 4.25,
    currentStock: 350,
    reorderPoint: 100,
    supplierId: 'sup-003',
  },
  {
    id: 'mat-004',
    name: 'Heavy-Duty Nylon Thread',
    sku: 'THR-NYL-HD',
    unit: 'spool',
    unitCost: 15.00,
    currentStock: 120,
    reorderPoint: 30,
    supplierId: 'sup-004',
  },
  {
    id: 'mat-005',
    name: 'High-Density Foam Padding',
    sku: 'FOM-HD-PAD',
    unit: 'sheet',
    unitCost: 22.00,
    currentStock: 180,
    reorderPoint: 50,
    supplierId: 'sup-005',
  },
  {
    id: 'mat-006',
    name: 'ABS Plastic Pellets',
    sku: 'PLS-ABS-PEL',
    unit: 'kg',
    unitCost: 3.50,
    currentStock: 600,
    reorderPoint: 200,
    supplierId: 'sup-003',
  },
  {
    id: 'mat-007',
    name: 'Cork Core Material',
    sku: 'CRK-CORE-01',
    unit: 'unit',
    unitCost: 2.75,
    currentStock: 450,
    reorderPoint: 150,
    supplierId: 'sup-005',
  },
  {
    id: 'mat-008',
    name: 'Synthetic Leather',
    sku: 'LTH-SYN-001',
    unit: 'sq ft',
    unitCost: 6.50,
    currentStock: 400,
    reorderPoint: 100,
    supplierId: 'sup-002',
  },
  {
    id: 'mat-009',
    name: 'Steel Wire (Stainless)',
    sku: 'STL-WIR-SS',
    unit: 'meter',
    unitCost: 1.25,
    currentStock: 1000,
    reorderPoint: 300,
    supplierId: 'sup-001',
  },
  {
    id: 'mat-010',
    name: 'Polyester Fabric',
    sku: 'FAB-PLY-001',
    unit: 'meter',
    unitCost: 8.00,
    currentStock: 250,
    reorderPoint: 75,
    supplierId: 'sup-004',
  },
  {
    id: 'mat-011',
    name: 'Grip Tape Roll',
    sku: 'GRP-TAP-001',
    unit: 'roll',
    unitCost: 18.00,
    currentStock: 85,
    reorderPoint: 25,
    supplierId: 'sup-003',
  },
  {
    id: 'mat-012',
    name: 'Epoxy Resin',
    sku: 'EPX-RES-001',
    unit: 'liter',
    unitCost: 45.00,
    currentStock: 30,
    reorderPoint: 15,
    supplierId: 'sup-003',
  },
];

// ============================================================================
// Bills of Materials (5+ products)
// ============================================================================

export const mockBillsOfMaterials: BillOfMaterials[] = [
  {
    id: 'bom-001',
    productId: 'prod-001',
    productName: 'Pro Series Baseball Bat',
    version: '2.1',
    items: [
      { materialId: 'mat-001', quantity: 1.2, unit: 'kg', notes: 'Primary barrel material' },
      { materialId: 'mat-011', quantity: 0.5, unit: 'roll', notes: 'Handle grip' },
      { materialId: 'mat-012', quantity: 0.1, unit: 'liter', notes: 'Finish coating' },
    ],
    laborHours: 2.5,
    laborCostPerHour: 35.00,
    overheadCost: 15.00,
    effectiveDate: '2025-01-01',
    isActive: true,
  },
  {
    id: 'bom-002',
    productId: 'prod-002',
    productName: 'Elite Baseball Glove',
    version: '1.3',
    items: [
      { materialId: 'mat-002', quantity: 3.5, unit: 'sq ft', notes: 'Main body leather' },
      { materialId: 'mat-004', quantity: 0.25, unit: 'spool', notes: 'Stitching thread' },
      { materialId: 'mat-005', quantity: 0.5, unit: 'sheet', notes: 'Palm padding' },
    ],
    laborHours: 4.0,
    laborCostPerHour: 40.00,
    overheadCost: 20.00,
    effectiveDate: '2025-01-15',
    isActive: true,
  },
  {
    id: 'bom-003',
    productId: 'prod-003',
    productName: 'Safety Batting Helmet',
    version: '3.0',
    items: [
      { materialId: 'mat-006', quantity: 0.8, unit: 'kg', notes: 'Outer shell' },
      { materialId: 'mat-005', quantity: 1.0, unit: 'sheet', notes: 'Inner padding' },
      { materialId: 'mat-010', quantity: 0.3, unit: 'meter', notes: 'Chin strap' },
    ],
    laborHours: 1.5,
    laborCostPerHour: 30.00,
    overheadCost: 12.00,
    effectiveDate: '2025-02-01',
    isActive: true,
  },
  {
    id: 'bom-004',
    productId: 'prod-004',
    productName: 'Official League Baseball',
    version: '1.0',
    items: [
      { materialId: 'mat-007', quantity: 1, unit: 'unit', notes: 'Core' },
      { materialId: 'mat-003', quantity: 0.15, unit: 'kg', notes: 'Rubber winding' },
      { materialId: 'mat-002', quantity: 0.25, unit: 'sq ft', notes: 'Cover' },
      { materialId: 'mat-004', quantity: 0.05, unit: 'spool', notes: 'Stitching' },
    ],
    laborHours: 0.75,
    laborCostPerHour: 25.00,
    overheadCost: 5.00,
    effectiveDate: '2024-06-01',
    isActive: true,
  },
  {
    id: 'bom-005',
    productId: 'prod-005',
    productName: 'Pro Batting Gloves (Pair)',
    version: '2.0',
    items: [
      { materialId: 'mat-008', quantity: 1.5, unit: 'sq ft', notes: 'Main material' },
      { materialId: 'mat-002', quantity: 0.5, unit: 'sq ft', notes: 'Palm reinforcement' },
      { materialId: 'mat-004', quantity: 0.1, unit: 'spool', notes: 'Stitching' },
      { materialId: 'mat-010', quantity: 0.2, unit: 'meter', notes: 'Wrist strap' },
    ],
    laborHours: 1.25,
    laborCostPerHour: 28.00,
    overheadCost: 8.00,
    effectiveDate: '2025-03-01',
    isActive: true,
  },
  {
    id: 'bom-006',
    productId: 'prod-006',
    productName: 'Youth Training Bat',
    version: '1.0',
    items: [
      { materialId: 'mat-001', quantity: 0.8, unit: 'kg', notes: 'Lightweight barrel' },
      { materialId: 'mat-011', quantity: 0.3, unit: 'roll', notes: 'Grip' },
    ],
    laborHours: 1.5,
    laborCostPerHour: 30.00,
    overheadCost: 10.00,
    effectiveDate: '2025-04-01',
    isActive: true,
  },
];

// ============================================================================
// Work Orders (8+ orders in various statuses)
// ============================================================================

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeksOut = new Date(today);
twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    bomId: 'bom-001',
    quantity: 50,
    status: WorkOrderStatus.Complete,
    scheduledStart: threeDaysAgo.toISOString(),
    scheduledEnd: yesterday.toISOString(),
    actualStart: threeDaysAgo.toISOString(),
    actualEnd: yesterday.toISOString(),
    assignedTo: 'John Smith',
    priority: 'High',
    notes: 'Rush order for regional tournament',
    createdAt: new Date(threeDaysAgo.getTime() - 86400000).toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: 'wo-002',
    bomId: 'bom-002',
    quantity: 30,
    status: WorkOrderStatus.InProgress,
    scheduledStart: yesterday.toISOString(),
    scheduledEnd: tomorrow.toISOString(),
    actualStart: yesterday.toISOString(),
    assignedTo: 'Maria Garcia',
    priority: 'Medium',
    notes: 'Standard production run',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-003',
    bomId: 'bom-003',
    quantity: 100,
    status: WorkOrderStatus.QualityCheck,
    scheduledStart: twoDaysAgo.toISOString(),
    scheduledEnd: today.toISOString(),
    actualStart: twoDaysAgo.toISOString(),
    assignedTo: 'David Chen',
    priority: 'High',
    notes: 'Safety certification batch',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-004',
    bomId: 'bom-004',
    quantity: 500,
    status: WorkOrderStatus.Scheduled,
    scheduledStart: tomorrow.toISOString(),
    scheduledEnd: nextWeek.toISOString(),
    assignedTo: 'Lisa Wong',
    priority: 'Medium',
    notes: 'League supply contract',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-005',
    bomId: 'bom-005',
    quantity: 200,
    status: WorkOrderStatus.Draft,
    scheduledStart: nextWeek.toISOString(),
    scheduledEnd: twoWeeksOut.toISOString(),
    priority: 'Low',
    notes: 'Pending material availability confirmation',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-006',
    bomId: 'bom-001',
    quantity: 25,
    status: WorkOrderStatus.InProgress,
    scheduledStart: today.toISOString(),
    scheduledEnd: tomorrow.toISOString(),
    actualStart: today.toISOString(),
    assignedTo: 'John Smith',
    priority: 'Urgent',
    notes: 'Emergency restock for retailer',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-007',
    bomId: 'bom-006',
    quantity: 75,
    status: WorkOrderStatus.Scheduled,
    scheduledStart: tomorrow.toISOString(),
    scheduledEnd: new Date(tomorrow.getTime() + 86400000 * 3).toISOString(),
    assignedTo: 'Maria Garcia',
    priority: 'Medium',
    notes: 'Youth league bulk order',
    createdAt: yesterday.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: 'wo-008',
    bomId: 'bom-002',
    quantity: 15,
    status: WorkOrderStatus.Cancelled,
    scheduledStart: twoDaysAgo.toISOString(),
    scheduledEnd: yesterday.toISOString(),
    priority: 'Low',
    notes: 'Customer cancelled order',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: 'wo-009',
    bomId: 'bom-004',
    quantity: 1000,
    status: WorkOrderStatus.Complete,
    scheduledStart: new Date(threeDaysAgo.getTime() - 86400000 * 4).toISOString(),
    scheduledEnd: twoDaysAgo.toISOString(),
    actualStart: new Date(threeDaysAgo.getTime() - 86400000 * 4).toISOString(),
    actualEnd: twoDaysAgo.toISOString(),
    assignedTo: 'Lisa Wong',
    priority: 'High',
    notes: 'Major retailer seasonal order',
    createdAt: new Date(threeDaysAgo.getTime() - 86400000 * 7).toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'wo-010',
    bomId: 'bom-003',
    quantity: 50,
    status: WorkOrderStatus.Draft,
    scheduledStart: twoWeeksOut.toISOString(),
    scheduledEnd: new Date(twoWeeksOut.getTime() + 86400000 * 5).toISOString(),
    priority: 'Low',
    notes: 'Tentative order pending contract',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
];

// ============================================================================
// Production Runs (historical data for charts)
// ============================================================================

export const mockProductionRuns: ProductionRun[] = [
  {
    id: 'run-001',
    workOrderId: 'wo-001',
    quantityProduced: 25,
    quantityDefective: 1,
    materialsConsumed: [
      { materialId: 'mat-001', expectedQuantity: 30, actualQuantity: 31, variance: 1 },
      { materialId: 'mat-011', expectedQuantity: 12.5, actualQuantity: 12.5, variance: 0 },
      { materialId: 'mat-012', expectedQuantity: 2.5, actualQuantity: 2.6, variance: 0.1 },
    ],
    startTime: threeDaysAgo.toISOString(),
    endTime: twoDaysAgo.toISOString(),
    operatorNotes: 'Slight material variance due to calibration',
  },
  {
    id: 'run-002',
    workOrderId: 'wo-001',
    quantityProduced: 25,
    quantityDefective: 0,
    materialsConsumed: [
      { materialId: 'mat-001', expectedQuantity: 30, actualQuantity: 30, variance: 0 },
      { materialId: 'mat-011', expectedQuantity: 12.5, actualQuantity: 12.5, variance: 0 },
      { materialId: 'mat-012', expectedQuantity: 2.5, actualQuantity: 2.5, variance: 0 },
    ],
    startTime: twoDaysAgo.toISOString(),
    endTime: yesterday.toISOString(),
    operatorNotes: 'Production complete, all units passed QC',
  },
  {
    id: 'run-003',
    workOrderId: 'wo-002',
    quantityProduced: 15,
    quantityDefective: 0,
    materialsConsumed: [
      { materialId: 'mat-002', expectedQuantity: 52.5, actualQuantity: 53, variance: 0.5 },
      { materialId: 'mat-004', expectedQuantity: 3.75, actualQuantity: 3.75, variance: 0 },
      { materialId: 'mat-005', expectedQuantity: 7.5, actualQuantity: 7.5, variance: 0 },
    ],
    startTime: yesterday.toISOString(),
    endTime: today.toISOString(),
    operatorNotes: 'First batch complete',
  },
  {
    id: 'run-004',
    workOrderId: 'wo-003',
    quantityProduced: 100,
    quantityDefective: 3,
    materialsConsumed: [
      { materialId: 'mat-006', expectedQuantity: 80, actualQuantity: 82, variance: 2 },
      { materialId: 'mat-005', expectedQuantity: 100, actualQuantity: 100, variance: 0 },
      { materialId: 'mat-010', expectedQuantity: 30, actualQuantity: 30, variance: 0 },
    ],
    startTime: twoDaysAgo.toISOString(),
    endTime: today.toISOString(),
    operatorNotes: '3 units failed safety test - shell thickness',
  },
  {
    id: 'run-005',
    workOrderId: 'wo-009',
    quantityProduced: 500,
    quantityDefective: 8,
    materialsConsumed: [
      { materialId: 'mat-007', expectedQuantity: 500, actualQuantity: 500, variance: 0 },
      { materialId: 'mat-003', expectedQuantity: 75, actualQuantity: 76, variance: 1 },
      { materialId: 'mat-002', expectedQuantity: 125, actualQuantity: 125, variance: 0 },
      { materialId: 'mat-004', expectedQuantity: 25, actualQuantity: 25, variance: 0 },
    ],
    startTime: new Date(threeDaysAgo.getTime() - 86400000 * 4).toISOString(),
    endTime: new Date(threeDaysAgo.getTime() - 86400000 * 2).toISOString(),
    operatorNotes: 'First batch of large order',
  },
  {
    id: 'run-006',
    workOrderId: 'wo-009',
    quantityProduced: 500,
    quantityDefective: 5,
    materialsConsumed: [
      { materialId: 'mat-007', expectedQuantity: 500, actualQuantity: 500, variance: 0 },
      { materialId: 'mat-003', expectedQuantity: 75, actualQuantity: 75, variance: 0 },
      { materialId: 'mat-002', expectedQuantity: 125, actualQuantity: 126, variance: 1 },
      { materialId: 'mat-004', expectedQuantity: 25, actualQuantity: 25, variance: 0 },
    ],
    startTime: new Date(threeDaysAgo.getTime() - 86400000 * 2).toISOString(),
    endTime: twoDaysAgo.toISOString(),
    operatorNotes: 'Second batch complete, improved defect rate',
  },
];

// ============================================================================
// Quality Checkpoints
// ============================================================================

export const mockQualityCheckpoints: QualityCheckpoint[] = [
  {
    id: 'qc-001',
    workOrderId: 'wo-001',
    checkType: 'dimensional_check',
    passed: true,
    notes: 'All units within spec',
    checkedBy: 'QC Inspector - Tom Brown',
    checkedAt: yesterday.toISOString(),
  },
  {
    id: 'qc-002',
    workOrderId: 'wo-001',
    checkType: 'weight_check',
    passed: true,
    notes: 'Weight variance < 2%',
    checkedBy: 'QC Inspector - Tom Brown',
    checkedAt: yesterday.toISOString(),
  },
  {
    id: 'qc-003',
    workOrderId: 'wo-003',
    checkType: 'safety_check',
    passed: false,
    notes: '3 units failed impact test - shell too thin',
    checkedBy: 'QC Inspector - Sarah Johnson',
    checkedAt: today.toISOString(),
  },
  {
    id: 'qc-004',
    workOrderId: 'wo-003',
    checkType: 'visual_inspection',
    passed: true,
    notes: 'Finish quality acceptable',
    checkedBy: 'QC Inspector - Sarah Johnson',
    checkedAt: today.toISOString(),
  },
  {
    id: 'qc-005',
    workOrderId: 'wo-009',
    checkType: 'weight_check',
    passed: true,
    notes: 'Official league weight specifications met',
    checkedBy: 'QC Inspector - Tom Brown',
    checkedAt: twoDaysAgo.toISOString(),
  },
];

// ============================================================================
// Production Alerts
// ============================================================================

export const mockAlerts: ProductionAlert[] = [
  {
    id: 'alert-001',
    type: 'low_stock',
    severity: 'warning',
    message: 'Epoxy Resin stock below reorder point (30 < 15 reorder point)',
    relatedId: 'mat-012',
    createdAt: today.toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-002',
    type: 'quality_issue',
    severity: 'critical',
    message: 'WO-003 (Helmets) - 3 units failed safety inspection',
    relatedId: 'wo-003',
    createdAt: today.toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-003',
    type: 'overdue_order',
    severity: 'warning',
    message: 'WO-002 approaching deadline - 50% complete',
    relatedId: 'wo-002',
    createdAt: today.toISOString(),
    acknowledged: false,
  },
];

// ============================================================================
// Historical Production Data (for dashboard charts - last 30 days)
// ============================================================================

export const generateHistoricalProductionData = () => {
  const data: Array<{
    date: string;
    unitsProduced: number;
    defects: number;
    workOrdersCompleted: number;
  }> = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate realistic production patterns
    // Weekends have lower production
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const baseProduction = isWeekend ? 50 : 150;
    const variance = Math.floor(Math.random() * 50) - 25;
    const unitsProduced = Math.max(0, baseProduction + variance);
    
    const defectRate = 0.02 + Math.random() * 0.02; // 2-4% defect rate
    const defects = Math.floor(unitsProduced * defectRate);
    
    const workOrdersCompleted = isWeekend 
      ? Math.floor(Math.random() * 2)
      : 1 + Math.floor(Math.random() * 3);

    data.push({
      date: date.toISOString().split('T')[0],
      unitsProduced,
      defects,
      workOrdersCompleted,
    });
  }

  return data;
};

// ============================================================================
// Function to initialize store with mock data
// ============================================================================

export const initializeMockData = () => {
  return {
    rawMaterials: mockRawMaterials,
    billsOfMaterials: mockBillsOfMaterials,
    workOrders: mockWorkOrders,
    productionRuns: mockProductionRuns,
    qualityCheckpoints: mockQualityCheckpoints,
    alerts: mockAlerts,
  };
};

// ============================================================================
// Production by Product (for charts)
// ============================================================================

export const getProductionByProduct = () => {
  return [
    { product: 'Pro Series Baseball Bat', produced: 75, target: 100 },
    { product: 'Elite Baseball Glove', produced: 45, target: 60 },
    { product: 'Safety Batting Helmet', produced: 100, target: 100 },
    { product: 'Official League Baseball', produced: 1500, target: 2000 },
    { product: 'Pro Batting Gloves', produced: 0, target: 200 },
    { product: 'Youth Training Bat', produced: 0, target: 75 },
  ];
};
