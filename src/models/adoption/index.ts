/**
 * Adoption Engine - Core exports
 *
 * Provides sigmoid-based adoption curve modeling with 5 scenarios
 * and linear regression-based unit projections.
 */

// Sigmoid function
export { sigmoid } from './sigmoid';

// Scenario configurations
export {
  scenarios,
  baseParams,
  getScenarioParams,
  type ScenarioParams,
  type BaseParams,
  type ScenarioName
} from './scenarios';

// Projection functions
export {
  projectUnits,
  getAnnualProjections,
  getMonthlyProjections,
  getSigmoidValue
} from './projections';
