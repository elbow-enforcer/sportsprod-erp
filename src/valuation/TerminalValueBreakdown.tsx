/**
 * Terminal Value Breakdown Component
 * Shows detailed terminal value calculation with method selection and comparison
 */

import { useMemo, useState } from 'react';
import {
  compareTerminalValueMethods,
  getTerminalValueBreakdown,
  getComparableMultipleStats,
  COMPARABLE_COMPANIES,
  type TerminalValueMethod,
  type ComparableCompany,
} from '../models/dcf';

// Format helpers
const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

interface TerminalValueBreakdownProps {
  method: TerminalValueMethod;
  onMethodChange: (method: TerminalValueMethod) => void;
  finalYearFCF: number;
  finalYearEBITDA: number;
  terminalGrowthRate: number;
  discountRate: number;
  exitMultiple: number;
  onExitMultipleChange: (multiple: number) => void;
  projectionYears: number;
  enterpriseValue: number;
}

export function TerminalValueBreakdown({
  method,
  onMethodChange,
  finalYearFCF,
  finalYearEBITDA,
  terminalGrowthRate,
  discountRate,
  exitMultiple,
  onExitMultipleChange,
  projectionYears,
  enterpriseValue,
}: TerminalValueBreakdownProps) {
  const [showComparables, setShowComparables] = useState(false);

  // Calculate comparison between methods
  const comparison = useMemo(() => {
    try {
      return compareTerminalValueMethods(
        finalYearFCF,
        finalYearEBITDA,
        terminalGrowthRate,
        discountRate,
        exitMultiple,
        projectionYears
      );
    } catch {
      return null;
    }
  }, [finalYearFCF, finalYearEBITDA, terminalGrowthRate, discountRate, exitMultiple, projectionYears]);

  // Get comparable company stats
  const compStats = useMemo(() => getComparableMultipleStats(), []);

  // Get breakdown for selected method
  const breakdown = useMemo(() => {
    if (!comparison) return null;
    
    const tv = method === 'gordon-growth' 
      ? comparison.gordonGrowth.terminalValue 
      : comparison.exitMultiple.terminalValue;
    const pv = method === 'gordon-growth'
      ? comparison.gordonGrowth.presentValue
      : comparison.exitMultiple.presentValue;

    return getTerminalValueBreakdown(
      method,
      tv,
      pv,
      enterpriseValue,
      finalYearFCF,
      finalYearEBITDA,
      terminalGrowthRate,
      discountRate,
      exitMultiple
    );
  }, [comparison, method, enterpriseValue, finalYearFCF, finalYearEBITDA, terminalGrowthRate, discountRate, exitMultiple]);

  if (!comparison || !breakdown) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500">Unable to calculate terminal value</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Method Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎯</span> Terminal Value Method
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gordon Growth Option */}
          <button
            onClick={() => onMethodChange('gordon-growth')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              method === 'gordon-growth'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Gordon Growth Model</h4>
                <p className="text-sm text-gray-500 mt-1">
                  FCF × (1 + g) / (r - g)
                </p>
              </div>
              {method === 'gordon-growth' && (
                <span className="text-blue-500 text-xl">✓</span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Best for:</p>
              <p className="text-sm text-gray-600">Stable, mature businesses with predictable growth</p>
            </div>
          </button>

          {/* Exit Multiple Option */}
          <button
            onClick={() => onMethodChange('exit-multiple')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              method === 'exit-multiple'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Exit Multiple</h4>
                <p className="text-sm text-gray-500 mt-1">
                  EBITDA × Multiple
                </p>
              </div>
              {method === 'exit-multiple' && (
                <span className="text-purple-500 text-xl">✓</span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Best for:</p>
              <p className="text-sm text-gray-600">M&A scenarios with comparable transactions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Terminal Value Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> Terminal Value Breakdown
        </h3>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${method === 'gordon-growth' ? 'bg-blue-50' : 'bg-purple-50'}`}>
            <p className={`text-2xl font-bold ${method === 'gordon-growth' ? 'text-blue-700' : 'text-purple-700'}`}>
              {formatCurrency(breakdown.terminalValue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Terminal Value</p>
          </div>
          <div className={`p-4 rounded-lg ${method === 'gordon-growth' ? 'bg-blue-50' : 'bg-purple-50'}`}>
            <p className={`text-2xl font-bold ${method === 'gordon-growth' ? 'text-blue-700' : 'text-purple-700'}`}>
              {formatCurrency(breakdown.presentValue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Present Value</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-100">
            <p className="text-2xl font-bold text-gray-700">
              {breakdown.percentOfEnterpriseValue.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">% of Enterprise Value</p>
          </div>
        </div>

        {/* Method-Specific Details */}
        {breakdown.gordonDetails && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
            <h4 className="font-medium text-blue-800 mb-3">Gordon Growth Calculation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Final Year FCF</p>
                <p className="font-medium">{formatCurrency(breakdown.gordonDetails.finalYearFCF)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Growth Rate (g)</p>
                <p className="font-medium">{formatPercent(breakdown.gordonDetails.growthRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Discount Rate (r)</p>
                <p className="font-medium">{formatPercent(breakdown.gordonDetails.discountRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Implied EBITDA Multiple</p>
                <p className="font-medium">{breakdown.gordonDetails.impliedMultiple.toFixed(1)}x</p>
              </div>
            </div>
            <div className="bg-white/80 rounded p-3">
              <p className="text-xs text-gray-500 mb-1">Formula</p>
              <code className="text-sm text-blue-800">{breakdown.gordonDetails.formula}</code>
            </div>
          </div>
        )}

        {breakdown.exitMultipleDetails && (
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
            <h4 className="font-medium text-purple-800 mb-3">Exit Multiple Calculation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Final Year EBITDA</p>
                <p className="font-medium">{formatCurrency(breakdown.exitMultipleDetails.finalYearEBITDA)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Exit Multiple</p>
                <p className="font-medium">{breakdown.exitMultipleDetails.exitMultiple}x</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Implied Growth Rate</p>
                <p className="font-medium">{formatPercent(breakdown.exitMultipleDetails.impliedGrowthRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Discount Rate</p>
                <p className="font-medium">{formatPercent(discountRate)}</p>
              </div>
            </div>
            <div className="bg-white/80 rounded p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Formula</p>
              <code className="text-sm text-purple-800">{breakdown.exitMultipleDetails.formula}</code>
            </div>

            {/* Exit Multiple Slider */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Adjust Exit Multiple</label>
                <span className="text-lg font-bold text-purple-700">{exitMultiple}x</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="0.5"
                value={exitMultiple}
                onChange={(e) => onExitMultipleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>4x (Conservative)</span>
                <span>10x (Median)</span>
                <span>16x (Aggressive)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Method Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚖️</span> Method Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                  Gordon Growth
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider bg-purple-50">
                  Exit Multiple
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Terminal Value</td>
                <td className="px-4 py-3 text-sm text-right bg-blue-50/50">
                  {formatCurrency(comparison.gordonGrowth.terminalValue)}
                </td>
                <td className="px-4 py-3 text-sm text-right bg-purple-50/50">
                  {formatCurrency(comparison.exitMultiple.terminalValue)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  comparison.difference.terminalValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comparison.difference.terminalValue >= 0 ? '+' : ''}{formatCurrency(comparison.difference.terminalValue)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Present Value</td>
                <td className="px-4 py-3 text-sm text-right bg-blue-50/50">
                  {formatCurrency(comparison.gordonGrowth.presentValue)}
                </td>
                <td className="px-4 py-3 text-sm text-right bg-purple-50/50">
                  {formatCurrency(comparison.exitMultiple.presentValue)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  comparison.difference.presentValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comparison.difference.presentValue >= 0 ? '+' : ''}{formatCurrency(comparison.difference.presentValue)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Implied EBITDA Multiple</td>
                <td className="px-4 py-3 text-sm text-right bg-blue-50/50">
                  {comparison.gordonGrowth.impliedEbitdaMultiple.toFixed(1)}x
                </td>
                <td className="px-4 py-3 text-sm text-right bg-purple-50/50">
                  {exitMultiple}x
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Implied Growth Rate</td>
                <td className="px-4 py-3 text-sm text-right bg-blue-50/50">
                  {formatPercent(terminalGrowthRate)}
                </td>
                <td className="px-4 py-3 text-sm text-right bg-purple-50/50">
                  {formatPercent(comparison.exitMultiple.impliedGrowthRate)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Difference Summary */}
        <div className={`mt-4 p-4 rounded-lg ${
          Math.abs(comparison.difference.percentDifference) <= 10 
            ? 'bg-green-50 border border-green-200'
            : Math.abs(comparison.difference.percentDifference) <= 25
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            Math.abs(comparison.difference.percentDifference) <= 10 
              ? 'text-green-800'
              : Math.abs(comparison.difference.percentDifference) <= 25
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            {Math.abs(comparison.difference.percentDifference) <= 10 
              ? '✓ Methods are well-aligned'
              : Math.abs(comparison.difference.percentDifference) <= 25
              ? '⚠️ Moderate difference between methods'
              : '⚠️ Significant difference - review assumptions'}
            {' '}({comparison.difference.percentDifference >= 0 ? '+' : ''}{comparison.difference.percentDifference.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Comparable Companies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🏢</span> Comparable Company Multiples
          </h3>
          <button
            onClick={() => setShowComparables(!showComparables)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showComparables ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900">{compStats.ebitdaMultiple.mean.toFixed(1)}x</p>
            <p className="text-xs text-gray-500">Mean EV/EBITDA</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900">{compStats.ebitdaMultiple.median.toFixed(1)}x</p>
            <p className="text-xs text-gray-500">Median EV/EBITDA</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900">{compStats.ebitdaMultiple.min.toFixed(1)}x</p>
            <p className="text-xs text-gray-500">Min EV/EBITDA</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900">{compStats.ebitdaMultiple.max.toFixed(1)}x</p>
            <p className="text-xs text-gray-500">Max EV/EBITDA</p>
          </div>
        </div>

        {/* Selected Multiple Indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Your exit multiple:</span>
            <span className={`font-bold ${
              exitMultiple < compStats.ebitdaMultiple.min 
                ? 'text-red-600'
                : exitMultiple > compStats.ebitdaMultiple.max
                ? 'text-red-600'
                : exitMultiple <= compStats.ebitdaMultiple.median
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}>
              {exitMultiple}x
            </span>
            <span className="text-gray-500">
              ({exitMultiple < compStats.ebitdaMultiple.median ? 'below' : 'above'} median)
            </span>
          </div>
        </div>

        {/* Detailed Table */}
        {showComparables && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EV/EBITDA
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EV/Revenue
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {COMPARABLE_COMPANIES.map((company) => (
                  <tr key={company.ticker || company.name} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        {company.ticker && (
                          <p className="text-xs text-gray-500">{company.ticker}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">{company.sector}</td>
                    <td className={`px-3 py-3 text-sm text-right font-medium ${
                      company.evEbitdaMultiple <= compStats.ebitdaMultiple.median
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {company.evEbitdaMultiple.toFixed(1)}x
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-gray-600">
                      {company.evRevenueMultiple.toFixed(1)}x
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-gray-600">
                      {company.marketCap ? `$${company.marketCap}M` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
