/**
 * Sensitivity Table Component
 * 
 * Displays a matrix of valuations across different discount rates and terminal growth rates.
 * Highlights the current assumption cell for easy reference.
 */

import { useMemo } from 'react';

// Format helpers
const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export interface SensitivityTableProps {
  /** Function to calculate value for given discount rate and growth rate */
  calculateValue: (discountRate: number, terminalGrowthRate: number) => number;
  /** Current discount rate assumption (decimal) */
  baseDiscountRate: number;
  /** Current terminal growth rate assumption (decimal) */
  baseTerminalGrowth: number;
  /** Array of discount rates to show (decimal) */
  discountRates?: number[];
  /** Array of terminal growth rates to show (decimal) */
  terminalGrowthRates?: number[];
  /** Title for the table */
  title?: string;
  /** Description text */
  description?: string;
  /** Value formatter (defaults to currency) */
  formatValue?: (value: number) => string;
}

/**
 * SensitivityTable - Discount Rate vs Terminal Growth Rate Matrix
 * 
 * Features:
 * - Configurable discount rate (WACC) ranges
 * - Configurable terminal growth rate ranges
 * - Highlights current assumption intersection
 * - Customizable value formatter
 */
export function SensitivityTable({
  calculateValue,
  baseDiscountRate,
  baseTerminalGrowth,
  discountRates = [0.08, 0.10, 0.12, 0.15, 0.18],
  terminalGrowthRates = [0.01, 0.02, 0.03, 0.04, 0.05],
  title = 'Sensitivity Analysis',
  description = 'Enterprise Value at different discount rates and terminal growth rates',
  formatValue = formatCurrency,
}: SensitivityTableProps) {
  // Calculate all values in the matrix
  const sensitivityData = useMemo(() => {
    return discountRates.map((dr) => ({
      discountRate: dr,
      values: terminalGrowthRates.map((tg) => {
        try {
          return calculateValue(dr, tg);
        } catch {
          return NaN;
        }
      }),
    }));
  }, [calculateValue, discountRates, terminalGrowthRates]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                WACC ↓ / Growth →
              </th>
              {terminalGrowthRates.map((tg) => (
                <th
                  key={tg}
                  className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    Math.abs(tg - baseTerminalGrowth) < 0.001
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {formatPercent(tg)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensitivityData.map((row) => (
              <tr key={row.discountRate}>
                <td
                  className={`px-4 py-3 text-sm font-medium ${
                    Math.abs(row.discountRate - baseDiscountRate) < 0.001
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {formatPercent(row.discountRate)}
                </td>
                {row.values.map((value, colIdx) => {
                  const isCurrentAssumption =
                    Math.abs(row.discountRate - baseDiscountRate) < 0.001 &&
                    Math.abs(terminalGrowthRates[colIdx] - baseTerminalGrowth) < 0.001;

                  return (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-sm text-center ${
                        isCurrentAssumption
                          ? 'bg-blue-600 text-white font-semibold'
                          : isNaN(value)
                          ? 'bg-red-50 text-red-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {isNaN(value) ? 'N/A' : formatValue(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        Highlighted cell shows current assumptions
      </p>
    </div>
  );
}

/**
 * IRR Sensitivity Table Props
 */
export interface IRRSensitivityTableProps {
  /** Function to calculate IRR for a given initial investment multiple */
  calculateIRR: (investmentMultiple: number) => number | null;
  /** Current investment amount */
  baseInvestment: number;
  /** Array of investment multipliers to show */
  investmentMultipliers?: number[];
  /** Title for the table */
  title?: string;
}

/**
 * IRR Sensitivity by Investment Amount
 */
export function IRRSensitivityTable({
  calculateIRR,
  baseInvestment,
  investmentMultipliers = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
  title = 'IRR Sensitivity by Investment',
}: IRRSensitivityTableProps) {
  const data = useMemo(() => {
    return investmentMultipliers.map((mult) => ({
      multiplier: mult,
      investment: baseInvestment * mult,
      irr: calculateIRR(mult),
    }));
  }, [calculateIRR, baseInvestment, investmentMultipliers]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Investment
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                vs Base
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                IRR
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const isBase = Math.abs(row.multiplier - 1.0) < 0.01;
              return (
                <tr
                  key={row.multiplier}
                  className={isBase ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(row.investment)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-500">
                    {row.multiplier === 1 ? 'Base' : `${row.multiplier}x`}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right font-medium ${
                      row.irr !== null && row.irr > 0
                        ? 'text-green-600'
                        : row.irr !== null && row.irr < 0
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {row.irr !== null ? formatPercent(row.irr) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SensitivityTable;
