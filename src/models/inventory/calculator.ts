/**
 * Inventory calculation utilities for batch ordering with MOQ constraints
 */

/**
 * Calculate daily sales rate from annual unit sales
 * @param annualUnits - Total units sold per year
 * @returns Daily sales rate
 */
export function calculateDailySalesRate(annualUnits: number): number {
  return annualUnits / 365;
}

/**
 * Calculate the reorder point (inventory level at which to place a new order)
 * Reorder point = (Daily demand × Lead time) + Safety stock
 * @param dailyRate - Daily sales rate
 * @param leadTimeDays - Manufacturing/delivery lead time in days
 * @param safetyDays - Safety stock buffer in days of demand
 * @returns Reorder point in units
 */
export function calculateReorderPoint(
  dailyRate: number,
  leadTimeDays: number,
  safetyDays: number
): number {
  const leadTimeDemand = dailyRate * leadTimeDays;
  const safetyStock = calculateSafetyStock(dailyRate, safetyDays);
  return Math.ceil(leadTimeDemand + safetyStock);
}

/**
 * Calculate safety stock in units
 * @param dailyRate - Daily sales rate
 * @param safetyDays - Number of days of safety stock to maintain
 * @returns Safety stock in units
 */
export function calculateSafetyStock(dailyRate: number, safetyDays: number): number {
  return Math.ceil(dailyRate * safetyDays);
}

/**
 * Calculate working capital tied up in inventory
 * @param inventoryUnits - Current inventory units
 * @param unitCost - Cost per unit
 * @returns Working capital in dollars
 */
export function calculateWorkingCapital(inventoryUnits: number, unitCost: number): number {
  return inventoryUnits * unitCost;
}

/**
 * Determine if a reorder should be placed
 * @param currentInventory - Current inventory level in units
 * @param reorderPoint - Reorder point threshold
 * @returns True if current inventory is at or below reorder point
 */
export function shouldReorder(currentInventory: number, reorderPoint: number): boolean {
  return currentInventory <= reorderPoint;
}

/**
 * Calculate order quantity respecting MOQ
 * Orders the larger of MOQ or the quantity needed to reach target inventory
 * @param targetInventory - Desired inventory level after order arrives
 * @param currentInventory - Current inventory (accounting for lead time demand)
 * @param moq - Minimum order quantity
 * @returns Order quantity in units
 */
export function calculateOrderQuantity(
  targetInventory: number,
  currentInventory: number,
  moq: number
): number {
  const needed = targetInventory - currentInventory;
  if (needed <= 0) return 0;
  
  // Round up to nearest MOQ multiple
  const moqMultiple = Math.ceil(needed / moq);
  return moqMultiple * moq;
}
