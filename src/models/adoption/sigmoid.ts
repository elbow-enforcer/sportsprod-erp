/**
 * Sigmoid function for adoption curve modeling
 * f(x) = L / (1 + exp(-k*(x-x0))) + b
 *
 * @param x - Input value (typically year)
 * @param L - Maximum value (curve's supremum)
 * @param x0 - Midpoint (x-value of sigmoid's center)
 * @param k - Steepness (growth rate)
 * @param b - Vertical offset (baseline shift)
 * @returns Sigmoid value at x
 */
export function sigmoid(
  x: number,
  L: number,
  x0: number,
  k: number,
  b: number
): number {
  return L / (1 + Math.exp(-k * (x - x0))) + b;
}
