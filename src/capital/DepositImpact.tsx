/**
 * DepositImpact Component
 * 
 * Shows how pre-order deposits reduce capital requirements.
 * Formula: deposits_collected = volume × deposit × conversion_rate
 * 
 * @related-issue Issue #18 - Pre-order Deposit Impact
 */

import { useState, useMemo } from 'react';
import {
  calculateDepositImpact,
  DEFAULT_DEPOSIT_IMPACT_INPUTS,
  DEFAULT_BASE_CAPITAL_NEEDED,
  type DepositImpactInputs,
} from './types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DepositImpact() {
  const [inputs, setInputs] = useState<DepositImpactInputs>(DEFAULT_DEPOSIT_IMPACT_INPUTS);
  const [baseCapital, setBaseCapital] = useState(DEFAULT_BASE_CAPITAL_NEEDED);

  const result = useMemo(() => {
    return calculateDepositImpact(inputs, baseCapital);
  }, [inputs, baseCapital]);

  const reductionPercent = baseCapital > 0 
    ? ((result.capitalReduction / baseCapital) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pre-order Deposit Impact</h2>
        <p className="text-gray-600 mt-1">
          See how collecting deposits reduces your capital requirements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inputs</h3>
          
          <div className="space-y-5">
            {/* Base Capital Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Capital Needed
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={baseCapital}
                  onChange={(e) => setBaseCapital(Number(e.target.value))}
                  step={10000}
                  min={0}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Total capital required without deposits</p>
            </div>

            {/* Pre-order Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-order Volume
              </label>
              <input
                type="number"
                value={inputs.volume}
                onChange={(e) => setInputs({ ...inputs, volume: Number(e.target.value) })}
                step={50}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Expected number of pre-orders</p>
            </div>

            {/* Conversion Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Rate: {inputs.conversionRate}%
              </label>
              <input
                type="range"
                value={inputs.conversionRate}
                onChange={(e) => setInputs({ ...inputs, conversionRate: Number(e.target.value) })}
                min={0}
                max={100}
                step={5}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">% of leads who complete deposit</p>
            </div>

            {/* Deposit Amount - Sensitivity Slider */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Amount: {formatCurrency(inputs.depositAmount)}
              </label>
              <input
                type="range"
                value={inputs.depositAmount}
                onChange={(e) => setInputs({ ...inputs, depositAmount: Number(e.target.value) })}
                min={50}
                max={500}
                step={25}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$50</span>
                <span>$200</span>
                <span>$500</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">↑ Sensitivity slider</p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capital Reduction</h3>
            
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-green-600">
                {formatCurrency(result.depositsCollected)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Deposits Collected
              </div>
              <div className="mt-3 text-lg text-green-700 font-medium">
                {reductionPercent}% reduction in capital needed
              </div>
            </div>

            {/* Formula Display */}
            <div className="mt-4 p-3 bg-white/60 rounded-lg text-sm font-mono text-gray-700 text-center">
              {inputs.volume.toLocaleString()} × ${inputs.depositAmount} × {inputs.conversionRate}% = {formatCurrency(result.depositsCollected)}
            </div>
          </div>

          {/* Capital Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capital Comparison</h3>
            
            <div className="space-y-4">
              {/* Without Deposits */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Without Deposits</span>
                  <span className="font-medium">{formatCurrency(baseCapital)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gray-500 h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* With Deposits */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">With Deposits</span>
                  <span className="font-medium text-green-600">{formatCurrency(result.effectiveCapitalNeeded)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${baseCapital > 0 ? (result.effectiveCapitalNeeded / baseCapital) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              {/* Savings */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Capital Savings</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(result.capitalReduction)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
