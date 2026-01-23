export interface InventoryConfig {
  moq: number;           // Minimum order quantity (default 1000)
  unitCost: number;      // Cost per unit (default $200)
  leadTimeDays: number;  // Manufacturing lead time (default 90)
  safetyDays: number;    // Safety stock in days (default 30)
}

export interface InventoryState {
  currentUnits: number;
  pendingOrders: PendingOrder[];
  totalInvested: number;
}

export interface PendingOrder {
  orderDate: number;      // Day number
  arrivalDate: number;    // Day number
  units: number;
  cost: number;
}

export interface ReorderPoint {
  units: number;
  daysRemaining: number;
  shouldReorder: boolean;
}

export interface InventoryTimeline {
  day: number;
  month: number;
  year: number;
  inventoryLevel: number;
  reorderEvent: boolean;
  orderPlaced: number | null;
  orderArrived: number | null;
  cashOutflow: number;
  cumulativeCashOutflow: number;
}

export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  moq: 1000,
  unitCost: 200,
  leadTimeDays: 90,
  safetyDays: 30,
};
