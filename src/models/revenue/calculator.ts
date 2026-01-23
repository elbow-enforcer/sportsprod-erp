export function calculateRevenue(units: number, price: number, discountRate: number): number {
  return units * price * (1 - discountRate);
}
