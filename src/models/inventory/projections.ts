import { InventoryConfig, InventoryTimeline, PendingOrder } from './types';
import {
  calculateDailySalesRate,
  calculateReorderPoint,
  calculateOrderQuantity,
  shouldReorder,
} from './calculator';

// Scenario annual unit mappings (from existing scenario model)
const SCENARIO_ANNUAL_UNITS: Record<string, number> = {
  conservative: 5000,
  moderate: 10000,
  aggressive: 20000,
};

/**
 * Project inventory timeline over a specified number of years
 * @param scenario - Scenario name (conservative, moderate, aggressive)
 * @param config - Inventory configuration
 * @param years - Number of years to project
 * @returns Array of daily inventory timeline entries
 */
export function projectInventoryTimeline(
  scenario: string,
  config: InventoryConfig,
  years: number
): InventoryTimeline[] {
  const annualUnits = SCENARIO_ANNUAL_UNITS[scenario] || SCENARIO_ANNUAL_UNITS.moderate;
  const dailyRate = calculateDailySalesRate(annualUnits);
  const reorderPoint = calculateReorderPoint(dailyRate, config.leadTimeDays, config.safetyDays);
  
  // Target inventory: enough for lead time + safety + buffer for next order
  const targetInventory = reorderPoint + config.moq;
  
  const totalDays = years * 365;
  const timeline: InventoryTimeline[] = [];
  const pendingOrders: PendingOrder[] = [];
  
  // Start with initial inventory at target level
  let currentInventory = targetInventory;
  let cumulativeCashOutflow = currentInventory * config.unitCost;
  
  for (let day = 1; day <= totalDays; day++) {
    const month = Math.ceil(day / 30);
    const year = Math.ceil(day / 365);
    
    let orderPlaced: number | null = null;
    let orderArrived: number | null = null;
    let cashOutflow = 0;
    let reorderEvent = false;
    
    // Check for arriving orders
    const arrivingOrders = pendingOrders.filter(o => o.arrivalDate === day);
    for (const order of arrivingOrders) {
      currentInventory += order.units;
      orderArrived = order.units;
    }
    // Remove arrived orders
    const remainingOrders = pendingOrders.filter(o => o.arrivalDate !== day);
    pendingOrders.length = 0;
    pendingOrders.push(...remainingOrders);
    
    // Check if we need to reorder (accounting for pending orders)
    const pendingUnits = pendingOrders.reduce((sum, o) => sum + o.units, 0);
    const effectiveInventory = currentInventory + pendingUnits;
    
    if (shouldReorder(effectiveInventory, reorderPoint) && pendingOrders.length === 0) {
      const orderQty = calculateOrderQuantity(targetInventory, currentInventory, config.moq);
      if (orderQty > 0) {
        const orderCost = orderQty * config.unitCost;
        pendingOrders.push({
          orderDate: day,
          arrivalDate: day + config.leadTimeDays,
          units: orderQty,
          cost: orderCost,
        });
        orderPlaced = orderQty;
        cashOutflow = orderCost;
        cumulativeCashOutflow += cashOutflow;
        reorderEvent = true;
      }
    }
    
    // Consume daily demand
    currentInventory = Math.max(0, currentInventory - dailyRate);
    
    timeline.push({
      day,
      month,
      year,
      inventoryLevel: Math.round(currentInventory),
      reorderEvent,
      orderPlaced,
      orderArrived,
      cashOutflow,
      cumulativeCashOutflow,
    });
  }
  
  return timeline;
}

/**
 * Get monthly summary from daily timeline
 */
export function getMonthlyInventorySummary(timeline: InventoryTimeline[]): {
  month: number;
  avgInventory: number;
  minInventory: number;
  maxInventory: number;
  ordersPlaced: number;
  totalCashOutflow: number;
}[] {
  const monthlyData: Map<number, InventoryTimeline[]> = new Map();
  
  for (const entry of timeline) {
    if (!monthlyData.has(entry.month)) {
      monthlyData.set(entry.month, []);
    }
    monthlyData.get(entry.month)!.push(entry);
  }
  
  return Array.from(monthlyData.entries()).map(([month, entries]) => ({
    month,
    avgInventory: Math.round(entries.reduce((sum, e) => sum + e.inventoryLevel, 0) / entries.length),
    minInventory: Math.min(...entries.map(e => e.inventoryLevel)),
    maxInventory: Math.max(...entries.map(e => e.inventoryLevel)),
    ordersPlaced: entries.filter(e => e.orderPlaced !== null).length,
    totalCashOutflow: entries.reduce((sum, e) => sum + e.cashOutflow, 0),
  }));
}
