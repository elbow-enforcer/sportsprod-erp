/**
 * Scenario configurations for adoption curve modeling
 * Each scenario modifies the base sigmoid parameters
 */

export interface ScenarioParams {
  x0Shift: number;    // Shift to midpoint (x0)
  kMultiplier: number; // Multiplier for steepness (k)
  b: number;           // Vertical offset
}

export interface BaseParams {
  L: number;  // Maximum value
  x0: number; // Midpoint year
  k: number;  // Steepness
}

/**
 * Base sigmoid parameters derived from historical data
 */
export const baseParams: BaseParams = {
  L: 42.14,
  x0: 2018.97,
  k: 0.48
};

/**
 * Five adoption scenarios from max (aggressive) to min (conservative)
 */
export const scenarios: Record<string, ScenarioParams> = {
  max: { x0Shift: -4, kMultiplier: 2.0, b: -3 },
  upside: { x0Shift: -2, kMultiplier: 1.2, b: -2 },
  base: { x0Shift: 0, kMultiplier: 1.0, b: -0.66 },
  downside: { x0Shift: 2, kMultiplier: 0.8, b: -0.66 },
  min: { x0Shift: 2, kMultiplier: 0.25, b: -10.75 }
};

/**
 * Get adjusted sigmoid parameters for a specific scenario
 */
export function getScenarioParams(scenarioName: string): {
  L: number;
  x0: number;
  k: number;
  b: number;
} {
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioName}. Valid scenarios: ${Object.keys(scenarios).join(', ')}`);
  }

  return {
    L: baseParams.L,
    x0: baseParams.x0 + scenario.x0Shift,
    k: baseParams.k * scenario.kMultiplier,
    b: scenario.b
  };
}

export type ScenarioName = keyof typeof scenarios;
