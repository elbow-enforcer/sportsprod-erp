import { describe, it, expect } from 'vitest';
import { sigmoid } from '../sigmoid';

describe('sigmoid', () => {
  it('should return b + L/2 at the midpoint x0', () => {
    const L = 42.14;
    const x0 = 2018.97;
    const k = 0.48;
    const b = -0.66;

    const result = sigmoid(x0, L, x0, k, b);
    const expected = L / 2 + b;

    expect(result).toBeCloseTo(expected, 5);
  });

  it('should approach L + b as x approaches infinity', () => {
    const L = 42.14;
    const x0 = 2018.97;
    const k = 0.48;
    const b = -0.66;

    const result = sigmoid(x0 + 100, L, x0, k, b);
    const expected = L + b;

    expect(result).toBeCloseTo(expected, 2);
  });

  it('should approach b as x approaches negative infinity', () => {
    const L = 42.14;
    const x0 = 2018.97;
    const k = 0.48;
    const b = -0.66;

    const result = sigmoid(x0 - 100, L, x0, k, b);
    const expected = b;

    expect(result).toBeCloseTo(expected, 2);
  });

  it('should increase monotonically with x for positive k', () => {
    const L = 42.14;
    const x0 = 2018.97;
    const k = 0.48;
    const b = -0.66;

    const y1 = sigmoid(2015, L, x0, k, b);
    const y2 = sigmoid(2020, L, x0, k, b);
    const y3 = sigmoid(2025, L, x0, k, b);

    expect(y2).toBeGreaterThan(y1);
    expect(y3).toBeGreaterThan(y2);
  });

  it('should produce steeper curve with higher k', () => {
    const L = 42.14;
    const x0 = 2018.97;
    const b = 0;
    const delta = 5;

    const slowK = 0.25;
    const fastK = 1.0;

    // Difference in y-values at x0 ± delta should be larger for higher k
    const slowDiff = sigmoid(x0 + delta, L, x0, slowK, b) - sigmoid(x0 - delta, L, x0, slowK, b);
    const fastDiff = sigmoid(x0 + delta, L, x0, fastK, b) - sigmoid(x0 - delta, L, x0, fastK, b);

    expect(fastDiff).toBeGreaterThan(slowDiff);
  });
});
